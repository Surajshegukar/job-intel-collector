"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Company = void 0;
const mongoose_1 = require("mongoose");
const CompanySchema = new mongoose_1.Schema({
    name: { type: String, required: true, unique: true },
    website: { type: String },
    linkedinUrl: { type: String },
    industry: { type: String },
    companySize: { type: String },
    locations: [{ type: String }],
    techStack: [{ type: String }],
    hiringStatus: { type: String, default: 'Unknown' },
    notes: { type: String }
}, {
    timestamps: true
});
exports.Company = (0, mongoose_1.model)('Company', CompanySchema);
