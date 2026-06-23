import { Schema, model } from 'mongoose';

const InterviewPrepSchema = new Schema({
  jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  interviewTopics: [{ type: String }],
  questions: [{
    question: { type: String, required: true },
    suggestedAnswer: { type: String },
    topic: { type: String },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' }
  }],
  preparationGuidance: { type: String },
  aiProvider: { type: String },
  generatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

InterviewPrepSchema.index({ jobId: 1, userId: 1 }, { unique: true });

export const InterviewPrep = model('InterviewPrep', InterviewPrepSchema);
