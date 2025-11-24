import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import exerciseService from '@/api/services/exerciseService';
import {
  CreateExerciseRequest,
  UpdateExerciseRequest,
} from '@/types/Exercise';

export const exerciseKeys = {
  all: ['exercises'] as const,
  lists: () => [...exerciseKeys.all, 'list'] as const,
  detail: (exerciseId: number) =>
    [...exerciseKeys.all, 'detail', exerciseId] as const,
};

export const useExercises = () => {
  return useQuery({
    queryKey: exerciseKeys.lists(),
    queryFn: () => exerciseService.getExercises(),
  });
};

export const useExercise = (exerciseId: number, enabled = true) => {
  return useQuery({
    queryKey: exerciseKeys.detail(exerciseId),
    queryFn: () => exerciseService.getExercise(exerciseId),
    enabled: enabled && exerciseId > 0,
  });
};

export const useCreateExercise = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (exercise: CreateExerciseRequest) =>
      exerciseService.createExercise(exercise),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: exerciseKeys.lists() });
    },
  });
};

export const useUpdateExercise = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      exerciseId,
      exercise,
    }: {
      exerciseId: number;
      exercise: UpdateExerciseRequest;
    }) => exerciseService.updateExercise(exerciseId, exercise),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: exerciseKeys.all });
    },
  });
};

export const useDeleteExercise = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (exerciseId: number) =>
      exerciseService.deleteExercise(exerciseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: exerciseKeys.all });
    },
  });
};
