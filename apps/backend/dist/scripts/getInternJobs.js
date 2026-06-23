"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = require("path");
const Job_1 = require("../models/Job");
const JobAnalysis_1 = require("../models/JobAnalysis");
const Company_1 = require("../models/Company");
const AnalysisQueue_1 = require("../ai/services/AnalysisQueue");
dotenv_1.default.config({ path: (0, path_1.resolve)(__dirname, '../../.env') });
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/job_intelligence';
async function run() {
    // Satisfy TypeScript compiler
    console.log(`Using Company Model: ${Company_1.Company.modelName}`);
    console.log('Connecting to database...');
    await mongoose_1.default.connect(MONGODB_URI);
    // Find the software engineer intern job
    const job = await Job_1.Job.findOne({ title: { $regex: /intern/i } }).populate('companyId');
    if (!job) {
        console.log('No intern job found.');
        await mongoose_1.default.disconnect();
        return;
    }
    // Find the user Suraj Shegukar
    const User = require('../models/User').User;
    const user = await User.findOne({ email: 'surajshegukar2732@gmail.com' });
    if (!user) {
        console.log('User not found.');
        await mongoose_1.default.disconnect();
        return;
    }
    const userId = user._id.toString();
    const jobId = job._id.toString();
    console.log(`\nTriggering fresh AI analysis for Job: "${job.title}" & User: "${user.name}"...`);
    // Initialize queue
    await AnalysisQueue_1.AnalysisQueue.initialize();
    // Clear any existing cached analyses to force a full run
    await JobAnalysis_1.JobAnalysis.deleteOne({ jobId, userId });
    // Add job to analysis queue
    await AnalysisQueue_1.AnalysisQueue.addJob(jobId, userId);
    console.log('Waiting for background processing...');
    // Poll until the analysis status becomes completed or failed
    let analysis = null;
    for (let i = 0; i < 20; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        analysis = await JobAnalysis_1.JobAnalysis.findOne({ jobId, userId });
        if (analysis && (analysis.status === 'completed' || analysis.status === 'failed')) {
            break;
        }
    }
    if (analysis) {
        console.log('\n========================================');
        console.log('COMPARED ANALYSIS OUTPUT:');
        console.log('========================================');
        console.log(`Job Title:       ${job.title}`);
        console.log(`Seniority:       ${analysis.seniority} (Taxonomy Class)`);
        console.log(`Role Category:   ${analysis.roleCategory} (Taxonomy Class)`);
        console.log(`Salary:          ${analysis.salaryEstimate} (Extracted by AI)`);
        console.log(`Urgency:         ${analysis.hiringUrgency} (Extracted by AI)`);
        console.log(`AI Provider:     ${analysis.aiProvider} (${analysis.providerMetadata?.modelName})`);
        console.log(`Extracted Skills:${(analysis.extractedSkills || []).join(', ')} (Extracted by AI)`);
        console.log(`Missing Skills:  ${(analysis.missingSkills || []).join(', ')} (Calculated by Engine)`);
        console.log('----------------------------------------');
        console.log(`MATCH SCORE:     ${analysis.matchScore}% (Engine Weighted Total)`);
        console.log('Score Breakdown:');
        console.log(` - Skills:       ${analysis.scoreBreakdown?.skillsScore}%`);
        console.log(` - Projects:     ${analysis.scoreBreakdown?.projectsScore}%`);
        console.log(` - Experience:   ${analysis.scoreBreakdown?.experienceScore}%`);
        console.log(` - Certs:        ${analysis.scoreBreakdown?.certificationScore}%`);
        console.log(`Explanation:     ${analysis.scoreExplanation}`);
        console.log('========================================');
    }
    else {
        console.log('Timeout waiting for AI analysis.');
    }
    await mongoose_1.default.disconnect();
}
run();
