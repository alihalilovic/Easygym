import { observer } from 'mobx-react-lite';
import { useAuth } from '@/components/auth/AuthProvider';
import { Navigate, Outlet } from 'react-router';
import { routes } from '@/lib/constants';

const AuthRoute = observer(() => {
  const { user } = useAuth();

  // Only redirect if we're not loading and the user is authenticated
  if (user) return <Navigate to={routes.Profile} replace />;

  return <Outlet />;
});

export default AuthRoute;
