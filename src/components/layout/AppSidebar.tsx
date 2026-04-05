import { useLocation, useNavigate } from 'react-router-dom';
import { getUser, setUser, getStreak } from '@/lib/mood-store';

const navItems = [
  { emoji: '🏠', label: 'Dashboard', path: '/dashboard' },
  { emoji: '😊', label: 'Daily Check-In', path: '/checkin' },
  { emoji: '✨', label: 'Affirmations', path: '/affirmations' },
  { emoji: '🧠', label: 'Insights', path: '/insights' },
  { emoji: '📊', label: 'Mood History', path: '/history' },
  { emoji: '📍', label: 'Nearby Places', path: '/places' },
  { emoji: '⚙️', label: 'Settings', path: '/settings' },
];

interface AppSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function AppSidebar({ open, onClose }: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getUser();
  const streak = getStreak();

  const handleNav = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleSignOut = () => {
    setUser(null);
    navigate('/');
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-foreground/40 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-[260px] z-50 gradient-dark flex flex-col
        transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-coral flex items-center justify-center text-xl">🌊</div>
            <span className="font-display text-xl font-bold text-primary-foreground">MoodFlow</span>
          </div>
        </div>

        {/* User info */}
        <div className="px-6 pb-6">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-sidebar-accent">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-lg">😊</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">{user?.name || 'User'}</p>
              {streak > 0 && (
                <p className="text-xs text-sidebar-foreground/60">🔥 {streak}-day streak</p>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                  ${isActive
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                  }
                `}
              >
                <span className="text-lg">{item.emoji}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
          {user?.role === 'admin' && (
            <button
              onClick={() => handleNav('/admin')}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                ${location.pathname === '/admin'
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                }
              `}
            >
              <span className="text-lg">👑</span>
              <span>Admin Panel</span>
            </button>
          )}
        </nav>

        {/* Sign out */}
        <div className="p-4">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all"
          >
            <span className="text-lg">🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
