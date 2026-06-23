import { db } from './db';
import type { Job } from '../types';

export async function getJobs(): Promise<Job[]> {
  return db.jobs.orderBy('savedAt').reverse().toArray();
}

export async function getJobById(id: string): Promise<Job | undefined> {
  return db.jobs.get(id);
}

export async function saveJob(job: Job): Promise<{ id: string; status: 'created' | 'updated' }> {
  const cleanUrl = job.url.trim().toLowerCase();
  const cleanCompany = job.company.trim().toLowerCase();
  const cleanTitle = job.title.trim().toLowerCase();

  // Search for an existing job by url + company + title
  // Since Dexie doesn't have multi-key compound indexes for text-transformations natively,
  // we query by url or company and filter in memory for precision.
  const existing = await db.jobs
    .where('url').equals(job.url.trim())
    .or('company').equalsIgnoreCase(job.company.trim())
    .filter(j => 
      j.url.trim().toLowerCase() === cleanUrl &&
      j.company.trim().toLowerCase() === cleanCompany &&
      j.title.trim().toLowerCase() === cleanTitle
    )
    .first();

  if (existing) {
    const updatedJob: Job = {
      ...existing,
      ...job,
      id: existing.id, // Keep the original ID
      tags: Array.from(new Set([...existing.tags, ...job.tags])),
      skills: Array.from(new Set([...existing.skills, ...job.skills])),
      notes: job.notes ? (existing.notes ? `${existing.notes}\n${job.notes}` : job.notes) : existing.notes,
      savedAt: existing.savedAt // Preserve original save timestamp
    };
    await db.jobs.put(updatedJob);
    return { id: existing.id, status: 'updated' };
  } else {
    // Generate UUID if not present
    if (!job.id) {
      job.id = crypto.randomUUID();
    }
    await db.jobs.add(job);
    
    // Automatically create a tracking application record in the 'applications' table
    const application = {
      id: crypto.randomUUID(),
      jobId: job.id,
      status: 'Saved' as const,
      notes: '',
      createdAt: new Date().toISOString()
    };
    await db.applications.add(application);

    return { id: job.id, status: 'created' };
  }
}

export async function updateJob(id: string, updates: Partial<Job>): Promise<void> {
  await db.jobs.update(id, updates);
}

export async function deleteJob(id: string): Promise<void> {
  await db.jobs.delete(id);
  
  // Also clean up any associated application records
  const apps = await db.applications.where('jobId').equals(id).toArray();
  for (const app of apps) {
    await db.applications.delete(app.id);
  }
}
