"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectIntelligenceEngine = void 0;
const generative_ai_1 = require("@google/generative-ai");
class ProjectIntelligenceEngine {
    static async analyzeProject(title, description, userTechnologies) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.warn('[ProjectIntelligenceEngine] GEMINI_API_KEY is not configured. Returning mock project insights.');
            return this.getMockInsights(title, userTechnologies);
        }
        try {
            const genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({
                model: 'gemini-2.5-flash',
                generationConfig: { responseMimeType: 'application/json' }
            });
            const prompt = `
You are an expert technical resume architect. Analyze the project details provided and extract/evaluate technical parameters.

PROJECT DETAILS:
Title: ${title}
Description: ${description}
Provided Technologies: ${userTechnologies.join(', ')}

You must return a JSON object with the following exact structure:
{
  "projectCategory": "string (e.g. Full-Stack Web App, CLI Tool, ML Pipeline)",
  "technologiesDetected": ["string (normalized technologies like React, Express, MongoDB, Docker)"],
  "businessDomain": "string (e.g. Finance, Healthcare, Real Estate, E-commerce, HRMS, Productivity)",
  "complexityScore": number (1 to 100 based on architectural complexity, data persistence, and systems integration),
  "resumePriority": number (1 to 100 reflecting how compelling this project is on a resume)
}
`;
            const result = await model.generateContent(prompt);
            const rawText = result.response.text();
            return JSON.parse(rawText);
        }
        catch (error) {
            console.error('[ProjectIntelligenceEngine] Failed to analyze project with Gemini:', error);
            return this.getMockInsights(title, userTechnologies);
        }
    }
    static getMockInsights(title, userTechnologies) {
        const titleLower = title.toLowerCase();
        let projectCategory = 'Full-Stack Web App';
        let businessDomain = 'Productivity';
        let complexityScore = 65;
        let resumePriority = 70;
        if (titleLower.includes('erp') || titleLower.includes('hrms') || titleLower.includes('dashboard')) {
            projectCategory = 'Enterprise SaaS Dashboard';
            businessDomain = 'HR & Operations';
            complexityScore = 75;
            resumePriority = 80;
        }
        else if (titleLower.includes('extension') || titleLower.includes('chrome')) {
            projectCategory = 'Browser Extension';
            businessDomain = 'Developer Tools';
            complexityScore = 70;
            resumePriority = 75;
        }
        else if (titleLower.includes('shop') || titleLower.includes('e-commerce') || titleLower.includes('store')) {
            projectCategory = 'E-commerce Platform';
            businessDomain = 'Retail';
            complexityScore = 80;
            resumePriority = 85;
        }
        else if (titleLower.includes('ai') || titleLower.includes('llm') || titleLower.includes('machine learning')) {
            projectCategory = 'AI Service Engine';
            businessDomain = 'Artificial Intelligence';
            complexityScore = 85;
            resumePriority = 90;
        }
        return {
            projectCategory,
            technologiesDetected: userTechnologies.length > 0 ? userTechnologies : ['TypeScript', 'Node.js', 'React'],
            businessDomain,
            complexityScore,
            resumePriority
        };
    }
}
exports.ProjectIntelligenceEngine = ProjectIntelligenceEngine;
