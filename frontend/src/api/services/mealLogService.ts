import { requests } from '@/api/api';
import {
  LogMealRequest,
  UnlogMealRequest,
  MealLogResponse,
  DailyMealProgressResponse,
  WeeklyMealProgressResponse,
  DeleteMealMediaRequest,
} from '@/types/MealLog';
import { instance } from '@/api/api';


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

  uploadMealMedia: async (file: File, mealId: number, logDate: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mealId', mealId.toString());
    formData.append('logDate', logDate);

    const response = await instance.post<{ mediaUrl: string }>(
      '/meallog/upload-media',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  deleteMealMedia: async (request: DeleteMealMediaRequest) => {
    await requests.delete('/meallog/delete-media', request);
  },

  downloadMealMedia: async (mediaUrl: string): Promise<Blob> => {
    const params = new URLSearchParams({ mediaUrl });
    const response = await instance.get(`/meallog/download-media?${params.toString()}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default mealLogService;
