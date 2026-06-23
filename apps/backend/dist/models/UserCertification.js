"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserCertification = void 0;
const mongoose_1 = require("mongoose");
const UserCertificationSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    issuer: { type: String, required: true },
    issueDate: { type: String },
    credentialUrl: { type: String }
}, {
    timestamps: true
});
UserCertificationSchema.index({ userId: 1 });
exports.UserCertification = (0, mongoose_1.model)('UserCertification', UserCertificationSchema);
