import { BaseProvider, AnalyzeJobOptions, AnalysisResult } from './BaseProvider';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { skillExtractionPrompt } from '../prompts/skillExtraction';
import { roleClassificationPrompt } from '../prompts/roleClassification';
import { matchScoringPrompt } from '../prompts/matchScoring';
import { interviewPrepPrompt } from '../prompts/interviewPrep';

export class GeminiProvider extends BaseProvider {
  name = 'gemini';

  async analyzeJob(options: AnalyzeJobOptions): Promise<AnalysisResult> {
    const startTime = Date.now();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.warn('[AI GeminiProvider] GEMINI_API_KEY is not configured. Falling back to mock generator.');
      return this.generateMockResult(options, startTime);
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.5-flash',
        generationConfig: { responseMimeType: 'application/json' }
      });

      const userProfileStr = options.userProfile
        ? JSON.stringify({
            skills: options.userProfile.skills,
            preferredRoles: options.userProfile.preferredRoles,
            experience: options.userProfile.experience?.map(e => ({ title: e.title, company: e.company, description: e.description })),
            projects: options.userProfile.projects?.map(p => ({ title: p.title, description: p.description, technologies: p.technologies }))
          }, null, 2)
        : 'None provided';

      const prompt = `
You are an advanced AI Job Intelligence Engine. Your task is to analyze the Job Description and match it against the User's Career Profile.

JOB DETAILS:
Title: ${options.jobTitle}
Description:
${options.jobDescription}

USER PROFILE:
${userProfileStr}

INSTRUCTIONS FOR PIPELINE PHASES:
1. Skill Extraction: ${skillExtractionPrompt}
2. Role & Seniority Classification: ${roleClassificationPrompt}
3. Resume tailoring & Match explanation: ${matchScoringPrompt}
4. Interview Prep generation: ${interviewPrepPrompt}

Detect additional fields:
- "experienceRequired": Estimate years of experience requested (e.g. "3-5 years", "Entry level").
- "salaryEstimate": Estimate or extract the salary (e.g. "$120,000 - $140,000" or "12-15 LPA" or "Not specified").
- "hiringUrgency": "high", "medium", "low", or "unknown" (look for words like "immediate", "urgent", "start ASAP").
- "referralAvailable": true or false (look for mention of employee referrals, referrals welcome, or contact info).
- "recruiterMentioned": true or false (look for recruiter names or email contacts in description).
- "companyInsights": General insights about the work culture, tech stack used, or domain.

You must respond with a JSON object matching the following structure:
{
  "roleCategory": "string",
  "seniority": "string",
  "experienceRequired": "string",
  "salaryEstimate": "string",
  "extractedSkills": ["string"],
  "missingSkills": ["string"],
  "recommendedProjects": ["string"],
  "recommendedResumeSections": ["string"],
  "interviewTopics": ["string"],
  "interviewQuestions": [
    {
      "question": "string",
      "suggestedAnswer": "string",
      "topic": "string",
      "difficulty": "easy | medium | hard"
    }
  ],
  "companyInsights": ["string"],
  "hiringUrgency": "high | medium | low | unknown",
  "referralAvailable": true | false,
  "recruiterMentioned": true | false
}
`;

      const result = await model.generateContent(prompt);
      const rawText = result.response.text();
      const latencyMs = Date.now() - startTime;
      
      const parsed = JSON.parse(rawText);

      // Estimate tokens (flash is roughly 4 chars per token)
      const promptTokens = Math.round(prompt.length / 4);
      const completionTokens = Math.round(rawText.length / 4);
      
      // Cost calculation for gemini-1.5-flash ($0.075 / 1M input tokens, $0.30 / 1M output tokens)
      const costUSD = (promptTokens * 0.000000075) + (completionTokens * 0.00000030);

      // Re-normalize missing skills by comparing candidate skills
      const candidateSkillsSet = new Set((options.userProfile?.skills || []).map(s => s.toLowerCase().trim()));
      const missingSkills = (parsed.extractedSkills || [])
        .filter((skill: string) => !candidateSkillsSet.has(skill.toLowerCase().trim()));

      return {
        roleCategory: parsed.roleCategory || 'Software Engineer (General)',
        seniority: parsed.seniority || 'Mid-Level',
        experienceRequired: parsed.experienceRequired || 'Not specified',
        salaryEstimate: parsed.salaryEstimate || 'Not specified',
        extractedSkills: parsed.extractedSkills || [],
        missingSkills: missingSkills,
        recommendedProjects: parsed.recommendedProjects || [],
        recommendedResumeSections: parsed.recommendedResumeSections || [],
        interviewTopics: parsed.interviewTopics || [],
        interviewQuestions: parsed.interviewQuestions || [],
        companyInsights: parsed.companyInsights || [],
        hiringUrgency: parsed.hiringUrgency || 'unknown',
        referralAvailable: !!parsed.referralAvailable,
        recruiterMentioned: !!parsed.recruiterMentioned,
        modelName: 'gemini-2.5-flash',
        promptTokens,
        completionTokens,
        costUSD,
        latencyMs,
        rawResponse: rawText
      };

    } catch (error: any) {
      console.error('[AI GeminiProvider] Error calling Gemini API:', error);
      throw error;
    }
  }

  private generateMockResult(options: AnalyzeJobOptions, startTime: Date | number): AnalysisResult {
    const skills = ['React', 'TypeScript', 'Node.js', 'Express', 'MongoDB', 'Docker', 'AWS'];
    const extractedSkills = skills.filter(() => Math.random() > 0.3);
    const candidateSkills = options.userProfile?.skills || [];
    const candidateSkillsSet = new Set(candidateSkills.map(s => s.toLowerCase().trim()));
    const missingSkills = extractedSkills.filter(s => !candidateSkillsSet.has(s.toLowerCase().trim()));

    const response = {
      roleCategory: options.jobTitle.toLowerCase().includes('frontend') 
        ? 'Frontend Developer' 
        : options.jobTitle.toLowerCase().includes('backend')
        ? 'Backend Developer'
        : 'Full Stack Developer',
      seniority: 'Mid-Level',
      experienceRequired: '3+ years',
      salaryEstimate: '$90,000 - $110,000',
      extractedSkills,
      missingSkills,
      recommendedProjects: [
        `Build a scalable application focusing on ${missingSkills[0] || 'TypeScript'} and state management.`,
        'Implement an authentication workflow using JWT and http-only cookies.'
      ],
      recommendedResumeSections: [
        `Move project utilizing ${extractedSkills[0] || 'React'} to the top of your resume.`,
        `Add details about API performance improvements to your experience section.`
      ],
      interviewTopics: ['System Design', 'Async JavaScript', 'Database indexing strategies'],
      interviewQuestions: [
        {
          question: 'What are index structures in MongoDB and why are they used?',
          suggestedAnswer: 'Indexes support the efficient execution of queries in MongoDB by storing a small portion of the collection data set in an easy to traverse form.',
          topic: 'MongoDB',
          difficulty: 'medium' as const
        },
        {
          question: 'Explain the event loop in Node.js.',
          suggestedAnswer: 'The event loop allows Node.js to perform non-blocking I/O operations by offloading operations to the system kernel whenever possible.',
          topic: 'Node.js',
          difficulty: 'hard' as const
        }
      ],
      companyInsights: ['Uses modern cloud stacks.', 'Strong emphasis on agile development methodology.'],
      hiringUrgency: 'medium' as const,
      referralAvailable: false,
      recruiterMentioned: false
    };

    return {
      ...response,
      modelName: 'gemini-1.5-flash-mock',
      promptTokens: 0,
      completionTokens: 0,
      costUSD: 0,
      latencyMs: Date.now() - Number(startTime),
      rawResponse: JSON.stringify(response)
    };
  }
}
