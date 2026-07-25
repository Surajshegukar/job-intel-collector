import { Request, Response } from 'express';
import { Job } from '../models/Job';
import { JobProcessingService } from '../services/JobProcessingService';
import { AnalysisQueue } from '../ai/services/AnalysisQueue';
import { AuthenticatedRequest } from '../middleware/auth';

export const getJobs = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const search = req.query.search as string;
    const location = req.query.location as string;
    const status = req.query.status as string;
    const source = req.query.source as string;

    const query: any = { userId };

    // Text search on title/description
    if (search) {
      query.$and = [
        { userId },
        {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
          ]
        }
      ];
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (status) {
      query.status = status;
    }

    if (source) {
      query.source = source;
    }

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .populate('companyId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.json({
      jobs,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const getJobById = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const job = await Job.findOne({ _id: req.params.id, userId }).populate('companyId');
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    return res.json(job);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const createJob = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const result = await JobProcessingService.processAndSaveJob(req.body, userId);
    
    // Trigger background AI Analysis
    await AnalysisQueue.addJob(result.job._id.toString(), userId);

    const jobWithCompany = await Job.findOne({ _id: result.job._id, userId }).populate('companyId');
    return res.status(201).json({
      message: `Job ${result.action} successfully`,
      action: result.action,
      job: jobWithCompany
    });
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
};

export const updateJob = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { title, location, salary, experience, description, skills, status } = req.body;
    
    const job = await Job.findOne({ _id: req.params.id, userId });
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    let needsReanalysis = false;
    if (description !== undefined && description !== job.description) {
      needsReanalysis = true;
    }

    if (title) job.title = title;
    if (location !== undefined) job.location = location;
    if (salary !== undefined) job.salary = salary;
    if (experience !== undefined) job.experience = experience;
    if (description !== undefined) job.description = description;
    if (skills) job.skills = skills;
    if (status) job.status = status;

    await job.save();

    // Trigger AI analysis if description changes
    if (needsReanalysis) {
      await AnalysisQueue.addJob(job._id.toString(), userId);
    }

    const jobWithCompany = await Job.findOne({ _id: job._id, userId }).populate('companyId');
    return res.json(jobWithCompany);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const deleteJob = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    await JobProcessingService.deleteJob(req.params.id, userId);
    return res.json({ message: 'Job and associated application deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};
