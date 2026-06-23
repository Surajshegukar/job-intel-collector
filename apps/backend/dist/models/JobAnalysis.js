"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobAnalysis = void 0;
const mongoose_1 = require("mongoose");
const JobAnalysisSchema = new mongoose_1.Schema({
    jobId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Job', required: true },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
    },
    error: { type: String },
    // Score Details (calculated deterministically by backend engine)
    matchScore: { type: Number, min: 0, max: 100, default: 0 },
    scoreBreakdown: {
        skillsScore: { type: Number, default: 0 },
        projectsScore: { type: Number, default: 0 },
        experienceScore: { type: Number, default: 0 },
        certificationScore: { type: Number, default: 0 }
    },
    scoreExplanation: { type: String },
    // Role and Categorization
    roleCategory: { type: String },
    seniority: { type: String },
    experienceRequired: { type: String },
    salaryEstimate: { type: String },
    salaryNormalized: {
        min: { type: Number },
        max: { type: Number },
        currency: { type: String, default: 'USD' },
        period: { type: String, enum: ['hourly', 'monthly', 'yearly'], default: 'yearly' }
    },
    // Detections
    hiringUrgency: { type: String, enum: ['high', 'medium', 'low', 'unknown'], default: 'unknown' },
    referralAvailable: { type: Boolean, default: false },
    recruiterMentioned: { type: Boolean, default: false },
    applicationPriority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
    // Extracted Skills
    extractedSkills: [{ type: String }],
    missingSkills: [{ type: String }],
    // Resume suggestions & projects
    recommendedProjects: [{ type: String }],
    recommendedResumeSections: [{ type: String }],
    // Interview Prep
    interviewTopics: [{ type: String }],
    interviewQuestions: [{
            question: { type: String },
            suggestedAnswer: { type: String },
            topic: { type: String },
            difficulty: { type: String, enum: ['easy', 'medium', 'hard'] }
        }],
    // Embedding links
    embeddingId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'JobEmbedding' },
    vectorStatus: { type: String, enum: ['pending', 'indexed', 'failed'], default: 'pending' },
    // AI Telemetry
    aiProvider: { type: String },
    analysisVersion: { type: String, default: '1.0.0' },
    providerMetadata: {
        modelName: String,
        promptTokens: Number,
        completionTokens: Number,
        latencyMs: Number,
        costUSD: Number
    },
    rawResponse: { type: String }, // Raw JSON from provider for fine-tuning
    processingStartedAt: { type: Date },
    processingCompletedAt: { type: Date }
}, {
    timestamps: true
});
JobAnalysisSchema.index({ jobId: 1, userId: 1 }, { unique: true });
JobAnalysisSchema.index({ status: 1 });
exports.JobAnalysis = (0, mongoose_1.model)('JobAnalysis', JobAnalysisSchema);
