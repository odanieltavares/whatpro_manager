/**
 * API Client Configuration
 * 
 * Axios instance with interceptors for auth and error handling.
 * NO localStorage - tokens managed in memory only.
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { env } from '@/lib/config/env';

// Token storage (in-memory only, NOT localStorage)
let accessToken: string | null = null;
let refreshToken: string | null = null;

// Create Axios instance
const api: AxiosInstance = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15s timeout
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle 401 and refresh token
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest?._retry && refreshToken) {
      originalRequest._retry = true;

      try {
        // Attempt token refresh
        const { data } = await axios.post<{ accessToken: string; refreshToken: string }>(
          `${env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          { refreshToken }
        );

        // Update tokens
        accessToken = data.accessToken;
        refreshToken = data.refreshToken;

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear tokens and redirect to login
        accessToken = null;
        refreshToken = null;
        
        // Only redirect if in browser
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Set authentication tokens
 * Called after successful login
 */
export const setTokens = (access: string, refresh: string): void => {
  accessToken = access;
  refreshToken = refresh;
};

/**
 * Clear authentication tokens
 * Called on logout
 */
export const clearTokens = (): void => {
  accessToken = null;
  refreshToken = null;
};

/**
 * Get current access token
 * For debugging purposes
 */
export const getAccessToken = (): string | null => accessToken;

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => !!accessToken;

export { api };
