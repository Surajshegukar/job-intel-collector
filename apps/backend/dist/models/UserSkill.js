"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSkill = void 0;
const mongoose_1 = require("mongoose");
const UserSkillSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    skillName: { type: String }, // For Phase 4 compatibility
    normalizedName: { type: String, required: true },
    category: {
        type: String,
        enum: ['Frontend', 'Backend', 'Database', 'Cloud', 'DevOps', 'Testing', 'Mobile', 'AI/ML', 'General'],
        default: 'General'
    },
    proficiency: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert'],
        default: 'intermediate'
    },
    yearsOfExperience: { type: Number, default: 0 }
}, {
    timestamps: true
});
UserSkillSchema.index({ userId: 1, normalizedName: 1 }, { unique: true });
exports.UserSkill = (0, mongoose_1.model)('UserSkill', UserSkillSchema);
