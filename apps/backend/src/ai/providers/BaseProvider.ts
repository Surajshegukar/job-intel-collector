export interface AnalyzeJobOptions {
  jobTitle: string;
  jobDescription: string;
  userProfile?: {
    skills: string[];
    preferredRoles?: string[];
    preferredLocations?: string[];
    experience?: any[];
    projects?: any[];
    certifications?: string[];
  };
}

export interface AnalysisResult {
  roleCategory: string;
  seniority: string;
  experienceRequired: string;
  salaryEstimate: string;
  extractedSkills: string[];
  missingSkills: string[];
  recommendedProjects: string[];
  recommendedResumeSections: string[];
  interviewTopics: string[];
  interviewQuestions: Array<{
    question: string;
    suggestedAnswer: string;
    topic: string;
    difficulty: 'easy' | 'medium' | 'hard';
  }>;
  companyInsights: string[];
  hiringUrgency: 'high' | 'medium' | 'low' | 'unknown';
  referralAvailable: boolean;
  recruiterMentioned: boolean;
  
  // Telemetry metadata
  modelName: string;
  promptTokens: number;
  completionTokens: number;
  costUSD: number;
  latencyMs: number;
  rawResponse: string;
}

export interface IAIProvider {
  name: string;
  analyzeJob(options: AnalyzeJobOptions): Promise<AnalysisResult>;
}

export abstract class BaseProvider implements IAIProvider {
  abstract name: string;
  abstract analyzeJob(options: AnalyzeJobOptions): Promise<AnalysisResult>;
}
