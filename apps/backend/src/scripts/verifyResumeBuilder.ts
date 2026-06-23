import dotenv from 'dotenv';
import { resolve } from 'path';
import mongoose from 'mongoose';
import { PDFParse } from 'pdf-parse';
import { ResumeParserService } from '../ai/services/ResumeParserService';
import { ProfileCompletenessEngine } from '../ai/services/ProfileCompletenessEngine';
import { ProjectIntelligenceEngine } from '../ai/services/ProjectIntelligenceEngine';
import { ResumeGeneratorService } from '../ai/services/ResumeGeneratorService';
import { ResumeScoringEngine } from '../ai/services/ResumeScoringEngine';
import { SkillTaxonomyService } from '../ai/services/SkillTaxonomyService';

import { User } from '../models/User';
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

// Configure dotenv
const envPath = resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

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
  await mongoose.connect(mongoUri);
  console.log('Successfully connected to MongoDB.');

  try {
    console.log('--- 0. TESTING PDF PARSER IMPORT CALLABILITY ---');
    const parser = new PDFParse({ data: Buffer.from('Hello PDF World') });
    const pdfData = await parser.getText();
    console.log('pdf-parse function is imported successfully. Extracted text:', JSON.stringify(pdfData.text));

    // 1. Fetch a user for testing
    let user = await User.findOne({ email: 'surajshegukar2732@gmail.com' });
    if (!user) {
      console.log('Test user not found, creating one...');
      user = new User({
        name: 'Suraj Shegukar',
        email: 'surajshegukar2732@gmail.com',
        password: 'password123'
      });
      await user.save();
    }
    const userId = user._id;

    console.log('\n--- 1. PARSING RAW RESUME TEXT ---');
    const parsedData = await ResumeParserService.parseText(MOCK_RESUME);
    console.log('Extracted Profile Name:', parsedData.profile.name);
    console.log('Extracted Email:', parsedData.profile.email);
    console.log('Extracted Skills Count:', parsedData.skills.length);
    console.log('Extracted Experiences:', parsedData.experience.length);

    console.log('\n--- 2. SAVING CAREER PROFILE DATA COLLECTIONS ---');
    
    // Save UserProfile
    const profile = await UserProfile.findOneAndUpdate(
      { userId },
      {
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
      },
      { upsert: true, new: true }
    );
    console.log('UserProfile saved successfully.');

    // Save Experiences
    await UserExperience.deleteMany({ userId });
    const experiencesToSave = parsedData.experience.map((exp: any) => ({ ...exp, userId }));
    if (experiencesToSave.length > 0) {
      await UserExperience.insertMany(experiencesToSave);
      console.log(`Saved ${experiencesToSave.length} experience records.`);
    }

    // Save Projects (enriched by ProjectIntelligenceEngine)
    await UserProject.deleteMany({ userId });
    const projectsToSave = [];
    for (const p of parsedData.projects) {
      const insights = await ProjectIntelligenceEngine.analyzeProject(
        p.title,
        p.description || '',
        p.technologies || []
      );
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
      await UserProject.insertMany(projectsToSave);
      console.log(`Saved ${projectsToSave.length} project records (complexity-rated).`);
    }

    // Save Skills
    await UserSkill.deleteMany({ userId });
    const skillsToSave = parsedData.skills.map((s: any) => {
      const canonical = SkillTaxonomyService.normalizeSkill(s.skillName);
      const category = SkillTaxonomyService.getCategory(canonical);
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
      await UserSkill.insertMany(skillsToSave);
      console.log(`Saved ${skillsToSave.length} skills records (taxonomy-mapped).`);
    }

    // Save Education
    await UserEducation.deleteMany({ userId });
    const eduToSave = parsedData.education.map((e: any) => ({ ...e, userId }));
    if (eduToSave.length > 0) {
      await UserEducation.insertMany(eduToSave);
      console.log(`Saved ${eduToSave.length} education records.`);
    }

    // Save Certifications
    await UserCertification.deleteMany({ userId });
    const certsToSave = parsedData.certifications.map((c: any) => ({ ...c, userId }));
    if (certsToSave.length > 0) {
      await UserCertification.insertMany(certsToSave);
      console.log(`Saved ${certsToSave.length} certification records.`);
    }

    console.log('\n--- 3. COMPLETENESS ENGINE METRICS ---');
    const completenessScore = await ProfileCompletenessEngine.calculateCompleteness(userId.toString());
    console.log('Overall Profile Completeness Score:', completenessScore, '%');

    console.log('\n--- 4. RESUME GENERATOR TAILORING ---');
    // Fetch a job to target
    let job = await Job.findOne();
    if (!job) {
      console.log('No job found in database. Creating a mock job for tailoring...');
      job = new Job({
        title: 'Full-Stack Developer Intern',
        description: 'We are looking for a MERN stack and React developer to build clean user interfaces. Experience with Node.js, Express, MongoDB, and Tailwind CSS is required. Strong cloud understanding is a plus.',
        location: 'Pune',
        salary: 'Paid'
      });
      await job.save();
    }
    console.log('Targeting Job Position:', job.title);

    // Pull full profile normalized data
    const experiences = await UserExperience.find({ userId });
    const projects = await UserProject.find({ userId });
    const skills = await UserSkill.find({ userId });
    const certifications = await UserCertification.find({ userId });
    const achievements = await UserAchievement.find({ userId });
    const education = await UserEducation.find({ userId });

    const tailoredData = await ResumeGeneratorService.generateTailoredResume({
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
    const scoreReport = await ResumeScoringEngine.scoreResume(
      tailoredData.resumeContent,
      job.title,
      job.description || ''
    );

    console.log('ATS Compatibility Score:', scoreReport.atsScore, '%');
    console.log('Keyword Coverage:', scoreReport.keywordCoverage, '%');
    console.log('Improvement Suggestions:', scoreReport.improvementSuggestions);

    console.log('\n--- 6. REGISTERING RESUME VERSION ---');
    const template = await ResumeTemplate.findOne();
    const version = new ResumeVersion({
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

  } catch (error) {
    console.error('Error during verification run:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database.');
  }
}

verify();
