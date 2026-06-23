"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInterviewPrep = exports.getMatchDetails = exports.triggerAnalysis = exports.getAnalysis = void 0;
const Job_1 = require("../models/Job");
const JobAnalysis_1 = require("../models/JobAnalysis");
const InterviewPrep_1 = require("../models/InterviewPrep");
const AnalysisQueue_1 = require("../ai/services/AnalysisQueue");
const getAnalysis = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const job = await Job_1.Job.findById(id).populate('companyId');
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        let analysis = await JobAnalysis_1.JobAnalysis.findOne({ jobId: id, userId });
        // If analysis doesn't exist, queue it now and return a pending status
        if (!analysis) {
            await AnalysisQueue_1.AnalysisQueue.addJob(id, userId);
            analysis = await JobAnalysis_1.JobAnalysis.findOne({ jobId: id, userId });
        }
        return res.json({
            job,
            analysis
        });
    }
    catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getAnalysis = getAnalysis;
const triggerAnalysis = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const job = await Job_1.Job.findById(id);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        // Force analysis run
        await AnalysisQueue_1.AnalysisQueue.addJob(id, userId);
        return res.json({
            message: 'Background AI analysis triggered successfully.',
            status: 'pending'
        });
    }
    catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.triggerAnalysis = triggerAnalysis;
const getMatchDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const analysis = await JobAnalysis_1.JobAnalysis.findOne({ jobId: id, userId });
        if (!analysis) {
            return res.status(404).json({ message: 'Analysis not found yet. Try again shortly.' });
        }
        return res.json({
            matchScore: analysis.matchScore,
            missingSkills: analysis.missingSkills,
            scoreBreakdown: analysis.scoreBreakdown,
            scoreExplanation: analysis.scoreExplanation
        });
    }
    catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getMatchDetails = getMatchDetails;
const getInterviewPrep = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        // Attempt to load from dedicated prep schema first
        let prep = await InterviewPrep_1.InterviewPrep.findOne({ jobId: id, userId });
        if (!prep) {
            // Pull extracted prep questions from completed analysis
            const analysis = await JobAnalysis_1.JobAnalysis.findOne({ jobId: id, userId, status: 'completed' });
            if (analysis && (analysis.interviewTopics?.length || analysis.interviewQuestions?.length)) {
                // Create InterviewPrep record from analysis data
                prep = new InterviewPrep_1.InterviewPrep({
                    jobId: id,
                    userId,
                    interviewTopics: analysis.interviewTopics || [],
                    questions: analysis.interviewQuestions || [],
                    preparationGuidance: `Based on your compatibility profile for this ${analysis.roleCategory} position.`,
                    aiProvider: analysis.aiProvider
                });
                await prep.save();
            }
            else {
                return res.status(404).json({
                    message: 'Interview preparation data is not available yet. Ensure AI processing has completed.'
                });
            }
        }
        return res.json(prep);
    }
    catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getInterviewPrep = getInterviewPrep;
