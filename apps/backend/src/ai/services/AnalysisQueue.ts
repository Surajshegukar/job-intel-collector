import { EventEmitter } from 'events';
import IORedis from 'ioredis';
import { Queue as BullQueue, Worker as BullWorker, Job as BullJob } from 'bullmq';
import { Job } from '../../models/Job';
import { JobAnalysis } from '../../models/JobAnalysis';
import { UserProfile } from '../../models/UserProfile';
import { UserSkill } from '../../models/UserSkill';
import { UserProject } from '../../models/UserProject';
import { AIAuditLog } from '../../models/AIAuditLog';
import { GeminiProvider } from '../providers/GeminiProvider';
import { OpenAIProvider } from '../providers/OpenAIProvider';
import { ScoringEngine } from './ScoringEngine';
import { AnalysisCache } from './AnalysisCache';
import { TrainingDataPipeline } from './TrainingDataPipeline';
import { RoleTaxonomyService } from './RoleTaxonomyService';
import { SkillTaxonomyService } from './SkillTaxonomyService';
import { UserAchievement } from '../../models/UserAchievement';

export interface AnalysisJobData {
  jobId: string;
  userId: string;
  retryCount?: number;
  currentProviderIndex?: number;
}

export class AnalysisQueue {
  private static redisClient: IORedis | null = null;
  private static bullQueue: BullQueue | null = null;
  private static bullWorker: BullWorker | null = null;
  private static memoryQueue = new EventEmitter();
  private static isRedisConnected = false;
  
  private static PROVIDERS = [new GeminiProvider(), new OpenAIProvider()];
  private static MAX_RETRIES = 3;

  /**
   * Initialize connection to Redis/BullMQ or prepare Memory Fallback
   */
  static async initialize(): Promise<void> {
    const redisHost = process.env.REDIS_HOST || '127.0.0.1';
    const redisPort = parseInt(process.env.REDIS_PORT || '6379');

    console.log(`[AI Queue] Initializing. Attempting Redis connection at ${redisHost}:${redisPort}...`);

    try {
      this.redisClient = new IORedis({
        host: redisHost,
        port: redisPort,
        connectTimeout: 2500, // 2.5 second timeout
        maxRetriesPerRequest: 1
      });

      await new Promise<void>((resolve, reject) => {
        this.redisClient!.on('connect', () => {
          this.isRedisConnected = true;
          resolve();
        });
        this.redisClient!.on('error', (err) => {
          reject(err);
        });
      });

      if (this.isRedisConnected) {
        console.log('[AI Queue] Redis connected successfully. Using BullMQ.');
        this.bullQueue = new BullQueue('job-analysis', { connection: this.redisClient as any });
        this.setupBullWorker();
      }
    } catch (error) {
      console.warn('[AI Queue] Redis connection failed. Falling back to In-Memory Processing Queue.');
      this.isRedisConnected = false;
      this.setupMemoryWorker();
    }
  }

