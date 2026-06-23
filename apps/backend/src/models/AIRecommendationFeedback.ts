import { Schema, model } from 'mongoose';

const AIRecommendationFeedbackSchema = new Schema({
  jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  recommendationType: { type: String, enum: ['project', 'resume_section', 'interview_prep'], required: true },
  recommendationText: { type: String, required: true },
  feedback: { type: String, enum: ['helpful', 'unhelpful'], required: true },
  comment: { type: String }
}, {
  timestamps: true
});

AIRecommendationFeedbackSchema.index({ jobId: 1, userId: 1 });

export const AIRecommendationFeedback = model('AIRecommendationFeedback', AIRecommendationFeedbackSchema);
