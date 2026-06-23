import { Schema, model } from 'mongoose';

const UserExperienceSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  company: { type: String, required: true },
  role: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String }, // Can be empty or "Present"
  description: { type: String },
  achievements: [{ type: String }],
  technologies: [{ type: String }],
  employmentType: { 
    type: String, 
    enum: ['Full-Time', 'Part-Time', 'Contract', 'Internship', 'Freelance'],
    default: 'Full-Time'
  }
}, {
  timestamps: true
});

UserExperienceSchema.index({ userId: 1 });

export const UserExperience = model('UserExperience', UserExperienceSchema);
