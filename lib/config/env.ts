/**
 * Environment Variables Configuration
 * 
 * Validates and exports environment variables with type safety.
 * Fails at build time if required variables are missing.
 */

import { z } from 'zod';

// Schema de validação
const envSchema = z.object({
  // Public variables (accessible in browser)
  NEXT_PUBLIC_API_URL: z.string().min(1, 'NEXT_PUBLIC_API_URL is required'),
  
  // Server-only variables (not exposed to browser)
  DATABASE_URL: z.string().optional(),
  REDIS_URL: z.string().optional(),
  NEXTAUTH_SECRET: z.string().optional(),
  NEXTAUTH_URL: z.string().optional(),
});

// Parse and validate
const parsed = envSchema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  DATABASE_URL: process.env.DATABASE_URL,
  REDIS_URL: process.env.REDIS_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
});

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables');
}

export const env = parsed.data;

// Helper to get API URL
export const getApiUrl = () => env.NEXT_PUBLIC_API_URL;
