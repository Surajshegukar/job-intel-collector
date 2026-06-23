"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalysisQueue = void 0;
const events_1 = require("events");
const ioredis_1 = __importDefault(require("ioredis"));
const bullmq_1 = require("bullmq");
const Job_1 = require("../../models/Job");
const JobAnalysis_1 = require("../../models/JobAnalysis");
const UserProfile_1 = require("../../models/UserProfile");
const UserSkill_1 = require("../../models/UserSkill");
const UserProject_1 = require("../../models/UserProject");
const AIAuditLog_1 = require("../../models/AIAuditLog");
const GeminiProvider_1 = require("../providers/GeminiProvider");
const OpenAIProvider_1 = require("../providers/OpenAIProvider");
const ScoringEngine_1 = require("./ScoringEngine");
const AnalysisCache_1 = require("./AnalysisCache");
const TrainingDataPipeline_1 = require("./TrainingDataPipeline");
const RoleTaxonomyService_1 = require("./RoleTaxonomyService");
const SkillTaxonomyService_1 = require("./SkillTaxonomyService");
const UserAchievement_1 = require("../../models/UserAchievement");
class AnalysisQueue {
    static redisClient = null;
    static bullQueue = null;
    static bullWorker = null;
    static memoryQueue = new events_1.EventEmitter();
    static isRedisConnected = false;
    static PROVIDERS = [new GeminiProvider_1.GeminiProvider(), new OpenAIProvider_1.OpenAIProvider()];
    static MAX_RETRIES = 3;
    /**
     * Initialize connection to Redis/BullMQ or prepare Memory Fallback
     */
    static async initialize() {
        const redisHost = process.env.REDIS_HOST || '127.0.0.1';
        const redisPort = parseInt(process.env.REDIS_PORT || '6379');
        console.log(`[AI Queue] Initializing. Attempting Redis connection at ${redisHost}:${redisPort}...`);
        try {
            this.redisClient = new ioredis_1.default({
                host: redisHost,
                port: redisPort,
                connectTimeout: 2500, // 2.5 second timeout
                maxRetriesPerRequest: 1
            });
            await new Promise((resolve, reject) => {
                this.redisClient.on('connect', () => {
                    this.isRedisConnected = true;
                    resolve();
                });
                this.redisClient.on('error', (err) => {
                    reject(err);
                });
            });
            if (this.isRedisConnected) {
                console.log('[AI Queue] Redis connected successfully. Using BullMQ.');
                this.bullQueue = new bullmq_1.Queue('job-analysis', { connection: this.redisClient });
                this.setupBullWorker();
            }
        }
        catch (error) {
            console.warn('[AI Queue] Redis connection failed. Falling back to In-Memory Processing Queue.');
            this.isRedisConnected = false;
            this.setupMemoryWorker();
        }
    }
    /**
     * Add a job to the analysis queue
     */
    static async addJob(jobId, userId) {
        const jobData = { jobId, userId, retryCount: 0, currentProviderIndex: 0 };
        // Set initial analysis record to pending
        await JobAnalysis_1.JobAnalysis.findOneAndUpdate({ jobId, userId }, { $set: { status: 'pending', error: null } }, { upsert: true });
        await AIAuditLog_1.AIAuditLog.create({
            jobId,
            userId,
            event: 'analysis_queued',
            level: 'info',
            meta: { isRedisConnected: this.isRedisConnected }
        });
        if (this.isRedisConnected && this.bullQueue) {
            await this.bullQueue.add(`analyze-${jobId}-${userId}`, jobData, {
                attempts: this.MAX_RETRIES,
                backoff: { type: 'exponential', delay: 5000 }
            });
        }
        else {
            // Emit event for in-memory processing
            this.memoryQueue.emit('new-job', jobData);
        }
    }
    /**
     * Set up BullMQ worker process
     */
    static setupBullWorker() {
        this.bullWorker = new bullmq_1.Worker('job-analysis', async (bullJob) => {
            console.log(`[AI Queue] Processing BullMQ job: ${bullJob.id}`);
            await this.processAnalysis(bullJob.data);
        }, { connection: this.redisClient });
        this.bullWorker.on('failed', (job, err) => {
            console.error(`[AI Queue] BullMQ Job ${job?.id} permanently failed:`, err);
        });
    }
    /**
     * Set up in-memory worker process (fallback)
     */
    static setupMemoryWorker() {
        this.memoryQueue.on('new-job', async (data) => {
            setTimeout(async () => {
                try {
                    await this.processAnalysis(data);
                }
                catch (error) {
                    console.error(`[AI Queue] Memory queue execution failed for Job: ${data.jobId}:`, error);
                }
            }, 0);
        });
    }
    /**
     * Main processor execution logic
     */
    static async processAnalysis(data) {
        const { jobId, userId } = data;
        const retryCount = data.retryCount || 0;
        let providerIndex = data.currentProviderIndex || 0;
        const startTime = Date.now();
        // 1. Update status to processing
        await JobAnalysis_1.JobAnalysis.findOneAndUpdate({ jobId, userId }, { $set: { status: 'processing', processingStartedAt: new Date(), error: null } });
        await AIAuditLog_1.AIAuditLog.create({
            jobId,
            userId,
            event: 'analysis_started',
            level: 'info',
            meta: { retryCount, providerIndex }
        });
        // Fetch the job
        const job = await Job_1.Job.findById(jobId);
        if (!job) {
            await this.markJobAsFailed(jobId, userId, 'Job record not found in database.');
            return;
        }
        // 2. Cache check
        const cachedAnalysis = await AnalysisCache_1.AnalysisCache.checkCache(jobId, userId, job.description || '');
        if (cachedAnalysis) {
            return; // Skip re-running, already updated
        }
        // 3. Deduplication check
        const duplicate = await AnalysisCache_1.AnalysisCache.findDuplicateAnalysis(userId, job.description || '', jobId);
        if (duplicate) {
            // Clone the duplicate completed analysis
            await JobAnalysis_1.JobAnalysis.findOneAndUpdate({ jobId, userId }, {
                $set: {
                    status: 'completed',
                    matchScore: duplicate.matchScore,
                    scoreBreakdown: duplicate.scoreBreakdown,
                    scoreExplanation: duplicate.scoreExplanation,
                    roleCategory: duplicate.roleCategory,
                    seniority: duplicate.seniority,
                    experienceRequired: duplicate.experienceRequired,
                    salaryEstimate: duplicate.salaryEstimate,
                    salaryNormalized: duplicate.salaryNormalized,
                    hiringUrgency: duplicate.hiringUrgency,
                    referralAvailable: duplicate.referralAvailable,
                    recruiterMentioned: duplicate.recruiterMentioned,
                    applicationPriority: duplicate.applicationPriority,
                    extractedSkills: duplicate.extractedSkills,
                    missingSkills: duplicate.missingSkills,
                    recommendedProjects: duplicate.recommendedProjects,
                    recommendedResumeSections: duplicate.recommendedResumeSections,
                    aiProvider: duplicate.aiProvider,
                    rawResponse: duplicate.rawResponse,
                    processingCompletedAt: new Date()
                }
            });
            await AIAuditLog_1.AIAuditLog.create({
                jobId,
                userId,
                event: 'analysis_completed',
                level: 'info',
                meta: { clonedFromJobId: duplicate.jobId }
            });
            return;
        }
        // 4. Fetch User profile + skills + projects
        let userProfile = await UserProfile_1.UserProfile.findOne({ userId });
        if (!userProfile) {
            // Auto-initialize UserProfile if not exists (using fallback from User record)
            const User = require('../../models/User').User;
            const user = await User.findById(userId);
            if (user) {
                userProfile = new UserProfile_1.UserProfile({
                    userId,
                    name: user.name,
                    email: user.email,
                    preferredRoles: [],
                    preferredLocations: [],
                    skills: user.skills || []
                });
                await userProfile.save();
                // Sync skills to UserSkill sub-collection
                for (const skillName of (user.skills || [])) {
                    const normalized = SkillTaxonomyService_1.SkillTaxonomyService.normalizeSkill(skillName);
                    await UserSkill_1.UserSkill.findOneAndUpdate({ userId, normalizedName: normalized.toLowerCase() }, { $set: { name: skillName, normalizedName: normalized.toLowerCase(), proficiency: 'intermediate' } }, { upsert: true });
                }
                // Sync projects to UserProject
                for (const proj of (user.projects || [])) {
                    await UserProject_1.UserProject.create({
                        userId,
                        title: proj.name,
                        description: proj.description,
                        technologies: proj.techStack || []
                    });
                }
            }
            else {
                await this.markJobAsFailed(jobId, userId, 'User record not found to pull career profile.');
                return;
            }
        }
        // Load sub-collections for deterministic scoring
        const candidateSkills = await UserSkill_1.UserSkill.find({ userId });
        const candidateProjects = await UserProject_1.UserProject.find({ userId });
        // Fetch certifications from UserAchievement collection
        const achievements = await UserAchievement_1.UserAchievement.find({ userId, type: 'certification' });
        const candidateCerts = achievements.map(a => a.title);
        // Heuristic experience array maps for Scoring Engine
        const User = require('../../models/User').User;
        const userDetails = await User.findById(userId).select('experience');
        const candidateExp = userDetails?.experience || [];
        // Format options for the AI Provider call
        const providerOptions = {
            jobTitle: job.title,
            jobDescription: job.description || '',
            userProfile: {
                skills: candidateSkills.map(s => s.name),
                preferredRoles: userProfile.preferredRoles,
                experience: candidateExp,
                projects: candidateProjects
            }
        };
        // Retrieve active provider
        let activeProvider = this.PROVIDERS[providerIndex];
        if (!activeProvider) {
            activeProvider = this.PROVIDERS[0]; // fallback to gemini
            providerIndex = 0;
        }
        try {
            console.log(`[AI Queue] Calling provider: ${activeProvider.name} for Job: ${jobId}`);
            const aiResult = await activeProvider.analyzeJob(providerOptions);
            const latencyMs = Date.now() - startTime;
            // Classify role category and seniority via taxonomy service rules (fallback layer)
            const roleCategory = RoleTaxonomyService_1.RoleTaxonomyService.classifyRole(job.title, job.description || '');
            const seniority = RoleTaxonomyService_1.RoleTaxonomyService.classifySeniority(job.title);
            // Perform deterministic weighted match score calculations
            const scoringEngineResult = ScoringEngine_1.ScoringEngine.calculateScore({
                skills: candidateSkills.map(s => ({ name: s.name, normalizedName: s.normalizedName })),
                projects: candidateProjects.map(p => ({ title: p.title, technologies: p.technologies })),
                experience: candidateExp,
                certifications: candidateCerts
            }, {
                title: job.title,
                requiredSkills: aiResult.extractedSkills,
                experienceRequired: aiResult.experienceRequired,
                seniority: seniority
            });
            // Calculate priority: high score = high priority
            let applicationPriority = 'medium';
            if (scoringEngineResult.totalScore >= 80)
                applicationPriority = 'high';
            else if (scoringEngineResult.totalScore < 50)
                applicationPriority = 'low';
            // Save analysis results to database
            await JobAnalysis_1.JobAnalysis.findOneAndUpdate({ jobId, userId }, {
                $set: {
                    status: 'completed',
                    matchScore: scoringEngineResult.totalScore,
                    scoreBreakdown: {
                        skillsScore: scoringEngineResult.skillsScore,
                        projectsScore: scoringEngineResult.projectsScore,
                        experienceScore: scoringEngineResult.experienceScore,
                        certificationScore: scoringEngineResult.certificationScore
                    },
                    scoreExplanation: scoringEngineResult.explanation,
                    roleCategory: roleCategory,
                    seniority: seniority,
                    experienceRequired: aiResult.experienceRequired,
                    salaryEstimate: aiResult.salaryEstimate,
                    hiringUrgency: aiResult.hiringUrgency,
                    referralAvailable: aiResult.referralAvailable,
                    recruiterMentioned: aiResult.recruiterMentioned,
                    applicationPriority,
                    extractedSkills: aiResult.extractedSkills,
                    missingSkills: aiResult.missingSkills,
                    recommendedProjects: aiResult.recommendedProjects,
                    recommendedResumeSections: aiResult.recommendedResumeSections,
                    aiProvider: activeProvider.name,
                    rawResponse: aiResult.rawResponse,
                    providerMetadata: {
                        modelName: aiResult.modelName,
                        promptTokens: aiResult.promptTokens,
                        completionTokens: aiResult.completionTokens,
                        latencyMs: latencyMs,
                        costUSD: aiResult.costUSD
                    },
                    processingCompletedAt: new Date()
                }
            });
            // Log training signals in feature store
            await TrainingDataPipeline_1.TrainingDataPipeline.logFeatures({
                jobId,
                userId,
                skillsOverlapCount: scoringEngineResult.skillsScore,
                projectsMatchCount: scoringEngineResult.projectsScore,
                experienceMatchYears: scoringEngineResult.experienceScore,
                certificationsRelevanceScore: scoringEngineResult.certificationScore,
                calculatedMatchScore: scoringEngineResult.totalScore
            });
            await AIAuditLog_1.AIAuditLog.create({
                jobId,
                userId,
                event: 'analysis_completed',
                level: 'info',
                provider: activeProvider.name,
                modelName: aiResult.modelName,
                latencyMs,
                meta: { cost: aiResult.costUSD, totalScore: scoringEngineResult.totalScore }
            });
            console.log(`[AI Queue] Successfully completed analysis for Job: ${jobId}`);
        }
        catch (error) {
            console.warn(`[AI Queue] Provider ${activeProvider.name} failed. Attempting failover.`);
            // Log failover audit event
            await AIAuditLog_1.AIAuditLog.create({
                jobId,
                userId,
                event: 'provider_failover',
                level: 'warn',
                provider: activeProvider.name,
                errorMessage: error.message
            });
            // Try next provider in the index chain
            const nextProviderIndex = providerIndex + 1;
            if (nextProviderIndex < this.PROVIDERS.length) {
                // Run failover recursively
                await this.processAnalysis({
                    jobId,
                    userId,
                    retryCount,
                    currentProviderIndex: nextProviderIndex
                });
            }
            else {
                // All providers failed, handle retries
                if (retryCount < this.MAX_RETRIES) {
                    console.warn(`[AI Queue] Queue retry #${retryCount + 1} for Job: ${jobId}`);
                    if (!this.isRedisConnected) {
                        // Trigger in-memory retry delay
                        setTimeout(async () => {
                            await this.processAnalysis({
                                jobId,
                                userId,
                                retryCount: retryCount + 1,
                                currentProviderIndex: 0 // reset provider back to primary
                            });
                        }, 5000);
                    }
                    else {
                        // Let BullMQ retry handle this automatically
                        throw error;
                    }
                }
                else {
                    // Dead-letter Queue: permanently failed
                    console.error(`[AI Queue] All providers and retries failed for Job: ${jobId}. Routing to DLQ.`);
                    await this.markJobAsFailed(jobId, userId, `AI Analysis pipeline failed after ${this.MAX_RETRIES} attempts. Last error: ${error.message}`);
                }
            }
        }
    }
    /**
     * Helper: Set analysis state to failed
     */
    static async markJobAsFailed(jobId, userId, errorMessage) {
        await JobAnalysis_1.JobAnalysis.findOneAndUpdate({ jobId, userId }, {
            $set: {
                status: 'failed',
                error: errorMessage,
                processingCompletedAt: new Date()
            }
        });
        await AIAuditLog_1.AIAuditLog.create({
            jobId,
            userId,
            event: 'analysis_failed',
            level: 'error',
            errorMessage
        });
    }
}
exports.AnalysisQueue = AnalysisQueue;
