"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalysisHistory = void 0;
const mongoose_1 = require("mongoose");
const AnalysisHistorySchema = new mongoose_1.Schema({
    jobAnalysisId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'JobAnalysis', required: true },
    jobId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Job', required: true },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    matchScore: { type: Number },
    roleCategory: { type: String },
    seniority: { type: String },
    analysisVersion: { type: String },
    aiProvider: { type: String },
    rawResponse: { type: String },
    generatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});
AnalysisHistorySchema.index({ jobAnalysisId: 1 });
AnalysisHistorySchema.index({ jobId: 1, userId: 1 });
exports.AnalysisHistory = (0, mongoose_1.model)('AnalysisHistory', AnalysisHistorySchema);
