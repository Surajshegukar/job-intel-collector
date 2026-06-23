import { Schema, model } from 'mongoose';

const HiringPostSchema = new Schema({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  author: { type: String },
  source: { type: String },
  content: { type: String },
  url: { type: String }
}, {
  timestamps: true
});

export const HiringPost = model('HiringPost', HiringPostSchema);