  /**
   * Add a job to the analysis queue
   */
  static async addJob(jobId: string, userId: string): Promise<void> {
    const jobData: AnalysisJobData = { jobId, userId, retryCount: 0, currentProviderIndex: 0 };
    
    // Set initial analysis record to pending
    await JobAnalysis.findOneAndUpdate(
      { jobId, userId },
      { $set: { status: 'pending', error: null } },
      { upsert: true }
    );

    await AIAuditLog.create({
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
    } else {
      // Emit event for in-memory processing
      this.memoryQueue.emit('new-job', jobData);
    }
  }

  /**
   * Set up BullMQ worker process
   */
  private static setupBullWorker(): void {
    this.bullWorker = new BullWorker('job-analysis', async (bullJob: BullJob<AnalysisJobData>) => {
      console.log(`[AI Queue] Processing BullMQ job: ${bullJob.id}`);
      await this.processAnalysis(bullJob.data);
    }, { connection: this.redisClient as any });

    this.bullWorker.on('failed', (job, err) => {
      console.error(`[AI Queue] BullMQ Job ${job?.id} permanently failed:`, err);
    });
  }

  /**
   * Set up in-memory worker process (fallback)
   */
  private static setupMemoryWorker(): void {
    this.memoryQueue.on('new-job', async (data: AnalysisJobData) => {
      setTimeout(async () => {
        try {
          await this.processAnalysis(data);
        } catch (error) {
          console.error(`[AI Queue] Memory queue execution failed for Job: ${data.jobId}:`, error);
        }
      }, 0);
    });
  }

  /**
   * Main processor execution logic
   */
  private static async processAnalysis(data: AnalysisJobData): Promise<void> {
    const { jobId, userId } = data;
    const retryCount = data.retryCount || 0;
    let providerIndex = data.currentProviderIndex || 0;
    
    const startTime = Date.now();

    // 1. Update status to processing
    await JobAnalysis.findOneAndUpdate(
      { jobId, userId },
      { $set: { status: 'processing', processingStartedAt: new Date(), error: null } }
    );

    await AIAuditLog.create({
      jobId,
      userId,
      event: 'analysis_started',
      level: 'info',
      meta: { retryCount, providerIndex }
    });

    // Fetch the job
    const job = await Job.findById(jobId);
    if (!job) {
      await this.markJobAsFailed(jobId, userId, 'Job record not found in database.');
      return;
    }

    // 2. Cache check
    const cachedAnalysis = await AnalysisCache.checkCache(jobId, userId, job.description || '');
    if (cachedAnalysis) {
      return; // Skip re-running, already updated
    }

    // 3. Deduplication check
    const duplicate = await AnalysisCache.findDuplicateAnalysis(userId, job.description || '', jobId);
    if (duplicate) {
      // Clone the duplicate completed analysis
      await JobAnalysis.findOneAndUpdate(
        { jobId, userId },
        {
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
        }
      );
      await AIAuditLog.create({
        jobId,
        userId,
        event: 'analysis_completed',
        level: 'info',
        meta: { clonedFromJobId: duplicate.jobId }
      });
      return;
    }

    // 4. Fetch User profile + skills + projects
    let userProfile = await UserProfile.findOne({ userId });
    if (!userProfile) {
      // Auto-initialize UserProfile if not exists (using fallback from User record)
      const User = require('../../models/User').User;
      const user = await User.findById(userId);
      if (user) {
        userProfile = new UserProfile({
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
          const normalized = SkillTaxonomyService.normalizeSkill(skillName);
          await UserSkill.findOneAndUpdate(
            { userId, normalizedName: normalized.toLowerCase() },
            { $set: { name: skillName, normalizedName: normalized.toLowerCase(), proficiency: 'intermediate' } },
            { upsert: true }
          );
        }

        // Sync projects to UserProject
        for (const proj of (user.projects || [])) {
          await UserProject.create({
            userId,
            title: proj.name,
            description: proj.description,
            technologies: proj.techStack || []
          });
        }
      } else {
        await this.markJobAsFailed(jobId, userId, 'User record not found to pull career profile.');
        return;
      }
    }

    // Load sub-collections for deterministic scoring
    const candidateSkills = await UserSkill.find({ userId });
    const candidateProjects = await UserProject.find({ userId });
    
    // Fetch certifications from UserAchievement collection
    const achievements = await UserAchievement.find({ userId, type: 'certification' });
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
      const roleCategory = RoleTaxonomyService.classifyRole(job.title, job.description || '');
      const seniority = RoleTaxonomyService.classifySeniority(job.title);

      // Perform deterministic weighted match score calculations
      const scoringEngineResult = ScoringEngine.calculateScore(
        {
          skills: candidateSkills.map(s => ({ name: s.name, normalizedName: s.normalizedName })),
          projects: candidateProjects.map(p => ({ title: p.title, technologies: p.technologies })),
          experience: candidateExp,
          certifications: candidateCerts
        },
        {
          title: job.title,
          requiredSkills: aiResult.extractedSkills,
          experienceRequired: aiResult.experienceRequired,
          seniority: seniority
        }
      );

      // Calculate priority: high score = high priority
      let applicationPriority: 'high' | 'medium' | 'low' = 'medium';
      if (scoringEngineResult.totalScore >= 80) applicationPriority = 'high';
      else if (scoringEngineResult.totalScore < 50) applicationPriority = 'low';

      // Save analysis results to database
      await JobAnalysis.findOneAndUpdate(
        { jobId, userId },
        {
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
        }
      );

      // Log training signals in feature store
      await TrainingDataPipeline.logFeatures({
        jobId,
        userId,
        skillsOverlapCount: scoringEngineResult.skillsScore,
        projectsMatchCount: scoringEngineResult.projectsScore,
        experienceMatchYears: scoringEngineResult.experienceScore,
        certificationsRelevanceScore: scoringEngineResult.certificationScore,
        calculatedMatchScore: scoringEngineResult.totalScore
      });

      await AIAuditLog.create({
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

    } catch (error: any) {
      console.warn(`[AI Queue] Provider ${activeProvider.name} failed. Attempting failover.`);

      // Log failover audit event
      await AIAuditLog.create({
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
      } else {
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
          } else {
            // Let BullMQ retry handle this automatically
            throw error;
          }
        } else {
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
  private static async markJobAsFailed(jobId: string, userId: string, errorMessage: string): Promise<void> {
    await JobAnalysis.findOneAndUpdate(
      { jobId, userId },
      { 
        $set: { 
          status: 'failed', 
          error: errorMessage,
          processingCompletedAt: new Date()
        } 
      }
    );

    await AIAuditLog.create({
      jobId,
      userId,
      event: 'analysis_failed',
      level: 'error',
      errorMessage
    });
  }
}
