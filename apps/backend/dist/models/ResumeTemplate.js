"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResumeTemplate = void 0;
const mongoose_1 = require("mongoose");
const ResumeTemplateSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    type: { type: String, required: true, unique: true }, // e.g. "ats", "modern", "minimal", "faang"
    htmlTemplate: { type: String, required: true },
    cssTemplate: { type: String, required: true }
}, {
    timestamps: true
});
exports.ResumeTemplate = (0, mongoose_1.model)('ResumeTemplate', ResumeTemplateSchema);
