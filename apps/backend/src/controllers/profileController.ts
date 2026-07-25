import { Response } from 'express';
import { UserProfile } from '../models/UserProfile';
import { UserSkill } from '../models/UserSkill';
import { UserProject } from '../models/UserProject';
import { UserExperience } from '../models/UserExperience';
import { UserCertification } from '../models/UserCertification';
import { UserAchievement } from '../models/UserAchievement';
import { UserEducation } from '../models/UserEducation';
import { ResumeVersion } from '../models/ResumeVersion';

import { SkillTaxonomyService } from '../ai/services/SkillTaxonomyService';
import { ProfileCompletenessEngine } from '../ai/services/ProfileCompletenessEngine';
import { ProjectIntelligenceEngine } from '../ai/services/ProjectIntelligenceEngine';
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
        summary: user.resumeText ? user.resumeText.substring(0, 150) + '...' : ''
      });
      await profile.save();

      // Populate sub-collections
      for (const skillName of (user.skills || [])) {
        const normalized = SkillTaxonomyService.normalizeSkill(skillName);
        const category = SkillTaxonomyService.getCategory(normalized);
        await UserSkill.findOneAndUpdate(
          { userId, normalizedName: normalized.toLowerCase() },
          { 
            $set: { 
              name: skillName, 
              skillName: skillName, 
              normalizedName: normalized.toLowerCase(), 
              proficiency: 'intermediate',
              category 
            } 
          },
          { upsert: true }
        );
      }

      for (const proj of (user.projects || [])) {
        const insights = await ProjectIntelligenceEngine.analyzeProject(proj.name, proj.description || '', proj.techStack || []);
        await UserProject.create({
          userId,
          title: proj.name,
          description: proj.description,
          technologies: insights.technologiesDetected,
          category: insights.projectCategory,
          businessDomain: insights.businessDomain,
          complexityScore: insights.complexityScore,
          resumePriority: insights.resumePriority
        });
      }

      for (const exp of (user.experience || [])) {
        await UserExperience.create({
          userId,
          company: exp.company,
          role: exp.title,
          startDate: exp.startDate || '2024-06',
          endDate: exp.endDate || 'Present',
          description: exp.description,
          achievements: [],
          technologies: [],
          employmentType: 'Full-Time'
        });
      }

      for (const edu of (user.education || [])) {
        await UserEducation.create({
          userId,
          school: edu.school,
          degree: edu.degree,
          fieldOfStudy: edu.fieldOfStudy || '',
          startDate: edu.startDate || '',
          endDate: edu.endDate || '',
          description: edu.description || ''
        });
      }

      for (const cert of (user.certifications || [])) {
        await UserCertification.create({
          userId,
          name: cert,
          issuer: 'Google/Self',
          issueDate: '2025'
        });
      }
    }

    // Load sub-collections
    const skills = await UserSkill.find({ userId });
    const projects = await UserProject.find({ userId });
    const experiences = await UserExperience.find({ userId });
    const certifications = await UserCertification.find({ userId });
    const achievements = await UserAchievement.find({ userId });
    const education = await UserEducation.find({ userId });
    const resumeVersions = await ResumeVersion.find({ userId }).sort({ generatedAt: -1 });

    // Calculate completeness
    const completeness = await ProfileCompletenessEngine.calculateCompleteness(userId);

    return res.json({
      profile,
      skills,
      projects,
      experiences,
      certifications,
      achievements,
      education,
      resumeVersions,
      completeness
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const updateProfileData = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { 
      preferredRoles, preferredLocations, salaryExpectation, 
      githubUrl, linkedinUrl, name, phone, location, portfolioUrl, summary, noticePeriod 
    } = req.body;

    const profile = await UserProfile.findOne({ userId });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    if (name) profile.name = name;
    if (preferredRoles) profile.preferredRoles = preferredRoles;
    if (preferredLocations) profile.preferredLocations = preferredLocations;
    if (salaryExpectation) profile.salaryExpectation = salaryExpectation;
    if (githubUrl !== undefined) profile.githubUrl = githubUrl;
    if (linkedinUrl !== undefined) profile.linkedinUrl = linkedinUrl;
    if (phone !== undefined) profile.phone = phone;
    if (location !== undefined) profile.location = location;
    if (portfolioUrl !== undefined) profile.portfolioUrl = portfolioUrl;
    if (summary !== undefined) profile.summary = summary;
    if (noticePeriod !== undefined) (profile as any).noticePeriod = noticePeriod;

    await profile.save();
    return res.json({ message: 'Profile details updated successfully', profile });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

// Skills CRUD
export const addSkill = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { skillName, proficiency, yearsOfExperience, category } = req.body;
    if (!skillName) return res.status(400).json({ message: 'Skill name is required' });

    const normalized = SkillTaxonomyService.normalizeSkill(skillName);
    const resolvedCategory = category || SkillTaxonomyService.getCategory(normalized);

    const userSkill = await UserSkill.findOneAndUpdate(
      { userId, normalizedName: normalized.toLowerCase() },
      { 
        $set: { 
          name: skillName, 
          skillName,
          normalizedName: normalized.toLowerCase(),
          category: resolvedCategory,
          proficiency: proficiency || 'intermediate',
          yearsOfExperience: yearsOfExperience || 1
        } 
      },
      { upsert: true, new: true }
    );

    return res.status(201).json(userSkill);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const updateSkill = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { proficiency, yearsOfExperience, category } = req.body;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const updated = await UserSkill.findOneAndUpdate(
      { _id: id, userId },
      { $set: { proficiency, yearsOfExperience, category } },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Skill not found.' });

    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const deleteSkill = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    await UserSkill.findOneAndDelete({ _id: id, userId });
    return res.json({ message: 'Skill deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

// Projects CRUD
export const addProject = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { title, description, technologies, achievements, category, githubUrl, liveUrl, impactMetrics } = req.body;
    if (!title) return res.status(400).json({ message: 'Project title is required' });

    // Call Project Intelligence Engine
    const insights = await ProjectIntelligenceEngine.analyzeProject(title, description || '', technologies || []);

    const project = new UserProject({
      userId,
      title,
      description,
      technologies: insights.technologiesDetected || technologies || [],
      achievements: achievements || [],
      category: category || insights.projectCategory,
      githubUrl,
      liveUrl,
      impactMetrics: impactMetrics || [],
      businessDomain: insights.businessDomain,
      complexityScore: insights.complexityScore,
      resumePriority: insights.resumePriority
    });

    await project.save();
    return res.status(201).json(project);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const updateProject = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { title, description, technologies, achievements, category, githubUrl, liveUrl, impactMetrics } = req.body;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const project = await UserProject.findOne({ _id: id, userId });
    if (!project) return res.status(404).json({ message: 'Project not found.' });

    if (title) project.title = title;
    if (description) project.description = description;
    if (technologies) project.technologies = technologies;
    if (achievements) project.achievements = achievements;
    if (category) project.category = category;
    if (githubUrl !== undefined) project.githubUrl = githubUrl;
    if (liveUrl !== undefined) project.liveUrl = liveUrl;
    if (impactMetrics) project.impactMetrics = impactMetrics;

    // Recalculate insights if title or description changes
    if (title || description) {
      const insights = await ProjectIntelligenceEngine.analyzeProject(
        project.title,
        project.description || '',
        project.technologies || []
      );
      project.businessDomain = insights.businessDomain;
      project.complexityScore = insights.complexityScore;
      project.resumePriority = insights.resumePriority;
      project.category = category || insights.projectCategory;
    }

    await project.save();
    return res.json(project);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const deleteProject = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    await UserProject.findOneAndDelete({ _id: id, userId });
    return res.json({ message: 'Project deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

// Experience CRUD
export const addExperience = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { company, role, startDate, endDate, description, achievements, technologies, employmentType } = req.body;
    if (!company || !role || !startDate) {
      return res.status(400).json({ message: 'Company, role, and startDate are required' });
    }

    const exp = new UserExperience({
      userId,
      company,
      role,
      startDate,
      endDate,
      description,
      achievements: achievements || [],
      technologies: technologies || [],
      employmentType: employmentType || 'Full-Time'
    });

    await exp.save();
    return res.status(201).json(exp);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const updateExperience = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { company, role, startDate, endDate, description, achievements, technologies, employmentType } = req.body;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const exp = await UserExperience.findOne({ _id: id, userId });
    if (!exp) return res.status(404).json({ message: 'Work experience not found.' });

    if (company) exp.company = company;
    if (role) exp.role = role;
    if (startDate) exp.startDate = startDate;
    if (endDate !== undefined) exp.endDate = endDate;
    if (description !== undefined) exp.description = description;
    if (achievements) exp.achievements = achievements;
    if (technologies) exp.technologies = technologies;
    if (employmentType) exp.employmentType = employmentType;

    await exp.save();
    return res.json(exp);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const deleteExperience = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    await UserExperience.findOneAndDelete({ _id: id, userId });
    return res.json({ message: 'Work experience deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

// Education CRUD
export const addEducation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { school, degree, fieldOfStudy, startDate, endDate, description } = req.body;
    if (!school || !degree) {
      return res.status(400).json({ message: 'School and degree are required.' });
    }

    const edu = new UserEducation({
      userId,
      school,
      degree,
      fieldOfStudy,
      startDate,
      endDate,
      description
    });

    await edu.save();
    return res.status(201).json(edu);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const updateEducation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { school, degree, fieldOfStudy, startDate, endDate, description } = req.body;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const edu = await UserEducation.findOne({ _id: id, userId });
    if (!edu) return res.status(404).json({ message: 'Education record not found.' });

    if (school) edu.school = school;
    if (degree) edu.degree = degree;
    if (fieldOfStudy !== undefined) edu.fieldOfStudy = fieldOfStudy;
    if (startDate !== undefined) edu.startDate = startDate;
    if (endDate !== undefined) edu.endDate = endDate;
    if (description !== undefined) edu.description = description;

    await edu.save();
    return res.json(edu);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const deleteEducation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    await UserEducation.findOneAndDelete({ _id: id, userId });
    return res.json({ message: 'Education record deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

// Certifications CRUD
export const addCertification = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { name, issuer, issueDate, credentialUrl } = req.body;
    if (!name || !issuer) {
      return res.status(400).json({ message: 'Name and issuer are required.' });
    }

    const cert = new UserCertification({
      userId,
      name,
      issuer,
      issueDate,
      credentialUrl
    });

    await cert.save();
    return res.status(201).json(cert);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const deleteCertification = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    await UserCertification.findOneAndDelete({ _id: id, userId });
    return res.json({ message: 'Certification deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

// Achievements CRUD
export const addAchievement = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { title, description, category } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Title is required.' });
    }

    const ach = new UserAchievement({
      userId,
      title,
      description,
      category
    });

    await ach.save();
    return res.status(201).json(ach);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const deleteAchievement = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    await UserAchievement.findOneAndDelete({ _id: id, userId });
    return res.json({ message: 'Achievement deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};
