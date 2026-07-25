import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import Onboarding from './pages/Onboarding';
import { Loader2 } from 'lucide-react';
import Overview from './pages/Overview';
import Jobs from './pages/Jobs/index';
import Companies from './pages/Companies/index';
import Skills from './pages/Skills';
import Tracker from './pages/Tracker';
import Profile from './pages/Profile';
import ResumeBuilder from './pages/ResumeBuilder';
import ResumeVersions from './pages/ResumeVersions';
import AIMonitoring from './pages/AIMonitoring';

function DashboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <div className="flex-1  flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto ml-64">
          <div className="max-w-7xl mx-auto px-8 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function RequireAuth() {
  const { isAuthenticated, token, user } = useAuthStore();
  if (!isAuthenticated && !token) {
    return <Navigate to="/login" replace />;
  }
  if (token && !user) {
    return null;
  }
  if (user && !user.isOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }
  return <DashboardLayout />;
}

function RequireOnboarding() {
  const { isAuthenticated, token, user } = useAuthStore();
  if (!isAuthenticated && !token) {
    return <Navigate to="/login" replace />;
  }
  if (token && !user) {
    return null;
  }
  if (user && user.isOnboarded) {
    return <Navigate to="/overview" replace />;
  }
  return <Onboarding />;
}

function RequireGuest() {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) {
    return <Navigate to="/overview" replace />;
  }
  return <Login />;
}

export default function App() {
  const { loadUser, token, isLoading, user } = useAuthStore();

  useEffect(() => {
    if (token) loadUser();
  }, []);

  if (isLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<RequireGuest />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/onboarding" element={<RequireOnboarding />} />
        <Route element={<RequireAuth />}>
          <Route path="/overview" element={<Overview />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/tracker" element={<Tracker />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/resume-builder" element={<ResumeBuilder />} />
          <Route path="/resume-versions" element={<ResumeVersions />} />
          <Route path="/ai-monitoring" element={<AIMonitoring />} />
        </Route>
        <Route path="*" element={<Navigate to="/overview" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
