import { Schema, model } from 'mongoose';

const UserCertificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  issuer: { type: String, required: true },
  issueDate: { type: String },
  credentialUrl: { type: String }
}, {
  timestamps: true
});

UserCertificationSchema.index({ userId: 1 });

export const UserCertification = model('UserCertification', UserCertificationSchema);
