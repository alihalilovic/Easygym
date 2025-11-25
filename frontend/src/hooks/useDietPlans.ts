import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dietPlanService from '@/api/services/dietPlanService';
import {
  CreateDietPlanRequest,
  UpdateDietPlanRequest,
  AssignDietPlanRequest,
} from '@/types/DietPlan';

export const dietPlanKeys = {
  all: ['dietPlans'] as const,
  lists: () => [...dietPlanKeys.all, 'list'] as const,
  detail: (dietPlanId: number) =>
    [...dietPlanKeys.all, 'detail', dietPlanId] as const,
};

export const useDietPlans = () => {
  return useQuery({
    queryKey: dietPlanKeys.lists(),
    queryFn: () => dietPlanService.getDietPlans(),
  });
};

export const useDietPlan = (dietPlanId: number, enabled = true) => {
  return useQuery({
    queryKey: dietPlanKeys.detail(dietPlanId),
    queryFn: () => dietPlanService.getDietPlan(dietPlanId),
    enabled: enabled && dietPlanId > 0,
  });
};

export const useCreateDietPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dietPlan: CreateDietPlanRequest) =>
      dietPlanService.createDietPlan(dietPlan),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dietPlanKeys.lists() });
    },
  });
};

export const useUpdateDietPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      dietPlanId,
      dietPlan,
    }: {
      dietPlanId: number;
      dietPlan: UpdateDietPlanRequest;
    }) => dietPlanService.updateDietPlan(dietPlanId, dietPlan),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dietPlanKeys.all });
    },
  });
};

export const useDeleteDietPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dietPlanId: number) =>
      dietPlanService.deleteDietPlan(dietPlanId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dietPlanKeys.all });
    },
  });
};

export const useAssignDietPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: AssignDietPlanRequest) =>
      dietPlanService.assignDietPlan(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dietPlanKeys.all });
    },
  });
};

export const useUnassignDietPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      dietPlanId,
      clientId,
    }: {
      dietPlanId: number;
      clientId: number;
    }) => dietPlanService.unassignDietPlan(dietPlanId, clientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dietPlanKeys.all });
    },
  });
};

export const useUpdateAssignmentActive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      dietPlanId,
      clientId,
      isActive,
    }: {
      dietPlanId: number;
      clientId: number;
      isActive: boolean;
    }) => dietPlanService.updateAssignmentActive(dietPlanId, clientId, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dietPlanKeys.all });
    },
  });
};
