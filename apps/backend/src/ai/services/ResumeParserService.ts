import { generateContentWithRetry } from '../utils/geminiHelper';
import { SkillTaxonomyService } from './SkillTaxonomyService';

export interface ParsedResumeData {
  profile: {
    name: string;
    email: string;
    phone?: string;
    location?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
    summary?: string;
    preferredRoles: string[];
    preferredLocations: string[];
    salaryExpectation?: {
      min?: number;
      max?: number;
      currency?: string;
    };
  };
  education: Array<{
    school: string;
    degree: string;
    fieldOfStudy?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  }>;
  experience: Array<{
    company: string;
    role: string;
    startDate: string;
    endDate?: string;
    description?: string;
    achievements: string[];
    technologies: string[];
    employmentType?: 'Full-Time' | 'Part-Time' | 'Contract' | 'Internship' | 'Freelance';
  }>;
  projects: Array<{
    title: string;
    description?: string;
    technologies: string[];
    category?: string;
    githubUrl?: string;
    liveUrl?: string;
    achievements: string[];
    impactMetrics: string[];
  }>;
  skills: Array<{
    skillName: string;
    category: 'Frontend' | 'Backend' | 'Database' | 'Cloud' | 'DevOps' | 'Testing' | 'Mobile' | 'AI/ML' | 'General';
    proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    yearsOfExperience?: number;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    issueDate?: string;
    credentialUrl?: string;
  }>;
  achievements: Array<{
    title: string;
    description?: string;
    category?: string;
  }>;
}

export class ResumeParserService {
  static async parseText(text: string): Promise<ParsedResumeData> {
    const apiKey = process.env.GEMINI_API_KEY;
    const parseMode = process.env.PARSE_MODE || (apiKey ? 'gemini' : 'local');

    if (parseMode === 'local') {
      console.log('[ResumeParserService] Parsing resume locally using heuristics...');
      return this.parseTextLocally(text);
    }

    if (!apiKey) {
      console.warn('[ResumeParserService] GEMINI_API_KEY is not configured and PARSE_MODE is not local. Returning mock parsed data.');
      return this.getMockParsedData(text);
    }

    try {
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

      const result = await generateContentWithRetry({
        apiKey,
        prompt,
        responseMimeType: 'application/json'
      });
      return JSON.parse(result.text) as ParsedResumeData;

    } catch (error) {
      console.error('[ResumeParserService] Failed to parse resume with Gemini:', error);
      throw error;
    }
  }

