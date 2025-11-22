import axios, { AxiosResponse } from 'axios';
import { authTokenKey } from '@/lib/constants';
import authService from '@/api/services/authService';
import userService from '@/api/services/userService';
import workoutService from '@/api/services/workoutService';
import workoutSessionService from '@/api/services/workoutSessionService';
import interactionService from './services/interactionService';

axios.defaults.baseURL = import.meta.env.VITE_APP_API_URL;

const instance = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(authTokenKey);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  },
);

const responseBody = <T>(response: AxiosResponse<T>) => response.data;

export const requests = {
  get: <T>(url: string) => instance.get<T>(url).then(responseBody),
  post: <T>(url: string, body: object) =>
    instance.post<T>(url, body).then(responseBody),
  put: <T>(url: string, body: object) =>
    instance.put<T>(url, body).then(responseBody),
  delete: <T>(url: string) => instance.delete<T>(url).then(responseBody),
};

const api = {
  users: userService,
  auth: authService,
  workouts: workoutService,
  workoutSessions: workoutSessionService,
  interactions: interactionService,
};

export default api;
