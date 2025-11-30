import { requests } from '@/api/api';
import {
  LogMealRequest,
  UnlogMealRequest,
  MealLogResponse,
  DailyMealProgressResponse,
  WeeklyMealProgressResponse,
} from '@/types/MealLog';

const mealLogService = {
  logMeal: async (request: LogMealRequest) => {
    const response = await requests.post<MealLogResponse>(`/meallog`, request);
    return response;
  },

  unlogMeal: async (request: UnlogMealRequest) => {
    await requests.delete(`/meallog`, request);
  },

  getDailyProgress: async (date: string, clientId?: number) => {
    const params = new URLSearchParams({ date });
    if (clientId) {
      params.append('clientId', clientId.toString());
    }
    const response = await requests.get<DailyMealProgressResponse>(
      `/meallog/daily?${params.toString()}`
    );
    return response;
  },

  getWeeklyProgress: async (startDate: string, clientId?: number) => {
    const params = new URLSearchParams({ startDate });
    if (clientId) {
      params.append('clientId', clientId.toString());
    }
    const response = await requests.get<WeeklyMealProgressResponse>(
      `/meallog/weekly?${params.toString()}`
    );
    return response;
  },
};

export default mealLogService;
