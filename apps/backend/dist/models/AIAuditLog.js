"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIAuditLog = void 0;
const mongoose_1 = require("mongoose");
const AIAuditLogSchema = new mongoose_1.Schema({
    jobId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Job' },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    event: { type: String, required: true }, // e.g., 'analysis_queued', 'analysis_started', 'analysis_failed', 'analysis_completed', 'provider_failover'
    level: { type: String, enum: ['info', 'warn', 'error'], default: 'info' },
    provider: { type: String },
    modelName: { type: String },
    latencyMs: { type: Number },
    errorMessage: { type: String },
    meta: { type: mongoose_1.Schema.Types.Mixed }
}, {
    timestamps: true
});
AIAuditLogSchema.index({ jobId: 1 });
AIAuditLogSchema.index({ userId: 1 });
AIAuditLogSchema.index({ level: 1 });
exports.AIAuditLog = (0, mongoose_1.model)('AIAuditLog', AIAuditLogSchema);
