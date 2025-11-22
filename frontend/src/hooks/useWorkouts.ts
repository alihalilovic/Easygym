import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import workoutService from '@/api/services/workoutService';
import { CreateWorkoutRequest, UpdateWorkoutRequest } from '@/types/Workout';

export const workoutKeys = {
  all: ['workouts'] as const,
  lists: () => [...workoutKeys.all, 'list'] as const,
  detail: (workoutId: number) =>
    [...workoutKeys.all, 'detail', workoutId] as const,
};

export const useWorkouts = () => {
  return useQuery({
    queryKey: workoutKeys.lists(),
    queryFn: () => workoutService.getWorkouts(),
  });
};

export const useWorkout = (workoutId: number, enabled = true) => {
  return useQuery({
    queryKey: workoutKeys.detail(workoutId),
    queryFn: () => workoutService.getWorkout(workoutId),
    enabled: enabled && workoutId > 0,
  });
};

export const useCreateWorkout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workout: CreateWorkoutRequest) =>
      workoutService.createWorkout(workout),
    onSuccess: () => {
      // Invalidate the workout list
      queryClient.invalidateQueries({ queryKey: workoutKeys.lists() });
    },
  });
};

export const useUpdateWorkout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workoutId,
      workout,
    }: {
      workoutId: number;
      workout: UpdateWorkoutRequest;
    }) => workoutService.updateWorkout(workoutId, workout),
    onSuccess: () => {
      // Invalidate all workout queries
      queryClient.invalidateQueries({ queryKey: workoutKeys.all });
    },
  });
};

export const useDeleteWorkout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workoutId: number) => workoutService.deleteWorkout(workoutId),
    onSuccess: () => {
      // Invalidate all workout queries
      queryClient.invalidateQueries({ queryKey: workoutKeys.all });
    },
  });
};
