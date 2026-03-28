import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import api from '../utils/api';
import { getSocket } from '../utils/socket';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    if (window.deferredPrompt) {
      setDeferredPrompt(window.deferredPrompt);
    }

    const handlePrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handlePrompt);

    if (user) {
      fetchNotifications();
      const socket = getSocket();
      if (socket) {
        socket.on('new_anomaly', handleNewNotification);
        socket.on('kpi_alert', handleNewNotification);
      }
      return () => {
        if (socket) {
          socket.off('new_anomaly', handleNewNotification);
          socket.off('kpi_alert', handleNewNotification);
        }
      };
    }
  }, [user]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
      setUnreadCount(res.data.filter(n => !n.is_read).length);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  const handleNewNotification = (data) => {
    setNotifications(prev => [data, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  const markAllRead = async () => {
    try {
      if (unreadCount > 0) {
        await api.put('/notifications/read');
        setUnreadCount(0);
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      }
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-white border-b border-border">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-2">

        {/* Brand/User Initials */}
        <Link to="/field" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
            {getInitials(user?.name)}
          </div>
          <span className="text-sm font-bold text-ink hidden sm:block">{user?.name}</span>
        </Link>

        {/* Action Zone */}
        <div className="flex items-center gap-2">

          {/* Install Button */}
          {deferredPrompt && (
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1 bg-primary text-white px-3 py-1.5 rounded-lg text-xs font-bold"
            >
              📥 Install
            </button>
          )}

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setShowDropdown(!showDropdown);
                if (!showDropdown) markAllRead();
              }}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-lg hover:bg-surface relative"
              title="Notifications"
            >
              🔔
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-danger text-[9px] font-bold text-white rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-border rounded-lg shadow-lg p-3 z-50">
                <h3 className="text-xs font-bold text-ink uppercase tracking-wide mb-3">Notifications</h3>
                <div className="max-h-[250px] overflow-y-auto space-y-2">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-ink-muted italic">No new updates...</p>
                  ) : (
                    notifications.map(n => (
                      <div key={n._id} className="p-2 bg-surface rounded-lg border border-border">
                        <div className="flex gap-2">
                          <div className={`w-1.5 h-1.5 mt-1.5 rounded-full shrink-0 ${n.type === 'anomaly' ? 'bg-danger' : 'bg-primary'}`}></div>
                          <p className="text-xs font-medium text-ink leading-tight">
                            {typeof n.message === 'string' ? n.message : JSON.stringify(n.message)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-lg bg-ink text-white text-xs font-bold"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
