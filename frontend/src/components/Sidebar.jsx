import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const menuItems = {
  field_agent: [
    { path: '/field', label: 'Dashboard', icon: '📊' },
    { path: '/submit', label: 'New Submission', icon: '📝' },
  ],
  district_admin: [
    { path: '/district', label: 'Dashboard', icon: '📊' },
    { path: '/fund-logs', label: 'Fund Logs', icon: '💰' },
  ],
  state_admin: [
    { path: '/state', label: 'State Dashboard', icon: '🏛️' },
  ],
};

export default function Sidebar() {
  const { user } = useAuth();
  if (!user) return null;

  const items = menuItems[user.role] || [];

  return (
    <aside className="fixed left-0 top-14 bottom-0 w-56 bg-surface-card/60 backdrop-blur-xl border-r border-slate-700/50 p-3 hidden lg:block">
      <div className="space-y-1">
        {items.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary-500/15 text-primary-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/40'
              }`
            }
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </div>

      <div className="absolute bottom-4 left-3 right-3">
        <div className="p-3 rounded-lg bg-surface-elevated border border-slate-700/50">
          <p className="text-xs text-slate-500">Logged in as</p>
          <p className="text-sm font-medium text-white truncate">{user.name}</p>
          <p className="text-xs text-slate-500 mt-0.5">
            {user.district_id ? user.district_id.charAt(0).toUpperCase() + user.district_id.slice(1) : 'All Districts'}
          </p>
        </div>
      </div>
    </aside>
  );
}
