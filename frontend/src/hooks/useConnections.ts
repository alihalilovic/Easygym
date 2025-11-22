import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import clientService from '@/api/services/clientService';
import trainerService from '@/api/services/trainerService';

export const connectionKeys = {
  all: ['connections'] as const,
  myTrainer: () => [...connectionKeys.all, 'my-trainer'] as const,
  myClients: () => [...connectionKeys.all, 'my-clients'] as const,
  myTrainerHistory: () => [...connectionKeys.all, 'my-trainer-history'] as const,
  myClientHistory: () => [...connectionKeys.all, 'my-client-history'] as const,
};

export const useMyTrainer = () => {
  return useQuery({
    queryKey: connectionKeys.myTrainer(),
    queryFn: clientService.getMyTrainer,
  });
};

export const useMyClients = () => {
  return useQuery({
    queryKey: connectionKeys.myClients(),
    queryFn: trainerService.getMyClients,
  });
};

export const useRemoveMyTrainer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: clientService.removeMyTrainer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: connectionKeys.myTrainer() });
      queryClient.invalidateQueries({ queryKey: connectionKeys.myTrainerHistory() });
    },
  });
};

export const useRemoveClient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (clientId: number) => trainerService.removeClient(clientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: connectionKeys.myClients() });
      queryClient.invalidateQueries({ queryKey: connectionKeys.myClientHistory() });
    },
  });
};

export const useMyTrainerHistory = () => {
  return useQuery({
    queryKey: connectionKeys.myTrainerHistory(),
    queryFn: clientService.getMyTrainerHistory,
  });
};

export const useMyClientHistory = () => {
  return useQuery({
    queryKey: connectionKeys.myClientHistory(),
    queryFn: trainerService.getMyClientHistory,
  });
};
