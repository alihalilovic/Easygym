import { Navigate, Outlet } from 'react-router';
import { routes } from '@/lib/constants';
import { useAuth } from '@/components/auth/AuthProvider';

const ProtectedTrainerRoute = () => {
  const { isUserTrainer } = useAuth();

  if (!isUserTrainer) return <Navigate to={routes.Profile} replace />;

  return <Outlet />;
};

export default ProtectedTrainerRoute;

