import { Schema, model } from 'mongoose';

const RecruiterSchema = new Schema({
  name: { type: String, required: true },
  title: { type: String },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company' },
  linkedinUrl: { type: String },
  email: { type: String },
  phone: { type: String },
  notes: { type: String },
  jobsAssociated: [{ type: Schema.Types.ObjectId, ref: 'Job' }]
}, {
  timestamps: true
});

RecruiterSchema.index({ name: 1 });
RecruiterSchema.index({ companyId: 1 });

export const Recruiter = model('Recruiter', RecruiterSchema);
