import { Schema, model } from 'mongoose';

const AnalysisHistorySchema = new Schema({
  jobAnalysisId: { type: Schema.Types.ObjectId, ref: 'JobAnalysis', required: true },
  jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  matchScore: { type: Number },
  roleCategory: { type: String },
  seniority: { type: String },
  analysisVersion: { type: String },
  aiProvider: { type: String },
  rawResponse: { type: String },
  generatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

AnalysisHistorySchema.index({ jobAnalysisId: 1 });
AnalysisHistorySchema.index({ jobId: 1, userId: 1 });

export const AnalysisHistory = model('AnalysisHistory', AnalysisHistorySchema);
