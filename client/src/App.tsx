import { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserProvider } from './context/UserContext';
import { usePseudonym } from './hooks/usePseudonym';
import { Navbar } from './components/Navbar';
import { CloudBackground } from './components/CloudBackground';
import { Onboarding } from './pages/Onboarding';
import { Dashboard } from './pages/Dashboard';
import { LogSession } from './pages/LogSession';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminParticipantDetail } from './pages/admin/AdminParticipantDetail';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { pseudonym } = usePseudonym();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!pseudonym && !location.pathname.startsWith('/admin')) {
      navigate('/onboarding', { replace: true });
    }
  }, [pseudonym, navigate, location.pathname]);

  if (!pseudonym && !location.pathname.startsWith('/admin')) {
    return null;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <>
      <CloudBackground />
      <Navbar />
      <div style={{ position: 'relative', zIndex: 1 }}>
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route
          path="/dashboard"
          element={
            <AuthGuard>
              <Dashboard />
            </AuthGuard>
          }
        />
        <Route
          path="/log"
          element={
            <AuthGuard>
              <LogSession />
            </AuthGuard>
          }
        />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/participants/:pseudonym" element={<AdminParticipantDetail />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      </div>
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <AppRoutes />
      </UserProvider>
    </QueryClientProvider>
  );
}
