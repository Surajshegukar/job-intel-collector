"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHiringPosts = exports.createHiringPost = void 0;
const HiringPost_1 = require("../models/HiringPost");
const CompanyService_1 = require("../services/CompanyService");
const createHiringPost = async (req, res) => {
    try {
        const { author, company, content, source, url } = req.body;
        if (!content) {
            return res.status(400).json({ message: 'Content is required' });
        }
        let companyId = null;
        if (company && company.trim()) {
            const companyDoc = await CompanyService_1.CompanyService.findOrCreateCompany(company);
            companyId = companyDoc._id;
        }
        const post = new HiringPost_1.HiringPost({
            companyId,
            author: author || 'Unknown',
            content,
            source: source || 'Extension',
            url: url || ''
        });
        await post.save();
        const populatedPost = await HiringPost_1.HiringPost.findById(post._id).populate('companyId');
        return res.status(201).json(populatedPost);
    }
    catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.createHiringPost = createHiringPost;
const getHiringPosts = async (_req, res) => {
    try {
        const posts = await HiringPost_1.HiringPost.find()
            .populate('companyId')
            .sort({ createdAt: -1 });
        return res.json(posts);
    }
    catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getHiringPosts = getHiringPosts;
