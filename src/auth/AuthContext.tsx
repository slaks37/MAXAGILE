/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppUser } from '../types';

interface AuthContextType {
  user: AppUser | null;
  users: AppUser[];
  loading: boolean;
  needsSetup: boolean;
  login: (username: string, password: string) => Promise<string | null>;
  register: (username: string, name: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
  refreshUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  users: [],
  loading: true,
  needsSetup: false,
  login: async () => 'not ready',
  register: async () => 'not ready',
  logout: async () => {},
  refreshUsers: async () => {},
});

async function readError(res: any, fallback: string): Promise<string> {
  try {
    const data = await res.json();
    if (data && typeof data.error === 'string' && data.error.trim()) return data.error;
  } catch (e) {
    // ignore — non-JSON body
  }
  return fallback;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);

  const refreshUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/users', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      // offline / server down — keep whatever we already have
    }
  }, []);

  // Restore the session on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (cancelled) return;
        if (res.ok) {
          const data = await res.json();
          if (cancelled) return;
          setNeedsSetup(!!(data && data.needsSetup));
          setUser(data && data.user ? data.user : null);
        } else {
          setUser(null);
          setNeedsSetup(false);
        }
      } catch (e) {
        if (!cancelled) {
          setUser(null);
          setNeedsSetup(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Keep the member list fresh once we know who is signed in.
  useEffect(() => {
    if (user) refreshUsers();
  }, [user, refreshUsers]);

  const login = useCallback(async (username: string, password: string): Promise<string | null> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        return await readError(res, 'Nama pengguna atau kata sandi salah.');
      }
      const data = await res.json();
      setUser(data && data.user ? data.user : null);
      setNeedsSetup(false);
      return null;
    } catch (e) {
      return 'Tidak bisa menghubungi server. Coba lagi sebentar lagi.';
    }
  }, []);

  const register = useCallback(async (username: string, name: string, password: string): Promise<string | null> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, name, password }),
      });
      if (!res.ok) {
        return await readError(res, 'Akun tidak bisa dibuat. Coba nama pengguna yang lain.');
      }
      const data = await res.json();
      setUser(data && data.user ? data.user : null);
      setNeedsSetup(false);
      return null;
    } catch (e) {
      return 'Tidak bisa menghubungi server. Coba lagi sebentar lagi.';
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (e) {
      // even if the call fails, drop the local session
    }
    setUser(null);
    setUsers([]);
    setNeedsSetup(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, users, loading, needsSetup, login, register, logout, refreshUsers }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
