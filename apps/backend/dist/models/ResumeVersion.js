"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResumeVersion = void 0;
const mongoose_1 = require("mongoose");
const ResumeVersionSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    jobId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Job' }, // optional, can be general resume
    templateId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ResumeTemplate' }, // optional
    versionName: { type: String, required: true }, // e.g. "Google Frontend Tailored v1"
    generatedResume: {
        summary: { type: String },
        experiences: [mongoose_1.Schema.Types.Mixed],
        projects: [mongoose_1.Schema.Types.Mixed],
        skills: [String],
        certifications: [String],
        achievements: [String],
        education: [mongoose_1.Schema.Types.Mixed]
    },
    matchScore: { type: Number, default: 0 },
    atsScore: { type: Number, default: 0 },
    keywordCoverage: { type: Number, default: 0 },
    improvementSuggestions: [{ type: String }],
    outcome: {
        type: String,
        enum: ['Saved', 'Applied', 'Interview', 'Rejected', 'Offer'],
        default: 'Saved'
    },
    notes: { type: String },
    generatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});
ResumeVersionSchema.index({ userId: 1 });
ResumeVersionSchema.index({ jobId: 1 });
exports.ResumeVersion = (0, mongoose_1.model)('ResumeVersion', ResumeVersionSchema);
