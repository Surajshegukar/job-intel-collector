"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateApplication = exports.createApplication = exports.getApplications = void 0;
const Application_1 = require("../models/Application");
const Job_1 = require("../models/Job");
const getApplications = async (_req, res) => {
    try {
        const applications = await Application_1.Application.find()
            .populate({
            path: 'jobId',
            populate: { path: 'companyId' }
        })
            .sort({ updatedAt: -1 });
        return res.json(applications);
    }
    catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getApplications = getApplications;
const createApplication = async (req, res) => {
    try {
        const { jobId, status, appliedDate, notes } = req.body;
        if (!jobId) {
            return res.status(400).json({ message: 'jobId is required' });
        }
        // Check if application already exists for this job
        const existing = await Application_1.Application.findOne({ jobId });
        if (existing) {
            return res.status(400).json({ message: 'Application for this job already exists' });
        }
        const application = new Application_1.Application({
            jobId,
            status: status || 'Saved',
            appliedDate: appliedDate || (status && status !== 'Saved' ? new Date() : undefined),
            notes: notes || ''
        });
        await application.save();
        // Sync job status
        await Job_1.Job.findByIdAndUpdate(jobId, { status: application.status });
        const populated = await Application_1.Application.findById(application._id).populate({
            path: 'jobId',
            populate: { path: 'companyId' }
        });
        return res.status(201).json(populated);
    }
    catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.createApplication = createApplication;
const updateApplication = async (req, res) => {
    try {
        const { status, appliedDate, notes, resumeMatchScore, aiFeedback, coverLetter } = req.body;
        const application = await Application_1.Application.findById(req.params.id);
        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }
        if (status) {
            application.status = status;
            // If status changes to anything other than Saved and appliedDate isn't set, set it to now
            if (status !== 'Saved' && !application.appliedDate && !appliedDate) {
                application.appliedDate = new Date();
            }
        }
        if (appliedDate !== undefined)
            application.appliedDate = appliedDate;
        if (notes !== undefined)
            application.notes = notes;
        if (resumeMatchScore !== undefined)
            application.resumeMatchScore = resumeMatchScore;
        if (aiFeedback !== undefined)
            application.aiFeedback = aiFeedback;
        if (coverLetter !== undefined)
            application.coverLetter = coverLetter;
        await application.save();
        // Sync job status
        await Job_1.Job.findByIdAndUpdate(application.jobId, { status: application.status });
        const populated = await Application_1.Application.findById(application._id).populate({
            path: 'jobId',
            populate: { path: 'companyId' }
        });
        return res.json(populated);
    }
    catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.updateApplication = updateApplication;
