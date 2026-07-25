import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Settings, LogOut, ChevronDown
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

// Mock notifications - replace with real data from your API
// const MOCK_NOTIFICATIONS = [
//   {
//     id: '1',
//     type: 'success',
//     title: 'Application Update',
//     message: 'Your application for Senior Developer at TechCorp moved to Interview stage',
//     time: '5 min ago',
//     read: false,
//   },
//   {
//     id: '2',
//     type: 'info',
//     title: 'New Job Match',
//     message: '3 new jobs match your profile with 85%+ compatibility',
//     time: '2 hours ago',
//     read: false,
//   },
//   {
//     id: '3',
//     type: 'ai',
//     title: 'AI Analysis Complete',
//     message: 'Resume optimization suggestions are ready for "Full-Stack Role"',
//     time: '1 day ago',
//     read: true,
//   },
// ];

export default function Header() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  // const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  // const [notifications] = useState(MOCK_NOTIFICATIONS);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        // setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  // const notificationIcon: Record<string, { icon: any; color: string; bg: string }> = {
  //   success: { icon: TrendingUp, color: 'text-emerald-650', bg: 'bg-emerald-50' },
  //   info: { icon: Sparkles, color: 'text-blue-600', bg: 'bg-blue-50' },
  //   ai: { icon: Sparkles, color: 'text-violet-600', bg: 'bg-violet-50' },
  //   warning: { icon: AlertCircle, color: 'text-amber-605', bg: 'bg-amber-50' },
  // };

  return (
    <header className="sticky top-0 z-2 bg-white border-b border-slate-100">
        
      <div className="flex items-center justify-between px-8 py-4">

        {/* Left: Search bar */}
        <div className="flex-1 max-w-2xl">
          {/* <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search jobs, companies, or skills..."
              className="w-full h-10 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 transition-all duration-200 focus:outline-none focus:bg-white focus:border-brand-400 focus:ring-2 focus:ring-brand-400/10"
            />
          </div> */}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 ml-8">

          {/* Notifications */}
          {/* <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all duration-200"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
              )}
            </button>

             
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-96 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-slide-up">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">Notifications</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{unreadCount} unread</p>
                  </div>
                  <button className="text-xs font-medium text-brand-600 hover:text-brand-700">
                    Mark all read
                  </button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notif) => {
                    const iconData = notificationIcon[notif.type] || notificationIcon.info;
                    const Icon = iconData.icon;
                    return (
                      <button
                        key={notif.id}
                        className={`w-full text-left px-5 py-4 border-b border-slate-50 transition-colors hover:bg-slate-50 ${!notif.read ? 'bg-brand-50/30' : ''
                          }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-lg ${iconData.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                            <Icon size={14} className={iconData.color} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-semibold text-slate-800">{notif.title}</p>
                              {!notif.read && (
                                <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                            <p className="text-xs text-slate-400 mt-1.5">{notif.time}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="px-5 py-3 border-t border-slate-100 bg-slate-50">
                  <button className="text-xs font-medium text-slate-600 hover:text-slate-800 w-full text-center">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div> */}

          {/* Profile Menu */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 rounded-xl transition-all duration-200"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-indigo-500 flex items-center justify-center text-sm font-bold text-white shadow-sm">
                {user?.name?.charAt(0).toUpperCase() ?? 'U'}
              </div>
              <div className="text-left hidden lg:block">
                <p className="text-sm font-semibold text-slate-700 leading-none">{user?.name || 'User'}</p>
                {/* <p className="text-xs text-slate-400 mt-0.5">Free Plan</p> */}
              </div>
              <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-slide-up">
                <div className="px-5 py-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-indigo-500 flex items-center justify-center text-sm font-bold text-white shadow-sm">
                      {user?.name?.charAt(0).toUpperCase() ?? 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{user?.name || 'User'}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email || 'user@example.com'}</p>
                    </div>
                  </div>
                  {/* <div className="mt-3 px-3 py-2 bg-brand-50 border border-brand-100 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-brand-700">Free Plan</span>
                      <button className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                        Upgrade
                      </button>
                    </div>
                    <div className="mt-2 h-1.5 bg-brand-100 rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-gradient-to-r from-brand-500 to-indigo-500 rounded-full" />
                    </div>
                    <p className="text-[10px] text-brand-600 mt-1.5">15 of 20 AI credits used</p>
                  </div> */}
                </div>

                <div className="py-2">
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setShowProfileMenu(false);
                    }}
                    className="flex items-center gap-3 w-full px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <User size={16} className="text-slate-400" />
                    My Profile
                  </button>
                  <button
                    onClick={() => {
                      navigate('/settings');
                      setShowProfileMenu(false);
                    }}
                    className="flex items-center gap-3 w-full px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Settings size={16} className="text-slate-400" />
                    Settings
                  </button>
                </div>

                <div className="border-t border-slate-100 py-2">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} className="text-red-500" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
