"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCompany = exports.getCompanyById = exports.getCompanies = void 0;
const Company_1 = require("../models/Company");
const Job_1 = require("../models/Job");
const CompanyService_1 = require("../services/CompanyService");
const getCompanies = async (req, res) => {
    try {
        const search = req.query.search;
        const query = {};
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        const companies = await Company_1.Company.find(query).sort({ name: 1 });
        return res.json(companies);
    }
    catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getCompanies = getCompanies;
const getCompanyById = async (req, res) => {
    try {
        const company = await Company_1.Company.findById(req.params.id);
        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }
        // Fetch jobs associated with this company
        const jobs = await Job_1.Job.find({ companyId: company._id }).sort({ createdAt: -1 });
        return res.json({
            company,
            jobs
        });
    }
    catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getCompanyById = getCompanyById;
const createCompany = async (req, res) => {
    try {
        const { name, website, linkedinUrl, industry, companySize, locations, notes, hiringStatus } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Company name is required' });
        }
        const company = await CompanyService_1.CompanyService.findOrCreateCompany(name, {
            website,
            linkedinUrl,
            industry,
            companySize,
            location: locations?.[0]
        });
        let updated = false;
        if (locations && locations.length > 1) {
            for (const loc of locations) {
                if (!company.locations.includes(loc)) {
                    company.locations.push(loc);
                    updated = true;
                }
            }
        }
        if (notes && company.notes !== notes) {
            company.notes = notes;
            updated = true;
        }
        if (hiringStatus && company.hiringStatus !== hiringStatus) {
            company.hiringStatus = hiringStatus;
            updated = true;
        }
        if (updated) {
            await company.save();
        }
        return res.status(201).json(company);
    }
    catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.createCompany = createCompany;
