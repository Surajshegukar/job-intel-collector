"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyService = void 0;
const Company_1 = require("../models/Company");
class CompanyService {
    /**
     * Find a company by name (case-insensitive) or create a new one.
     */
    static async findOrCreateCompany(name, details) {
        if (!name || !name.trim()) {
            throw new Error('Company name is required');
        }
        const cleanName = name.trim();
        // Case-insensitive lookup
        let company = await Company_1.Company.findOne({ name: { $regex: new RegExp(`^${escapeRegExp(cleanName)}$`, 'i') } });
        if (!company) {
            const locations = details?.location ? [details.location] : [];
            company = new Company_1.Company({
                name: cleanName,
                website: details?.website || '',
                linkedinUrl: details?.linkedinUrl || '',
                industry: details?.industry || 'Unknown',
                companySize: details?.companySize || 'Unknown',
                locations,
                hiringStatus: 'Hiring', // Default to hiring when we ingest a job
                notes: `Created automatically during job ingestion.`
            });
            await company.save();
        }
        else {
            // Proactively merge missing fields
            let updated = false;
            if (details?.website && !company.website) {
                company.website = details.website;
                updated = true;
            }
            if (details?.linkedinUrl && !company.linkedinUrl) {
                company.linkedinUrl = details.linkedinUrl;
                updated = true;
            }
            if (details?.industry && (!company.industry || company.industry === 'Unknown')) {
                company.industry = details.industry;
                updated = true;
            }
            if (details?.companySize && (!company.companySize || company.companySize === 'Unknown')) {
                company.companySize = details.companySize;
                updated = true;
            }
            if (details?.location && !company.locations.includes(details.location)) {
                company.locations.push(details.location);
                updated = true;
            }
            if (updated) {
                await company.save();
            }
        }
        return company;
    }
}
exports.CompanyService = CompanyService;
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
