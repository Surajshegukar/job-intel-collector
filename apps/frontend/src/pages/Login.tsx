import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Bot, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { GoogleIcon, GithubIcon } from '../icons';

export default function Login() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const { login, register, isLoading, error } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryError = searchParams.get('error');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let ok = false;
    if (mode === 'login') {
      ok = await login(email, password);
    } else {
      ok = await register(name, email, password);
    }
    if (ok) navigate('/overview');
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-white">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-brand-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md mx-4 animate-slide-up bg-white border border-[#e6e6e6] rounded-3xl p-8">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-brand-600 text-white mb-2 shadow-sm">
            <Bot size={26} />
          </div>
          <h1 className="text-2xl font-bold text-primary">Intel<span className='text-brand-600'>JET</span></h1>
          <p className="text-sm text-secondary mt-1">Your AI-powered career command centre</p>
        </div>

        <h2 className='text-secondary text-center text-md font-semibold mb-4'>Login to your account</h2>

        {/* Social Logins */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => {
              window.location.href = '/api/auth/google';
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition-all text-xs font-semibold text-slate-900"
          >
            <GoogleIcon /> Google
          </button>
          <button
            type="button"
            onClick={() => {
              window.location.href = '/api/auth/github';
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition-all text-xs font-semibold text-slate-900"
          >
            <GithubIcon /> GitHub
          </button>
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100" />
          </div>
          <div className="relative flex justify-center text-xs tracking-wider">
            <span className="bg-white px-3 text-tertiary font-medium">Or continue with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Suraj Shegukar"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-slate-900 placeholder-slate-400 text-sm transition-all duration-200 focus:outline-none focus:border-brand-600 focus:bg-white outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-secondary mb-1.5">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="suraj@example.com"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-slate-900 placeholder-slate-400 text-sm transition-all duration-200 focus:outline-none focus:border-brand-600 focus:bg-white outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-slate-900 placeholder-slate-400 text-sm transition-all duration-200 focus:outline-none focus:border-brand-600 focus:bg-white outline-none pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {(error || queryError) && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-100 rounded-md text-red-600 text-xs">
              <AlertCircle size={14} className="flex-shrink-0" />
              <span className="break-words max-w-full">{error || queryError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-brand-600 text-white font-semibold rounded-md hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm shadow-sm"
          >
            {isLoading ? <Loader2 size={15} className="animate-spin" /> : null}
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {mode === 'login' && (
          <p className="text-center text-xs text-slate-400 mt-5">
            Default seed user: <span className="text-slate-600 font-semibold">suraj@example.com</span> / <span className="text-slate-600 font-semibold">password123</span>
          </p>
        )}

        {
          mode === 'login' ? (
            <p className="text-center text-xs text-slate-400 mt-5">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-brand-600 font-semibold hover:text-brand-700"
              >
                Create an account
              </button>
            </p>
          ) : (
            <p className="text-center text-xs text-slate-400 mt-5">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-brand-600 font-semibold hover:text-brand-700"
              >
                Sign in
              </button>
            </p>
          )
        }
      </div>
    </div>
  );
}
