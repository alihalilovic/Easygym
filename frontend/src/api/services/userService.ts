import { User } from '@/types/User';
import { requests } from '@/api/api';

const userService = {
  single: (id: string) => requests.get<User>(`/user/${id}`),

  me: () => requests.get<User>('/auth/me'),

  updateProfile: (data: { name?: string; password?: string }) =>
    requests.put<void>('/auth/me', data),
};

export default userService;
