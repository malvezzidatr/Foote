import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginGoogle as apiLoginGoogle, logout as apiLogout, getStoredUser, isLoggedIn as checkLoggedIn } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [loading, setLoading] = useState(false);

  const loginGoogle = useCallback(async (credential) => {
    setLoading(true);
    try {
      const data = await apiLoginGoogle(credential);
      setUser(data.user);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    apiLogout();
    setUser(null);
  }, []);

  const value = {
    user,
    loading,
    isLoggedIn: !!user,
    loginGoogle,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
