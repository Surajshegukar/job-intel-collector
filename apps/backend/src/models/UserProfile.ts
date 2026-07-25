import { Schema, model } from 'mongoose';

const UserProfileSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  
  preferredRoles: [{ type: String }],
  preferredLocations: [{ type: String }],
  salaryExpectation: {
    min: { type: Number },
    max: { type: Number },
    currency: { type: String, default: 'USD' }
  },
  phone: { type: String },
  location: { type: String },
  linkedinUrl: { type: String },
  githubUrl: { type: String },
  portfolioUrl: { type: String },
  summary: { type: String },
  noticePeriod: { type: String }
}, {
  timestamps: true
});

export const UserProfile = model('UserProfile', UserProfileSchema);
