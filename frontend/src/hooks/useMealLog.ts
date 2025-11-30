import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import mealLogService from '@/api/services/mealLogService';
import { LogMealRequest, UnlogMealRequest } from '@/types/MealLog';

export const mealLogKeys = {
  all: ['mealLogs'] as const,
  daily: (date: string, clientId?: number) =>
    [...mealLogKeys.all, 'daily', date, clientId] as const,
  weekly: (startDate: string, clientId?: number) =>
    [...mealLogKeys.all, 'weekly', startDate, clientId] as const,
};

export const useDailyMealProgress = (date: string, clientId?: number) => {
  return useQuery({
    queryKey: mealLogKeys.daily(date, clientId),
    queryFn: () => mealLogService.getDailyProgress(date, clientId),
    enabled: !!date,
  });
};

export const useWeeklyMealProgress = (startDate: string, clientId?: number) => {
  return useQuery({
    queryKey: mealLogKeys.weekly(startDate, clientId),
    queryFn: () => mealLogService.getWeeklyProgress(startDate, clientId),
    enabled: !!startDate,
  });
};

export const useLogMeal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: LogMealRequest) => mealLogService.logMeal(request),
    onSuccess: (_, variables) => {
      // Invalidate daily and weekly progress for the logged date
      queryClient.invalidateQueries({
        queryKey: mealLogKeys.daily(variables.logDate),
      });
      queryClient.invalidateQueries({
        queryKey: mealLogKeys.all,
      });
    },
  });
};

export const useUnlogMeal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UnlogMealRequest) => mealLogService.unlogMeal(request),
    onSuccess: (_, variables) => {
      // Invalidate daily and weekly progress for the unlogged date
      queryClient.invalidateQueries({
        queryKey: mealLogKeys.daily(variables.logDate),
      });
      queryClient.invalidateQueries({
        queryKey: mealLogKeys.all,
      });
    },
  });
};
