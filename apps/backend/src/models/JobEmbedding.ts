import { Schema, model } from 'mongoose';

const JobEmbeddingSchema = new Schema({
  jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true, unique: true },
  vector: { type: [Number], required: true },
  modelName: { type: String, required: true }, // e.g. "text-embedding-3-small"
  textHash: { type: String, required: true }
}, {
  timestamps: true
});

JobEmbeddingSchema.index({ jobId: 1 });

export const JobEmbedding = model('JobEmbedding', JobEmbeddingSchema);
