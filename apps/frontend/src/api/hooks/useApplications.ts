import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../client';
import type { Application, ApplicationStatus } from '../../types';

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
