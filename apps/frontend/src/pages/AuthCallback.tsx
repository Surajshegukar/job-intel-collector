import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const loadUser = useAuthStore(state => state.loadUser);

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('auth-token', token);
      // Update store state directly
      useAuthStore.setState({ token, isAuthenticated: true });
      loadUser()
        .then(() => {
          navigate('/overview');
        })
        .catch((err) => {
          console.error('Failed to load user info:', err);
          navigate('/login?error=Failed to retrieve user profile after login.');
        });
    } else {
      navigate('/login?error=Authentication token was not found.');
    }
  }, [searchParams, navigate, loadUser]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="text-center">
        <Loader2 className="h-10 w-10 animate-spin text-brand-600 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-slate-900">Completing login...</h2>
        <p className="text-sm text-slate-500 mt-1">Please wait while we set up your session.</p>
      </div>
    </div>
  );
}
