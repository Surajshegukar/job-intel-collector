"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileEmbedding = void 0;
const mongoose_1 = require("mongoose");
const ProfileEmbeddingSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    resumeVersionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'UserResumeVersion' },
    vector: { type: [Number], required: true },
    modelName: { type: String, required: true },
    textHash: { type: String, required: true }
}, {
    timestamps: true
});
ProfileEmbeddingSchema.index({ userId: 1 });
ProfileEmbeddingSchema.index({ resumeVersionId: 1 });
exports.ProfileEmbedding = (0, mongoose_1.model)('ProfileEmbedding', ProfileEmbeddingSchema);
