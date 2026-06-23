"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserResumeVersion = void 0;
const mongoose_1 = require("mongoose");
const UserResumeVersionSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    versionName: { type: String, required: true }, // e.g., "Default V1", "Tailored Frontend Developer"
    resumeText: { type: String, required: true },
    resumeHash: { type: String, required: true },
    embeddingId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ProfileEmbedding' },
    isActive: { type: Boolean, default: false }
}, {
    timestamps: true
});
UserResumeVersionSchema.index({ userId: 1 });
UserResumeVersionSchema.index({ resumeHash: 1 });
exports.UserResumeVersion = (0, mongoose_1.model)('UserResumeVersion', UserResumeVersionSchema);
