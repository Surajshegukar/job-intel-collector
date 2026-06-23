"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteJob = exports.updateJob = exports.createJob = exports.getJobById = exports.getJobs = void 0;
const Job_1 = require("../models/Job");
const JobProcessingService_1 = require("../services/JobProcessingService");
const AnalysisQueue_1 = require("../ai/services/AnalysisQueue");
const getJobs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search;
        const location = req.query.location;
        const status = req.query.status;
        const source = req.query.source;
        const query = {};
        // Text search on title/description
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }
        if (status) {
            query.status = status;
        }
        if (source) {
            query.source = source;
        }
        const total = await Job_1.Job.countDocuments(query);
        const jobs = await Job_1.Job.find(query)
            .populate('companyId')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        return res.json({
            jobs,
            page,
            pages: Math.ceil(total / limit),
            total
        });
    }
    catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getJobs = getJobs;
const getJobById = async (req, res) => {
    try {
        const job = await Job_1.Job.findById(req.params.id).populate('companyId');
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        return res.json(job);
    }
    catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getJobById = getJobById;
const createJob = async (req, res) => {
    try {
        const result = await JobProcessingService_1.JobProcessingService.processAndSaveJob(req.body);
        // Trigger background AI Analysis
        const userId = req.user?.id;
        if (userId) {
            await AnalysisQueue_1.AnalysisQueue.addJob(result.job._id.toString(), userId);
        }
        const jobWithCompany = await Job_1.Job.findById(result.job._id).populate('companyId');
        return res.status(201).json({
            message: `Job ${result.action} successfully`,
            action: result.action,
            job: jobWithCompany
        });
    }
    catch (error) {
        return res.status(400).json({ message: error.message });
    }
};
exports.createJob = createJob;
const updateJob = async (req, res) => {
    try {
        const { title, location, salary, experience, description, skills, status } = req.body;
        // We can fetch job first
        const job = await Job_1.Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        let needsReanalysis = false;
        if (description !== undefined && description !== job.description) {
            needsReanalysis = true;
        }
        if (title)
            job.title = title;
        if (location !== undefined)
            job.location = location;
        if (salary !== undefined)
            job.salary = salary;
        if (experience !== undefined)
            job.experience = experience;
        if (description !== undefined)
            job.description = description;
        if (skills)
            job.skills = skills;
        if (status)
            job.status = status;
        await job.save();
        // Trigger AI analysis if description changes
        const userId = req.user?.id;
        if (needsReanalysis && userId) {
            await AnalysisQueue_1.AnalysisQueue.addJob(job._id.toString(), userId);
        }
        const jobWithCompany = await Job_1.Job.findById(job._id).populate('companyId');
        return res.json(jobWithCompany);
    }
    catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.updateJob = updateJob;
const deleteJob = async (req, res) => {
    try {
        await JobProcessingService_1.JobProcessingService.deleteJob(req.params.id);
        return res.json({ message: 'Job and associated application deleted successfully' });
    }
    catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.deleteJob = deleteJob;
