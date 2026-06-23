import { Request, Response } from 'express';
import { Application } from '../models/Application';
import { Job } from '../models/Job';

export const getApplications = async (_req: Request, res: Response) => {
  try {
    const applications = await Application.find()
      .populate({
        path: 'jobId',
        populate: { path: 'companyId' }
      })
      .sort({ updatedAt: -1 });
    return res.json(applications);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const createApplication = async (req: Request, res: Response) => {
  try {
    const { jobId, status, appliedDate, notes } = req.body;
    if (!jobId) {
      return res.status(400).json({ message: 'jobId is required' });
    }

    // Check if application already exists for this job
    const existing = await Application.findOne({ jobId });
    if (existing) {
      return res.status(400).json({ message: 'Application for this job already exists' });
    }

    const application = new Application({
      jobId,
      status: status || 'Saved',
      appliedDate: appliedDate || (status && status !== 'Saved' ? new Date() : undefined),
      notes: notes || ''
    });

    await application.save();

    // Sync job status
    await Job.findByIdAndUpdate(jobId, { status: application.status });

    const populated = await Application.findById(application._id).populate({
      path: 'jobId',
      populate: { path: 'companyId' }
    });

    return res.status(201).json(populated);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const updateApplication = async (req: Request, res: Response) => {
  try {
    const { status, appliedDate, notes, resumeMatchScore, aiFeedback, coverLetter } = req.body;

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (status) {
      application.status = status;
      // If status changes to anything other than Saved and appliedDate isn't set, set it to now
      if (status !== 'Saved' && !application.appliedDate && !appliedDate) {
        application.appliedDate = new Date();
      }
    }
    if (appliedDate !== undefined) application.appliedDate = appliedDate;
    if (notes !== undefined) application.notes = notes;
    if (resumeMatchScore !== undefined) application.resumeMatchScore = resumeMatchScore;
    if (aiFeedback !== undefined) application.aiFeedback = aiFeedback;
    if (coverLetter !== undefined) application.coverLetter = coverLetter;

    await application.save();

    // Sync job status
    await Job.findByIdAndUpdate(application.jobId, { status: application.status });

    const populated = await Application.findById(application._id).populate({
      path: 'jobId',
      populate: { path: 'companyId' }
    });

    return res.json(populated);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};
