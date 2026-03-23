import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('pmddky_token');
    const savedUser = localStorage.getItem('pmddky_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (phone, password) => {
    const res = await api.post('/auth/login', { phone, password });
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('pmddky_token', newToken);
    localStorage.setItem('pmddky_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('pmddky_token');
    localStorage.removeItem('pmddky_user');
    setToken(null);
    setUser(null);
  };

  const getRedirectPath = (role) => {
    switch (role) {
      case 'field_agent': return '/field';
      case 'district_admin': return '/district';
      case 'state_admin': return '/state';
      default: return '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, getRedirectPath }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
