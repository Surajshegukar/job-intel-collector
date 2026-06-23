"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIRecommendationFeedback = void 0;
const mongoose_1 = require("mongoose");
const AIRecommendationFeedbackSchema = new mongoose_1.Schema({
    jobId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Job', required: true },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    recommendationType: { type: String, enum: ['project', 'resume_section', 'interview_prep'], required: true },
    recommendationText: { type: String, required: true },
    feedback: { type: String, enum: ['helpful', 'unhelpful'], required: true },
    comment: { type: String }
}, {
    timestamps: true
});
AIRecommendationFeedbackSchema.index({ jobId: 1, userId: 1 });
exports.AIRecommendationFeedback = (0, mongoose_1.model)('AIRecommendationFeedback', AIRecommendationFeedbackSchema);
