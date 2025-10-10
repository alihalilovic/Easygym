import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/styles/index.css';
import Router from '@/components/router/Router';
import store, { StoreContext } from '@/store/store';
import { AuthProvider } from '@/components/auth/AuthProvider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreContext.Provider value={store}>
      <AuthProvider>
        <Router />
      </AuthProvider>
    </StoreContext.Provider>
  </StrictMode>,
);
