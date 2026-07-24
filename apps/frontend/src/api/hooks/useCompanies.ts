import { useQuery } from '@tanstack/react-query';
import api from '../client';
import type { Company, Job } from '../../types';

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
