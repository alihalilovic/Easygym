import { requests } from '../api';
import { ClientConnection } from '@/types/User';

const trainerService = {
  getMyClients: (): Promise<ClientConnection[]> => requests.get<ClientConnection[]>('/trainer/me/clients'),
  removeClient: (clientId: number): Promise<void> => requests.delete<void>(`/trainer/me/clients/${clientId}`),
  getMyClientHistory: (): Promise<ClientConnection[]> => requests.get<ClientConnection[]>('/trainer/me/clients/history'),
};

export default trainerService;
