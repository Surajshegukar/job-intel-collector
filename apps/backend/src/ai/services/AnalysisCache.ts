import crypto from 'crypto';
import { Job } from '../../models/Job';
import { JobAnalysis } from '../../models/JobAnalysis';

export class AnalysisCache {
  /**
   * Generate an MD5 hash of the job description text.
   */
  static generateDescriptionHash(description: string): string {
    const text = (description || '').trim();
    return crypto.createHash('md5').update(text).digest('hex');
  }

  /**
   * Check if a job analysis is cached (job description hasn't changed).
   */
  static async checkCache(jobId: string, userId: string, description: string): Promise<any | null> {
    // 1. Fetch current analysis
    const existingAnalysis = await JobAnalysis.findOne({ jobId, userId });
    if (!existingAnalysis || existingAnalysis.status !== 'completed') {
      return null;
    }

    // 2. Compare description hashes if available, or just check text
    const job = await Job.findById(jobId);
    if (!job) return null;

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
  static async findDuplicateAnalysis(userId: string, description: string, currentJobId: string): Promise<any | null> {
    if (!description || description.trim().length === 0) return null;

    // Find a job with the same description
    const matchingJobs = await Job.find({ 
      description, 
      _id: { $ne: currentJobId } 
    }).select('_id');

    if (matchingJobs.length === 0) return null;

    const jobIds = matchingJobs.map(j => j._id);

    // Look for a completed analysis for one of these jobs
    const duplicateAnalysis = await JobAnalysis.findOne({
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
