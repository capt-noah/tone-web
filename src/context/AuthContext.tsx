'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '@/types';
import { api } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  sessionId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isMounted: boolean;
  login: (username: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, password?: string, telegramId?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateAvatar: (base64Photo: string) => Promise<boolean>;
  updateEmail: (email: string | null) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'tone_web_user';
const SESSION_STORAGE_KEY = 'tone_web_session_id';
const LEGACY_USER_STORAGE_KEY = 'musicly_web_user';
const LEGACY_SESSION_STORAGE_KEY = 'musicly_web_session_id';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  const validateSession = useCallback(async (token: string) => {
    try {
      const userData = await api.getMe(token);
      setUser(userData);
      setIsAuthenticated(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      }
    } catch (err: unknown) {
      console.warn('[AuthContext] Session validation failed:', err);
      const apiErr = err as { status?: number; message?: string };
      const isAuthError =
        apiErr?.status === 401 ||
        apiErr?.status === 403 ||
        apiErr?.message?.includes('401') ||
        apiErr?.message?.includes('403');

      // Only invalidate session if the server explicitly rejected the token
      if (isAuthError) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(USER_STORAGE_KEY);
          localStorage.removeItem(SESSION_STORAGE_KEY);
        }
        setUser(null);
        setSessionId(null);
        setIsAuthenticated(false);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);
    try {
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem(USER_STORAGE_KEY) || localStorage.getItem(LEGACY_USER_STORAGE_KEY);
        const storedToken = localStorage.getItem(SESSION_STORAGE_KEY) || localStorage.getItem(LEGACY_SESSION_STORAGE_KEY);

        if (storedToken) {
          setSessionId(storedToken);
          setIsAuthenticated(true);
          if (storedUser) {
            try {
              setUser(JSON.parse(storedUser));
            } catch {
              // ignore json parse
            }
          }
          setIsLoading(false);
          validateSession(storedToken);
        } else {
          setIsLoading(false);
        }
      }
    } catch (err) {
      console.error('[AuthContext] Error loading stored auth:', err);
      setIsLoading(false);
    }
  }, [validateSession]);

  const login = async (username: string, password?: string) => {
    try {
      const res = await api.login({ username, password });
      if (res.sessionId && res.user) {
        setUser(res.user);
        setSessionId(res.sessionId);
        setIsAuthenticated(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.user));
          localStorage.setItem(SESSION_STORAGE_KEY, res.sessionId);
        }
        return { success: true };
      }
      return { success: false, error: 'Invalid response from server' };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      return { success: false, error: msg };
    }
  };

  const register = async (username: string, password?: string, telegramId?: string) => {
    try {
      const res = await api.register({ username, password, telegramId });
      if (res.sessionId && res.user) {
        setUser(res.user);
        setSessionId(res.sessionId);
        setIsAuthenticated(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.user));
          localStorage.setItem(SESSION_STORAGE_KEY, res.sessionId);
        }
        return { success: true };
      }
      return { success: false, error: 'Registration failed' };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      return { success: false, error: msg };
    }
  };

  const logout = async () => {
    if (sessionId) {
      await api.logout(sessionId).catch(() => {});
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
    setUser(null);
    setSessionId(null);
    setIsAuthenticated(false);
  };

  const updateAvatar = async (base64Photo: string): Promise<boolean> => {
    if (!sessionId) return false;
    try {
      const res = await api.updateProfilePhoto(sessionId, base64Photo);
      if (res.user) {
        setUser(res.user);
        if (typeof window !== 'undefined') {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.user));
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error('[AuthContext] Failed to update avatar:', err);
      return false;
    }
  };

  const updateEmail = async (email: string | null): Promise<{ success: boolean; error?: string }> => {
    if (!sessionId) return { success: false, error: 'Not authenticated' };
    try {
      const res = await api.updateEmail(sessionId, email);
      if (res.user) {
        setUser(res.user);
        if (typeof window !== 'undefined') {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.user));
        }
        return { success: true };
      }
      return { success: false, error: 'Failed to update email' };
    } catch (err: any) {
      console.error('[AuthContext] Failed to update email:', err);
      return { success: false, error: err?.message || 'Failed to update email' };
    }
  };

  const refreshUser = async () => {
    if (sessionId) {
      await validateSession(sessionId);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        sessionId,
        isAuthenticated,
        isLoading,
        isMounted,
        login,
        register,
        logout,
        updateAvatar,
        updateEmail,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
