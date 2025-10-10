import { Navigate, Outlet } from 'react-router';
import { routes } from '@/lib/constants';
import { useAuth } from '@/components/auth/AuthProvider';

const ProtectedClientRoute = () => {
  const { isUserClient } = useAuth();

  if (!isUserClient) return <Navigate to={routes.Profile} replace />;

  return <Outlet />;
};

export default ProtectedClientRoute;
