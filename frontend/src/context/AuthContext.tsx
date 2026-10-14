import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api, clearToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  login: (biDanh: string, pass: string) => Promise<void>;
  register: (biDanh: string, pass: string) => Promise<string>;
  switchDemoUser: (biDanh: string) => Promise<void>;
  logout: () => void;
  updateUserStreak: (streak: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Auto-login with default demo account if no user is logged in
  useEffect(() => {
    async function initAuth() {
      try {
        const storedTheme = (localStorage.getItem('bookaholic_theme') as 'dark' | 'light') || 'dark';
        setTheme(storedTheme);
        document.documentElement.setAttribute('data-theme', storedTheme);

        // Try login with default demo user: sach_va_tra
        const res = await api.login('sach_va_tra', 'Bookaholic@2026!');
        setUser(res.user);
      } catch (err) {
        console.warn('[Auth] Auto-login with default user failed:', err);
      } finally {
        setLoading(false);
      }
    }
    initAuth();
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('bookaholic_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const login = async (biDanh: string, pass: string) => {
    const res = await api.login(biDanh, pass);
    setUser(res.user);
  };

  const register = async (biDanh: string, pass: string) => {
    const res = await api.register(biDanh, pass);
    setUser(res.user);
    return res.recoveryKey;
  };

  const switchDemoUser = async (biDanh: string) => {
    setLoading(true);
    try {
      const res = await api.login(biDanh, 'Bookaholic@2026!');
      setUser(res.user);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  const updateUserStreak = (streak: number) => {
    setUser((prev) => (prev ? { ...prev, currentStreak: streak } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        theme,
        toggleTheme,
        login,
        register,
        switchDemoUser,
        logout,
        updateUserStreak,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
