"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResumeParserService = void 0;
const generative_ai_1 = require("@google/generative-ai");
class ResumeParserService {
    static async parseText(text) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.warn('[ResumeParserService] GEMINI_API_KEY is not configured. Returning mock parsed data.');
            return this.getMockParsedData(text);
        }
        try {
            const genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({
                model: 'gemini-2.5-flash',
                generationConfig: { responseMimeType: 'application/json' }
            });
            const prompt = `
You are an expert AI Resume Parsing System. Your task is to extract and structure professional details from the raw resume text provided.

RAW RESUME TEXT:
${text}

You must return a JSON object with the following exact structure:
{
  "profile": {
    "name": "string (required)",
    "email": "string (required)",
    "phone": "string",
    "location": "string",
    "linkedinUrl": "string",
    "githubUrl": "string",
    "portfolioUrl": "string",
    "summary": "string",
    "preferredRoles": ["string"],
    "preferredLocations": ["string"],
    "salaryExpectation": {
      "min": number,
      "max": number,
      "currency": "string"
    }
  },
  "education": [
    {
      "school": "string (required)",
      "degree": "string (required)",
      "fieldOfStudy": "string",
      "startDate": "string (e.g. 2022)",
      "endDate": "string (e.g. 2024 or Present)",
      "description": "string"
    }
  ],
  "experience": [
    {
      "company": "string (required)",
      "role": "string (required)",
      "startDate": "string (e.g. 2024-06)",
      "endDate": "string (e.g. Present or 2026-02)",
      "description": "string",
      "achievements": ["string"],
      "technologies": ["string"],
      "employmentType": "Full-Time | Part-Time | Contract | Internship | Freelance"
    }
  ],
  "projects": [
    {
      "title": "string (required)",
      "description": "string",
      "technologies": ["string"],
      "category": "string",
      "githubUrl": "string",
      "liveUrl": "string",
      "achievements": ["string"],
      "impactMetrics": ["string"]
    }
  ],
  "skills": [
    {
      "skillName": "string (required, e.g. React, Node.js)",
      "category": "Frontend | Backend | Database | Cloud | DevOps | Testing | Mobile | AI/ML | General",
      "proficiency": "beginner | intermediate | advanced | expert",
      "yearsOfExperience": number
    }
  ],
  "certifications": [
    {
      "name": "string (required)",
      "issuer": "string (required)",
      "issueDate": "string",
      "credentialUrl": "string"
    }
  ],
  "achievements": [
    {
      "title": "string (required)",
      "description": "string",
      "category": "string"
    }
  ]
}

Parse accurately. If contact details or specific links are present, extract them. Categorize skills appropriately based on the technology domain.
`;
            const result = await model.generateContent(prompt);
            const rawText = result.response.text();
            return JSON.parse(rawText);
        }
        catch (error) {
            console.error('[ResumeParserService] Failed to parse resume with Gemini:', error);
            throw error;
        }
    }
    static getMockParsedData(text) {
        // Basic heuristics to pull name or email if possible
        const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        const phoneMatch = text.match(/[\+]?[0-9\s-]{10,}/);
        return {
            profile: {
                name: 'Extracted Candidate Name',
                email: emailMatch ? emailMatch[0] : 'parsed@example.com',
                phone: phoneMatch ? phoneMatch[0].trim() : '+91 9021434751',
                location: 'Pune, Maharashtra, India',
                linkedinUrl: 'https://linkedin.com/in/parsed-candidate',
                githubUrl: 'https://github.com/parsed-candidate',
                portfolioUrl: '',
                summary: 'Experienced developer specializing in modern web applications, scalable APIs, and performance optimizations.',
                preferredRoles: ['Full-Stack Developer', 'Frontend Engineer'],
                preferredLocations: ['Pune', 'Remote'],
                salaryExpectation: {
                    min: 80000,
                    max: 120000,
                    currency: 'USD'
                }
            },
            education: [
                {
                    school: 'Example University',
                    degree: 'Bachelor of Engineering',
                    fieldOfStudy: 'Computer Engineering',
                    startDate: '2020',
                    endDate: '2024',
                    description: 'Graduated with First Class Distinction.'
                }
            ],
            experience: [
                {
                    company: 'Quickensol IT Solutions',
                    role: 'Front-End Developer',
                    startDate: '2024-10',
                    endDate: 'Present',
                    description: 'Built response dashboards and scaled MERN stacks.',
                    achievements: [
                        'Improved dashboard load times by 35%.',
                        'Successfully led a team of 3 developers to deliver ERP portal.'
                    ],
                    technologies: ['React.js', 'Next.js', 'TypeScript', 'Tailwind CSS'],
                    employmentType: 'Full-Time'
                }
            ],
            projects: [
                {
                    title: 'E-commerce Platform',
                    description: 'Full-stack application supporting state-of-the-art catalog filters and payments.',
                    technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
                    category: 'E-commerce',
                    githubUrl: 'https://github.com/parsed-candidate/ecommerce',
                    liveUrl: '',
                    achievements: ['Integrated Stripe payment intent workflow.'],
                    impactMetrics: ['Processed $5,000+ in simulated transactions.']
                }
            ],
            skills: [
                { skillName: 'React', category: 'Frontend', proficiency: 'expert', yearsOfExperience: 2 },
                { skillName: 'Node.js', category: 'Backend', proficiency: 'intermediate', yearsOfExperience: 1 },
                { skillName: 'MongoDB', category: 'Database', proficiency: 'intermediate', yearsOfExperience: 1 }
            ],
            certifications: [
                {
                    name: 'AWS Certified Cloud Practitioner',
                    issuer: 'Amazon Web Services',
                    issueDate: '2025-05',
                    credentialUrl: ''
                }
            ],
            achievements: [
                {
                    title: 'Hackathon Winner',
                    description: 'Secured 1st place in regional code sprint.',
                    category: 'Hackathon'
                }
            ]
        };
    }
}
exports.ResumeParserService = ResumeParserService;
