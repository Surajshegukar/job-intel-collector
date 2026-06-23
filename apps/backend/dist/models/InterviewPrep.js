"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterviewPrep = void 0;
const mongoose_1 = require("mongoose");
const InterviewPrepSchema = new mongoose_1.Schema({
    jobId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Job', required: true },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    interviewTopics: [{ type: String }],
    questions: [{
            question: { type: String, required: true },
            suggestedAnswer: { type: String },
            topic: { type: String },
            difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' }
        }],
    preparationGuidance: { type: String },
    aiProvider: { type: String },
    generatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});
InterviewPrepSchema.index({ jobId: 1, userId: 1 }, { unique: true });
exports.InterviewPrep = (0, mongoose_1.model)('InterviewPrep', InterviewPrepSchema);
