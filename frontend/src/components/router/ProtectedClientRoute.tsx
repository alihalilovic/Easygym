import { observer } from 'mobx-react-lite';
import { Navigate, Outlet } from 'react-router';
import { routes } from '@/lib/constants';
import { useAuth } from '@/components/auth/AuthProvider';

const ProtectedClientRoute = observer(() => {
  const { isUserClient } = useAuth();

  if (!isUserClient) return <Navigate to={routes.Profile} replace />;

  return <Outlet />;
});

export default ProtectedClientRoute;
