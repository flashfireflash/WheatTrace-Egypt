import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';
import LoginPage from './pages/LoginPage';
import SplashScreen from './pages/SplashScreen';
import ServerWakeUp from './components/ui/ServerWakeUp';

const InspectorLayout = lazy(() => import('./components/layout/InspectorLayout'));
const ManagerLayout = lazy(() => import('./components/layout/ManagerLayout'));
const MonitorLayout = lazy(() => import('./components/layout/MonitorLayout'));
const AdminLayout = lazy(() => import('./components/layout/AdminLayout'));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return <>{children}</>;
}

function RoleRouter() {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;

  return (
    <Suspense fallback={<div style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', color: 'var(--text-secondary)' }}>جاري التحميل...</div>}>
      {(() => {
        switch (user.role) {
          case 'Inspector':          return <InspectorLayout />;
          case 'GovernorateManager': return <ManagerLayout />;
          case 'OperationsMonitor':
          case 'GeneralMonitor':     return <MonitorLayout />;
          case 'Admin':              return <AdminLayout />;
          case 'SuperAdmin':         return <AdminLayout />;
          default:                   return <Navigate to="/login" replace />;
        }
      })()}
    </Suspense>
  );
}

function GhostSwitcher() {
  const { user, login } = useAuthStore();
  
  if (!user) return null;
  const isGhost = user.role === 'SuperAdmin' || user.actualRole === 'SuperAdmin';
  if (!isGhost) return null;

  return (
    <div style={{
      position: 'fixed', bottom: '1rem', left: '1rem', zIndex: 9999,
      background: 'rgba(0,0,0,0.85)', padding: '0.75rem', borderRadius: '1rem',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)', border: '1px solid #333'
    }}>
      <div style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span>👻 وضع الشبح</span>
        <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', background: '#333', borderRadius: '1rem' }}>{user.role}</span>
      </div>
      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', maxWidth: '280px' }}>
        {['SuperAdmin', 'Admin', 'GovernorateManager', 'Inspector', 'GeneralMonitor', 'OperationsMonitor'].map(r => (
          <button
            key={r}
            onClick={() => {
              login({ ...user, role: r as any, actualRole: 'SuperAdmin' });
              // Force reload to reset states
              window.location.href = '/';
            }}
            style={{
              padding: '0.3rem 0.6rem', fontSize: '0.7rem', borderRadius: '0.5rem',
              border: user.role === r ? '1px solid #a855f7' : '1px solid #444',
              background: user.role === r ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
              color: user.role === r ? '#d8b4fe' : '#ccc', cursor: 'pointer'
            }}
          >
            {r.replace('Governorate', 'Gov').replace('Operations', 'Ops')}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ServerWakeUp>
        <ThemeProvider>
          <BrowserRouter>
            <Toaster
              position="bottom-center"
              toastOptions={{
                style: {
                  fontFamily: 'Cairo, sans-serif',
                  direction: 'rtl',
                  borderRadius: '0.875rem',
                  fontWeight: 600,
                  background: 'var(--surface-1)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow-lg)',
                },
                success: {
                  iconTheme: { primary: '#15803d', secondary: '#dcfce7' },
                },
                error: {
                  iconTheme: { primary: '#dc2626', secondary: '#fee2e2' },
                },
              }}
            />
            <GhostSwitcher />
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/splash" element={<SplashScreen />} />
              <Route path="/*"    element={<RoleRouter />} />
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </ServerWakeUp>
    </QueryClientProvider>
  );
}
