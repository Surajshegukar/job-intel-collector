import { Schema, model } from 'mongoose';

const UserEducationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  school: { type: String, required: true },
  degree: { type: String, required: true },
  fieldOfStudy: { type: String },
  startDate: { type: String },
  endDate: { type: String },
  description: { type: String }
}, {
  timestamps: true
});

UserEducationSchema.index({ userId: 1 });

export const UserEducation = model('UserEducation', UserEducationSchema);
