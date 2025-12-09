/**
 * Auth Context
 * 
 * Manages authentication state using new API structure
 * NO localStorage - tokens managed in-memory via lib/api/client
 */

'use client';

import { createContext, useCallback, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/endpoints/auth';
import { setTokens, clearTokens, isAuthenticated as checkAuth } from '@/lib/api/client';
import type { User } from '@/lib/api/types/auth.types';

export interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user;

  // Check authentication on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      if (checkAuth()) {
        try {
          const userData = await authApi.me();
          setUser(userData);
        } catch (error) {
          console.error('Failed to fetch user:', error);
          clearTokens();
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const { user: userData, accessToken, refreshToken } = await authApi.login({ email, password });

      setTokens(accessToken, refreshToken);
      setUser(userData);
      
      // Redirect to dashboard
      router.push('/');
    },
    [router]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      clearTokens();
      setUser(null);
      router.push('/login');
    }
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
