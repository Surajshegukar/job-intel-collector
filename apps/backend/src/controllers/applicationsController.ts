import { Request, Response } from 'express';
import { Application } from '../models/Application';
import { Job } from '../models/Job';
import { AuthenticatedRequest } from '../middleware/auth';

export const getApplications = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const applications = await Application.find({ userId })
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
    const userId = (req as AuthenticatedRequest).user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { jobId, status, appliedDate, notes } = req.body;
    if (!jobId) {
      return res.status(400).json({ message: 'jobId is required' });
    }

    // Verify job belongs to this user
    const job = await Job.findOne({ _id: jobId, userId });
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if application already exists for this job
    const existing = await Application.findOne({ userId, jobId });
    if (existing) {
      return res.status(400).json({ message: 'Application for this job already exists' });
    }

    const application = new Application({
      userId,
      jobId,
      status: status || 'Saved',
      appliedDate: appliedDate || (status && status !== 'Saved' ? new Date() : undefined),
      notes: notes || ''
    });

    await application.save();

    // Sync job status
    await Job.findOneAndUpdate({ _id: jobId, userId }, { status: application.status });

    const populated = await Application.findOne({ _id: application._id, userId }).populate({
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
    const userId = (req as AuthenticatedRequest).user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { status, appliedDate, notes, resumeMatchScore, aiFeedback, coverLetter } = req.body;

    const application = await Application.findOne({ _id: req.params.id, userId });
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (status) {
      application.status = status;
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
    await Job.findOneAndUpdate({ _id: application.jobId, userId }, { status: application.status });

    const populated = await Application.findOne({ _id: application._id, userId }).populate({
      path: 'jobId',
      populate: { path: 'companyId' }
    });

    return res.json(populated);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};
