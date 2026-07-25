import { Request, Response } from 'express';
import { HiringPost } from '../models/HiringPost';
import { CompanyService } from '../services/CompanyService';
import { AuthenticatedRequest } from '../middleware/auth';

export const createHiringPost = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { author, company, content, source, url } = req.body;
    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    let companyId = null;
    if (company && company.trim()) {
      const companyDoc = await CompanyService.findOrCreateCompany(company);
      companyId = companyDoc._id;
    }

    const post = new HiringPost({
      userId,
      companyId,
      author: author || 'Unknown',
      content,
      source: source || 'Extension',
      url: url || ''
    });

    await post.save();

    const populatedPost = await HiringPost.findOne({ _id: post._id, userId }).populate('companyId');
    return res.status(201).json(populatedPost);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const getHiringPosts = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const posts = await HiringPost.find({ userId })
      .populate('companyId')
      .sort({ createdAt: -1 });
    return res.json(posts);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};
