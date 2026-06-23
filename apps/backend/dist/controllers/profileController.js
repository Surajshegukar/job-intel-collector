"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadResumeVersion = exports.addProject = exports.addSkill = exports.updateProfileData = exports.getProfileData = void 0;
const crypto_1 = __importDefault(require("crypto"));
const UserProfile_1 = require("../models/UserProfile");
const UserSkill_1 = require("../models/UserSkill");
const UserProject_1 = require("../models/UserProject");
const UserResumeVersion_1 = require("../models/UserResumeVersion");
const SkillTaxonomyService_1 = require("../ai/services/SkillTaxonomyService");
const getProfileData = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        let profile = await UserProfile_1.UserProfile.findOne({ userId });
        // Initialize profile from User collection if it does not exist (Self-healing)
        if (!profile) {
            const User = require('../models/User').User;
            const user = await User.findById(userId);
            if (!user)
                return res.status(404).json({ message: 'User account not found' });
            profile = new UserProfile_1.UserProfile({
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
                const normalized = SkillTaxonomyService_1.SkillTaxonomyService.normalizeSkill(skillName);
                await UserSkill_1.UserSkill.findOneAndUpdate({ userId, normalizedName: normalized.toLowerCase() }, { $set: { name: skillName, normalizedName: normalized.toLowerCase(), proficiency: 'intermediate' } }, { upsert: true });
            }
            for (const proj of (user.projects || [])) {
                await UserProject_1.UserProject.create({
                    userId,
                    title: proj.name,
                    description: proj.description,
                    technologies: proj.techStack || []
                });
            }
            if (user.resumeText) {
                const hash = crypto_1.default.createHash('md5').update(user.resumeText).digest('hex');
                await UserResumeVersion_1.UserResumeVersion.create({
                    userId,
                    versionName: 'Initial Resume (Imported)',
                    resumeText: user.resumeText,
                    resumeHash: hash,
                    isActive: true
                });
            }
        }
        // Load sub-collections
        const skills = await UserSkill_1.UserSkill.find({ userId });
        const projects = await UserProject_1.UserProject.find({ userId });
        const resumeVersions = await UserResumeVersion_1.UserResumeVersion.find({ userId });
        return res.json({
            profile,
            skills,
            projects,
            resumeVersions
        });
    }
    catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getProfileData = getProfileData;
const updateProfileData = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const { preferredRoles, preferredLocations, salaryExpectation, githubUrl, linkedinUrl, name } = req.body;
        const profile = await UserProfile_1.UserProfile.findOne({ userId });
        if (!profile)
            return res.status(404).json({ message: 'Profile not found' });
        if (name)
            profile.name = name;
        if (preferredRoles)
            profile.preferredRoles = preferredRoles;
        if (preferredLocations)
            profile.preferredLocations = preferredLocations;
        if (salaryExpectation)
            profile.salaryExpectation = salaryExpectation;
        if (githubUrl !== undefined)
            profile.githubUrl = githubUrl;
        if (linkedinUrl !== undefined)
            profile.linkedinUrl = linkedinUrl;
        await profile.save();
        return res.json({ message: 'Profile preferences updated successfully', profile });
    }
    catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.updateProfileData = updateProfileData;
const addSkill = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const { name, proficiency } = req.body;
        if (!name)
            return res.status(400).json({ message: 'Skill name is required' });
        // Normalize using Taxonomy Service
        const normalized = SkillTaxonomyService_1.SkillTaxonomyService.normalizeSkill(name);
        const userSkill = await UserSkill_1.UserSkill.findOneAndUpdate({ userId, normalizedName: normalized.toLowerCase() }, {
            $set: {
                name,
                normalizedName: normalized.toLowerCase(),
                proficiency: proficiency || 'intermediate'
            }
        }, { upsert: true, new: true });
        // Sync back to main UserProfile skill list string array
        const allSkills = await UserSkill_1.UserSkill.find({ userId });
        const skillNames = allSkills.map(s => s.name);
        await UserProfile_1.UserProfile.findOneAndUpdate({ userId }, { $set: { skills: skillNames } });
        return res.status(201).json(userSkill);
    }
    catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.addSkill = addSkill;
const addProject = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const { title, description, technologies, achievements } = req.body;
        if (!title)
            return res.status(400).json({ message: 'Project title is required' });
        const project = new UserProject_1.UserProject({
            userId,
            title,
            description,
            technologies: technologies || [],
            achievements: achievements || []
        });
        await project.save();
        return res.status(201).json(project);
    }
    catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.addProject = addProject;
const uploadResumeVersion = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const { versionName, resumeText } = req.body;
        if (!versionName || !resumeText) {
            return res.status(400).json({ message: 'versionName and resumeText are required.' });
        }
        const hash = crypto_1.default.createHash('md5').update(resumeText).digest('hex');
        // Deactivate prior resumes if this is set active
        await UserResumeVersion_1.UserResumeVersion.updateMany({ userId }, { $set: { isActive: false } });
        const newResume = new UserResumeVersion_1.UserResumeVersion({
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
    }
    catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.uploadResumeVersion = uploadResumeVersion;
