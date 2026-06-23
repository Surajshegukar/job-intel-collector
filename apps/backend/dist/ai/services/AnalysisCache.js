"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalysisCache = void 0;
const crypto_1 = __importDefault(require("crypto"));
const Job_1 = require("../../models/Job");
const JobAnalysis_1 = require("../../models/JobAnalysis");
class AnalysisCache {
    /**
     * Generate an MD5 hash of the job description text.
     */
    static generateDescriptionHash(description) {
        const text = (description || '').trim();
        return crypto_1.default.createHash('md5').update(text).digest('hex');
    }
    /**
     * Check if a job analysis is cached (job description hasn't changed).
     */
    static async checkCache(jobId, userId, description) {
        // 1. Fetch current analysis
        const existingAnalysis = await JobAnalysis_1.JobAnalysis.findOne({ jobId, userId });
        if (!existingAnalysis || existingAnalysis.status !== 'completed') {
            return null;
        }
        // 2. Compare description hashes if available, or just check text
        const job = await Job_1.Job.findById(jobId);
        if (!job)
            return null;
        // Check if the current job's description hash matches the cached analysis metadata or description
        // If completed and description is exactly matching, we reuse the cache
        if (job.description === description && existingAnalysis.status === 'completed') {
            console.log(`[AI Cache] Cache hit for Job ID: ${jobId}, User ID: ${userId}. Skipping re-analysis.`);
            return existingAnalysis;
        }
        return null;
    }
    /**
     * Check if the same job description has already been analyzed for this user in another job.
     * If yes, clone the analysis output to avoid duplicate LLM processing.
     */
    static async findDuplicateAnalysis(userId, description, currentJobId) {
        if (!description || description.trim().length === 0)
            return null;
        // Find a job with the same description
        const matchingJobs = await Job_1.Job.find({
            description,
            _id: { $ne: currentJobId }
        }).select('_id');
        if (matchingJobs.length === 0)
            return null;
        const jobIds = matchingJobs.map(j => j._id);
        // Look for a completed analysis for one of these jobs
        const duplicateAnalysis = await JobAnalysis_1.JobAnalysis.findOne({
            userId,
            jobId: { $in: jobIds },
            status: 'completed'
        });
        if (duplicateAnalysis) {
            console.log(`[AI Cache] Found duplicate job description in Job: ${duplicateAnalysis.jobId}. Cloning analysis details to Job: ${currentJobId}.`);
            return duplicateAnalysis;
        }
        return null;
    }
}
exports.AnalysisCache = AnalysisCache;
