import { Schema, model } from 'mongoose';

const CompanySchema = new Schema({
  name: { type: String, required: true, unique: true },
  website: { type: String },
  linkedinUrl: { type: String },
  industry: { type: String },
  companySize: { type: String },
  locations: [{ type: String }],
  techStack: [{ type: String }],
  hiringStatus: { type: String, default: 'Unknown' },
  notes: { type: String }
}, {
  timestamps: true
});

export const Company = model('Company', CompanySchema);
