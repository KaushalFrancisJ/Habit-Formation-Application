import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import * as authApi from '../api/auth.ts';
import type { User } from '../types/index.ts';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    authApi.getMe()
      .then(setUser)
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const { token, user } = await authApi.login(email, password, timezone);
    localStorage.setItem('token', token);
    setUser(user);
  };

  const logout = async () => {
    await authApi.logout().catch(() => {});
    localStorage.removeItem('token');
    setUser(null);
  };

  const register = async (name: string, email: string, password: string) => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    await authApi.register(name, email, password, timezone);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
