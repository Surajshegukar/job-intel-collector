import type { Job, Company, HiringPost } from '../types';

export interface SiteParser {
  extractJob(doc: Document, url: string): Partial<Job> | null;
  extractCompany(doc: Document, url: string): Partial<Company> | null;
  extractPost(doc: Document, url: string): Partial<HiringPost> | null;
}
