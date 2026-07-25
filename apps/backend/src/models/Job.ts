import { Schema, model } from 'mongoose';

const JobSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  source: { type: String },
  url: { type: String, required: true },
  location: { type: String },
  salary: { type: String },
  experience: { type: String },
  description: { type: String },
  skills: [{ type: String }],
  status: { type: String, default: 'Saved' },
  // Future AI Preparation
  descriptionEmbedding: { type: [Number] },
  keyRequirements: [{ type: String }]
}, {
  timestamps: true
});

// Add index on userId, companyId and title, and url
JobSchema.index({ userId: 1, url: 1 });
JobSchema.index({ userId: 1, companyId: 1, title: 1 });

export const Job = model('Job', JobSchema);
