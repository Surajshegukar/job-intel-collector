import { Schema, model } from 'mongoose';

const AIAuditLogSchema = new Schema({
  jobId: { type: Schema.Types.ObjectId, ref: 'Job' },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  event: { type: String, required: true }, // e.g., 'analysis_queued', 'analysis_started', 'analysis_failed', 'analysis_completed', 'provider_failover'
  level: { type: String, enum: ['info', 'warn', 'error'], default: 'info' },
  provider: { type: String },
  modelName: { type: String },
  latencyMs: { type: Number },
  errorMessage: { type: String },
  meta: { type: Schema.Types.Mixed }
}, {
  timestamps: true
});

AIAuditLogSchema.index({ jobId: 1 });
AIAuditLogSchema.index({ userId: 1 });
AIAuditLogSchema.index({ level: 1 });

export const AIAuditLog = model('AIAuditLog', AIAuditLogSchema);
