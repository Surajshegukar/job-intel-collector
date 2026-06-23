"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareVersions = exports.getTemplates = exports.updateOutcome = exports.getResumeVersions = exports.generateResume = exports.importResume = void 0;
const UserProfile_1 = require("../models/UserProfile");
const UserExperience_1 = require("../models/UserExperience");
const UserProject_1 = require("../models/UserProject");
const UserSkill_1 = require("../models/UserSkill");
const UserCertification_1 = require("../models/UserCertification");
const UserAchievement_1 = require("../models/UserAchievement");
const UserEducation_1 = require("../models/UserEducation");
const ResumeTemplate_1 = require("../models/ResumeTemplate");
const ResumeVersion_1 = require("../models/ResumeVersion");
const Job_1 = require("../models/Job");
const User_1 = require("../models/User");
const ResumeParserService_1 = require("../ai/services/ResumeParserService");
const ResumeGeneratorService_1 = require("../ai/services/ResumeGeneratorService");
const ResumeScoringEngine_1 = require("../ai/services/ResumeScoringEngine");
const SkillTaxonomyService_1 = require("../ai/services/SkillTaxonomyService");
const ProjectIntelligenceEngine_1 = require("../ai/services/ProjectIntelligenceEngine");
const pdfParse = require("pdf-parse");
const mammoth_1 = __importDefault(require("mammoth"));
const importResume = async (req, res) => {
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
            const data = await pdfParse(req.file.buffer);
            extractedText = data.text;
        }
        else if (fileExtension === 'docx') {
            const result = await mammoth_1.default.extractRawText({ buffer: req.file.buffer });
            extractedText = result.value;
        }
        else {
            // Text file
            extractedText = req.file.buffer.toString('utf-8');
        }
        if (!extractedText || extractedText.trim().length === 0) {
            return res.status(400).json({ message: 'Failed to extract text from the file.' });
        }
        // Call AI Parser Service
        console.log('[Resume Import] Parsing text via Gemini...');
        const parsedData = await ResumeParserService_1.ResumeParserService.parseText(extractedText);
        // Save/Overwrite user collections cleanly
        // 1. Profile Core Info
        const profile = await UserProfile_1.UserProfile.findOneAndUpdate({ userId }, {
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
        }, { upsert: true, new: true });
        // Sync back to primary User record for backward compatibility
        await User_1.User.findByIdAndUpdate(userId, {
            $set: {
                name: parsedData.profile.name,
                resumeText: extractedText
            }
        });
        // 2. Clear old sub-records to prevent duplicates, then insert new ones
        await UserEducation_1.UserEducation.deleteMany({ userId });
        if (parsedData.education && parsedData.education.length > 0) {
            const docs = parsedData.education.map(ed => ({ ...ed, userId }));
            await UserEducation_1.UserEducation.insertMany(docs);
            // Sync back to User record
            await User_1.User.findByIdAndUpdate(userId, { $set: { education: parsedData.education } });
        }
        await UserExperience_1.UserExperience.deleteMany({ userId });
        if (parsedData.experience && parsedData.experience.length > 0) {
            const docs = parsedData.experience.map(exp => ({ ...exp, userId }));
            await UserExperience_1.UserExperience.insertMany(docs);
            // Sync back to User record
            const experienceLegacy = parsedData.experience.map(e => ({
                company: e.company,
                title: e.role,
                startDate: e.startDate,
                endDate: e.endDate,
                description: e.description
            }));
            await User_1.User.findByIdAndUpdate(userId, { $set: { experience: experienceLegacy } });
        }
        await UserProject_1.UserProject.deleteMany({ userId });
        if (parsedData.projects && parsedData.projects.length > 0) {
            // Analyze every project using ProjectIntelligenceEngine before saving
            const enrichedProjects = [];
            for (const proj of parsedData.projects) {
                const insights = await ProjectIntelligenceEngine_1.ProjectIntelligenceEngine.analyzeProject(proj.title, proj.description || '', proj.technologies || []);
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
            await UserProject_1.UserProject.insertMany(enrichedProjects);
            // Sync back to User record
            const projectsLegacy = parsedData.projects.map(p => ({
                name: p.title,
                description: p.description,
                url: p.githubUrl || p.liveUrl || '',
                techStack: p.technologies
            }));
            await User_1.User.findByIdAndUpdate(userId, { $set: { projects: projectsLegacy } });
        }
        await UserSkill_1.UserSkill.deleteMany({ userId });
        if (parsedData.skills && parsedData.skills.length > 0) {
            const skillDocs = parsedData.skills.map(s => {
                const canonical = SkillTaxonomyService_1.SkillTaxonomyService.normalizeSkill(s.skillName);
                const category = SkillTaxonomyService_1.SkillTaxonomyService.getCategory(canonical);
                return {
                    userId,
                    name: s.skillName, // Keep name for legacy compatibility
                    skillName: s.skillName,
                    normalizedName: canonical.toLowerCase(),
                    category: s.category || category,
                    proficiency: s.proficiency || 'intermediate',
                    yearsOfExperience: s.yearsOfExperience || 1
                };
            });
            await UserSkill_1.UserSkill.insertMany(skillDocs);
            // Sync back to User record
            const skillsLegacy = parsedData.skills.map(s => s.skillName);
            await User_1.User.findByIdAndUpdate(userId, { $set: { skills: skillsLegacy } });
        }
        await UserCertification_1.UserCertification.deleteMany({ userId });
        if (parsedData.certifications && parsedData.certifications.length > 0) {
            const docs = parsedData.certifications.map(c => ({ ...c, userId }));
            await UserCertification_1.UserCertification.insertMany(docs);
            // Sync back to User record
            const certsLegacy = parsedData.certifications.map(c => c.name);
            await User_1.User.findByIdAndUpdate(userId, { $set: { certifications: certsLegacy } });
        }
        await UserAchievement_1.UserAchievement.deleteMany({ userId });
        if (parsedData.achievements && parsedData.achievements.length > 0) {
            const docs = parsedData.achievements.map(a => ({ ...a, userId }));
            await UserAchievement_1.UserAchievement.insertMany(docs);
        }
        return res.status(200).json({
            message: 'Resume imported and parsed successfully into normalized collections.',
            profile
        });
    }
    catch (error) {
        console.error('[resumeController] Error importing resume:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.importResume = importResume;
const generateResume = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const { jobId, templateId, versionName } = req.body;
        const job = await Job_1.Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Target Job not found.' });
        }
        // Pull full profile normalized data
        const profile = await UserProfile_1.UserProfile.findOne({ userId });
        const experiences = await UserExperience_1.UserExperience.find({ userId });
        const projects = await UserProject_1.UserProject.find({ userId });
        const skills = await UserSkill_1.UserSkill.find({ userId });
        const certifications = await UserCertification_1.UserCertification.find({ userId });
        const achievements = await UserAchievement_1.UserAchievement.find({ userId });
        const education = await UserEducation_1.UserEducation.find({ userId });
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
        const tailoredData = await ResumeGeneratorService_1.ResumeGeneratorService.generateTailoredResume(generatorInput);
        // Call ATS scoring service
        console.log('[Resume Generator] Evaluation by ATS Scoring Engine...');
        const scoreReport = await ResumeScoringEngine_1.ResumeScoringEngine.scoreResume(tailoredData.resumeContent, job.title, job.description || '');
        // Save as a ResumeVersion
        const resumeVersion = new ResumeVersion_1.ResumeVersion({
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
    }
    catch (error) {
        console.error('[resumeController] Error generating tailored resume:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.generateResume = generateResume;
const getResumeVersions = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const versions = await ResumeVersion_1.ResumeVersion.find({ userId })
            .populate('jobId')
            .populate('templateId')
            .sort({ generatedAt: -1 });
        return res.status(200).json(versions);
    }
    catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getResumeVersions = getResumeVersions;
const updateOutcome = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        const { outcome, notes } = req.body;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const updated = await ResumeVersion_1.ResumeVersion.findOneAndUpdate({ _id: id, userId }, { $set: { outcome, notes } }, { new: true });
        if (!updated) {
            return res.status(404).json({ message: 'Resume version not found.' });
        }
        return res.status(200).json(updated);
    }
    catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.updateOutcome = updateOutcome;
const getTemplates = async (_req, res) => {
    try {
        const templates = await ResumeTemplate_1.ResumeTemplate.find();
        return res.status(200).json(templates);
    }
    catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getTemplates = getTemplates;
const compareVersions = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { v1Id, v2Id } = req.query;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const v1 = await ResumeVersion_1.ResumeVersion.findOne({ _id: v1Id, userId }).populate('jobId');
        const v2 = await ResumeVersion_1.ResumeVersion.findOne({ _id: v2Id, userId }).populate('jobId');
        if (!v1 || !v2) {
            return res.status(404).json({ message: 'One or both resume versions not found.' });
        }
        const v1Resume = v1.generatedResume || { skills: [], projects: [], summary: '' };
        const v2Resume = v2.generatedResume || { skills: [], projects: [], summary: '' };
        const v1Skills = (v1Resume.skills || []);
        const v2Skills = (v2Resume.skills || []);
        const v1Projects = (v1Resume.projects || []);
        const v2Projects = (v2Resume.projects || []);
        // Generate textual summaries/differences highlights
        const addedSkills = v2Skills.filter(s => !v1Skills.includes(s));
        const removedSkills = v1Skills.filter(s => !v2Skills.includes(s));
        const addedProjects = v2Projects.map((p) => p.title).filter(t => !v1Projects.map((p) => p.title).includes(t));
        const removedProjects = v1Projects.map((p) => p.title).filter(t => !v2Projects.map((p) => p.title).includes(t));
        return res.status(200).json({
            v1: {
                id: v1._id,
                name: v1.versionName,
                jobTitle: v1.jobId?.title || 'General',
                matchScore: v1.matchScore,
                atsScore: v1.atsScore,
                keywordCoverage: v1.keywordCoverage,
                summary: v1Resume.summary
            },
            v2: {
                id: v2._id,
                name: v2.versionName,
                jobTitle: v2.jobId?.title || 'General',
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
    }
    catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.compareVersions = compareVersions;
