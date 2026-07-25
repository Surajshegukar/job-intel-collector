import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { UserProfile } from '../models/UserProfile';
import { UserExperience } from '../models/UserExperience';
import { UserProject } from '../models/UserProject';
import { UserSkill } from '../models/UserSkill';
import { UserCertification } from '../models/UserCertification';
import { UserAchievement } from '../models/UserAchievement';
import { UserEducation } from '../models/UserEducation';
import { ResumeTemplate } from '../models/ResumeTemplate';
import { ResumeVersion } from '../models/ResumeVersion';
import { Job } from '../models/Job';
import { User } from '../models/User';

import { ResumeParserService } from '../ai/services/ResumeParserService';
import { ResumeGeneratorService } from '../ai/services/ResumeGeneratorService';
import { ResumeScoringEngine } from '../ai/services/ResumeScoringEngine';
import { SkillTaxonomyService } from '../ai/services/SkillTaxonomyService';
import { ProjectIntelligenceEngine } from '../ai/services/ProjectIntelligenceEngine';

const { PDFParse } = require('pdf-parse');
import mammoth from 'mammoth';

export const importResume = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    let extractedText = '';
    const fileExtension = req.file.originalname.split('.').pop()?.toLowerCase();

    if (fileExtension === 'pdf') {
      const parser = new PDFParse({ data: req.file.buffer });
      const pdfData = await parser.getText();
      extractedText = pdfData.text;
    } else if (fileExtension === 'docx') {
      const result = await mammoth.extractRawText({ buffer: req.file.buffer });
      extractedText = result.value;
    } else {
      // Text file
      extractedText = req.file.buffer.toString('utf-8');
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({ message: 'Failed to extract text from the file.' });
    }

    // Call AI Parser Service
    console.log('[Resume Import] Parsing text via Gemini...');
    const parsedData = await ResumeParserService.parseText(extractedText);

    // Save/Overwrite user collections cleanly
    // 1. Profile Core Info
    const profile = await UserProfile.findOneAndUpdate(
      { userId },
      {
        $set: {
          name: parsedData.profile.name || req.user?.email.split('@')[0],
          email: parsedData.profile.email || req.user?.email,
          phone: parsedData.profile.phone,
          location: parsedData.profile.location,
          linkedinUrl: parsedData.profile.linkedinUrl,
          githubUrl: parsedData.profile.githubUrl,
          portfolioUrl: parsedData.profile.portfolioUrl,
          summary: parsedData.profile.summary,
          preferredRoles: parsedData.profile.preferredRoles || [],
          preferredLocations: parsedData.profile.preferredLocations || [],
          salaryExpectation: parsedData.profile.salaryExpectation
        }
      },
      { upsert: true, new: true }
    );

    // Sync back to primary User record for backward compatibility
    await User.findByIdAndUpdate(userId, {
      $set: {
        name: parsedData.profile.name,
        resumeText: extractedText
      }
    });

    // 2. Clear old sub-records to prevent duplicates, then insert new ones
    await UserEducation.deleteMany({ userId });
    if (parsedData.education && parsedData.education.length > 0) {
      const docs = parsedData.education.map(ed => ({ ...ed, userId }));
      await UserEducation.insertMany(docs);
      // Sync back to User record
      await User.findByIdAndUpdate(userId, { $set: { education: parsedData.education } });
    }

    await UserExperience.deleteMany({ userId });
    if (parsedData.experience && parsedData.experience.length > 0) {
      const docs = parsedData.experience.map(exp => ({ ...exp, userId }));
      await UserExperience.insertMany(docs);
      // Sync back to User record
      const experienceLegacy = parsedData.experience.map(e => ({
        company: e.company,
        title: e.role,
        startDate: e.startDate,
        endDate: e.endDate,
        description: e.description
      }));
      await User.findByIdAndUpdate(userId, { $set: { experience: experienceLegacy } });
    }

    await UserProject.deleteMany({ userId });
    if (parsedData.projects && parsedData.projects.length > 0) {
      // Analyze every project using ProjectIntelligenceEngine before saving
      const enrichedProjects = [];
      for (const proj of parsedData.projects) {
        const insights = await ProjectIntelligenceEngine.analyzeProject(
          proj.title,
          proj.description || '',
          proj.technologies || []
        );

        enrichedProjects.push({
          ...proj,
          userId,
          category: proj.category || insights.projectCategory,
          technologies: insights.technologiesDetected,
          businessDomain: insights.businessDomain,
          complexityScore: insights.complexityScore,
          resumePriority: insights.resumePriority
        });
      }
      await UserProject.insertMany(enrichedProjects);
      // Sync back to User record
      const projectsLegacy = parsedData.projects.map(p => ({
        name: p.title,
        description: p.description,
        url: p.githubUrl || p.liveUrl || '',
        techStack: p.technologies
      }));
      await User.findByIdAndUpdate(userId, { $set: { projects: projectsLegacy } });
    }

    await UserSkill.deleteMany({ userId });
    if (parsedData.skills && parsedData.skills.length > 0) {
      const seenNormalized = new Set<string>();
      const skillDocs = [];
      
      for (const s of parsedData.skills) {
        const canonical = SkillTaxonomyService.normalizeSkill(s.skillName);
        const normalizedName = canonical.toLowerCase();
        
        if (!seenNormalized.has(normalizedName)) {
          seenNormalized.add(normalizedName);
          const category = SkillTaxonomyService.getCategory(canonical);
          skillDocs.push({
            userId,
            name: s.skillName, // Keep name for legacy compatibility
            skillName: s.skillName,
            normalizedName,
            category: s.category || category,
            proficiency: s.proficiency || 'intermediate',
            yearsOfExperience: s.yearsOfExperience || 1
          });
        }
      }

      if (skillDocs.length > 0) {
        await UserSkill.insertMany(skillDocs);
      }

      // Sync back to User record
      const skillsLegacy = skillDocs.map(s => s.skillName);
      await User.findByIdAndUpdate(userId, { $set: { skills: skillsLegacy } });
    }

    await UserCertification.deleteMany({ userId });
    if (parsedData.certifications && parsedData.certifications.length > 0) {
      const docs = parsedData.certifications.map(c => ({ ...c, userId }));
      await UserCertification.insertMany(docs);
      // Sync back to User record
      const certsLegacy = parsedData.certifications.map(c => c.name);
      await User.findByIdAndUpdate(userId, { $set: { certifications: certsLegacy } });
    }

    await UserAchievement.deleteMany({ userId });
    if (parsedData.achievements && parsedData.achievements.length > 0) {
      const docs = parsedData.achievements.map(a => ({ ...a, userId }));
      await UserAchievement.insertMany(docs);
    }

    return res.status(200).json({
      message: 'Resume imported and parsed successfully into normalized collections.',
      profile
    });

  } catch (error) {
    console.error('[resumeController] Error importing resume:', error);
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const generateResume = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { jobId, templateId, versionName } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Target Job not found.' });
    }

    // Pull full profile normalized data
    const profile = await UserProfile.findOne({ userId });
    const experiences = await UserExperience.find({ userId });
    const projects = await UserProject.find({ userId });
    const skills = await UserSkill.find({ userId });
    const certifications = await UserCertification.find({ userId });
    const achievements = await UserAchievement.find({ userId });
    const education = await UserEducation.find({ userId });

    // Call AI Resume Tailoring Generator Service
    console.log('[Resume Generator] Customizing resume content...');
    const generatorInput = {
      profile,
      experiences,
      projects,
      skills,
      certifications,
      achievements,
      education,
      jobTitle: job.title,
      jobDescription: job.description || ''
    };

    const tailoredData = await ResumeGeneratorService.generateTailoredResume(generatorInput);

    // Call ATS scoring service
    console.log('[Resume Generator] Evaluation by ATS Scoring Engine...');
    const scoreReport = await ResumeScoringEngine.scoreResume(
      tailoredData.resumeContent,
      job.title,
      job.description || ''
    );

    // Save as a ResumeVersion
    const resumeVersion = new ResumeVersion({
      userId,
      jobId,
      templateId: templateId || null,
      versionName: versionName || `${job.title} Tailored Resume`,
      generatedResume: tailoredData.resumeContent,
      matchScore: tailoredData.matchScore,
      atsScore: scoreReport.atsScore,
      keywordCoverage: scoreReport.keywordCoverage,
      improvementSuggestions: scoreReport.improvementSuggestions,
      outcome: 'Saved'
    });

    await resumeVersion.save();

    return res.status(201).json(resumeVersion);

  } catch (error) {
    console.error('[resumeController] Error generating tailored resume:', error);
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const getResumeVersions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const versions = await ResumeVersion.find({ userId })
      .populate('jobId')
      .populate('templateId')
      .sort({ generatedAt: -1 });

    return res.status(200).json(versions);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const updateOutcome = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { outcome, notes } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const updated = await ResumeVersion.findOneAndUpdate(
      { _id: id, userId },
      { $set: { outcome, notes } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Resume version not found.' });
    }

    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const getTemplates = async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const templates = await ResumeTemplate.find();
    return res.status(200).json(templates);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const compareVersions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { v1Id, v2Id } = req.query;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const v1 = await ResumeVersion.findOne({ _id: v1Id, userId }).populate('jobId');
    const v2 = await ResumeVersion.findOne({ _id: v2Id, userId }).populate('jobId');

    if (!v1 || !v2) {
      return res.status(404).json({ message: 'One or both resume versions not found.' });
    }

    const v1Resume = v1.generatedResume || { skills: [], projects: [], summary: '' };
    const v2Resume = v2.generatedResume || { skills: [], projects: [], summary: '' };

    const v1Skills = (v1Resume.skills || []) as string[];
    const v2Skills = (v2Resume.skills || []) as string[];
    const v1Projects = (v1Resume.projects || []) as any[];
    const v2Projects = (v2Resume.projects || []) as any[];

    // Generate textual summaries/differences highlights
    const addedSkills = v2Skills.filter(s => !v1Skills.includes(s));
    const removedSkills = v1Skills.filter(s => !v2Skills.includes(s));

    const addedProjects = v2Projects.map((p: any) => p.title).filter(t => !v1Projects.map((p: any) => p.title).includes(t));
    const removedProjects = v1Projects.map((p: any) => p.title).filter(t => !v2Projects.map((p: any) => p.title).includes(t));

    return res.status(200).json({
      v1: {
        id: v1._id,
        name: v1.versionName,
        jobTitle: (v1.jobId as any)?.title || 'General',
        matchScore: v1.matchScore,
        atsScore: v1.atsScore,
        keywordCoverage: v1.keywordCoverage,
        summary: v1Resume.summary
      },
      v2: {
        id: v2._id,
        name: v2.versionName,
        jobTitle: (v2.jobId as any)?.title || 'General',
        matchScore: v2.matchScore,
        atsScore: v2.atsScore,
        keywordCoverage: v2.keywordCoverage,
        summary: v2Resume.summary
      },
      differences: {
        addedSkills,
        removedSkills,
        addedProjects,
        removedProjects,
        scoreDelta: v2.atsScore - v1.atsScore,
        matchDelta: v2.matchScore - v1.matchScore
      }
    });

  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};
