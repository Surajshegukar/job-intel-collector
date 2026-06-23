import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './client';
import type {
  PaginatedJobs, Job, Company, Skill, Application,
  OverviewStats, ApplicationStatus, JobAnalysis, AIMetrics
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

// ─── AI Analysis ─────────────────────────────────────────────────────────────
export function useJobAnalysis(jobId: string) {
  return useQuery<{ job: Job; analysis: JobAnalysis | null }>({
    queryKey: ['jobs', jobId, 'analysis'],
    queryFn: async () => {
      const { data } = await api.get(`/jobs/${jobId}/analysis`);
      return data;
    },
    enabled: !!jobId,
    // Poll while pending or processing to update status automatically in UI
    refetchInterval: (query) => {
      const status = query.state.data?.analysis?.status;
      return status === 'pending' || status === 'processing' ? 2000 : false;
    }
  });
}

export function useTriggerJobAnalysis() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => api.post(`/jobs/${jobId}/analyze`).then(r => r.data),
    onSuccess: (_, jobId) => {
      qc.invalidateQueries({ queryKey: ['jobs', jobId, 'analysis'] });
    }
  });
}

export function useSubmitRecommendationFeedback() {
  return useMutation({
    mutationFn: (body: {
      jobId: string;
      recommendationType: 'project' | 'resume_section' | 'interview_prep';
      recommendationText: string;
      feedback: 'helpful' | 'unhelpful';
      comment?: string;
    }) => api.post('/analysis/feedback', body).then(r => r.data)
  });
}

export function useAIMetrics() {
  return useQuery<AIMetrics>({
    queryKey: ['ai', 'metrics'],
    queryFn: async () => {
      const { data } = await api.get('/ai/metrics');
      return data;
    }
  });
}

// ─── Career Profile Endpoints (Phase 4) ───────────────────────────────────────
export function useProfileData() {
  return useQuery<any>({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await api.get('/profile');
      return data;
    }
  });
}

export function useUpdateProfileData() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) => api.put('/profile', body).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile'] });
    }
  });
}

export function useImportResume() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => api.post('/resume/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile'] });
    }
  });
}

// Skills Sub-collection
export function useAddSkill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { skillName: string; proficiency?: string; yearsOfExperience?: number; category?: string }) => api.post('/profile/skills', body).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile'] });
    }
  });
}

export function useUpdateSkill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: { proficiency?: string; yearsOfExperience?: number; category?: string } }) => api.put(`/profile/skills/${id}`, body).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile'] });
    }
  });
}

export function useDeleteSkill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/profile/skills/${id}`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile'] });
    }
  });
}

// Projects Sub-collection
export function useAddProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) => api.post('/profile/projects', body).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile'] });
    }
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) => api.put(`/profile/projects/${id}`, body).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile'] });
    }
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/profile/projects/${id}`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile'] });
    }
  });
}

// Experience Sub-collection
export function useAddExperience() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) => api.post('/profile/experiences', body).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile'] });
    }
  });
}

export function useUpdateExperience() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) => api.put(`/profile/experiences/${id}`, body).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile'] });
    }
  });
}

export function useDeleteExperience() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/profile/experiences/${id}`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile'] });
    }
  });
}

// Education Sub-collection
export function useAddEducation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) => api.post('/profile/education', body).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile'] });
    }
  });
}

export function useUpdateEducation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) => api.put(`/profile/education/${id}`, body).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile'] });
    }
  });
}

export function useDeleteEducation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/profile/education/${id}`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile'] });
    }
  });
}

// Certifications Sub-collection
export function useAddCertification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; issuer: string; issueDate?: string; credentialUrl?: string }) => api.post('/profile/certifications', body).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile'] });
    }
  });
}

export function useDeleteCertification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/profile/certifications/${id}`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile'] });
    }
  });
}

// Achievements Sub-collection
export function useAddAchievement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { title: string; description?: string; category?: string }) => api.post('/profile/achievements', body).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile'] });
    }
  });
}

export function useDeleteAchievement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/profile/achievements/${id}`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile'] });
    }
  });
}

// Resume templates and generated versions
export function useResumeTemplates() {
  return useQuery<any[]>({
    queryKey: ['resume', 'templates'],
    queryFn: async () => {
      const { data } = await api.get('/resume/templates');
      return data;
    }
  });
}

export function useResumeVersions() {
  return useQuery<any[]>({
    queryKey: ['resume', 'versions'],
    queryFn: async () => {
      const { data } = await api.get('/resume/versions');
      return data;
    }
  });
}

export function useGenerateResume() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { jobId: string; templateId?: string; versionName?: string }) => api.post('/resume/generate', body).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['resume', 'versions'] });
      qc.invalidateQueries({ queryKey: ['profile'] });
    }
  });
}

export function useUpdateResumeOutcome() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, outcome, notes }: { id: string; outcome: string; notes?: string }) => api.put(`/resume/versions/${id}/outcome`, { outcome, notes }).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['resume', 'versions'] });
    }
  });
}

export function useCompareResumes(v1Id: string, v2Id: string) {
  return useQuery<any>({
    queryKey: ['resume', 'compare', v1Id, v2Id],
    queryFn: async () => {
      const { data } = await api.get('/resume/compare', {
        params: { v1Id, v2Id }
      });
      return data;
    },
    enabled: !!v1Id && !!v2Id,
  });
}


