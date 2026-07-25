import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Briefcase, Building2, Zap,
  KanbanSquare, UserCircle, Bot, FileText, History
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/overview', icon: LayoutDashboard, label: 'Overview' },
  { to: '/jobs', icon: Briefcase, label: 'Jobs' },
  { to: '/companies', icon: Building2, label: 'Companies' },
  { to: '/skills', icon: Zap, label: 'Skills' },
  { to: '/tracker', icon: KanbanSquare, label: 'Tracker' },
  { to: '/profile', icon: UserCircle, label: 'Profile' },
  { to: '/resume-builder', icon: FileText, label: 'Resume Builder' },
  { to: '/resume-versions', icon: History, label: 'Resume History' },
  { to: '/ai-monitoring', icon: Bot, label: 'AI Monitoring' },
];

export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-4c w-64 flex flex-col bg-white border-r border-slate-100">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 pb-0">
        {/* <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-brand-600 text-white mb-2 shadow-sm">
          <Bot size={15} />
        </div> */}
        <h1 className="text-lg font-bold text-primary">Intel<span className='text-brand-600'>JET</span></h1>
      </div>

      <div className="px-5 pb-4">
        <p className="text-xs text-secondary mt-1">Your AI-powered career command centre</p>
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
      {/* <div className="px-3 py-4 border-t border-dark-800/60">
        
        <button
          onClick={handleLogout}
          className="nav-link w-full mt-1 text-red-400 hover:bg-red-900/20 hover:text-red-300"
        >
          <LogOut size={15} />
          Sign Out
        </button>
      </div> */}
    </aside>
  );
}
