"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyEmbedding = void 0;
const mongoose_1 = require("mongoose");
const CompanyEmbeddingSchema = new mongoose_1.Schema({
    companyId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Company', required: true, unique: true },
    vector: { type: [Number], required: true },
    modelName: { type: String, required: true },
    textHash: { type: String, required: true }
}, {
    timestamps: true
});
CompanyEmbeddingSchema.index({ companyId: 1 });
exports.CompanyEmbedding = (0, mongoose_1.model)('CompanyEmbedding', CompanyEmbeddingSchema);
