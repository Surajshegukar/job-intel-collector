"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Job = void 0;
const mongoose_1 = require("mongoose");
const JobSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    companyId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Company', required: true },
    source: { type: String },
    url: { type: String, required: true },
    location: { type: String },
    salary: { type: String },
    experience: { type: String },
    description: { type: String },
    skills: [{ type: String }],
    status: { type: String, default: 'Saved' },
    // Future AI Preparation
    descriptionEmbedding: { type: [Number] },
    keyRequirements: [{ type: String }]
}, {
    timestamps: true
});
// Add index on companyId and title, and url
JobSchema.index({ url: 1 });
JobSchema.index({ companyId: 1, title: 1 });
exports.Job = (0, mongoose_1.model)('Job', JobSchema);
