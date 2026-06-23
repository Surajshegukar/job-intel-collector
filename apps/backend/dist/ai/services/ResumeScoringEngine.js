"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResumeScoringEngine = void 0;
const generative_ai_1 = require("@google/generative-ai");
class ResumeScoringEngine {
    static async scoreResume(resumeContent, jobTitle, jobDescription) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.warn('[ResumeScoringEngine] GEMINI_API_KEY is not configured. Returning mock score report.');
            return this.getMockReport(resumeContent, jobDescription);
        }
        try {
            const genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({
                model: 'gemini-2.5-flash',
                generationConfig: { responseMimeType: 'application/json' }
            });
            const prompt = `
You are an expert Applicant Tracking System (ATS) and Technical Recruiter. Your task is to critique a resume against a target job description and provide a score report.

TARGET JOB:
Title: ${jobTitle}
Description:
${jobDescription}

TAILORED RESUME CONTENT:
${JSON.stringify(resumeContent, null, 2)}

Calculate:
1. atsScore (0 to 100): Overall structural and relevance score for the ATS database parser.
2. keywordCoverage (0 to 100): Percentage of target keywords successfully hit in the resume text.
3. improvementSuggestions (Array of strings): Concrete, actionable recommendations to improve the resume matching.

You must respond with a JSON object of the exact structure:
{
  "atsScore": number,
  "keywordCoverage": number,
  "improvementSuggestions": ["string"]
}
`;
            const result = await model.generateContent(prompt);
            const rawText = result.response.text();
            return JSON.parse(rawText);
        }
        catch (error) {
            console.error('[ResumeScoringEngine] Failed to score resume with Gemini:', error);
            return this.getMockReport(resumeContent, jobDescription);
        }
    }
    static getMockReport(resumeContent, jobDescription) {
        // Basic mock calculation based on skill count and description length
        const skillCount = resumeContent?.skills?.length || 0;
        const jdLower = jobDescription.toLowerCase();
        // Look for matching keywords in description
        const keywords = ['react', 'node', 'typescript', 'mongodb', 'docker', 'aws', 'rest api', 'next.js'];
        let hits = 0;
        keywords.forEach(kw => {
            if (jdLower.includes(kw) && (resumeContent?.skills || []).some((s) => s.toLowerCase().includes(kw))) {
                hits++;
            }
        });
        const keywordCoverage = keywords.length > 0 ? Math.round((hits / keywords.length) * 100) : 50;
        const atsScore = Math.min(100, Math.round(50 + (skillCount * 3) + (hits * 5)));
        const improvementSuggestions = [
            'Quantify your impact in your work achievements using numeric values (e.g. % performance increase, hours saved).',
            'Integrate more domain-specific keyword variations from the job listing into your summary statement.',
            'Ensure that your core technical skills section is positioned towards the top of your resume for ATS parsibility.'
        ];
        return {
            atsScore: Math.max(30, atsScore),
            keywordCoverage: Math.max(20, keywordCoverage),
            improvementSuggestions
        };
    }
}
exports.ResumeScoringEngine = ResumeScoringEngine;
