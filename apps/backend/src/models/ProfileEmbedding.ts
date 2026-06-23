import { Schema, model } from 'mongoose';

const ProfileEmbeddingSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  resumeVersionId: { type: Schema.Types.ObjectId, ref: 'UserResumeVersion' },
  vector: { type: [Number], required: true },
  modelName: { type: String, required: true },
  textHash: { type: String, required: true }
}, {
  timestamps: true
});

ProfileEmbeddingSchema.index({ userId: 1 });
ProfileEmbeddingSchema.index({ resumeVersionId: 1 });

export const ProfileEmbedding = model('ProfileEmbedding', ProfileEmbeddingSchema);
