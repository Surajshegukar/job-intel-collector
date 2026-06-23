import { Schema, model } from 'mongoose';

const CompanyEmbeddingSchema = new Schema({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, unique: true },
  vector: { type: [Number], required: true },
  modelName: { type: String, required: true },
  textHash: { type: String, required: true }
}, {
  timestamps: true
});

CompanyEmbeddingSchema.index({ companyId: 1 });

export const CompanyEmbedding = model('CompanyEmbedding', CompanyEmbeddingSchema);
