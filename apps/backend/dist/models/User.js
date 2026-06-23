"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const EducationSchema = new mongoose_1.Schema({
    school: { type: String, required: true },
    degree: { type: String, required: true },
    fieldOfStudy: { type: String },
    startDate: { type: String },
    endDate: { type: String },
    description: { type: String }
});
const ExperienceSchema = new mongoose_1.Schema({
    company: { type: String, required: true },
    title: { type: String, required: true },
    location: { type: String },
    startDate: { type: String },
    endDate: { type: String },
    description: { type: String }
});
const ProjectSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    description: { type: String },
    url: { type: String },
    techStack: [{ type: String }]
});
const UserSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    education: [EducationSchema],
    experience: [ExperienceSchema],
    projects: [ProjectSchema],
    skills: [{ type: String }],
    certifications: [{ type: String }],
    // Future AI Preparation
    resumeText: { type: String },
    resumeEmbedding: { type: [Number] }
}, {
    timestamps: true
});
exports.User = (0, mongoose_1.model)('User', UserSchema);
