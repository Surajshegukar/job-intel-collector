import { Schema, model } from 'mongoose';

const EducationSchema = new Schema({
  school: { type: String, required: true },
  degree: { type: String, required: true },
  fieldOfStudy: { type: String },
  startDate: { type: String },
  endDate: { type: String },
  description: { type: String }
});

const ExperienceSchema = new Schema({
  company: { type: String, required: true },
  title: { type: String, required: true },
  location: { type: String },
  startDate: { type: String },
  endDate: { type: String },
  description: { type: String }
});

const ProjectSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  url: { type: String },
  techStack: [{ type: String }]
});

const UserSchema = new Schema({
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

export const User = model('User', UserSchema);
