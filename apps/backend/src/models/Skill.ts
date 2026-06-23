import { Schema, model } from 'mongoose';

const SkillSchema = new Schema({
  name: { type: String, required: true, unique: true },
  category: { type: String, default: 'General' },
  frequency: { type: Number, default: 0 }
}, {
  timestamps: true
});

export const Skill = model('Skill', SkillSchema);
