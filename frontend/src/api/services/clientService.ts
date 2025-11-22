import { requests } from '../api';
import { TrainerConnection } from '@/types/User';

const clientService = {
  getMyTrainer: (): Promise<TrainerConnection | null> =>
    requests.get<TrainerConnection | null>('/client/me/trainer'),
  removeMyTrainer: (): Promise<void> =>
    requests.delete<void>('/client/me/trainer'),
};

export default clientService;
