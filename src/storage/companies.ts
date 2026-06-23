import { db } from './db';
import type { Company } from '../types';

export async function getCompanies(): Promise<Company[]> {
  return db.companies.orderBy('savedAt').reverse().toArray();
}

export async function getCompanyById(id: string): Promise<Company | undefined> {
  return db.companies.get(id);
}

export async function saveCompany(company: Company): Promise<{ id: string; status: 'created' | 'updated' }> {
  const cleanName = company.name.trim().toLowerCase();
  const cleanWebsite = (company.website || '').trim().toLowerCase();

  // Find duplicates matching name + website
  const existing = await db.companies
    .where('name').equalsIgnoreCase(company.name.trim())
    .filter(c => {
      const matchName = c.name.trim().toLowerCase() === cleanName;
      if (cleanWebsite) {
        return matchName && (c.website || '').trim().toLowerCase() === cleanWebsite;
      }
      return matchName && !(c.website);
    })
    .first();

  if (existing) {
    const updatedCompany: Company = {
      ...existing,
      ...company,
      id: existing.id,
      tags: Array.from(new Set([...existing.tags, ...company.tags])),
      description: company.description || existing.description,
      notes: company.notes ? (existing.notes ? `${existing.notes}\n${company.notes}` : company.notes) : existing.notes,
      savedAt: existing.savedAt
    };
    await db.companies.put(updatedCompany);
    return { id: existing.id, status: 'updated' };
  } else {
    if (!company.id) {
      company.id = crypto.randomUUID();
    }
    await db.companies.add(company);
    return { id: company.id, status: 'created' };
  }
}

export async function updateCompany(id: string, updates: Partial<Company>): Promise<void> {
  await db.companies.update(id, updates);
}

export async function deleteCompany(id: string): Promise<void> {
  await db.companies.delete(id);
}
