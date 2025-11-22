import { UserRegisterRequest, User, AuthTokenResponse } from '@/types/User';
import { requests } from '@/api/api';

const authService = {
  me: async () => {
    const user = await requests.get<User>('/auth/me');
    return user;
  },
  login: async (body: { email: string; password: string }) => {
    const { token } = await requests.post<AuthTokenResponse>(
      '/auth/login',
      body,
    );
    return token;
  },
  register: async (body: UserRegisterRequest) => {
    const { token } = await requests.post<AuthTokenResponse>(
      '/auth/register',
      body,
    );
    return token;
  },
};

export default authService;
