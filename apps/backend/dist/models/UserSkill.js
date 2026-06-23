"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSkill = void 0;
const mongoose_1 = require("mongoose");
const UserSkillSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    normalizedName: { type: String, required: true },
    proficiency: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert'],
        default: 'intermediate'
    }
}, {
    timestamps: true
});
UserSkillSchema.index({ userId: 1, normalizedName: 1 }, { unique: true });
exports.UserSkill = (0, mongoose_1.model)('UserSkill', UserSkillSchema);
