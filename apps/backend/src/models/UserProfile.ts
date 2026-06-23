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
  githubUrl: { type: String },
  linkedinUrl: { type: String }
}, {
  timestamps: true
});

export const UserProfile = model('UserProfile', UserProfileSchema);
