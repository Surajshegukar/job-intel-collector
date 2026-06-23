"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Application = void 0;
const mongoose_1 = require("mongoose");
const ApplicationSchema = new mongoose_1.Schema({
    jobId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Job', required: true, unique: true },
    status: {
        type: String,
        enum: ['Saved', 'Applied', 'Interview', 'Rejected', 'Offer'],
        default: 'Saved'
    },
    appliedDate: { type: Date },
    notes: { type: String },
    // Future AI Preparation
    resumeMatchScore: { type: Number },
    aiFeedback: { type: String },
    coverLetter: { type: String }
}, {
    timestamps: true
});
exports.Application = (0, mongoose_1.model)('Application', ApplicationSchema);
