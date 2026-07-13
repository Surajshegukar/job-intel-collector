import { generateContentWithRetry } from '../utils/geminiHelper';

export interface ScoreReport {
  atsScore: number;
  keywordCoverage: number;
  improvementSuggestions: string[];
}

export class ResumeScoringEngine {
  static async scoreResume(resumeContent: any, jobTitle: string, jobDescription: string): Promise<ScoreReport> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.warn('[ResumeScoringEngine] GEMINI_API_KEY is not configured. Returning mock score report.');
      return this.getMockReport(resumeContent, jobDescription);
    }

    try {
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

      const result = await generateContentWithRetry({
        apiKey,
        prompt,
        responseMimeType: 'application/json'
      });
      return JSON.parse(result.text) as ScoreReport;

    } catch (error) {
      console.error('[ResumeScoringEngine] Failed to score resume with Gemini:', error);
      return this.getMockReport(resumeContent, jobDescription);
    }
  }

  private static getMockReport(resumeContent: any, jobDescription: string): ScoreReport {
    // Basic mock calculation based on skill count and description length
    const skillCount = resumeContent?.skills?.length || 0;
    const jdLower = jobDescription.toLowerCase();

    // Look for matching keywords in description
    const keywords = ['react', 'node', 'typescript', 'mongodb', 'docker', 'aws', 'rest api', 'next.js'];
    let hits = 0;
    keywords.forEach(kw => {
      if (jdLower.includes(kw) && (resumeContent?.skills || []).some((s: string) => s.toLowerCase().includes(kw))) {
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
