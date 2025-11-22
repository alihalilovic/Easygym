import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import workoutSessionService from '@/api/services/workoutSessionService';
import {
  CreateWorkoutSessionRequest,
  UpdateWorkoutSessionRequest,
  WorkoutSession,
  WorkoutSessionQueryParams,
} from '@/types/WorkoutSession';

export const workoutSessionKeys = {
  all: ['workoutSessions'] as const,
  lists: () => [...workoutSessionKeys.all, 'lists'] as const,
  list: (traineeId: number) =>
    [...workoutSessionKeys.lists(), traineeId] as const,
  pagedLists: () => [...workoutSessionKeys.all, 'pagedLists'] as const,
  pagedList: (traineeId: number, params: WorkoutSessionQueryParams) =>
    [...workoutSessionKeys.pagedLists(), traineeId, params] as const,
  details: () => [...workoutSessionKeys.all, 'detail'] as const,
  detail: (traineeId: number, sessionId: number) =>
    [...workoutSessionKeys.details(), traineeId, sessionId] as const,
};

export const useWorkoutSessions = (traineeId: number, enabled = true) => {
  return useQuery({
    queryKey: workoutSessionKeys.list(traineeId),
    queryFn: () =>
      workoutSessionService.getWorkoutSessionsForTrainee(traineeId),
    enabled: enabled && traineeId > 0,
  });
};

export const usePagedWorkoutSessions = (
  traineeId: number,
  queryParams: WorkoutSessionQueryParams,
  enabled = true,
) => {
  return useQuery({
    queryKey: workoutSessionKeys.pagedList(traineeId, queryParams),
    queryFn: () =>
      workoutSessionService.getPagedWorkoutSessionsForTrainee(traineeId, queryParams),
    enabled: enabled && traineeId > 0,
  });
};

export const useWorkoutSession = (
  traineeId: number,
  sessionId: number,
  enabled = true,
) => {
  return useQuery({
    queryKey: workoutSessionKeys.detail(traineeId, sessionId),
    queryFn: () => workoutSessionService.getWorkoutSessionForTrainee(sessionId),
    enabled: enabled && traineeId > 0 && sessionId > 0,
  });
};

export const useCreateWorkoutSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (session: CreateWorkoutSessionRequest) =>
      workoutSessionService.createWorkoutSession(session),
    onSuccess: () => {
      // Invalidate all workout session lists (both paged and non-paged)
      queryClient.invalidateQueries({ queryKey: workoutSessionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: workoutSessionKeys.pagedLists() });
    },
  });
};

export const useUpdateWorkoutSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      traineeId,
      sessionId,
      session,
    }: {
      traineeId: number;
      sessionId: number;
      session: UpdateWorkoutSessionRequest;
    }) =>
      workoutSessionService.updateWorkoutSession(traineeId, sessionId, session),
    onSuccess: (updatedSession, { traineeId, sessionId }) => {
      // Update the specific session in cache
      queryClient.setQueryData(
        workoutSessionKeys.detail(traineeId, sessionId),
        updatedSession,
      );

      // Update the session in the list
      queryClient.setQueryData<WorkoutSession[]>(
        workoutSessionKeys.list(traineeId),
        (old) =>
          old?.map((s) => (s.id === sessionId ? updatedSession : s)) || [],
      );
    },
  });
};

export const useDeleteWorkoutSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: number) =>
      workoutSessionService.deleteWorkoutSession(sessionId),
    onSuccess: (_, sessionId) => {
      // Invalidate all lists (both paged and non-paged) since we don't know the traineeId
      queryClient.invalidateQueries({ queryKey: workoutSessionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: workoutSessionKeys.pagedLists() });

      // Remove all detail queries for this session
      queryClient.removeQueries({
        queryKey: workoutSessionKeys.details(),
        predicate: (query) => {
          const key = query.queryKey as unknown[];
          return key[key.length - 1] === sessionId;
        },
      });
    },
  });
};
