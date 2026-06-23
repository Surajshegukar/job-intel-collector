import { Schema, model } from 'mongoose';

const JobSchema = new Schema({
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

// Add index on companyId and title, and url
JobSchema.index({ url: 1 });
JobSchema.index({ companyId: 1, title: 1 });

export const Job = model('Job', JobSchema);
