import { db } from './db';
import type { Application } from '../types';

export async function getApplications(): Promise<Application[]> {
  return db.applications.orderBy('createdAt').reverse().toArray();
}

export async function getApplicationByJobId(jobId: string): Promise<Application | undefined> {
  return db.applications.where('jobId').equals(jobId).first();
}

export async function saveApplication(application: Application): Promise<void> {
  const existing = await db.applications.get(application.id);
  if (existing) {
    await db.applications.put(application);
  } else {
    await db.applications.add(application);
  }
}

export async function updateApplicationStatus(
  jobId: string, 
  status: Application['status'], 
  notes?: string
): Promise<void> {
  const app = await db.applications.where('jobId').equals(jobId).first();
  if (app) {
    const updates: Partial<Application> = { status };
    if (notes !== undefined) {
      updates.notes = notes;
    }
    await db.applications.update(app.id, updates);
  } else {
    const newApp: Application = {
      id: crypto.randomUUID(),
      jobId,
      status,
      notes: notes || '',
      createdAt: new Date().toISOString()
    };
    await db.applications.add(newApp);
  }
}

export async function deleteApplicationByJobId(jobId: string): Promise<void> {
  const app = await db.applications.where('jobId').equals(jobId).first();
  if (app) {
    await db.applications.delete(app.id);
  }
}
