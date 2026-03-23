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
    // Check for global event captured in index.html
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
    <nav className="fixed top-6 left-0 right-0 z-[100] px-4 pointer-events-none">
      <div className="max-w-5xl mx-auto flex items-center justify-between bg-white border-2 border-brand-ink p-2 rounded-full shadow-[8px_8px_0px_black] pointer-events-auto">
        
        {/* Brand/User Initials */}
        <Link to="/" className="flex items-center justify-center w-12 h-12 rounded-full border-2 border-brand-ink bg-brand-clay text-brand-ink transition-all hover:bg-brand-ink hover:text-white">
           <span className="font-display font-black text-lg tracking-tighter">{getInitials(user?.name)}</span>
        </Link>

        {/* Action Zone */}
        <div className="flex items-center gap-2 pr-2">
          
          {/* Install Button */}
          {deferredPrompt && (
            <button 
              onClick={handleInstallClick}
              className="flex items-center gap-2 bg-accent-terracotta text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-mono text-[9px] sm:text-[10px] font-black border-2 border-black shadow-[4px_4px_0px_black] active:translate-y-[2px] active:shadow-none transition-all mr-1 sm:mr-2"
            >
              📥 INSTALL APP
            </button>
          )}

          {/* Notifications Pulse */}
          <div className="relative">
            <button 
              onClick={() => {
                setShowDropdown(!showDropdown);
                if (!showDropdown) markAllRead();
              }}
              className="w-10 h-10 rounded-full flex items-center justify-center text-xl hover:bg-brand-clay transition relative"
              title="Notifications"
            >
              🔔
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-cobalt text-[10px] font-black text-white rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown - Organic Panel */}
            {showDropdown && (
              <div className="absolute right-0 mt-6 w-72 organic-panel bg-white p-4 shadow-2xl border-4 border-brand-ink animate-in zoom-in-95 duration-300">
                <h3 className="font-display font-bold text-sm mb-4 uppercase text-brand-ink">Updates</h3>
                <div className="max-h-[250px] overflow-y-auto space-y-3">
                  {notifications.length === 0 ? (
                    <p className="text-[10px] font-mono text-brand-ink italic">No new updates...</p>
                  ) : (
                    notifications.map(n => (
                      <div key={n._id} className="p-3 bg-brand-clay rounded-2xl border border-brand-ink/10">
                        <div className="flex gap-3">
                           <div className={`w-1.5 h-1.5 mt-1.5 rounded-full shrink-0 ${n.type === 'anomaly' ? 'bg-red-500' : 'bg-accent-cobalt'}`}></div>
                           <p className="text-[10px] font-bold text-brand-ink leading-tight">{typeof n.message === 'string' ? n.message : JSON.stringify(n.message)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="w-[1px] h-6 bg-brand-ink/20 mx-2 hidden sm:block"></div>

          {/* User Meta Hidden */}

          <button 
            onClick={handleLogout}
            className="px-4 py-2 rounded-full bg-brand-ink text-white font-mono text-[10px] font-black hover:bg-accent-terracotta transition-all shadow-md active:translate-y-[1px]"
          >
            LOGOUT
          </button>
        </div>
      </div>
    </nav>
  );
}
