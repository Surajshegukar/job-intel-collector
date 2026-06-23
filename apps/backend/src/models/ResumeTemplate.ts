import { Schema, model } from 'mongoose';

const ResumeTemplateSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true, unique: true }, // e.g. "ats", "modern", "minimal", "faang"
  htmlTemplate: { type: String, required: true },
  cssTemplate: { type: String, required: true }
}, {
  timestamps: true
});

export const ResumeTemplate = model('ResumeTemplate', ResumeTemplateSchema);
