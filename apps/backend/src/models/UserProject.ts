import { Schema, model } from 'mongoose';

const UserProjectSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  technologies: [{ type: String }],
  achievements: [{ type: String }]
}, {
  timestamps: true
});

UserProjectSchema.index({ userId: 1 });

export const UserProject = model('UserProject', UserProjectSchema);
