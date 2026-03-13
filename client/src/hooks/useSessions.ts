import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sessionsApi } from '../api/client';
import type { Session } from '../types';

export function useSessions(pseudonym: string | null) {
  return useQuery<Session[]>({
    queryKey: ['sessions', pseudonym],
    queryFn: () => sessionsApi.getForParticipant(pseudonym!),
    enabled: !!pseudonym,
    staleTime: 30_000,
  });
}

export function useLogSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      pseudonym: string;
      session_date: string;
      duration_minutes: number;
      word_count: number;
      topic: string;
    }) => sessionsApi.log(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sessions', variables.pseudonym] });
    },
  });
}
