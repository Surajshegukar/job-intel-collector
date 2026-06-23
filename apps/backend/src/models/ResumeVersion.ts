import { Schema, model } from 'mongoose';

const ResumeVersionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  jobId: { type: Schema.Types.ObjectId, ref: 'Job' }, // optional, can be general resume
  templateId: { type: Schema.Types.ObjectId, ref: 'ResumeTemplate' }, // optional
  versionName: { type: String, required: true }, // e.g. "Google Frontend Tailored v1"
  generatedResume: {
    summary: { type: String },
    experiences: [Schema.Types.Mixed],
    projects: [Schema.Types.Mixed],
    skills: [String],
    certifications: [String],
    achievements: [String],
    education: [Schema.Types.Mixed]
  },
  matchScore: { type: Number, default: 0 },
  atsScore: { type: Number, default: 0 },
  keywordCoverage: { type: Number, default: 0 },
  improvementSuggestions: [{ type: String }],
  outcome: { 
    type: String, 
    enum: ['Saved', 'Applied', 'Interview', 'Rejected', 'Offer'], 
    default: 'Saved' 
  },
  notes: { type: String },
  generatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

ResumeVersionSchema.index({ userId: 1 });
ResumeVersionSchema.index({ jobId: 1 });

export const ResumeVersion = model('ResumeVersion', ResumeVersionSchema);
