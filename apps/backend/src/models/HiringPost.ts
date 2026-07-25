import { Schema, model } from 'mongoose';

const HiringPostSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  author: { type: String },
  source: { type: String },
  content: { type: String },
  url: { type: String }
}, {
  timestamps: true
});

HiringPostSchema.index({ userId: 1 });

export const HiringPost = model('HiringPost', HiringPostSchema);
