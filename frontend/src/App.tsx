import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { Outlet } from 'react-router';
import { Toaster } from '@/components/ui/sonner';
import ModeToggle from '@/components/theme/ModeToggle';
import Navbar from '@/components/layout/Navbar';
import { useEffect } from 'react';
import { authTokenKey } from '@/lib/constants';
import { observer } from 'mobx-react-lite';
import { useAuth } from '@/components/auth/AuthProvider';

const App = observer(() => {
  const { setMeUser } = useAuth();

  useEffect(() => {
    if (localStorage.getItem(authTokenKey))
      setMeUser();
  }, [setMeUser]);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
      <div className="wrapper">
        <Navbar />
        <ModeToggle className="absolute top-0 right-0" />
        <Toaster />
        <Outlet />
      </div>
    </ThemeProvider>
  );
});

export default App;
