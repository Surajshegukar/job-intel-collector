import { db } from './db';
import type { Recruiter } from '../types';

export async function getRecruiters(): Promise<Recruiter[]> {
  return db.recruiters.orderBy('savedAt').reverse().toArray();
}

export async function getRecruiterById(id: string): Promise<Recruiter | undefined> {
  return db.recruiters.get(id);
}

export async function saveRecruiter(recruiter: Recruiter): Promise<{ id: string; status: 'created' | 'updated' }> {
  if (!recruiter.profileUrl) {
    if (!recruiter.id) {
      recruiter.id = crypto.randomUUID();
    }
    await db.recruiters.add(recruiter);
    return { id: recruiter.id, status: 'created' };
  }
  // Find duplicates matching profileUrl
  const existing = await db.recruiters
    .where('profileUrl').equals(recruiter.profileUrl.trim())
    .first();

  if (existing) {
    const updatedRecruiter: Recruiter = {
      ...existing,
      ...recruiter,
      id: existing.id,
      notes: recruiter.notes ? (existing.notes ? `${existing.notes}\n${recruiter.notes}` : recruiter.notes) : existing.notes,
      company: recruiter.company || existing.company,
      postsCount: (existing.postsCount || 0) + (recruiter.postsCount || 0),
      savedAt: existing.savedAt
    };
    await db.recruiters.put(updatedRecruiter);
    return { id: existing.id, status: 'updated' };
  } else {
    if (!recruiter.id) {
      recruiter.id = crypto.randomUUID();
    }
    await db.recruiters.add(recruiter);
    return { id: recruiter.id, status: 'created' };
  }
}

export async function updateRecruiter(id: string, updates: Partial<Recruiter>): Promise<void> {
  await db.recruiters.update(id, updates);
}

export async function deleteRecruiter(id: string): Promise<void> {
  await db.recruiters.delete(id);
}
