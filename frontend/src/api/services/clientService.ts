import { requests } from '../api';
import { TrainerConnection } from '@/types/User';
import { DashboardStatsResponse } from '@/types/Dashboard';

const clientService = {
  getMyTrainer: (): Promise<TrainerConnection | null> =>
    requests.get<TrainerConnection | null>('/client/me/trainer'),
  removeMyTrainer: (): Promise<void> =>
    requests.delete<void>('/client/me/trainer'),
  getMyTrainerHistory: (): Promise<TrainerConnection[]> =>
    requests.get<TrainerConnection[]>('/client/me/trainer/history'),
  getDashboardStats: (): Promise<DashboardStatsResponse> =>
    requests.get<DashboardStatsResponse>('/client/me/dashboard'),
};

export default clientService;
