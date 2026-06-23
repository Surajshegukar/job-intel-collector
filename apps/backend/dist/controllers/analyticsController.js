"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSalaryRanges = exports.getLocations = exports.getTopCompanies = exports.getTopSkills = exports.getOverview = void 0;
const AnalyticsService_1 = require("../services/AnalyticsService");
const getOverview = async (_req, res) => {
    try {
        const stats = await AnalyticsService_1.AnalyticsService.getOverviewStats();
        return res.json(stats);
    }
    catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getOverview = getOverview;
const getTopSkills = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const skills = await AnalyticsService_1.AnalyticsService.getTopSkills(limit);
        return res.json(skills);
    }
    catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getTopSkills = getTopSkills;
const getTopCompanies = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const companies = await AnalyticsService_1.AnalyticsService.getTopCompanies(limit);
        return res.json(companies);
    }
    catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getTopCompanies = getTopCompanies;
const getLocations = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const locations = await AnalyticsService_1.AnalyticsService.getLocationStats(limit);
        return res.json(locations);
    }
    catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getLocations = getLocations;
const getSalaryRanges = async (_req, res) => {
    try {
        const ranges = await AnalyticsService_1.AnalyticsService.getSalaryRangeStats();
        return res.json(ranges);
    }
    catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getSalaryRanges = getSalaryRanges;
