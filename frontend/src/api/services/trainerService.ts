import { requests } from '../api';
import { ClientConnection } from '@/types/User';

const trainerService = {
  getMyClients: (): Promise<ClientConnection[]> => requests.get<ClientConnection[]>('/trainer/me/clients'),
};

export default trainerService;
