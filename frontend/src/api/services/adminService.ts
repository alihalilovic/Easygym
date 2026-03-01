import { requests } from '../api';
import { User } from '@/types/User';

const adminService = {
  getClients: (): Promise<User[]> =>
    requests.get<User[]>('/admin/clients'),

  getTrainers: (): Promise<User[]> =>
    requests.get<User[]>('/admin/trainers'),

  deleteUser: (id: number): Promise<void> =>
    requests.delete<void>(`/admin/users/${id}`),

  updateUser: (id: number, data: { name: string; email: string }): Promise<void> =>
    requests.put<void>(`/admin/users/${id}`, data),
};

export default adminService;