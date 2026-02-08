import { useAuth } from '@/components/auth/AuthProvider';
import { Navigate, Outlet } from 'react-router';
import { routes } from '@/lib/constants';
import { UserRole } from '@/types/User';

const AuthRoute = () => {
  const { user, isLoading } = useAuth();

  // Wait for auth initialization before redirecting
  if (isLoading) return null;

  // Only redirect if we're not loading and the user is authenticated
  if (user) {
    const redirectPath =
      user.role === UserRole.Client ? routes.Dashboard : routes.MyClients;
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

export default AuthRoute;
