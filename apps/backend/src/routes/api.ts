import { Router } from 'express';
import * as authController from '../controllers/authController';
import * as jobsController from '../controllers/jobsController';
import * as companiesController from '../controllers/companiesController';
import * as skillsController from '../controllers/skillsController';
import * as applicationsController from '../controllers/applicationsController';
import * as analyticsController from '../controllers/analyticsController';
import * as hiringPostsController from '../controllers/hiringPostsController';
import * as analysisController from '../controllers/analysisController';
import * as profileController from '../controllers/profileController';
import * as telemetryController from '../controllers/telemetryController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Authentication routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/profile', authMiddleware, authController.getProfile);
router.put('/auth/profile', authMiddleware, authController.updateProfile);
router.get('/auth/profile/ai-suggestions/:jobId', authMiddleware, authController.getAISuggestions);

// Jobs CRUD routes
// GET /api/jobs and GET /api/jobs/:id are open for read (or protected, we'll protect for standard auth setup)
router.get('/jobs', authMiddleware, jobsController.getJobs);
router.get('/jobs/:id', authMiddleware, jobsController.getJobById);
router.post('/jobs', authMiddleware, jobsController.createJob);
router.put('/jobs/:id', authMiddleware, jobsController.updateJob);
router.delete('/jobs/:id', authMiddleware, jobsController.deleteJob);

// Companies routes
router.get('/companies', authMiddleware, companiesController.getCompanies);
router.get('/companies/:id', authMiddleware, companiesController.getCompanyById);
router.post('/companies', authMiddleware, companiesController.createCompany);

// Hiring Posts routes
router.get('/hiring-posts', authMiddleware, hiringPostsController.getHiringPosts);
router.post('/hiring-posts', authMiddleware, hiringPostsController.createHiringPost);

// Skills routes
router.get('/skills', authMiddleware, skillsController.getSkills);


// Applications routes
router.get('/applications', authMiddleware, applicationsController.getApplications);
router.post('/applications', authMiddleware, applicationsController.createApplication);
router.put('/applications/:id', authMiddleware, applicationsController.updateApplication);

// Analytics routes
router.get('/analytics/overview', authMiddleware, analyticsController.getOverview);
router.get('/analytics/top-skills', authMiddleware, analyticsController.getTopSkills);
router.get('/analytics/top-companies', authMiddleware, analyticsController.getTopCompanies);
router.get('/analytics/locations', authMiddleware, analyticsController.getLocations);
router.get('/analytics/salary-ranges', authMiddleware, analyticsController.getSalaryRanges);

// ─── AI Analysis Endpoints ───────────────────────────────────────────────────
router.get('/jobs/:id/analysis', authMiddleware, analysisController.getAnalysis);
router.post('/jobs/:id/analyze', authMiddleware, analysisController.triggerAnalysis);
router.get('/jobs/:id/match', authMiddleware, analysisController.getMatchDetails);
router.get('/jobs/:id/interview-prep', authMiddleware, analysisController.getInterviewPrep);

// ─── Career Profile Endpoints ─────────────────────────────────────────────────
router.get('/profile', authMiddleware, profileController.getProfileData);
router.put('/profile', authMiddleware, profileController.updateProfileData);
router.post('/profile/skills', authMiddleware, profileController.addSkill);
router.post('/profile/projects', authMiddleware, profileController.addProject);
router.post('/profile/resume-version', authMiddleware, profileController.uploadResumeVersion);

// ─── Telemetry & Tuning Endpoints ─────────────────────────────────────────────
router.post('/analysis/feedback', authMiddleware, telemetryController.submitFeedback);
router.get('/ai/metrics', authMiddleware, telemetryController.getMetrics);
router.get('/ai/export', authMiddleware, telemetryController.exportTrainingData);

export default router;
