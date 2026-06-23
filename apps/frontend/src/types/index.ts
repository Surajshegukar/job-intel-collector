export type ApplicationStatus = 'Saved' | 'Applied' | 'Interview' | 'Rejected' | 'Offer';

export interface Company {
  _id: string;
  name: string;
  website?: string;
  linkedinUrl?: string;
  industry?: string;
  companySize?: string;
  locations: string[];
  techStack: string[];
  hiringStatus: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  _id: string;
  title: string;
  companyId: Company;
  source?: string;
  url: string;
  location?: string;
  salary?: string;
  experience?: string;
  description?: string;
  skills: string[];
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Skill {
  _id: string;
  name: string;
  category: string;
  frequency: number;
}

export interface Application {
  _id: string;
  jobId: Job;
  status: ApplicationStatus;
  appliedDate?: string;
  notes?: string;
  resumeMatchScore?: number;
  aiFeedback?: string;
  coverLetter?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HiringPost {
  _id: string;
  companyId: Company;
  author?: string;
  source?: string;
  content?: string;
  url?: string;
  createdAt: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  education?: Education[];
  experience?: Experience[];
  projects?: Project[];
  skills?: string[];
  certifications?: string[];
  resumeText?: string;
}

export interface Education {
  school: string;
  degree: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface Experience {
  company: string;
  title: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface Project {
  name: string;
  description?: string;
  url?: string;
  techStack?: string[];
}

export interface OverviewStats {
  totalJobs: number;
  totalCompanies: number;
  totalSkills: number;
  totalApplications: number;
  statusDistribution: { status: ApplicationStatus; count: number }[];
}

export interface PaginatedJobs {
  jobs: Job[];
  page: number;
  pages: number;
  total: number;
}
