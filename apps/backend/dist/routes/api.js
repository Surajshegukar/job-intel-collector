"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController = __importStar(require("../controllers/authController"));
const jobsController = __importStar(require("../controllers/jobsController"));
const companiesController = __importStar(require("../controllers/companiesController"));
const skillsController = __importStar(require("../controllers/skillsController"));
const applicationsController = __importStar(require("../controllers/applicationsController"));
const analyticsController = __importStar(require("../controllers/analyticsController"));
const hiringPostsController = __importStar(require("../controllers/hiringPostsController"));
const analysisController = __importStar(require("../controllers/analysisController"));
const profileController = __importStar(require("../controllers/profileController"));
const telemetryController = __importStar(require("../controllers/telemetryController"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Health check
router.get('/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});
// Authentication routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/profile', auth_1.authMiddleware, authController.getProfile);
router.put('/auth/profile', auth_1.authMiddleware, authController.updateProfile);
router.get('/auth/profile/ai-suggestions/:jobId', auth_1.authMiddleware, authController.getAISuggestions);
// Jobs CRUD routes
// GET /api/jobs and GET /api/jobs/:id are open for read (or protected, we'll protect for standard auth setup)
router.get('/jobs', auth_1.authMiddleware, jobsController.getJobs);
router.get('/jobs/:id', auth_1.authMiddleware, jobsController.getJobById);
router.post('/jobs', auth_1.authMiddleware, jobsController.createJob);
router.put('/jobs/:id', auth_1.authMiddleware, jobsController.updateJob);
router.delete('/jobs/:id', auth_1.authMiddleware, jobsController.deleteJob);
// Companies routes
router.get('/companies', auth_1.authMiddleware, companiesController.getCompanies);
router.get('/companies/:id', auth_1.authMiddleware, companiesController.getCompanyById);
router.post('/companies', auth_1.authMiddleware, companiesController.createCompany);
// Hiring Posts routes
router.get('/hiring-posts', auth_1.authMiddleware, hiringPostsController.getHiringPosts);
router.post('/hiring-posts', auth_1.authMiddleware, hiringPostsController.createHiringPost);
// Skills routes
router.get('/skills', auth_1.authMiddleware, skillsController.getSkills);
// Applications routes
router.get('/applications', auth_1.authMiddleware, applicationsController.getApplications);
router.post('/applications', auth_1.authMiddleware, applicationsController.createApplication);
router.put('/applications/:id', auth_1.authMiddleware, applicationsController.updateApplication);
// Analytics routes
router.get('/analytics/overview', auth_1.authMiddleware, analyticsController.getOverview);
router.get('/analytics/top-skills', auth_1.authMiddleware, analyticsController.getTopSkills);
router.get('/analytics/top-companies', auth_1.authMiddleware, analyticsController.getTopCompanies);
router.get('/analytics/locations', auth_1.authMiddleware, analyticsController.getLocations);
router.get('/analytics/salary-ranges', auth_1.authMiddleware, analyticsController.getSalaryRanges);
// ─── AI Analysis Endpoints ───────────────────────────────────────────────────
router.get('/jobs/:id/analysis', auth_1.authMiddleware, analysisController.getAnalysis);
router.post('/jobs/:id/analyze', auth_1.authMiddleware, analysisController.triggerAnalysis);
router.get('/jobs/:id/match', auth_1.authMiddleware, analysisController.getMatchDetails);
router.get('/jobs/:id/interview-prep', auth_1.authMiddleware, analysisController.getInterviewPrep);
// ─── Career Profile Endpoints ─────────────────────────────────────────────────
router.get('/profile', auth_1.authMiddleware, profileController.getProfileData);
router.put('/profile', auth_1.authMiddleware, profileController.updateProfileData);
router.post('/profile/skills', auth_1.authMiddleware, profileController.addSkill);
router.post('/profile/projects', auth_1.authMiddleware, profileController.addProject);
router.post('/profile/resume-version', auth_1.authMiddleware, profileController.uploadResumeVersion);
// ─── Telemetry & Tuning Endpoints ─────────────────────────────────────────────
router.post('/analysis/feedback', auth_1.authMiddleware, telemetryController.submitFeedback);
router.get('/ai/metrics', auth_1.authMiddleware, telemetryController.getMetrics);
router.get('/ai/export', auth_1.authMiddleware, telemetryController.exportTrainingData);
exports.default = router;
