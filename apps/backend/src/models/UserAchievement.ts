import { Schema, model } from 'mongoose';

const UserAchievementSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
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

export const UserAchievement = model('UserAchievement', UserAchievementSchema);
