import { BaseProvider, AnalyzeJobOptions, AnalysisResult } from './BaseProvider';
import { skillExtractionPrompt } from '../prompts/skillExtraction';
import { roleClassificationPrompt } from '../prompts/roleClassification';
import { matchScoringPrompt } from '../prompts/matchScoring';
import { interviewPrepPrompt } from '../prompts/interviewPrep';

export class OpenAIProvider extends BaseProvider {
  name = 'openai';

  async analyzeJob(options: AnalyzeJobOptions): Promise<AnalysisResult> {
    const startTime = Date.now();
    const apiKey = process.env.OPENAI_API_KEY;
    const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
    const modelName = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    // If it's standard OpenAI and API key is missing, fall back to mock
    if (baseUrl.includes('openai.com') && !apiKey) {
      console.warn('[AI OpenAIProvider] OPENAI_API_KEY is not configured and baseUrl is OpenAI. Falling back to mock.');
      return this.generateMockResult(options, startTime);
    }

    try {
      const userProfileStr = options.userProfile
        ? JSON.stringify({
            skills: options.userProfile.skills,
            preferredRoles: options.userProfile.preferredRoles,
            experience: options.userProfile.experience?.map(e => ({ title: e.title, company: e.company, description: e.description })),
            projects: options.userProfile.projects?.map(p => ({ title: p.title, description: p.description, technologies: p.technologies }))
          }, null, 2)
        : 'None';

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
- "hiringUrgency": "high", "medium", "low", or "unknown".
- "referralAvailable": true or false.
- "recruiterMentioned": true or false.
- "companyInsights": General insights about the work culture, tech stack, or domain.

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

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      const body = {
        model: modelName,
        messages: [
          { role: 'system', content: 'You are an assistant that outputs structured JSON.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' }
      };

      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI Provider HTTP Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const rawText = data.choices[0].message.content;
      const latencyMs = Date.now() - startTime;
      const parsed = JSON.parse(rawText);

      const promptTokens = data.usage?.prompt_tokens || 0;
      const completionTokens = data.usage?.completion_tokens || 0;
      
      // Cost calculation estimation for gpt-4o-mini ($0.150 / 1M input, $0.600 / 1M output)
      const costUSD = (promptTokens * 0.000000150) + (completionTokens * 0.000000600);

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
        missingSkills,
        recommendedProjects: parsed.recommendedProjects || [],
        recommendedResumeSections: parsed.recommendedResumeSections || [],
        interviewTopics: parsed.interviewTopics || [],
        interviewQuestions: parsed.interviewQuestions || [],
        companyInsights: parsed.companyInsights || [],
        hiringUrgency: parsed.hiringUrgency || 'unknown',
        referralAvailable: !!parsed.referralAvailable,
        recruiterMentioned: !!parsed.recruiterMentioned,
        modelName,
        promptTokens,
        completionTokens,
        costUSD,
        latencyMs,
        rawResponse: rawText
      };

    } catch (error: any) {
      console.error('[AI OpenAIProvider] Error calling OpenAI API:', error);
      throw error;
    }
  }

  private generateMockResult(options: AnalyzeJobOptions, startTime: Date | number): AnalysisResult {
    // Re-use same structured mock response as Gemini for consistency
    const skills = ['React', 'TypeScript', 'Node.js', 'Express', 'MongoDB', 'Docker', 'AWS'];
    const extractedSkills = skills.filter(() => Math.random() > 0.3);
    const candidateSkills = options.userProfile?.skills || [];
    const candidateSkillsSet = new Set(candidateSkills.map(s => s.toLowerCase().trim()));
    const missingSkills = extractedSkills.filter(s => !candidateSkillsSet.has(s.toLowerCase().trim()));

    const response = {
      roleCategory: 'Backend Developer',
      seniority: 'Mid-Level',
      experienceRequired: '3+ years',
      salaryEstimate: '$95,000 - $115,000',
      extractedSkills,
      missingSkills,
      recommendedProjects: [
        'Build a microservice matching this stack.',
        'Develop a CLI tool with TypeScript.'
      ],
      recommendedResumeSections: [
        'Move experience with AWS/Docker to the top.',
        'Add details about database scaling to work history.'
      ],
      interviewTopics: ['Express middleware', 'SQL vs NoSQL', 'V8 performance optimization'],
      interviewQuestions: [
        {
          question: 'What is CORS and how does it work?',
          suggestedAnswer: 'Cross-Origin Resource Sharing is a system, consisting of transmitting HTTP headers, that determines whether browsers block frontend JavaScript from accessing cross-origin resources.',
          topic: 'CORS',
          difficulty: 'medium' as const
        }
      ],
      companyInsights: ['Strong backend focus.', 'Distributed engineering team.'],
      hiringUrgency: 'medium' as const,
      referralAvailable: false,
      recruiterMentioned: false
    };

    return {
      ...response,
      modelName: 'openai-mock',
      promptTokens: 0,
      completionTokens: 0,
      costUSD: 0,
      latencyMs: Date.now() - Number(startTime),
      rawResponse: JSON.stringify(response)
    };
  }
}
