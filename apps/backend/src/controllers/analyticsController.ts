import { Request, Response } from 'express';
import { AnalyticsService } from '../services/AnalyticsService';
import { AuthenticatedRequest } from '../middleware/auth';

export const getOverview = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const stats = await AnalyticsService.getOverviewStats(userId);
    return res.json(stats);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const getTopSkills = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const limit = parseInt(req.query.limit as string) || 10;
    const skills = await AnalyticsService.getTopSkills(userId, limit);
    return res.json(skills);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const getTopCompanies = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const limit = parseInt(req.query.limit as string) || 10;
    const companies = await AnalyticsService.getTopCompanies(userId, limit);
    return res.json(companies);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const getLocations = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const limit = parseInt(req.query.limit as string) || 10;
    const locations = await AnalyticsService.getLocationStats(userId, limit);
    return res.json(locations);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const getSalaryRanges = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const ranges = await AnalyticsService.getSalaryRangeStats(userId);
    return res.json(ranges);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};
