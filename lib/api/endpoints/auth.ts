/**
 * Authentication API Endpoints
 */

import { api } from '../client';
import type { LoginRequest, AuthResponse, RefreshTokenRequest, User } from '../types/auth.types';

export const authApi = {
  /**
   * Login with email and password
   */
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', credentials);
    return data;
  },

  /**
   * Logout current user
   */
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  /**
   * Refresh access token
   */
  refresh: async (payload: RefreshTokenRequest): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/refresh', payload);
    return data;
  },

  /**
   * Get current user info
   */
  me: async (): Promise<User> => {
    const { data } = await api.get<{ user: User }>('/auth/me');
    return data.user;
  },
};
