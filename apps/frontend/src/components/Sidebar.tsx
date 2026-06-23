import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Briefcase, Building2, Zap,
  KanbanSquare, UserCircle, LogOut, Bot
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const NAV_ITEMS = [
  { to: '/overview',      icon: LayoutDashboard, label: 'Overview' },
  { to: '/jobs',          icon: Briefcase,       label: 'Jobs' },
  { to: '/companies',     icon: Building2,       label: 'Companies' },
  { to: '/skills',        icon: Zap,             label: 'Skills' },
  { to: '/tracker',       icon: KanbanSquare,    label: 'Tracker' },
  { to: '/profile',       icon: UserCircle,      label: 'Profile' },
  { to: '/ai-monitoring', icon: Bot,             label: 'AI Monitoring' },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-60 flex flex-col glass-card rounded-none border-r border-dark-800/80 bg-dark-950/90">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-dark-800/60">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-lg shadow-brand-900/50">
          <Bot size={16} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-dark-50 leading-tight">Job Intel</p>
          <p className="text-[10px] text-dark-500 font-medium tracking-wide uppercase">System</p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User Footer */}
      <div className="px-3 py-4 border-t border-dark-800/60">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-dark-200 truncate">{user?.name}</p>
            <p className="text-[10px] text-dark-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="nav-link w-full mt-1 text-red-400 hover:bg-red-900/20 hover:text-red-300"
        >
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
