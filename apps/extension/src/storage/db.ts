import Dexie, { type Table } from 'dexie';
import type { Job, Company, HiringPost, Recruiter, Application } from '../types';

export class JobIntelligenceDB extends Dexie {
  jobs!: Table<Job, string>;
  companies!: Table<Company, string>;
  posts!: Table<HiringPost, string>;
  recruiters!: Table<Recruiter, string>;
  applications!: Table<Application, string>;

  constructor() {
    super('JobIntelligenceDB');
    this.version(1).stores({
      jobs: 'id, title, company, url, savedAt, *tags',
      companies: 'id, name, website, savedAt, *tags',
      posts: 'id, author, url, savedAt, *tags',
      recruiters: 'id, name, profileUrl, savedAt',
      applications: 'id, jobId, status, createdAt'
    });
  }
}

export const db = new JobIntelligenceDB();
