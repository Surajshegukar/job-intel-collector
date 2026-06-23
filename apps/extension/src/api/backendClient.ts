/**
 * Backend API client for the Job Intelligence extension.
 *
 * This module wraps all calls to the Job Intelligence backend API.
 * The extension stores the JWT token in chrome.storage.local so it
 * persists across sessions without leaking to web-page contexts.
 *
 * All functions fail silently (return null) when the backend is
 * unreachable so the extension keeps working in offline/local mode.
 */

const DEFAULT_BASE_URL = 'http://localhost:5000/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────

export interface SyncSettings {
  baseUrl: string;
  token: string | null;
  syncEnabled: boolean;
}

/** Read the persisted sync settings from chrome.storage.local */
export async function getSyncSettings(): Promise<SyncSettings> {
  return new Promise(resolve => {
    chrome.storage.local.get(['ji_baseUrl', 'ji_token', 'ji_syncEnabled'], result => {
      resolve({
        baseUrl: result.ji_baseUrl || DEFAULT_BASE_URL,
        token: result.ji_token || null,
        syncEnabled: result.ji_syncEnabled !== false, // default ON
      });
    });
  });
}

/** Persist sync settings to chrome.storage.local */
export async function setSyncSettings(settings: Partial<SyncSettings>): Promise<void> {
  return new Promise(resolve => {
    const data: Record<string, unknown> = {};
    if (settings.baseUrl   !== undefined) data.ji_baseUrl     = settings.baseUrl;
    if (settings.token     !== undefined) data.ji_token       = settings.token;
    if (settings.syncEnabled !== undefined) data.ji_syncEnabled = settings.syncEnabled;
    chrome.storage.local.set(data, resolve);
  });
}

async function apiFetch(
  path: string,
  options: RequestInit & { baseUrl?: string; token?: string }
): Promise<Response | null> {
  try {
    const { baseUrl = DEFAULT_BASE_URL, token, ...fetchOptions } = options;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(fetchOptions.headers as Record<string, string>),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${baseUrl}${path}`, { ...fetchOptions, headers });
    return res;
  } catch {
    // Network error — backend offline
    return null;
  }
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginResult {
  success: boolean;
  token?: string;
  name?: string;
  error?: string;
}

/**
 * Login to the backend and store the JWT token in chrome.storage.local.
 */
export async function loginToBackend(
  email: string,
  password: string,
  baseUrl?: string
): Promise<LoginResult> {
  const url = baseUrl || DEFAULT_BASE_URL;
  const res = await apiFetch('/auth/login', {
    method: 'POST',
    baseUrl: url,
    body: JSON.stringify({ email, password }),
  });

  if (!res) return { success: false, error: 'Backend unreachable. Check the URL and try again.' };

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return { success: false, error: body.message || `Auth failed (${res.status})` };
  }

  const data = await res.json();
  await setSyncSettings({ baseUrl: url, token: data.token, syncEnabled: true });
  return { success: true, token: data.token, name: data.user?.name };
}

/** Clear the stored token (logout from sync) */
export async function logoutFromBackend(): Promise<void> {
  await setSyncSettings({ token: null });
}

// ─── Job Sync ─────────────────────────────────────────────────────────────────

export interface ExtensionJob {
  title: string;
  company: string;
  location?: string;
  experience?: string;
  salary?: string;
  description?: string;
  skills: string[];
  source?: string;
  url: string;
  notes?: string;
  companyUrl?: string;
}

/**
 * Push a job to the backend.
 * The backend's JobProcessingService handles de-duplication, company
 * resolution, and skill frequency updates automatically.
 */
export async function syncJobToBackend(
  job: ExtensionJob,
  settings?: SyncSettings
): Promise<{ success: boolean; backendId?: string }> {
  const cfg = settings ?? (await getSyncSettings());
  if (!cfg.token || !cfg.syncEnabled) return { success: false };

  const payload = {
    title:       job.title,
    companyName: job.company,
    location:    job.location  || '',
    experience:  job.experience || '',
    salary:      job.salary    || '',
    description: job.description || '',
    skills:      job.skills,
    source:      job.source    || 'Extension',
    url:         job.url,
    notes:       job.notes     || '',
    status:      'Saved',
    companyLinkedin: job.companyUrl || '',
  };


  const res = await apiFetch('/jobs', {
    method: 'POST',
    baseUrl: cfg.baseUrl,
    token: cfg.token,
    body: JSON.stringify(payload),
  });

  if (!res || !res.ok) return { success: false };
  const data = await res.json();
  return { success: true, backendId: data._id };
}

// ─── Company Sync ─────────────────────────────────────────────────────────────

export interface ExtensionCompany {
  name: string;
  website?: string;
  linkedinUrl?: string;
  industry?: string;
  companySize?: string;
  locations?: string[];
  description?: string;
  notes?: string;
}

export async function syncCompanyToBackend(
  company: ExtensionCompany,
  settings?: SyncSettings
): Promise<{ success: boolean; backendId?: string }> {
  const cfg = settings ?? (await getSyncSettings());
  if (!cfg.token || !cfg.syncEnabled) return { success: false };

  const payload = {
    name:        company.name,
    website:     company.website     || '',
    linkedinUrl: company.linkedinUrl || company.website || '',
    industry:    company.industry    || '',
    companySize: company.companySize || '',
    locations:   company.locations   || [],
    notes:       company.notes       || '',
    hiringStatus: 'Hiring',
  };

  const res = await apiFetch('/companies', {
    method: 'POST',
    baseUrl: cfg.baseUrl,
    token: cfg.token,
    body: JSON.stringify(payload),
  });

  if (!res || !res.ok) return { success: false };
  const data = await res.json();
  return { success: true, backendId: data._id };
}

// ─── Hiring Post Sync ─────────────────────────────────────────────────────────

export interface ExtensionPost {
  author: string;
  authorProfile?: string;
  company?: string;
  content: string;
  source?: string;
  url?: string;
}

export async function syncPostToBackend(
  post: ExtensionPost,
  settings?: SyncSettings
): Promise<{ success: boolean; backendId?: string }> {
  const cfg = settings ?? (await getSyncSettings());
  if (!cfg.token || !cfg.syncEnabled) return { success: false };

  const payload = {
    author:        post.author,
    authorProfile: post.authorProfile || '',
    company:       post.company       || '',
    content:       post.content,
    source:        post.source        || 'Extension',
    url:           post.url           || '',
  };

  const res = await apiFetch('/hiring-posts', {
    method: 'POST',
    baseUrl: cfg.baseUrl,
    token: cfg.token,
    body: JSON.stringify(payload),
  });

  if (!res || !res.ok) return { success: false };
  const data = await res.json();
  return { success: true, backendId: data._id };
}

// ─── Connection Test ──────────────────────────────────────────────────────────

export async function testBackendConnection(baseUrl: string): Promise<boolean> {
  const res = await apiFetch('/health', { baseUrl });
  return res !== null && res.ok;
}
