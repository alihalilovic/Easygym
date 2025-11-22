import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import workoutService from '@/api/services/workoutService';
import {
  CreateWorkoutRequest,
  UpdateWorkoutRequest,
  Workout,
} from '@/types/Workout';

export const workoutKeys = {
  all: ['workouts'] as const,
  lists: () => [...workoutKeys.all, 'lists'] as const,
  list: (traineeId: number) => [...workoutKeys.lists(), traineeId] as const,
  trainerWorkouts: () => [...workoutKeys.all, 'trainer'] as const,
  detail: (traineeId: number, workoutId: number) =>
    [...workoutKeys.all, 'detail', traineeId, workoutId] as const,
};

export const useWorkouts = (traineeId: number, enabled = true) => {
  return useQuery({
    queryKey: workoutKeys.list(traineeId),
    queryFn: () => workoutService.getWorkoutsForTrainee(traineeId),
    enabled: enabled && traineeId > 0,
  });
};

export const useTrainerWorkouts = (trainerId: number, enabled = true) => {
  return useQuery({
    queryKey: workoutKeys.trainerWorkouts(),
    queryFn: () => workoutService.getWorkoutsCreatedByTrainer(trainerId),
    enabled: enabled && trainerId > 0,
  });
};

export const useWorkout = (
  traineeId: number,
  workoutId: number,
  enabled = true,
) => {
  return useQuery({
    queryKey: workoutKeys.detail(traineeId, workoutId),
    queryFn: () => workoutService.getWorkoutForTrainee(traineeId, workoutId),
    enabled: enabled && traineeId > 0 && workoutId > 0,
  });
};

export const useCreateWorkout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workout: CreateWorkoutRequest) =>
      workoutService.createWorkout(workout),
    onSuccess: () => {
      // Invalidate all workout lists since we don't know the traineeId from the response
      queryClient.invalidateQueries({ queryKey: workoutKeys.lists() });
      // Also invalidate trainer workouts list
      queryClient.invalidateQueries({
        queryKey: workoutKeys.trainerWorkouts(),
      });
    },
  });
};

export const useUpdateWorkout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      traineeId,
      workoutId,
      workout,
    }: {
      traineeId: number;
      workoutId: number;
      workout: UpdateWorkoutRequest;
    }) => workoutService.updateWorkout(traineeId, workoutId, workout),
    onSuccess: (updatedWorkout, { traineeId, workoutId }) => {
      // Update the specific workout in cache
      queryClient.setQueryData(
        workoutKeys.detail(traineeId, workoutId),
        updatedWorkout,
      );

      // Update the workout in the list
      queryClient.setQueryData<Workout[]>(
        workoutKeys.list(traineeId),
        (old) =>
          old?.map((w) => (w.id === workoutId ? updatedWorkout : w)) || [],
      );
    },
  });
};

export const useDeleteWorkout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      traineeId,
      workoutId,
    }: {
      traineeId: number;
      workoutId: number;
    }) => workoutService.deleteWorkout(traineeId, workoutId),
    onSuccess: (_, { traineeId, workoutId }) => {
      // Remove from list
      queryClient.setQueryData<Workout[]>(
        workoutKeys.list(traineeId),
        (old) => old?.filter((w) => w.id !== workoutId) || [],
      );

      // Remove detail from cache
      queryClient.removeQueries({
        queryKey: workoutKeys.detail(traineeId, workoutId),
      });
    },
  });
};
