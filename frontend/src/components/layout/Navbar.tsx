import { NavLink } from 'react-router';
import { routes } from '@/lib/constants';
import { observer } from 'mobx-react-lite';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/AuthProvider';

const Navbar = observer(() => {
  const { userId, isUserClient, logout } = useAuth();

  return (
    <div className="flex flex-col sm:flex-row items-center min-h-9 font-bold mb-4">
      <h1 className="text-2xl uppercase">EasyGym</h1>
      <div className="flex flex-col sm:flex-row items-center w-fit ml-0 mt-2 sm:mt-0 sm:ml-auto mr-0 sm:mr-16">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {userId ? (
            <>
              <NavLink to={routes.Invitations}>Invitations</NavLink>
              {isUserClient && (
                <>
                  <NavLink to={''}>My trainer</NavLink>
                  <NavLink to={routes.WorkoutSessions}>Sessions</NavLink>
                </>
              )}
              <NavLink to={routes.Workouts}>Workouts</NavLink>
              <NavLink to={routes.Profile}>Profile</NavLink>
              <Button variant="outline" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <NavLink to={routes.Home}>Home</NavLink>
              <NavLink to={routes.Login}>Login</NavLink>
              <NavLink to={routes.Register}>Register</NavLink>
            </>
          )}
        </div>
      </div>
    </div>
  );
});

export default Navbar;
