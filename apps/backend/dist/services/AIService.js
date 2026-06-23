"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
class AIService {
    /**
     * Future: Generate text embeddings for semantic search or RAG pipeline.
     * Currently returns a mock 1536-dimensional vector.
     */
    static async generateEmbedding(text) {
        console.log(`[AI Proxy] Generating embedding for text length: ${text.length}`);
        // Mock a 1536-dimension float array (typical for OpenAI text-embedding-3-small)
        const embedding = Array.from({ length: 1536 }, () => Math.random());
        return embedding;
    }
    /**
     * Future: Run skill gap analysis between a user's skills and a job description's required skills.
     */
    static async analyzeSkillGap(userSkills, jobSkills) {
        const userSet = new Set(userSkills.map(s => s.toLowerCase().trim()));
        const missingSkills = jobSkills.filter(s => !userSet.has(s.toLowerCase().trim()));
        const totalRequired = jobSkills.length;
        const gapPercentage = totalRequired > 0
            ? Math.round((missingSkills.length / totalRequired) * 100)
            : 0;
        const recommendations = missingSkills.map(skill => `Take a certification or complete a project focused on ${skill} to close this gap.`);
        return {
            missingSkills,
            gapPercentage,
            recommendations: recommendations.length > 0 ? recommendations : ['Your profile matches all identified skills for this job!']
        };
    }
    /**
     * Future: Score how well a user's resume matches a job description.
     * Utilizes mock calculation based on skill overlap.
     */
    static async matchResume(resumeText, _jobDescription, userSkills = []) {
        if (!resumeText) {
            return {
                score: 0,
                fitLevel: 'Low',
                strengths: [],
                weaknesses: ['No resume text uploaded.'],
                feedback: 'Please upload a resume in your profile to run AI matching analysis.'
            };
        }
        // Identify job skills first
        const SkillExtractionService = require('./SkillExtractionService').SkillExtractionService;
        const jobSkills = SkillExtractionService.extractSkills(_jobDescription);
        // Calculate skill overlap
        const userSet = new Set(userSkills.map(s => s.toLowerCase().trim()));
        const matchingSkills = jobSkills.filter((s) => userSet.has(s.toLowerCase().trim()));
        const missingSkills = jobSkills.filter((s) => !userSet.has(s.toLowerCase().trim()));
        let score = 30; // base score if resume exists
        if (jobSkills.length > 0) {
            score += Math.round((matchingSkills.length / jobSkills.length) * 60);
        }
        else {
            score += 20; // default medium if no skills are listed in description
        }
        // Add some random variety (simulating LLM variance)
        score = Math.min(100, Math.max(0, score + Math.floor(Math.random() * 11) - 5));
        let fitLevel = 'Low';
        if (score >= 80)
            fitLevel = 'High';
        else if (score >= 50)
            fitLevel = 'Medium';
        return {
            score,
            fitLevel,
            strengths: matchingSkills.length > 0 ? matchingSkills : ['Professional experience is formatted cleanly.'],
            weaknesses: missingSkills.length > 0 ? missingSkills.slice(0, 3) : [],
            feedback: `Based on your resume, you have a ${fitLevel.toLowerCase()} matching likelihood. Closing the skills gaps in ${missingSkills.slice(0, 2).join(', ') || 'niche areas'} will increase your chances.`
        };
    }
    /**
     * Future: Generate a cover letter tailored to a job description.
     */
    static async generateTailoredCoverLetter(userName, userSkills, jobTitle, companyName, _jobDescription) {
        const skillHighlights = userSkills.slice(0, 3).join(', ');
        return `Dear Hiring Team at ${companyName},

I am writing to express my strong interest in the ${jobTitle} position. With my background in software development and specialized expertise in ${skillHighlights || 'web technologies'}, I am confident that I can make a significant contribution to your engineering group.

Based on the role description, I understand you are seeking a candidate who is skilled in analyzing complex environments and delivering robust solutions. Throughout my career, I have consistently aligned technical implementations with business objectives.

I am eager to bring my background in modern system architectures to ${companyName} and would welcome the opportunity to discuss how my skill set matches your current requirements.

Thank you for your time and consideration.

Sincerely,
${userName}`;
    }
}
exports.AIService = AIService;