  private static parseTextLocally(text: string): ParsedResumeData {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    // 1. Extract contact details
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const email = emailMatch ? emailMatch[0] : '';
    
    const phoneMatch = text.match(/[\+]?[0-9][0-9\s-()]{8,18}[0-9]/);
    const phone = phoneMatch ? phoneMatch[0].trim() : '';

    const githubMatch = text.match(/github\.com\/[a-zA-Z0-9_-]+/i);
    const githubUrl = githubMatch ? `https://${githubMatch[0]}` : '';

    const linkedinMatch = text.match(/linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
    const linkedinUrl = linkedinMatch ? `https://${linkedinMatch[0]}` : '';

    // Name heuristic
    let name = '';
    for (let i = 0; i < Math.min(10, lines.length); i++) {
      const line = lines[i];
      if (
        !line.includes('@') &&
        !line.toLowerCase().includes('github') &&
        !line.toLowerCase().includes('linkedin') &&
        !line.toLowerCase().includes('resume') &&
        !line.toLowerCase().includes('curriculum') &&
        !line.toLowerCase().includes('page') &&
        !line.match(/[0-9]{5,}/) &&
        !line.startsWith('•') &&
        !line.startsWith('-') &&
        !line.startsWith('*') &&
        line.split(/\s+/).length <= 4
      ) {
        name = line;
        break;
      }
    }
    if (!name) name = email ? email.split('@')[0] : 'Parsed Candidate';

    // 2. Identify sections
    const sections: Record<string, string[]> = {
      summary: [],
      experience: [],
      education: [],
      projects: [],
      skills: [],
      certifications: [],
      achievements: []
    };

    const experienceHeaders = ['experience', 'work experience', 'employment', 'work history', 'professional experience', 'experience history', 'employment history'];
    const educationHeaders = ['education', 'academic', 'qualifications', 'study', 'academic background', 'education background'];
    const projectHeaders = ['projects', 'personal projects', 'key projects', 'academic projects', 'selected projects', 'academic and personal projects'];
    const skillsHeaders = ['skills', 'technical skills', 'skills & technologies', 'expertise', 'core competencies', 'skills and expertise', 'technologies'];
    const certificationHeaders = ['certifications', 'licenses', 'courses', 'certifications & courses', 'credentials'];
    const achievementsHeaders = ['achievements', 'honors', 'awards', 'extra-curricular activities', 'co-curricular activities'];

    let currentSectionKey = 'summary';

    for (const line of lines) {
      const lineLower = line.toLowerCase().replace(/[^a-z0-9&\s]/g, '').trim();
      
      let matchedHeader = '';
      if (experienceHeaders.includes(lineLower)) matchedHeader = 'experience';
      else if (educationHeaders.includes(lineLower)) matchedHeader = 'education';
      else if (projectHeaders.includes(lineLower)) matchedHeader = 'projects';
      else if (skillsHeaders.includes(lineLower)) matchedHeader = 'skills';
      else if (certificationHeaders.includes(lineLower)) matchedHeader = 'certifications';
      else if (achievementsHeaders.includes(lineLower)) matchedHeader = 'achievements';

      if (matchedHeader) {
        currentSectionKey = matchedHeader;
      } else {
        sections[currentSectionKey].push(line);
      }
    }

    const summary = sections.summary.slice(0, 5).join(' ');

    // 3. Extract Skills using SkillTaxonomyService synonym map
    const foundSkillsMap = new Map<string, string>(); // normalizedName -> canonicalName
    const lowerText = text.toLowerCase();
    
    const commonSkills = [
      'react', 'vue', 'angular', 'next.js', 'nextjs', 'typescript', 'javascript', 'html', 'css', 'tailwind',
      'node.js', 'nodejs', 'express', 'nestjs', 'python', 'django', 'flask', 'fastapi', 'java', 'spring',
      'kotlin', 'c++', 'c#', 'rust', 'go', 'golang', 'mongodb', 'postgresql', 'mysql', 'redis', 'aws',
      'gcp', 'docker', 'kubernetes', 'git', 'jest', 'cypress', 'flutter', 'tensorflow', 'pytorch'
    ];

    const matchesSkill = (textToSearch: string, skill: string): boolean => {
      const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const startBoundary = /^[a-zA-Z0-9]/.test(skill) ? '\\b' : '(?<=^|[^a-zA-Z0-9])';
      const endBoundary = /[a-zA-Z0-9]$/.test(skill) ? '\\b' : '(?=$|[^a-zA-Z0-9])';
      const regex = new RegExp(`${startBoundary}${escaped}${endBoundary}`, 'i');
      return regex.test(textToSearch);
    };

    for (const skill of commonSkills) {
      if (matchesSkill(lowerText, skill)) {
        const canonical = SkillTaxonomyService.normalizeSkill(skill);
        foundSkillsMap.set(canonical.toLowerCase(), canonical);
      }
    }

    for (const line of sections.skills) {
      const parts = line.split(/[,;|•\-\*]/).map(p => p.trim()).filter(p => p.length > 0);
      for (const part of parts) {
        if (part.length > 0 && part.length < 30) {
          const canonical = SkillTaxonomyService.normalizeSkill(part);
          foundSkillsMap.set(canonical.toLowerCase(), canonical);
        }
      }
    }

    const skills = Array.from(foundSkillsMap.values()).map(s => ({
      skillName: s,
      category: SkillTaxonomyService.getCategory(s),
      proficiency: 'intermediate' as const,
      yearsOfExperience: 1
    }));

    // 4. Extract Education
    const education: ParsedResumeData['education'] = [];
    let currentEdu: any = null;
    for (const line of sections.education) {
      const dateRangeRegex = /(?:([a-zA-Z]+)\s+)?((?:19|20)\d{2})\s*(?:[-–—]|to)\s*(?:([a-zA-Z]+)\s+)?((?:19|20)\d{2}|present|current)/i;
      const dateMatch = line.match(dateRangeRegex);
      const isSchool = line.match(/(university|college|school|institute|academy|iit|nit|bits|iiit|zeal)/i);
      
      if (dateMatch) {
        if (currentEdu) education.push(currentEdu);
        
        const startDate = `${dateMatch[1] ? dateMatch[1] + ' ' : ''}${dateMatch[2]}`;
        const endDate = `${dateMatch[3] ? dateMatch[3] + ' ' : ''}${dateMatch[4]}`;
        const cleanedDegree = line.replace(dateRangeRegex, '').trim();
        
        currentEdu = {
          school: 'University/School',
          degree: cleanedDegree || 'Degree',
          startDate,
          endDate,
          description: ''
        };
      } else if (currentEdu) {
        if (isSchool) {
          currentEdu.school = line;
        } else {
          currentEdu.description = (currentEdu.description + ' ' + line).trim();
        }
      }
    }
    if (currentEdu) education.push(currentEdu);

    // 5. Extract Experience
    const experience: ParsedResumeData['experience'] = [];
    let currentExp: any = null;
    for (const line of sections.experience) {
      const dateRangeRegex = /(?:([a-zA-Z]+)\s+)?((?:19|20)\d{2})\s*(?:[-–—]|to)\s*(?:([a-zA-Z]+)\s+)?((?:19|20)\d{2}|present|current)/i;
      const dateRangeMatch = line.match(dateRangeRegex);
      const isHeader = dateRangeMatch || line.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(?:19|20)\d{2}/i);

      if (isHeader) {
        if (currentExp) experience.push(currentExp);
        
        let company = 'Company';
        let role = 'Software Engineer';
        
        let startDate = '2022';
        let endDate = 'Present';
        
        if (dateRangeMatch) {
          startDate = `${dateRangeMatch[1] ? dateRangeMatch[1] + ' ' : ''}${dateRangeMatch[2]}`;
          endDate = `${dateRangeMatch[3] ? dateRangeMatch[3] + ' ' : ''}${dateRangeMatch[4]}`;
        }

        let cleanedHeader = line.replace(dateRangeRegex, '');
        cleanedHeader = cleanedHeader.replace(/((?:19|20)\d{2}|present|current)/gi, '').replace(/[-–—]/g, '').trim();
        cleanedHeader = cleanedHeader.replace(/\s+/g, ' ');

        if (cleanedHeader.includes('|')) {
          const parts = cleanedHeader.split('|').map(p => p.trim());
          role = parts[0];
          company = parts[1];
        } else if (cleanedHeader.includes(' at ')) {
          const parts = cleanedHeader.split(/\s+at\s+/i).map(p => p.trim());
          role = parts[0];
          company = parts[1];
        } else {
          company = cleanedHeader;
        }

        currentExp = {
          company,
          role,
          startDate,
          endDate,
          description: '',
          achievements: [],
          technologies: [],
          employmentType: role.toLowerCase().includes('intern') ? 'Internship' : 'Full-Time'
        };
      } else if (currentExp) {
        const isLocation = line.match(/(pune|mumbai|bangalore|delhi|hyderabad|chennai|maharashtra|india|remote|usa|uk|san francisco|new york)/i) && line.length < 50;
        
        if (isLocation) {
          currentExp.description = line;
        } else {
          const cleanLine = line.replace(/^[•\-\*\s]+/, '');
          currentExp.achievements.push(cleanLine);
          
          for (const s of commonSkills) {
            if (matchesSkill(cleanLine, s)) {
              const norm = SkillTaxonomyService.normalizeSkill(s);
              if (!currentExp.technologies.includes(norm)) {
                currentExp.technologies.push(norm);
              }
            }
          }
        }
      }
    }
    if (currentExp) experience.push(currentExp);

    // 6. Extract Projects
    const projects: ParsedResumeData['projects'] = [];
    let currentProj: any = null;
    for (const line of sections.projects) {
      const hasPipe = line.includes('|');
      const hasDash = line.includes('—');
      const actionVerbs = /^(built|designed|architected|developed|implemented|created|managed|led|analyzed|worked)/i;
      const isShort = line.length < 100;
      
      const isNewProject = isShort && (hasPipe || hasDash || (!actionVerbs.test(line) && line.match(/^[A-Z]/)));

      if (isNewProject) {
        if (currentProj) projects.push(currentProj);
        
        let title = line;
        let projectTechs: string[] = [];
        
        if (hasPipe) {
          const parts = line.split('|').map(p => p.trim());
          title = parts[0];
          if (parts[1]) {
            projectTechs = parts[1].split(',').map(t => SkillTaxonomyService.normalizeSkill(t.trim()));
          }
        } else if (hasDash) {
          const parts = line.split('—').map(p => p.trim());
          title = parts[0];
          if (parts[1] && parts[1].includes('|')) {
            const subparts = parts[1].split('|').map(s => s.trim());
            if (subparts[1]) {
              projectTechs = subparts[1].split(',').map(t => SkillTaxonomyService.normalizeSkill(t.trim()));
            }
          }
        }

        currentProj = {
          title,
          description: '',
          technologies: projectTechs,
          category: 'Web Application',
          achievements: [],
          impactMetrics: []
        };
      } else if (currentProj) {
        const cleanLine = line.replace(/^[•\-\*\s]+/, '');
        currentProj.achievements.push(cleanLine);
        
        if (cleanLine.match(/(\d+%\s*(?:increase|reduction|improvement|faster|growth))|(\$\d+)/i)) {
          currentProj.impactMetrics.push(cleanLine);
        }
        
        for (const s of commonSkills) {
          if (matchesSkill(cleanLine, s)) {
            const norm = SkillTaxonomyService.normalizeSkill(s);
            if (!currentProj.technologies.includes(norm)) {
              currentProj.technologies.push(norm);
            }
          }
        }
      }
    }
    if (currentProj) projects.push(currentProj);

    // 7. Certifications
    const certifications: ParsedResumeData['certifications'] = [];
    for (const line of sections.certifications) {
      if (line.length < 100 && !line.startsWith('•') && !line.startsWith('-') && !line.startsWith('*')) {
        let issuer = 'External Issuer';
        const issuerMatch = line.match(/(google|aws|amazon|microsoft|azure|udemy|coursera|oracle|cisco)/i);
        if (issuerMatch) {
          issuer = issuerMatch[1].toUpperCase();
        }
        certifications.push({
          name: line,
          issuer,
          issueDate: '2025'
        });
      }
    }

    // 8. Achievements
    const achievements: ParsedResumeData['achievements'] = [];
    for (const line of sections.achievements) {
      const cleanLine = line.replace(/^[•\-\*\s]+/, '');
      if (cleanLine.length < 150) {
        achievements.push({
          title: cleanLine,
          category: 'Professional'
        });
      }
    }

    return {
      profile: {
        name,
        email,
        phone,
        githubUrl,
        linkedinUrl,
        summary,
        preferredRoles: [],
        preferredLocations: []
      },
      education,
      experience,
      projects,
      skills,
      certifications,
      achievements
    };
  }

  private static getMockParsedData(text: string): ParsedResumeData {
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
