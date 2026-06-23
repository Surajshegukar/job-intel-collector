import { Request, Response } from 'express';
import { AnalyticsService } from '../services/AnalyticsService';

export const getOverview = async (_req: Request, res: Response) => {
  try {
    const stats = await AnalyticsService.getOverviewStats();
    return res.json(stats);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const getTopSkills = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const skills = await AnalyticsService.getTopSkills(limit);
    return res.json(skills);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const getTopCompanies = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const companies = await AnalyticsService.getTopCompanies(limit);
    return res.json(companies);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const getLocations = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const locations = await AnalyticsService.getLocationStats(limit);
    return res.json(locations);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const getSalaryRanges = async (_req: Request, res: Response) => {
  try {
    const ranges = await AnalyticsService.getSalaryRangeStats();
    return res.json(ranges);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};
