import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Overview from './pages/Overview';
import Jobs from './pages/Jobs';
import Companies from './pages/Companies';
import Skills from './pages/Skills';
import Tracker from './pages/Tracker';
import Profile from './pages/Profile';
import ResumeBuilder from './pages/ResumeBuilder';
import ResumeVersions from './pages/ResumeVersions';
import AIMonitoring from './pages/AIMonitoring';

function DashboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 ml-60 overflow-y-auto bg-dark-950">
        <div className="max-w-7xl mx-auto px-6 py-7">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function RequireAuth() {
  const { isAuthenticated, token } = useAuthStore();
  if (!isAuthenticated && !token) {
    return <Navigate to="/login" replace />;
  }
  return <DashboardLayout />;
}

function RequireGuest() {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) {
    return <Navigate to="/overview" replace />;
  }
  return <Login />;
}

export default function App() {
  const { loadUser, token } = useAuthStore();

  useEffect(() => {
    if (token) loadUser();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<RequireGuest />} />
        <Route element={<RequireAuth />}>
          <Route path="/overview"      element={<Overview />} />
          <Route path="/jobs"          element={<Jobs />} />
          <Route path="/companies"     element={<Companies />} />
          <Route path="/skills"        element={<Skills />} />
          <Route path="/tracker"       element={<Tracker />} />
          <Route path="/profile"       element={<Profile />} />
          <Route path="/resume-builder" element={<ResumeBuilder />} />
          <Route path="/resume-versions" element={<ResumeVersions />} />
          <Route path="/ai-monitoring" element={<AIMonitoring />} />
        </Route>
        <Route path="*" element={<Navigate to="/overview" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
