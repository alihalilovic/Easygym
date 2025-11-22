import { requests } from '../api';
import { TrainerConnection } from '@/types/User';

const clientService = {
  getMyTrainer: (): Promise<TrainerConnection | null> =>
    requests.get<TrainerConnection | null>('/client/me/trainer'),
  removeMyTrainer: (): Promise<void> =>
    requests.delete<void>('/client/me/trainer'),
  getMyTrainerHistory: (): Promise<TrainerConnection[]> =>
    requests.get<TrainerConnection[]>('/client/me/trainer/history'),
};

export default clientService;
