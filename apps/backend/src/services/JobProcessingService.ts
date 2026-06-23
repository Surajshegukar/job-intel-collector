import { Job } from '../models/Job';
import { Application } from '../models/Application';
import { CompanyService } from './CompanyService';
import { SkillExtractionService } from './SkillExtractionService';

export interface RawJobInput {
  title: string;
  companyName: string;
  source?: string;
  url: string;
  location?: string;
  salary?: string;
  experience?: string;
  description?: string;
  skills?: string[];
  status?: 'Saved' | 'Applied' | 'Interview' | 'Rejected' | 'Offer';
  // Company details if available
  companyWebsite?: string;
  companyLinkedin?: string;
  companyIndustry?: string;
  companySize?: string;
}

export class JobProcessingService {
  /**
   * Process and save/update a raw scraped job post.
   */
  static async processAndSaveJob(input: RawJobInput): Promise<{ job: any; action: 'created' | 'updated' }> {
    if (!input.title || !input.companyName || !input.url) {
      throw new Error('Title, companyName, and url are required fields.');
    }

    // 1. Find or create the company
    const company = await CompanyService.findOrCreateCompany(input.companyName, {
      website: input.companyWebsite,
      linkedinUrl: input.companyLinkedin,
      industry: input.companyIndustry,
      companySize: input.companySize,
      location: input.location
    });

    const companyId = company._id;
    const cleanUrl = input.url.trim();

    // 2. Check duplicate: by URL or (companyId + title + location)
    let existingJob = await Job.findOne({
      $or: [
        { url: cleanUrl },
        { companyId, title: { $regex: new RegExp(`^${escapeRegExp(input.title.trim())}$`, 'i') }, location: input.location }
      ]
    });

    if (existingJob) {
      // Job already exists, let's update it
      // Extract skills from description if description changed
      let newSkills = input.skills || [];
      if (input.description && input.description !== existingJob.description) {
        const extracted = SkillExtractionService.extractSkills(input.description);
        newSkills = Array.from(new Set([...newSkills, ...extracted]));
      }

      // Merge skills
      const mergedSkills = Array.from(new Set([...existingJob.skills, ...newSkills]));
      
      // Calculate newly added skills for frequency update
      const addedSkills = mergedSkills.filter(s => !existingJob!.skills.includes(s));
      if (addedSkills.length > 0) {
        await SkillExtractionService.updateSkillFrequencies(addedSkills);
      }

      existingJob.title = input.title.trim();
      existingJob.source = input.source || existingJob.source;
      existingJob.location = input.location || existingJob.location;
      existingJob.salary = input.salary || existingJob.salary;
      existingJob.experience = input.experience || existingJob.experience;
      existingJob.description = input.description || existingJob.description;
      existingJob.skills = mergedSkills;
      
      if (input.status) {
        existingJob.status = input.status;
      }

      await existingJob.save();

      // If status changed and we have an application, sync it
      if (input.status) {
        await Application.findOneAndUpdate(
          { jobId: existingJob._id },
          { $set: { status: input.status } }
        );
      }

      return { job: existingJob, action: 'updated' };
    } else {
      // 3. New job, extract skills
      let extractedSkills = SkillExtractionService.extractSkills(input.description || '');
      if (input.skills && input.skills.length > 0) {
        extractedSkills = Array.from(new Set([...extractedSkills, ...input.skills]));
      }

      // Create new job
      const newJob = new Job({
        title: input.title.trim(),
        companyId,
        source: input.source || 'Extension',
        url: cleanUrl,
        location: input.location || '',
        salary: input.salary || '',
        experience: input.experience || '',
        description: input.description || '',
        skills: extractedSkills,
        status: input.status || 'Saved'
      });

      await newJob.save();

      // 4. Update skill frequencies in database
      if (extractedSkills.length > 0) {
        await SkillExtractionService.updateSkillFrequencies(extractedSkills);
      }

      // 5. Auto-initialize application record
      const newApplication = new Application({
        jobId: newJob._id,
        status: input.status || 'Saved',
        notes: '',
        appliedDate: input.status && input.status !== 'Saved' ? new Date() : undefined
      });

      await newApplication.save();

      return { job: newJob, action: 'created' };
    }
  }

  /**
   * Delete a job and its associated application and clean up skill counts.
   */
  static async deleteJob(jobId: string): Promise<void> {
    const job = await Job.findById(jobId);
    if (!job) return;

    // Remove skills count
    if (job.skills && job.skills.length > 0) {
      await SkillExtractionService.decrementSkillFrequencies(job.skills);
    }

    // Delete job
    await Job.findByIdAndDelete(jobId);

    // Delete application
    await Application.findOneAndDelete({ jobId });
  }
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
