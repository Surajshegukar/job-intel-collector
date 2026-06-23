"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResumeGeneratorService = void 0;
const generative_ai_1 = require("@google/generative-ai");
class ResumeGeneratorService {
    static async generateTailoredResume(input) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.warn('[ResumeGeneratorService] GEMINI_API_KEY is not configured. Returning mock tailored resume.');
            return this.getMockTailoredResume(input);
        }
        try {
            const genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({
                model: 'gemini-2.5-flash',
                generationConfig: { responseMimeType: 'application/json' }
            });
            const profilePayload = {
                summary: input.profile?.summary || '',
                skills: input.skills.map(s => s.skillName || s.name),
                experiences: input.experiences.map(e => ({
                    company: e.company,
                    role: e.role,
                    description: e.description,
                    achievements: e.achievements,
                    technologies: e.technologies,
                    startDate: e.startDate,
                    endDate: e.endDate
                })),
                projects: input.projects.map(p => ({
                    title: p.title,
                    description: p.description,
                    technologies: p.technologies,
                    achievements: p.achievements,
                    impactMetrics: p.impactMetrics
                })),
                certifications: input.certifications.map(c => c.name || c.title),
                achievements: input.achievements.map(a => a.title),
                education: input.education.map(ed => ({
                    school: ed.school,
                    degree: ed.degree,
                    fieldOfStudy: ed.fieldOfStudy
                }))
            };
            const prompt = `
You are an advanced AI Resume Tailoring Architect. Your goal is to optimize a candidate's resume for a specific Job Description.

TARGET JOB DESCRIPTION:
Title: ${input.jobTitle}
Description:
${input.jobDescription}

CANDIDATE PROFILE DATA:
${JSON.stringify(profilePayload, null, 2)}

INSTRUCTIONS:
1. Select the most relevant skills (up to 12) matching the job description.
2. Select the most relevant projects (up to 3) matching the job description.
3. Rewrite the candidate's professional summary to align with the job description keywords and required experience.
4. Rewrite and customize the experience description and bullet points (achievements) to highlight technical competencies matching the job's core challenges.
5. Select and adapt the projects' description and achievements to reflect relevant technologies.
6. Propose a logical order for the resume sections (e.g. summary, skills, experience, projects, certifications, education).
7. Calculate a predictive matchScore (0 to 100) indicating how well this tailored resume matches the job description.

You must respond with a JSON object of the following structure:
{
  "matchScore": number,
  "resumeContent": {
    "summary": "string (rewritten summary)",
    "experiences": [
      {
        "company": "string",
        "role": "string",
        "startDate": "string",
        "endDate": "string",
        "description": "string (rewritten core description)",
        "achievements": ["string (rewritten customized achievements highlights)"],
        "technologies": ["string"],
        "employmentType": "string"
      }
    ],
    "projects": [
      {
        "title": "string",
        "description": "string (rewritten core description)",
        "technologies": ["string"],
        "category": "string",
        "githubUrl": "string",
        "liveUrl": "string",
        "achievements": ["string (rewritten bullet points)"],
        "impactMetrics": ["string (rewritten metric highlights)"]
      }
    ],
    "skills": ["string (selected skill names)"],
    "certifications": ["string"],
    "achievements": ["string"],
    "education": [
      {
        "school": "string",
        "degree": "string",
        "fieldOfStudy": "string",
        "startDate": "string",
        "endDate": "string",
        "description": "string"
      }
    ],
    "sectionOrder": ["string (e.g., ['summary', 'skills', 'experiences', 'projects', 'certifications', 'education'])"]
  },
  "selectedProjects": ["string (project titles selected)"],
  "selectedSkills": ["string (skill names selected)"]
}
`;
            const result = await model.generateContent(prompt);
            const rawText = result.response.text();
            return JSON.parse(rawText);
        }
        catch (error) {
            console.error('[ResumeGeneratorService] Failed to generate resume with Gemini:', error);
            return this.getMockTailoredResume(input);
        }
    }
    static getMockTailoredResume(input) {
        const selectedSkills = input.skills.slice(0, 10).map(s => s.skillName || s.name);
        const selectedProjects = input.projects.slice(0, 2).map(p => p.title);
        return {
            matchScore: 82,
            resumeContent: {
                summary: `Result-driven Full-Stack Developer with expertise in React, Next.js, and Node.js. Tailored for the ${input.jobTitle} position, demonstrating a strong capability in designing developer tools, REST APIs, and responsive web platforms.`,
                experiences: input.experiences.map(e => ({
                    company: e.company,
                    role: e.role,
                    startDate: e.startDate,
                    endDate: e.endDate || 'Present',
                    description: `Spearheaded software development workflows at ${e.company}. Aligned frontend performance with modern system architectures.`,
                    achievements: e.achievements.length > 0 ? e.achievements : [
                        'Delivered web pages with optimized layout architectures.',
                        'Collaborated with multi-functional teams to integrate responsive user components.'
                    ],
                    technologies: e.technologies.length > 0 ? e.technologies : ['React.js', 'Next.js', 'TypeScript'],
                    employmentType: e.employmentType || 'Full-Time'
                })),
                projects: input.projects.map(p => ({
                    title: p.title,
                    description: p.description || 'Enterprise web utility optimizing client workflows.',
                    technologies: p.technologies,
                    category: p.category || 'Web Application',
                    githubUrl: p.githubUrl || '',
                    liveUrl: p.liveUrl || '',
                    achievements: p.achievements.length > 0 ? p.achievements : ['Designed modular modules utilizing React.'],
                    impactMetrics: p.impactMetrics.length > 0 ? p.impactMetrics : ['Boosted user acquisition by 15%']
                })),
                skills: selectedSkills,
                certifications: input.certifications.map(c => c.name),
                achievements: input.achievements.map(a => a.title),
                education: input.education.map(ed => ({
                    school: ed.school,
                    degree: ed.degree,
                    fieldOfStudy: ed.fieldOfStudy || '',
                    startDate: ed.startDate || '',
                    endDate: ed.endDate || '',
                    description: ed.description || ''
                })),
                sectionOrder: ['summary', 'skills', 'experiences', 'projects', 'certifications', 'education']
            },
            selectedProjects,
            selectedSkills
        };
    }
}
exports.ResumeGeneratorService = ResumeGeneratorService;
