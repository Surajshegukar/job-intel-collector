import { useQuery } from '@tanstack/react-query';
import api from '../client';
import type { Skill } from '../../types';

export function useSkills() {
  return useQuery<Skill[]>({
    queryKey: ['skills'],
    queryFn: async () => {
      const { data } = await api.get('/skills');
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
