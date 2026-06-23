import { Schema, model } from 'mongoose';

const UserSkillSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  skillName: { type: String }, // For Phase 4 compatibility
  normalizedName: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Frontend', 'Backend', 'Database', 'Cloud', 'DevOps', 'Testing', 'Mobile', 'AI/ML', 'General'],
    default: 'General' 
  },
  proficiency: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced', 'expert'], 
    default: 'intermediate' 
  },
  yearsOfExperience: { type: Number, default: 0 }
}, {
  timestamps: true
});

UserSkillSchema.index({ userId: 1, normalizedName: 1 }, { unique: true });

export const UserSkill = model('UserSkill', UserSkillSchema);
