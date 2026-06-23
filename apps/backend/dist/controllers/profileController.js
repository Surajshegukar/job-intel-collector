"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAchievement = exports.addAchievement = exports.deleteCertification = exports.addCertification = exports.deleteEducation = exports.updateEducation = exports.addEducation = exports.deleteExperience = exports.updateExperience = exports.addExperience = exports.deleteProject = exports.updateProject = exports.addProject = exports.deleteSkill = exports.updateSkill = exports.addSkill = exports.updateProfileData = exports.getProfileData = void 0;
const UserProfile_1 = require("../models/UserProfile");
const UserSkill_1 = require("../models/UserSkill");
const UserProject_1 = require("../models/UserProject");
const UserExperience_1 = require("../models/UserExperience");
const UserCertification_1 = require("../models/UserCertification");
const UserAchievement_1 = require("../models/UserAchievement");
const UserEducation_1 = require("../models/UserEducation");
const ResumeVersion_1 = require("../models/ResumeVersion");
const SkillTaxonomyService_1 = require("../ai/services/SkillTaxonomyService");
const ProfileCompletenessEngine_1 = require("../ai/services/ProfileCompletenessEngine");
const ProjectIntelligenceEngine_1 = require("../ai/services/ProjectIntelligenceEngine");
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
                summary: user.resumeText ? user.resumeText.substring(0, 150) + '...' : ''
            });
            await profile.save();
            // Populate sub-collections
            for (const skillName of (user.skills || [])) {
                const normalized = SkillTaxonomyService_1.SkillTaxonomyService.normalizeSkill(skillName);
                const category = SkillTaxonomyService_1.SkillTaxonomyService.getCategory(normalized);
                await UserSkill_1.UserSkill.findOneAndUpdate({ userId, normalizedName: normalized.toLowerCase() }, {
                    $set: {
                        name: skillName,
                        skillName: skillName,
                        normalizedName: normalized.toLowerCase(),
                        proficiency: 'intermediate',
                        category
                    }
                }, { upsert: true });
            }
            for (const proj of (user.projects || [])) {
                const insights = await ProjectIntelligenceEngine_1.ProjectIntelligenceEngine.analyzeProject(proj.name, proj.description || '', proj.techStack || []);
                await UserProject_1.UserProject.create({
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
                await UserExperience_1.UserExperience.create({
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
                await UserEducation_1.UserEducation.create({
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
                await UserCertification_1.UserCertification.create({
                    userId,
                    name: cert,
                    issuer: 'Google/Self',
                    issueDate: '2025'
                });
            }
        }
        // Load sub-collections
        const skills = await UserSkill_1.UserSkill.find({ userId });
        const projects = await UserProject_1.UserProject.find({ userId });
        const experiences = await UserExperience_1.UserExperience.find({ userId });
        const certifications = await UserCertification_1.UserCertification.find({ userId });
        const achievements = await UserAchievement_1.UserAchievement.find({ userId });
        const education = await UserEducation_1.UserEducation.find({ userId });
        const resumeVersions = await ResumeVersion_1.ResumeVersion.find({ userId }).sort({ generatedAt: -1 });
        // Calculate completeness
        const completeness = await ProfileCompletenessEngine_1.ProfileCompletenessEngine.calculateCompleteness(userId);
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
        const { preferredRoles, preferredLocations, salaryExpectation, githubUrl, linkedinUrl, name, phone, location, portfolioUrl, summary } = req.body;
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
        if (phone !== undefined)
            profile.phone = phone;
        if (location !== undefined)
            profile.location = location;
        if (portfolioUrl !== undefined)
            profile.portfolioUrl = portfolioUrl;
        if (summary !== undefined)
            profile.summary = summary;
        await profile.save();
        return res.json({ message: 'Profile details updated successfully', profile });
    }
    catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.updateProfileData = updateProfileData;
// Skills CRUD
const addSkill = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const { skillName, proficiency, yearsOfExperience, category } = req.body;
        if (!skillName)
            return res.status(400).json({ message: 'Skill name is required' });
        const normalized = SkillTaxonomyService_1.SkillTaxonomyService.normalizeSkill(skillName);
        const resolvedCategory = category || SkillTaxonomyService_1.SkillTaxonomyService.getCategory(normalized);
        const userSkill = await UserSkill_1.UserSkill.findOneAndUpdate({ userId, normalizedName: normalized.toLowerCase() }, {
            $set: {
                name: skillName,
                skillName,
                normalizedName: normalized.toLowerCase(),
                category: resolvedCategory,
                proficiency: proficiency || 'intermediate',
                yearsOfExperience: yearsOfExperience || 1
            }
        }, { upsert: true, new: true });
        return res.status(201).json(userSkill);
    }
    catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.addSkill = addSkill;
const updateSkill = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        const { proficiency, yearsOfExperience, category } = req.body;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const updated = await UserSkill_1.UserSkill.findOneAndUpdate({ _id: id, userId }, { $set: { proficiency, yearsOfExperience, category } }, { new: true });
        if (!updated)
            return res.status(404).json({ message: 'Skill not found.' });
        return res.json(updated);
    }
    catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.updateSkill = updateSkill;
const deleteSkill = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        await UserSkill_1.UserSkill.findOneAndDelete({ _id: id, userId });
        return res.json({ message: 'Skill deleted successfully.' });
    }
    catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.deleteSkill = deleteSkill;
// Projects CRUD
const addProject = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const { title, description, technologies, achievements, category, githubUrl, liveUrl, impactMetrics } = req.body;
        if (!title)
            return res.status(400).json({ message: 'Project title is required' });
        // Call Project Intelligence Engine
        const insights = await ProjectIntelligenceEngine_1.ProjectIntelligenceEngine.analyzeProject(title, description || '', technologies || []);
        const project = new UserProject_1.UserProject({
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
    }
    catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.addProject = addProject;
const updateProject = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        const { title, description, technologies, achievements, category, githubUrl, liveUrl, impactMetrics } = req.body;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const project = await UserProject_1.UserProject.findOne({ _id: id, userId });
        if (!project)
            return res.status(404).json({ message: 'Project not found.' });
        if (title)
            project.title = title;
        if (description)
            project.description = description;
        if (technologies)
            project.technologies = technologies;
        if (achievements)
            project.achievements = achievements;
        if (category)
            project.category = category;
        if (githubUrl !== undefined)
            project.githubUrl = githubUrl;
        if (liveUrl !== undefined)
            project.liveUrl = liveUrl;
        if (impactMetrics)
            project.impactMetrics = impactMetrics;
        // Recalculate insights if title or description changes
        if (title || description) {
            const insights = await ProjectIntelligenceEngine_1.ProjectIntelligenceEngine.analyzeProject(project.title, project.description || '', project.technologies || []);
            project.businessDomain = insights.businessDomain;
            project.complexityScore = insights.complexityScore;
            project.resumePriority = insights.resumePriority;
            project.category = category || insights.projectCategory;
        }
        await project.save();
        return res.json(project);
    }
    catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.updateProject = updateProject;
const deleteProject = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        await UserProject_1.UserProject.findOneAndDelete({ _id: id, userId });
        return res.json({ message: 'Project deleted successfully.' });
    }
    catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.deleteProject = deleteProject;
