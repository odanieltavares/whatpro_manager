import jwt from 'jsonwebtoken';
import { configService } from '@/lib/config/env.config';

// Get configuration from ConfigService (validated at startup)
const authConfig = configService.get('AUTH');

export interface JWTPayload {
  userId: string;
  email: string;
  tenantId: string;
  role: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Generate access and refresh tokens
 */
export function generateTokens(payload: JWTPayload): TokenPair {
  const accessToken = jwt.sign(
    payload,
    authConfig.JWT_SECRET,
    { expiresIn: authConfig.JWT_EXPIRES_IN } as jwt.SignOptions
  );

  const refreshToken = jwt.sign(
    { userId: payload.userId },
    authConfig.JWT_REFRESH_SECRET,
    { expiresIn: authConfig.JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions
  );

  return { accessToken, refreshToken };
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): JWTPayload | null {  try {
    const payload = jwt.verify(token, authConfig.JWT_SECRET) as JWTPayload;
    return payload;
  } catch {
    return null;
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): { userId: string } | null {
  try {
    const payload = jwt.verify(token, authConfig.JWT_REFRESH_SECRET) as { userId: string };
    return payload;
  } catch {
    return null;
  }
}

/**
 * Decode token without verification (useful for debugging)
 */
export function decodeToken(token: string): jwt.JwtPayload | string | null {
  try {
    return jwt.decode(token);
  } catch {
    return null;
  }
}
