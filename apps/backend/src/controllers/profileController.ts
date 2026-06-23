import { Response } from 'express';
import crypto from 'crypto';
import { UserProfile } from '../models/UserProfile';
import { UserSkill } from '../models/UserSkill';
import { UserProject } from '../models/UserProject';
import { UserResumeVersion } from '../models/UserResumeVersion';
import { SkillTaxonomyService } from '../ai/services/SkillTaxonomyService';
import { AuthenticatedRequest } from '../middleware/auth';

export const getProfileData = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    let profile = await UserProfile.findOne({ userId });

    // Initialize profile from User collection if it does not exist (Self-healing)
    if (!profile) {
      const User = require('../models/User').User;
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: 'User account not found' });

      profile = new UserProfile({
        userId,
        name: user.name,
        email: user.email,
        preferredRoles: [],
        preferredLocations: [],
        skills: user.skills || []
      });
      await profile.save();

      // Populate sub-collections
      for (const skillName of (user.skills || [])) {
        const normalized = SkillTaxonomyService.normalizeSkill(skillName);
        await UserSkill.findOneAndUpdate(
          { userId, normalizedName: normalized.toLowerCase() },
          { $set: { name: skillName, normalizedName: normalized.toLowerCase(), proficiency: 'intermediate' } },
          { upsert: true }
        );
      }

      for (const proj of (user.projects || [])) {
        await UserProject.create({
          userId,
          title: proj.name,
          description: proj.description,
          technologies: proj.techStack || []
        });
      }

      if (user.resumeText) {
        const hash = crypto.createHash('md5').update(user.resumeText).digest('hex');
        await UserResumeVersion.create({
          userId,
          versionName: 'Initial Resume (Imported)',
          resumeText: user.resumeText,
          resumeHash: hash,
          isActive: true
        });
      }
    }

    // Load sub-collections
    const skills = await UserSkill.find({ userId });
    const projects = await UserProject.find({ userId });
    const resumeVersions = await UserResumeVersion.find({ userId });

    return res.json({
      profile,
      skills,
      projects,
      resumeVersions
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const updateProfileData = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { preferredRoles, preferredLocations, salaryExpectation, githubUrl, linkedinUrl, name } = req.body;

    const profile = await UserProfile.findOne({ userId });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    if (name) profile.name = name;
    if (preferredRoles) profile.preferredRoles = preferredRoles;
    if (preferredLocations) profile.preferredLocations = preferredLocations;
    if (salaryExpectation) profile.salaryExpectation = salaryExpectation;
    if (githubUrl !== undefined) profile.githubUrl = githubUrl;
    if (linkedinUrl !== undefined) profile.linkedinUrl = linkedinUrl;

    await profile.save();
    return res.json({ message: 'Profile preferences updated successfully', profile });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const addSkill = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { name, proficiency } = req.body;
    if (!name) return res.status(400).json({ message: 'Skill name is required' });

    // Normalize using Taxonomy Service
    const normalized = SkillTaxonomyService.normalizeSkill(name);

    const userSkill = await UserSkill.findOneAndUpdate(
      { userId, normalizedName: normalized.toLowerCase() },
      { 
        $set: { 
          name, 
          normalizedName: normalized.toLowerCase(),
          proficiency: proficiency || 'intermediate' 
        } 
      },
      { upsert: true, new: true }
    );

    // Sync back to main UserProfile skill list string array
    const allSkills = await UserSkill.find({ userId });
    const skillNames = allSkills.map(s => s.name);
    await UserProfile.findOneAndUpdate({ userId }, { $set: { skills: skillNames } });

    return res.status(201).json(userSkill);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const addProject = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { title, description, technologies, achievements } = req.body;
    if (!title) return res.status(400).json({ message: 'Project title is required' });

    const project = new UserProject({
      userId,
      title,
      description,
      technologies: technologies || [],
      achievements: achievements || []
    });

    await project.save();
    return res.status(201).json(project);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const uploadResumeVersion = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { versionName, resumeText } = req.body;
    if (!versionName || !resumeText) {
      return res.status(400).json({ message: 'versionName and resumeText are required.' });
    }

    const hash = crypto.createHash('md5').update(resumeText).digest('hex');

    // Deactivate prior resumes if this is set active
    await UserResumeVersion.updateMany({ userId }, { $set: { isActive: false } });

    const newResume = new UserResumeVersion({
      userId,
      versionName,
      resumeText,
      resumeHash: hash,
      isActive: true
    });

    await newResume.save();

    // Sync standard User model resumeText for backward compatibility
    const User = require('../models/User').User;
    await User.findByIdAndUpdate(userId, { $set: { resumeText: resumeText } });

    return res.status(201).json(newResume);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};
