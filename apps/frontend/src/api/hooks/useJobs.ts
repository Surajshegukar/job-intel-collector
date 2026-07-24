import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../client';
import type { PaginatedJobs, Job, JobAnalysis } from '../../types';

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

export function useJobAnalysis(jobId: string) {
  return useQuery<{ job: Job; analysis: JobAnalysis | null }>({
    queryKey: ['jobs', jobId, 'analysis'],
    queryFn: async () => {
      const { data } = await api.get(`/jobs/${jobId}/analysis`);
      return data;
    },
    enabled: !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.analysis?.status;
      return status === 'pending' || status === 'processing' ? 2000 : false;
    },
  });
}

export function useTriggerJobAnalysis() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => api.post(`/jobs/${jobId}/analyze`).then(r => r.data),
    onSuccess: (_, jobId) => {
      qc.invalidateQueries({ queryKey: ['jobs', jobId, 'analysis'] });
    },
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
    }) => api.post('/analysis/feedback', body).then(r => r.data),
  });
}
