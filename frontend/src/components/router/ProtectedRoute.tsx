import { useAuth } from '@/components/auth/AuthProvider';
import { Navigate, Outlet } from 'react-router';
import { routes } from '@/lib/constants';

const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();

  // Wait for auth initialization before redirecting
  if (isLoading) return null;

  // Only redirect if we're not loading and the user is not authenticated
  if (!user) return <Navigate to={routes.Login} replace />;

  return <Outlet />;
};

export default ProtectedRoute;
