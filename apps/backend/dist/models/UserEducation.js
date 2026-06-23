"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserEducation = void 0;
const mongoose_1 = require("mongoose");
const UserEducationSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
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
exports.UserEducation = (0, mongoose_1.model)('UserEducation', UserEducationSchema);
