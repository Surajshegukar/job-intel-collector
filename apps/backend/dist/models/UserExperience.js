"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserExperience = void 0;
const mongoose_1 = require("mongoose");
const UserExperienceSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    company: { type: String, required: true },
    role: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String }, // Can be empty or "Present"
    description: { type: String },
    achievements: [{ type: String }],
    technologies: [{ type: String }],
    employmentType: {
        type: String,
        enum: ['Full-Time', 'Part-Time', 'Contract', 'Internship', 'Freelance'],
        default: 'Full-Time'
    }
}, {
    timestamps: true
});
UserExperienceSchema.index({ userId: 1 });
exports.UserExperience = (0, mongoose_1.model)('UserExperience', UserExperienceSchema);
