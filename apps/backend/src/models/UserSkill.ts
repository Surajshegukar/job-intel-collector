import { Schema, model } from 'mongoose';

const UserSkillSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  normalizedName: { type: String, required: true },
  proficiency: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced', 'expert'], 
    default: 'intermediate' 
  }
}, {
  timestamps: true
});

UserSkillSchema.index({ userId: 1, normalizedName: 1 }, { unique: true });

export const UserSkill = model('UserSkill', UserSkillSchema);
