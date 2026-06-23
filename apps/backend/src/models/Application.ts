import { Schema, model } from 'mongoose';

const ApplicationSchema = new Schema({
  jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true, unique: true },
  status: { 
    type: String, 
    enum: ['Saved', 'Applied', 'Interview', 'Rejected', 'Offer'], 
    default: 'Saved' 
  },
  appliedDate: { type: Date },
  notes: { type: String },
  // Future AI Preparation
  resumeMatchScore: { type: Number },
  aiFeedback: { type: String },
  coverLetter: { type: String }
}, {
  timestamps: true
});

export const Application = model('Application', ApplicationSchema);
