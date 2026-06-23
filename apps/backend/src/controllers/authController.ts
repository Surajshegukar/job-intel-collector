import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { Job } from '../models/Job';
import { AIService } from '../services/AIService';
import { AuthenticatedRequest } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_job_intelligence_key_123';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      education: [],
      experience: [],
      projects: [],
      skills: [],
      certifications: []
    });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id, email: newUser.email }, JWT_SECRET, {
      expiresIn: '24h'
    });

    return res.status(201).json({
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: '24h'
    });

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user?.id;
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user?.id;
    const { name, education, experience, projects, skills, certifications, resumeText } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (education) user.education = education;
    if (experience) user.experience = experience;
    if (projects) user.projects = projects;
    if (skills) user.skills = skills;
    if (certifications) user.certifications = certifications;
    
    if (resumeText !== undefined) {
      user.resumeText = resumeText;
      // If resume text changed, update embedding placeholder
      if (resumeText) {
        user.resumeEmbedding = await AIService.generateEmbedding(resumeText);
      }
    }

    await user.save();

    const updatedUser = await User.findById(userId).select('-password');
    return res.json(updatedUser);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const getAISuggestions = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user?.id;
    const { jobId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const job = await Job.findById(jobId).populate('companyId');
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // 1. Analyze skill gap
    const skillGap = await AIService.analyzeSkillGap(user.skills, job.skills);

    // 2. Score resume
    const matchAnalysis = await AIService.matchResume(user.resumeText || '', job.description || '', user.skills);

    // 3. Tailor cover letter
    const companyName = (job.companyId as any).name || 'Hiring Company';
    const coverLetter = await AIService.generateTailoredCoverLetter(
      user.name,
      user.skills,
      job.title,
      companyName,
      job.description || ''
    );

    return res.json({
      skillGap,
      matchAnalysis,
      coverLetter
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};
