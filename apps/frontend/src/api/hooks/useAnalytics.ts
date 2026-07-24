import { useQuery } from '@tanstack/react-query';
import api from '../client';
import type { OverviewStats, AIMetrics } from '../../types';

export function useOverviewStats() {
  return useQuery<OverviewStats>({
    queryKey: ['analytics', 'overview'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/overview');
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

export function useAIMetrics() {
  return useQuery<AIMetrics>({
    queryKey: ['ai', 'metrics'],
    queryFn: async () => {
      const { data } = await api.get('/ai/metrics');
      return data;
    },
  });
}
