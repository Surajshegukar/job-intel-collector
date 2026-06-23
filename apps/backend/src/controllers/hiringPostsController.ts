import { Request, Response } from 'express';
import { HiringPost } from '../models/HiringPost';
import { CompanyService } from '../services/CompanyService';

export const createHiringPost = async (req: Request, res: Response) => {
  try {
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
      companyId,
      author: author || 'Unknown',
      content,
      source: source || 'Extension',
      url: url || ''
    });

    await post.save();

    const populatedPost = await HiringPost.findById(post._id).populate('companyId');
    return res.status(201).json(populatedPost);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const getHiringPosts = async (_req: Request, res: Response) => {
  try {
    const posts = await HiringPost.find()
      .populate('companyId')
      .sort({ createdAt: -1 });
    return res.json(posts);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};
