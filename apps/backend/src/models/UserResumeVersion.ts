import { Schema, model } from 'mongoose';

const UserResumeVersionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  versionName: { type: String, required: true }, // e.g., "Default V1", "Tailored Frontend Developer"
  resumeText: { type: String, required: true },
  resumeHash: { type: String, required: true },
  embeddingId: { type: Schema.Types.ObjectId, ref: 'ProfileEmbedding' },
  isActive: { type: Boolean, default: false }
}, {
  timestamps: true
});

UserResumeVersionSchema.index({ userId: 1 });
UserResumeVersionSchema.index({ resumeHash: 1 });

export const UserResumeVersion = model('UserResumeVersion', UserResumeVersionSchema);
