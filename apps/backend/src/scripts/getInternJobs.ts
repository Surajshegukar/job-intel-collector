import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { resolve } from 'path';
import { Job } from '../models/Job';
import { JobAnalysis } from '../models/JobAnalysis';
import { Company } from '../models/Company';
import { AnalysisQueue } from '../ai/services/AnalysisQueue';

dotenv.config({ path: resolve(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/job_intelligence';

async function run() {
  // Satisfy TypeScript compiler
  console.log(`Using Company Model: ${Company.modelName}`);
  
  console.log('Connecting to database...');
  await mongoose.connect(MONGODB_URI);
  
  // Find the software engineer intern job
  const job = await Job.findOne({ title: { $regex: /intern/i } }).populate('companyId');
  
  if (!job) {
    console.log('No intern job found.');
    await mongoose.disconnect();
    return;
  }

  // Find the user Suraj Shegukar
  const User = require('../models/User').User;
  const user = await User.findOne({ email: 'surajshegukar2732@gmail.com' });
  if (!user) {
    console.log('User not found.');
    await mongoose.disconnect();
    return;
  }

  const userId = user._id.toString();
  const jobId = job._id.toString();

  console.log(`\nTriggering fresh AI analysis for Job: "${job.title}" & User: "${user.name}"...`);
  
  // Initialize queue
  await AnalysisQueue.initialize();
  
  // Clear any existing cached analyses to force a full run
  await JobAnalysis.deleteOne({ jobId, userId });

  // Add job to analysis queue
  await AnalysisQueue.addJob(jobId, userId);

  console.log('Waiting for background processing...');
  
  // Poll until the analysis status becomes completed or failed
  let analysis = null;
  for (let i = 0; i < 20; i++) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    analysis = await JobAnalysis.findOne({ jobId, userId });
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
  } else {
    console.log('Timeout waiting for AI analysis.');
  }

  await mongoose.disconnect();
}

run();
