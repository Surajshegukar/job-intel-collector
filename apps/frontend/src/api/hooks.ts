import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './client';
import type {
  PaginatedJobs, Job, Company, Skill, Application,
  OverviewStats, ApplicationStatus
} from '../types';

// ─── Jobs ─────────────────────────────────────────────────────────────────────
export function useJobs(params: {
  page?: number; limit?: number; search?: string;
  location?: string; status?: string; source?: string;
} = {}) {
  return useQuery<PaginatedJobs>({
    queryKey: ['jobs', params],
    queryFn: async () => {
      const { data } = await api.get('/jobs', { params });
      return data;
    },
  });
}

export function useJob(id: string) {
  return useQuery<Job>({
    queryKey: ['jobs', id],
    queryFn: async () => {
      const { data } = await api.get(`/jobs/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/jobs', body).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['jobs'] }); },
  });
}

export function useUpdateJob(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Job>) => api.put(`/jobs/${id}`, body).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['jobs'] });
      qc.invalidateQueries({ queryKey: ['applications'] });
    },
  });
}

export function useDeleteJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/jobs/${id}`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['jobs'] });
      qc.invalidateQueries({ queryKey: ['applications'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

// ─── Companies ────────────────────────────────────────────────────────────────
export function useCompanies(search?: string) {
  return useQuery<Company[]>({
    queryKey: ['companies', search],
    queryFn: async () => {
      const { data } = await api.get('/companies', { params: search ? { search } : {} });
      return data;
    },
  });
}

export function useCompany(id: string) {
  return useQuery<{ company: Company; jobs: Job[] }>({
    queryKey: ['companies', id],
    queryFn: async () => {
      const { data } = await api.get(`/companies/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

// ─── Skills ───────────────────────────────────────────────────────────────────
export function useSkills() {
  return useQuery<Skill[]>({
    queryKey: ['skills'],
    queryFn: async () => {
      const { data } = await api.get('/skills');
      return data;
    },
  });
}

// ─── Applications ─────────────────────────────────────────────────────────────
export function useApplications() {
  return useQuery<Application[]>({
    queryKey: ['applications'],
    queryFn: async () => {
      const { data } = await api.get('/applications');
      return data;
    },
  });
}

export function useUpdateApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; status?: ApplicationStatus; notes?: string; appliedDate?: string }) =>
      api.put(`/applications/${id}`, body).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['applications'] });
      qc.invalidateQueries({ queryKey: ['jobs'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

// ─── Analytics ────────────────────────────────────────────────────────────────
export function useOverviewStats() {
  return useQuery<OverviewStats>({
    queryKey: ['analytics', 'overview'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/overview');
      return data;
    },
  });
}

export function useTopSkills(limit = 15) {
  return useQuery<Skill[]>({
    queryKey: ['analytics', 'top-skills', limit],
    queryFn: async () => {
      const { data } = await api.get('/analytics/top-skills', { params: { limit } });
      return data;
    },
  });
}

export function useTopCompanies(limit = 8) {
  return useQuery({
    queryKey: ['analytics', 'top-companies', limit],
    queryFn: async () => {
      const { data } = await api.get('/analytics/top-companies', { params: { limit } });
      return data;
    },
  });
}

export function useLocationStats() {
  return useQuery({
    queryKey: ['analytics', 'locations'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/locations');
      return data;
    },
  });
}

export function useSalaryRanges() {
  return useQuery({
    queryKey: ['analytics', 'salary-ranges'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/salary-ranges');
      return data;
    },
  });
}
