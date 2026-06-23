export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  experience?: string;
  salary?: string;
  employmentType?: string;
  skills: string[];
  description: string;
  source: string;
  url: string;
  notes?: string;
  tags: string[];
  parserVersion: string;
  savedAt: string;
  
  // Recruiter and metadata extensions
  recruiterName?: string;
  recruiterUrl?: string;
  companyUrl?: string;
  highlights?: string;
}

export interface Company {
  id: string;
  name: string;
  website?: string;
  linkedin?: string;
  industry?: string;
  size?: string;
  location?: string;
  description?: string;
  notes?: string;
  tags: string[];
  parserVersion: string;
  savedAt: string;
}

export interface HiringPost {
  id: string;
  author: string;
  authorProfile?: string;
  company?: string;
  content: string;
  source: string;
  url: string;
  tags: string[];
  parserVersion: string;
  savedAt: string;
}

export interface Recruiter {
  id: string;
  name: string;
  company?: string;
  profileUrl?: string;
  postsCount?: number;
  notes?: string;
  savedAt: string;
}

export interface Application {
  id: string;
  jobId: string;
  status: "Saved" | "Applied" | "Interview" | "Rejected" | "Offer";
  notes?: string;
  createdAt: string;
}
