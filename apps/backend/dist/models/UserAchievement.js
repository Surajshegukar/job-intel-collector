"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserAchievement = void 0;
const mongoose_1 = require("mongoose");
const UserAchievementSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    issuer: { type: String },
    issueDate: { type: String },
    expirationDate: { type: String },
    credentialId: { type: String },
    url: { type: String },
    description: { type: String },
    type: { type: String, enum: ['certification', 'award', 'publication', 'other'], default: 'certification' }
}, {
    timestamps: true
});
UserAchievementSchema.index({ userId: 1 });
exports.UserAchievement = (0, mongoose_1.model)('UserAchievement', UserAchievementSchema);
