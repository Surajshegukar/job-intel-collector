import { Schema, model } from 'mongoose';

const ApplicationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
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

ApplicationSchema.index({ userId: 1, jobId: 1 }, { unique: true });

export const Application = model('Application', ApplicationSchema);
