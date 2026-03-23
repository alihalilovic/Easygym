import { Navigate, Outlet } from 'react-router';
import { routes } from '@/lib/constants';
import { useAuth } from '@/components/auth/AuthProvider';

const ProtectedAdminRoute = () => {
  const { user, isUserAdmin, isLoading } = useAuth();

  if (isLoading) return null;

  if (!user) return <Navigate to={routes.Login} replace />;

  if (!isUserAdmin) return <Navigate to={routes.Profile} replace />;

  return <Outlet />;
};

export default ProtectedAdminRoute;
