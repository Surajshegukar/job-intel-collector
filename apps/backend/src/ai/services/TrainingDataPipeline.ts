import { AIFeatureStore } from '../../models/AIFeatureStore';
import { Job } from '../../models/Job';
import { UserProfile } from '../../models/UserProfile';
import { UserResumeVersion } from '../../models/UserResumeVersion';
import { UserSkill } from '../../models/UserSkill';

export class TrainingDataPipeline {
  /**
   * Log matching signals into the feature store.
   */
  static async logFeatures(options: {
    jobId: string;
    userId: string;
    skillsOverlapCount: number;
    projectsMatchCount: number;
    experienceMatchYears: number;
    certificationsRelevanceScore: number;
    calculatedMatchScore: number;
  }): Promise<void> {
    try {
      await AIFeatureStore.findOneAndUpdate(
        { jobId: options.jobId, userId: options.userId },
        {
          $set: {
            skillsOverlapCount: options.skillsOverlapCount,
            projectsMatchCount: options.projectsMatchCount,
            experienceMatchYears: options.experienceMatchYears,
            certificationsRelevanceScore: options.certificationsRelevanceScore,
            calculatedMatchScore: options.calculatedMatchScore,
            isTrainingSample: true
          }
        },
        { upsert: true, new: true }
      );
      console.log(`[Feature Store] Successfully logged matching features for Job: ${options.jobId}, User: ${options.userId}.`);
    } catch (error) {
      console.error('[Feature Store] Error logging features:', error);
    }
  }

  /**
   * Update the outcome label (actualOutcome) in the feature store when application state changes.
   */
  static async updateOutcome(jobId: string, userId: string, outcome: string): Promise<void> {
    try {
      await AIFeatureStore.findOneAndUpdate(
        { jobId, userId },
        { $set: { actualOutcome: outcome } }
      );
      console.log(`[Feature Store] Updated outcome label to "${outcome}" for Job: ${jobId}.`);
    } catch (error) {
      console.error('[Feature Store] Error updating outcome:', error);
    }
  }

  /**
   * Export training dataset matching fine-tuning templates.
   * Returns a list of JSON-lines objects.
   */
  static async exportFineTuningDataset(): Promise<string> {
    const samples = await AIFeatureStore.find({ isTrainingSample: true });
    const jsonlLines: string[] = [];

    for (const sample of samples) {
      const job = await Job.findById(sample.jobId);
      const profile = await UserProfile.findOne({ userId: sample.userId });
      const resume = await UserResumeVersion.findOne({ userId: sample.userId, isActive: true });

      if (!job || !profile) continue;

      const candidateSkills = await UserSkill.find({ userId: sample.userId });
      const skillsStr = candidateSkills.map(s => s.name).join(', ');

      // Structure sample for model fine-tuning prompt matching our templates
      const fineTuningLine = {
        messages: [
          { 
            role: 'system', 
            content: 'You are an advanced AI Job Matching assistant. Estimate the candidate compatibility.' 
          },
          { 
            role: 'user', 
            content: `Resume:\n${resume?.resumeText || skillsStr}\n\nJob Description:\n${job.description}` 
          },
          { 
            role: 'assistant', 
            content: JSON.stringify({
              matchScore: sample.calculatedMatchScore,
              actualOutcome: sample.actualOutcome,
              skillsOverlapCount: sample.skillsOverlapCount,
              projectsMatchCount: sample.projectsMatchCount
            }) 
          }
        ]
      };

      jsonlLines.push(JSON.stringify(fineTuningLine));
    }

    return jsonlLines.join('\n');
  }
}
