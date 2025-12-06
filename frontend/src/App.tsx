import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { Outlet } from 'react-router';
import { Toaster } from '@/components/ui/sonner';
import ModeToggle from '@/components/theme/ModeToggle';
import Navbar from '@/components/layout/Navbar';
import { useEffect } from 'react';
import { authTokenKey } from '@/lib/constants';
import { useAuth } from '@/components/auth/AuthProvider';
import KeyboardShortcutProvider from '@/components/keyboard-shortcuts/KeyboardShortcutProvider';

const App = () => {
  const { setMeUser } = useAuth();

  useEffect(() => {
    if (localStorage.getItem(authTokenKey))
      setMeUser();
  }, [setMeUser]);
  return (
    <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
      <KeyboardShortcutProvider>
        <div className="wrapper">
          <Navbar />
          <ModeToggle className="absolute top-0 right-0" />
          <Toaster />
          <Outlet />
        </div>
      </KeyboardShortcutProvider>
    </ThemeProvider>
  );
};

export default App;
