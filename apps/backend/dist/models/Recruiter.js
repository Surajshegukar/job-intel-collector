"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Recruiter = void 0;
const mongoose_1 = require("mongoose");
const RecruiterSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    title: { type: String },
    companyId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Company' },
    linkedinUrl: { type: String },
    email: { type: String },
    phone: { type: String },
    notes: { type: String },
    jobsAssociated: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Job' }]
}, {
    timestamps: true
});
RecruiterSchema.index({ name: 1 });
RecruiterSchema.index({ companyId: 1 });
exports.Recruiter = (0, mongoose_1.model)('Recruiter', RecruiterSchema);
