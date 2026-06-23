"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobEmbedding = void 0;
const mongoose_1 = require("mongoose");
const JobEmbeddingSchema = new mongoose_1.Schema({
    jobId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Job', required: true, unique: true },
    vector: { type: [Number], required: true },
    modelName: { type: String, required: true }, // e.g. "text-embedding-3-small"
    textHash: { type: String, required: true }
}, {
    timestamps: true
});
JobEmbeddingSchema.index({ jobId: 1 });
exports.JobEmbedding = (0, mongoose_1.model)('JobEmbedding', JobEmbeddingSchema);
