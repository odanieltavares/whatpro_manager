/**
 * Environment Configuration Service
 * 
 * Centralized, type-safe configuration management
 * Validates required environment variables on startup
 */

import dotenv from 'dotenv';

dotenv.config();

export class ConfigService {
  private env: any;

  constructor() {
    this.loadEnv();
  }

  public get<T = any>(key: string): T {
    return this.env[key] as T;
  }

  private loadEnv(): void {
    const isDevelopment = process.env.NODE_ENV !== 'production';

    this.env = {
      AUTH: {
        JWT_SECRET: process.env.JWT_SECRET || 'dev-jwt-secret-change-in-production',
        JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-production',
        JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
        JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
        API_KEY: {
          GLOBAL: process.env.API_KEY_GLOBAL || 'dev-api-key-insecure-change-in-production',
          EXPOSE_IN_FETCH: process.env.API_KEY_EXPOSE === 'true',
        },
      },
      DATABASE: {
        URL: process.env.DATABASE_URL || '',
        ENCRYPTION_KEY: process.env.DATABASE_ENCRYPTION_KEY || 'dev-encryption-key-do-not-use-in-production-min32chars',
      },
      SECURITY: {
        CORS_ORIGIN: (process.env.CORS_ORIGIN || 'http://localhost:3001,http://localhost:3000')
          .split(',')
          .map((o: string) => o.trim()),
        CORS_METHODS: (process.env.CORS_METHODS || 'GET,POST,PUT,DELETE').split(','),
        CORS_CREDENTIALS: process.env.CORS_CREDENTIALS !== 'false',
        RATE_LIMIT_ENABLED: process.env.RATE_LIMIT_ENABLED !== 'false',
        RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
        RATE_LIMIT_WINDOW: process.env.RATE_LIMIT_WINDOW || '15m',
      },
      REDIS: {
        URL: process.env.REDIS_URL || 'redis://localhost:6379',
      },
      PRODUCTION: !isDevelopment,
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    };

    // Warn in development if using insecure defaults
    if (isDevelopment) {
      if (!process.env.JWT_SECRET) {
        console.warn('⚠️  WARNING: Using insecure default JWT_SECRET in development');
      }
      if (!process.env.API_KEY_GLOBAL) {
        console.warn('⚠️  WARNING: Using insecure default API_KEY_GLOBAL in development');
      }
      if (!process.env.DATABASE_ENCRYPTION_KEY) {
        console.warn('⚠️  WARNING: Using insecure default DATABASE_ENCRYPTION_KEY in development');
        console.warn('   Data encryption will use a weak key. DO NOT use in production!');
      }
    }

    // Validate in production (but skip during build phase)
    const isBuilding = process.env.NEXT_PHASE === 'phase-production-build';
    
    if (!isDevelopment && !isBuilding) {
      if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
        throw new Error('JWT_SECRET must be at least 32 characters in production');
      }
      if (!process.env.DATABASE_ENCRYPTION_KEY || process.env.DATABASE_ENCRYPTION_KEY.length < 32) {
        throw new Error('DATABASE_ENCRYPTION_KEY must be at least 32 characters in production');
      }
      if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL is required');
      }
    }
    
    // Warn during build if production env vars are missing
    if (isBuilding) {
      console.log('📦 Building in production mode - env validation skipped');
      console.log('⚠️  Remember to set proper env vars before deployment!');
    }
  }

  /**
   * Get all environment variables (for debugging)
   * Sensitive values are masked
   */
  public getAll(): Record<string, unknown> {
    return {
      ...this.env,
      AUTH: {
        ...this.env.AUTH,
        JWT_SECRET: this.mask(this.env.AUTH.JWT_SECRET),
        JWT_REFRESH_SECRET: this.mask(this.env.AUTH.JWT_REFRESH_SECRET),
        API_KEY: {
          GLOBAL: this.mask(this.env.AUTH.API_KEY.GLOBAL),
          EXPOSE_IN_FETCH: this.env.AUTH.API_KEY.EXPOSE_IN_FETCH,
        },
      },
      DATABASE: {
        URL: this.maskDatabaseUrl(this.env.DATABASE.URL),
        ENCRYPTION_KEY: this.mask(this.env.DATABASE.ENCRYPTION_KEY),
      },
    };
  }

  private mask(value: string): string {
    if (!value || value.length <= 8) return '***';
    return value.substring(0, 4) + '***' + value.substring(value.length - 4);
  }

  private maskDatabaseUrl(url: string): string {
    try {
      const parsed = new URL(url);
      if (parsed.password) {
        parsed.password = '***';
      }
      return parsed.toString();
    } catch {
      return '***';
    }
  }
}

// Singleton instance
export const configService = new ConfigService();
