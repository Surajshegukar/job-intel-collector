"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAISuggestions = exports.updateProfile = exports.getProfile = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const Job_1 = require("../models/Job");
const AIService_1 = require("../services/AIService");
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_job_intelligence_key_123';
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please enter all fields' });
        }
        const existingUser = await User_1.User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const newUser = new User_1.User({
            name,
            email,
            password: hashedPassword,
            education: [],
            experience: [],
            projects: [],
            skills: [],
            certifications: []
        });
        await newUser.save();
        const token = jsonwebtoken_1.default.sign({ id: newUser._id, email: newUser.email }, JWT_SECRET, {
            expiresIn: '24h'
        });
        return res.status(201).json({
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email
            }
        });
    }
    catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Please enter all fields' });
        }
        const user = await User_1.User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id, email: user.email }, JWT_SECRET, {
            expiresIn: '24h'
        });
        return res.status(200).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    }
    catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.login = login;
const getProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        const user = await User_1.User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.json(user);
    }
    catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { name, education, experience, projects, skills, certifications, resumeText } = req.body;
        const user = await User_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (name)
            user.name = name;
        if (education)
            user.education = education;
        if (experience)
            user.experience = experience;
        if (projects)
            user.projects = projects;
        if (skills)
            user.skills = skills;
        if (certifications)
            user.certifications = certifications;
        if (resumeText !== undefined) {
            user.resumeText = resumeText;
            // If resume text changed, update embedding placeholder
            if (resumeText) {
                user.resumeEmbedding = await AIService_1.AIService.generateEmbedding(resumeText);
            }
        }
        await user.save();
        const updatedUser = await User_1.User.findById(userId).select('-password');
        return res.json(updatedUser);
    }
    catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.updateProfile = updateProfile;
const getAISuggestions = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { jobId } = req.params;
        const user = await User_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const job = await Job_1.Job.findById(jobId).populate('companyId');
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        // 1. Analyze skill gap
        const skillGap = await AIService_1.AIService.analyzeSkillGap(user.skills, job.skills);
        // 2. Score resume
        const matchAnalysis = await AIService_1.AIService.matchResume(user.resumeText || '', job.description || '', user.skills);
        // 3. Tailor cover letter
        const companyName = job.companyId.name || 'Hiring Company';
        const coverLetter = await AIService_1.AIService.generateTailoredCoverLetter(user.name, user.skills, job.title, companyName, job.description || '');
        return res.json({
            skillGap,
            matchAnalysis,
            coverLetter
        });
    }
    catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getAISuggestions = getAISuggestions;
