import { Request, Response } from 'express';
import { Skill } from '../models/Skill';

export const getSkills = async (_req: Request, res: Response) => {
  try {
    const skills = await Skill.find().sort({ frequency: -1 });
    return res.json(skills);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};