// Experience CRUD
const addExperience = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const { company, role, startDate, endDate, description, achievements, technologies, employmentType } = req.body;
        if (!company || !role || !startDate) {
            return res.status(400).json({ message: 'Company, role, and startDate are required' });
        }
        const exp = new UserExperience_1.UserExperience({
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
    }
    catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.addExperience = addExperience;
const updateExperience = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        const { company, role, startDate, endDate, description, achievements, technologies, employmentType } = req.body;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const exp = await UserExperience_1.UserExperience.findOne({ _id: id, userId });
        if (!exp)
            return res.status(404).json({ message: 'Work experience not found.' });
        if (company)
            exp.company = company;
        if (role)
            exp.role = role;
        if (startDate)
            exp.startDate = startDate;
        if (endDate !== undefined)
            exp.endDate = endDate;
        if (description !== undefined)
            exp.description = description;
        if (achievements)
            exp.achievements = achievements;
        if (technologies)
            exp.technologies = technologies;
        if (employmentType)
            exp.employmentType = employmentType;
        await exp.save();
        return res.json(exp);
    }
    catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.updateExperience = updateExperience;
const deleteExperience = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        await UserExperience_1.UserExperience.findOneAndDelete({ _id: id, userId });
        return res.json({ message: 'Work experience deleted successfully.' });
    }
    catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.deleteExperience = deleteExperience;
// Education CRUD
const addEducation = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const { school, degree, fieldOfStudy, startDate, endDate, description } = req.body;
        if (!school || !degree) {
            return res.status(400).json({ message: 'School and degree are required.' });
        }
        const edu = new UserEducation_1.UserEducation({
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
    }
    catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.addEducation = addEducation;
const updateEducation = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        const { school, degree, fieldOfStudy, startDate, endDate, description } = req.body;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const edu = await UserEducation_1.UserEducation.findOne({ _id: id, userId });
        if (!edu)
            return res.status(404).json({ message: 'Education record not found.' });
        if (school)
            edu.school = school;
        if (degree)
            edu.degree = degree;
        if (fieldOfStudy !== undefined)
            edu.fieldOfStudy = fieldOfStudy;
        if (startDate !== undefined)
            edu.startDate = startDate;
        if (endDate !== undefined)
            edu.endDate = endDate;
        if (description !== undefined)
            edu.description = description;
        await edu.save();
        return res.json(edu);
    }
    catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.updateEducation = updateEducation;
const deleteEducation = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        await UserEducation_1.UserEducation.findOneAndDelete({ _id: id, userId });
        return res.json({ message: 'Education record deleted successfully.' });
    }
    catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.deleteEducation = deleteEducation;
// Certifications CRUD
const addCertification = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const { name, issuer, issueDate, credentialUrl } = req.body;
        if (!name || !issuer) {
            return res.status(400).json({ message: 'Name and issuer are required.' });
        }
        const cert = new UserCertification_1.UserCertification({
            userId,
            name,
            issuer,
            issueDate,
            credentialUrl
        });
        await cert.save();
        return res.status(201).json(cert);
    }
    catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.addCertification = addCertification;
const deleteCertification = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        await UserCertification_1.UserCertification.findOneAndDelete({ _id: id, userId });
        return res.json({ message: 'Certification deleted successfully.' });
    }
    catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.deleteCertification = deleteCertification;
// Achievements CRUD
const addAchievement = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const { title, description, category } = req.body;
        if (!title) {
            return res.status(400).json({ message: 'Title is required.' });
        }
        const ach = new UserAchievement_1.UserAchievement({
            userId,
            title,
            description,
            category
        });
        await ach.save();
        return res.status(201).json(ach);
    }
    catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.addAchievement = addAchievement;
const deleteAchievement = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        await UserAchievement_1.UserAchievement.findOneAndDelete({ _id: id, userId });
        return res.json({ message: 'Achievement deleted successfully.' });
    }
    catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.deleteAchievement = deleteAchievement;
