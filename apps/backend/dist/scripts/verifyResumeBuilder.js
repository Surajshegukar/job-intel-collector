"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = require("path");
const mongoose_1 = __importDefault(require("mongoose"));
const ResumeParserService_1 = require("../ai/services/ResumeParserService");
const ProfileCompletenessEngine_1 = require("../ai/services/ProfileCompletenessEngine");
const ProjectIntelligenceEngine_1 = require("../ai/services/ProjectIntelligenceEngine");
const ResumeGeneratorService_1 = require("../ai/services/ResumeGeneratorService");
const ResumeScoringEngine_1 = require("../ai/services/ResumeScoringEngine");
const SkillTaxonomyService_1 = require("../ai/services/SkillTaxonomyService");
const User_1 = require("../models/User");
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
// Configure dotenv
const envPath = (0, path_1.resolve)(__dirname, '../../.env');
dotenv_1.default.config({ path: envPath });
const MOCK_RESUME = `
SURAJ SHEGUKAR
Full-Stack Developer (MERN / Next.js)
Pune, Maharashtra, India | +91 9021434751 | surajshegukar2732@gmail.com
GitHub: github.com/suraj | LinkedIn: linkedin.com/in/suraj

SUMMARY
Full-Stack Developer with 1.8+ years of experience building production-grade web applications using React.js, Next.js, Express.js, and Prisma. Experienced in monorepo architecture, REST APIs, and performance-optimized UIs.

EXPERIENCE
Quickensol IT Solutions LLP | Web Designer & Front-End Developer
Pune, India | Oct 2024 – Present
- Contributed to 30+ client projects spanning ERP and e-commerce platforms.
- Led front-end development for 10+ projects using React.js and Next.js.
- Tech Stack: React, Next.js, TailwindCSS, Express, MongoDB.

EDUCATION
Savitribai Phule Pune University | Bachelor of Engineering in Computer Science
Pune, India | 2020 – 2024

PROJECTS
Job Intelligence System
- Designed a system to scrape and extract jobs from multiple job boards using AI.
- Stack: React, Express, MongoDB, Gemini API, BullMQ.

CERTIFICATIONS
AWS Certified Cloud Practitioner (2025)
`;
async function verify() {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        console.error('MONGODB_URI is not set in env.');
        process.exit(1);
    }
    console.log('Connecting to database:', mongoUri);
    await mongoose_1.default.connect(mongoUri);
    console.log('Successfully connected to MongoDB.');
    try {
        // 1. Fetch a user for testing
        let user = await User_1.User.findOne({ email: 'surajshegukar2732@gmail.com' });
        if (!user) {
            console.log('Test user not found, creating one...');
            user = new User_1.User({
                name: 'Suraj Shegukar',
                email: 'surajshegukar2732@gmail.com',
                password: 'password123'
            });
            await user.save();
        }
        const userId = user._id;
        console.log('\n--- 1. PARSING RAW RESUME TEXT ---');
        const parsedData = await ResumeParserService_1.ResumeParserService.parseText(MOCK_RESUME);
        console.log('Extracted Profile Name:', parsedData.profile.name);
        console.log('Extracted Email:', parsedData.profile.email);
        console.log('Extracted Skills Count:', parsedData.skills.length);
        console.log('Extracted Experiences:', parsedData.experience.length);
        console.log('\n--- 2. SAVING CAREER PROFILE DATA COLLECTIONS ---');
        // Save UserProfile
        const profile = await UserProfile_1.UserProfile.findOneAndUpdate({ userId }, {
            $set: {
                name: parsedData.profile.name,
                email: parsedData.profile.email,
                phone: parsedData.profile.phone,
                location: parsedData.profile.location,
                linkedinUrl: parsedData.profile.linkedinUrl,
                githubUrl: parsedData.profile.githubUrl,
                portfolioUrl: parsedData.profile.portfolioUrl,
                summary: parsedData.profile.summary,
                preferredRoles: parsedData.profile.preferredRoles || [],
                preferredLocations: parsedData.profile.preferredLocations || []
            }
        }, { upsert: true, new: true });
        console.log('UserProfile saved successfully.');
        // Save Experiences
        await UserExperience_1.UserExperience.deleteMany({ userId });
        const experiencesToSave = parsedData.experience.map((exp) => ({ ...exp, userId }));
        if (experiencesToSave.length > 0) {
            await UserExperience_1.UserExperience.insertMany(experiencesToSave);
            console.log(`Saved ${experiencesToSave.length} experience records.`);
        }
        // Save Projects (enriched by ProjectIntelligenceEngine)
        await UserProject_1.UserProject.deleteMany({ userId });
        const projectsToSave = [];
        for (const p of parsedData.projects) {
            const insights = await ProjectIntelligenceEngine_1.ProjectIntelligenceEngine.analyzeProject(p.title, p.description || '', p.technologies || []);
            projectsToSave.push({
                ...p,
                userId,
                category: p.category || insights.projectCategory,
                technologies: insights.technologiesDetected,
                businessDomain: insights.businessDomain,
                complexityScore: insights.complexityScore,
                resumePriority: insights.resumePriority
            });
        }
        if (projectsToSave.length > 0) {
            await UserProject_1.UserProject.insertMany(projectsToSave);
            console.log(`Saved ${projectsToSave.length} project records (complexity-rated).`);
        }
        // Save Skills
        await UserSkill_1.UserSkill.deleteMany({ userId });
        const skillsToSave = parsedData.skills.map((s) => {
            const canonical = SkillTaxonomyService_1.SkillTaxonomyService.normalizeSkill(s.skillName);
            const category = SkillTaxonomyService_1.SkillTaxonomyService.getCategory(canonical);
            return {
                userId,
                name: s.skillName,
                skillName: s.skillName,
                normalizedName: canonical.toLowerCase(),
                category: s.category || category,
                proficiency: s.proficiency || 'intermediate',
                yearsOfExperience: s.yearsOfExperience || 1
            };
        });
        if (skillsToSave.length > 0) {
            await UserSkill_1.UserSkill.insertMany(skillsToSave);
            console.log(`Saved ${skillsToSave.length} skills records (taxonomy-mapped).`);
        }
        // Save Education
        await UserEducation_1.UserEducation.deleteMany({ userId });
        const eduToSave = parsedData.education.map((e) => ({ ...e, userId }));
        if (eduToSave.length > 0) {
            await UserEducation_1.UserEducation.insertMany(eduToSave);
            console.log(`Saved ${eduToSave.length} education records.`);
        }
        // Save Certifications
        await UserCertification_1.UserCertification.deleteMany({ userId });
        const certsToSave = parsedData.certifications.map((c) => ({ ...c, userId }));
        if (certsToSave.length > 0) {
            await UserCertification_1.UserCertification.insertMany(certsToSave);
            console.log(`Saved ${certsToSave.length} certification records.`);
        }
        console.log('\n--- 3. COMPLETENESS ENGINE METRICS ---');
        const completenessScore = await ProfileCompletenessEngine_1.ProfileCompletenessEngine.calculateCompleteness(userId.toString());
        console.log('Overall Profile Completeness Score:', completenessScore, '%');
        console.log('\n--- 4. RESUME GENERATOR TAILORING ---');
        // Fetch a job to target
        let job = await Job_1.Job.findOne();
        if (!job) {
            console.log('No job found in database. Creating a mock job for tailoring...');
            job = new Job_1.Job({
                title: 'Full-Stack Developer Intern',
                description: 'We are looking for a MERN stack and React developer to build clean user interfaces. Experience with Node.js, Express, MongoDB, and Tailwind CSS is required. Strong cloud understanding is a plus.',
                location: 'Pune',
                salary: 'Paid'
            });
            await job.save();
        }
        console.log('Targeting Job Position:', job.title);
        // Pull full profile normalized data
        const experiences = await UserExperience_1.UserExperience.find({ userId });
        const projects = await UserProject_1.UserProject.find({ userId });
        const skills = await UserSkill_1.UserSkill.find({ userId });
        const certifications = await UserCertification_1.UserCertification.find({ userId });
        const achievements = await UserAchievement_1.UserAchievement.find({ userId });
        const education = await UserEducation_1.UserEducation.find({ userId });
        const tailoredData = await ResumeGeneratorService_1.ResumeGeneratorService.generateTailoredResume({
            profile,
            experiences,
            projects,
            skills,
            certifications,
            achievements,
            education,
            jobTitle: job.title,
            jobDescription: job.description || ''
        });
        console.log('Tailored Summary Generated:', tailoredData.resumeContent.summary);
        console.log('Tailored Skills Selected:', tailoredData.resumeContent.skills.join(', '));
        console.log('Calculated Match Score:', tailoredData.matchScore, '%');
        console.log('\n--- 5. ATS SCORING EVALUATION ---');
        const scoreReport = await ResumeScoringEngine_1.ResumeScoringEngine.scoreResume(tailoredData.resumeContent, job.title, job.description || '');
        console.log('ATS Compatibility Score:', scoreReport.atsScore, '%');
        console.log('Keyword Coverage:', scoreReport.keywordCoverage, '%');
        console.log('Improvement Suggestions:', scoreReport.improvementSuggestions);
        console.log('\n--- 6. REGISTERING RESUME VERSION ---');
        const template = await ResumeTemplate_1.ResumeTemplate.findOne();
        const version = new ResumeVersion_1.ResumeVersion({
            userId,
            jobId: job._id,
            templateId: template ? template._id : null,
            versionName: `${job.title} Tailored v1`,
            generatedResume: tailoredData.resumeContent,
            matchScore: tailoredData.matchScore,
            atsScore: scoreReport.atsScore,
            keywordCoverage: scoreReport.keywordCoverage,
            improvementSuggestions: scoreReport.improvementSuggestions,
            outcome: 'Saved',
            notes: 'Initial generated tailored copy for testing'
        });
        await version.save();
        console.log(`Saved ResumeVersion ${version.versionName} with outcome: ${version.outcome}`);
        console.log('\n==================================================');
        console.log('PHASE 4 ENGINE PIPELINE VERIFICATION SUCCESSFUL!');
        console.log('==================================================');
    }
    catch (error) {
        console.error('Error during verification run:', error);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log('Disconnected from database.');
    }
}
verify();
