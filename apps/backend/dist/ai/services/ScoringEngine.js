"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScoringEngine = void 0;
const SkillTaxonomyService_1 = require("./SkillTaxonomyService");
class ScoringEngine {
    static DEFAULT_CONFIG = {
        skillsWeight: 0.40,
        projectsWeight: 0.25,
        experienceWeight: 0.25,
        certificationsWeight: 0.10
    };
    /**
     * Calculate a deterministic match score and breakdown.
     */
    static calculateScore(candidate, job, config = this.DEFAULT_CONFIG) {
        // Normalize required skills
        const normalizedJobSkills = SkillTaxonomyService_1.SkillTaxonomyService.normalizeSkills(job.requiredSkills);
        // 1. Calculate Skills Score
        let skillsScore = 0;
        const normalizedCandidateSkills = candidate.skills.map(s => s.normalizedName.toLowerCase());
        const candidateSkillsSet = new Set(normalizedCandidateSkills);
        if (normalizedJobSkills.length > 0) {
            let matchCount = 0;
            for (const skill of normalizedJobSkills) {
                if (candidateSkillsSet.has(skill.toLowerCase())) {
                    matchCount++;
                }
            }
            skillsScore = Math.round((matchCount / normalizedJobSkills.length) * 100);
        }
        else {
            skillsScore = 100; // default to max if no required skills are listed
        }
        // 2. Calculate Projects Score
        let projectsScore = 0;
        if (normalizedJobSkills.length > 0 && candidate.projects.length > 0) {
            let coveredSkillsCount = 0;
            const projectTechSet = new Set();
            candidate.projects.forEach(p => {
                (p.technologies || []).forEach(tech => {
                    projectTechSet.add(SkillTaxonomyService_1.SkillTaxonomyService.normalizeSkill(tech).toLowerCase());
                });
            });
            for (const skill of normalizedJobSkills) {
                if (projectTechSet.has(skill.toLowerCase())) {
                    coveredSkillsCount++;
                }
            }
            projectsScore = Math.round((coveredSkillsCount / normalizedJobSkills.length) * 100);
        }
        else if (candidate.projects.length > 0) {
            projectsScore = 80; // default points for having projects if job has no listed skills
        }
        // 3. Calculate Experience Score
        let experienceScore = 0;
        const requiredYears = this.extractYearsFromExperienceString(job.experienceRequired, job.seniority);
        const candidateYears = this.calculateCandidateExperienceYears(candidate.experience);
        if (requiredYears === 0) {
            experienceScore = 100;
        }
        else {
            // Linear scaling: 100% if candidate matches or exceeds required years, scale down if less
            const ratio = candidateYears / requiredYears;
            experienceScore = Math.min(100, Math.round(ratio * 100));
        }
        // 4. Calculate Certifications Score
        let certificationScore = 0;
        if (candidate.certifications.length > 0) {
            // Basic check: do any certifications match the job category or required skills?
            let matches = 0;
            const certsText = candidate.certifications.join(' ').toLowerCase();
            normalizedJobSkills.forEach(skill => {
                if (certsText.includes(skill.toLowerCase())) {
                    matches++;
                }
            });
            // If certifications align with job skills, score is high; else baseline 50 for having certs
            certificationScore = normalizedJobSkills.length > 0
                ? Math.min(100, 50 + Math.round((matches / normalizedJobSkills.length) * 50))
                : 80;
        }
        // Calculate final weighted total
        const weightedTotal = Math.round((skillsScore * config.skillsWeight) +
            (projectsScore * config.projectsWeight) +
            (experienceScore * config.experienceWeight) +
            (certificationScore * config.certificationsWeight));
        // Build human-friendly explanation
        const explanationParts = [];
        explanationParts.push(`Overall match score is ${weightedTotal}%.`);
        if (skillsScore >= 80) {
            explanationParts.push(`Excellent skill overlap: you possess most of the required skills (${skillsScore}% match).`);
        }
        else if (skillsScore >= 50) {
            explanationParts.push(`Moderate skill overlap: you have ${skillsScore}% of the core skills requested.`);
        }
        else {
            explanationParts.push(`Significant skill gap detected: you have only ${skillsScore}% of the required tech stack.`);
        }
        if (projectsScore >= 70) {
            explanationParts.push('Your projects strongly demonstrate experience with the required tech stack.');
        }
        else if (projectsScore > 0) {
            explanationParts.push('Building additional projects with these required skills will strengthen your profile.');
        }
        const expDiff = candidateYears - requiredYears;
        if (expDiff >= 0) {
            explanationParts.push(`Your experience (${candidateYears} yrs) meets or exceeds the job requirement of ${requiredYears} yrs.`);
        }
        else {
            explanationParts.push(`Your experience (${candidateYears} yrs) is slightly below the requested ${requiredYears} yrs.`);
        }
        return {
            skillsScore,
            projectsScore,
            experienceScore,
            certificationScore,
            totalScore: weightedTotal,
            explanation: explanationParts.join(' ')
        };
    }
    /**
     * Helper: Parse a string like "3 years", "5-8 yrs", or a seniority level to estimate required years of experience.
     */
    static extractYearsFromExperienceString(expStr, seniority) {
        const clean = (expStr || '').toLowerCase();
        // Check regex match for numbers
        const matches = clean.match(/(\d+)/);
        if (matches && matches[1]) {
            return parseInt(matches[1]);
        }
        // Map seniority defaults if text-only
        const seniorityClean = (seniority || '').toLowerCase();
        if (seniorityClean.includes('intern'))
            return 0;
        if (seniorityClean.includes('fresher'))
            return 0;
        if (seniorityClean.includes('junior'))
            return 1;
        if (seniorityClean.includes('mid'))
            return 3;
        if (seniorityClean.includes('senior'))
            return 5;
        if (seniorityClean.includes('lead'))
            return 7;
        if (seniorityClean.includes('manager'))
            return 8;
        return 2; // general default
    }
    /**
     * Helper: Compute candidate years of experience based on job history dates.
     */
    static calculateCandidateExperienceYears(experience) {
        if (!experience || experience.length === 0)
            return 0;
        let totalMonths = 0;
        experience.forEach(exp => {
            const start = exp.startDate ? new Date(exp.startDate) : null;
            const end = exp.endDate ? new Date(exp.endDate) : new Date(); // assume current date if active/blank
            if (start && !isNaN(start.getTime()) && !isNaN(end.getTime())) {
                const diffMs = end.getTime() - start.getTime();
                const diffMonths = diffMs / (1000 * 60 * 60 * 24 * 30.4375);
                totalMonths += Math.max(0, diffMonths);
            }
        });
        const years = totalMonths / 12;
        return parseFloat(years.toFixed(1));
    }
}
exports.ScoringEngine = ScoringEngine;
