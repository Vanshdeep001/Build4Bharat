import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Attempt to parse user from localStorage on mount
    const savedUser = localStorage.getItem('pmddky_auth');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (role) => {
    const newUser = { role }; // role can be 'dm' or 'bdo'
    setUser(newUser);
    localStorage.setItem('pmddky_auth', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('pmddky_auth');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
