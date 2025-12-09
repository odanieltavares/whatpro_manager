/**
 * Authentication Types
 */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  tenantId: string;
  tenant: {
    id: string;
    name: string;
    slug: string;
  };
  role: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}
