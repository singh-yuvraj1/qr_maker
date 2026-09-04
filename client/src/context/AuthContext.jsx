import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

const TOKEN_KEY = 'qrspark_token';
const USER_KEY = 'qrspark_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Loading until hydrated

  // ─── Hydrate from localStorage on mount ────────────────────────────────
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  // ─── Persist auth state ────────────────────────────────────────────────
  const persistAuth = (tokenValue, userValue) => {
    localStorage.setItem(TOKEN_KEY, tokenValue);
    localStorage.setItem(USER_KEY, JSON.stringify(userValue));
    setToken(tokenValue);
    setUser(userValue);
  };

  // ─── Register ──────────────────────────────────────────────────────────
  const register = useCallback(async ({ name, email, password }) => {
    const data = await authService.register({ name, email, password });
    persistAuth(data.token, data.user);
    return data;
  }, []);

  // ─── Login ─────────────────────────────────────────────────────────────
  const login = useCallback(async ({ email, password }) => {
    const data = await authService.login({ email, password });
    persistAuth(data.token, data.user);
    return data;
  }, []);

  // ─── Logout ────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const isAuthenticated = Boolean(token && user);

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated, isLoading, register, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
