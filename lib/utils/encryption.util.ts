/**
 * Encryption Utilities
 * 
 * AES-256-GCM encryption for sensitive database fields
 * Provides authenticated encryption with additional data (AEAD)
 */

import crypto from 'crypto';
import { configService } from '@/lib/config/env.config';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128 bits
const SALT = 'whatpro-encryption-salt-v1'; // Static salt for key derivation

/**
 * Encrypt sensitive data using AES-256-GCM
 * 
 * @param text - Plain text to encrypt
 * @returns Encrypted string in format: iv:authTag:encrypted
 */
export function encrypt(text: string): string {
  if (!text) return text;
  
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Format: iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('[Encryption] Encryption failed:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt sensitive data encrypted with AES-256-GCM
 * 
 * @param encryptedText - Encrypted string in format: iv:authTag:encrypted
 * @returns Decrypted plain text
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText) return encryptedText;
  
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
      // If not in encrypted format, assume it's plain text (for backwards compatibility)
      // This allows gradual migration
      console.warn('[Encryption] Data not in encrypted format, returning as-is');
      return encryptedText;
    }
    
    const [ivHex, authTagHex, encrypted] = parts;
    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('[Encryption] Decryption failed:', error);
    throw new Error('Failed to decrypt data - data may be corrupted or key may have changed');
  }
}

/**
 * Check if a string is encrypted (has the expected format)
 * 
 * @param text - Text to check
 * @returns true if text appears to be encrypted
 */
export function isEncrypted(text: string): boolean {
  if (!text) return false;
  const parts = text.split(':');
  return parts.length === 3 && parts.every(part => /^[0-9a-f]+$/i.test(part));
}

/**
 * Get encryption key from environment
 * Derives a 32-byte key using scrypt
 */
function getEncryptionKey(): Buffer {
  const dbConfig = configService.get<{ ENCRYPTION_KEY: string }>('DATABASE');
  const keyString = dbConfig.ENCRYPTION_KEY;
  
  // Derive 32-byte key from environment variable using scrypt
  // scrypt is a password-based key derivation function designed to be expensive
  return crypto.scryptSync(keyString, SALT, 32);
}

/**
 * Hash sensitive data (one-way)
 * Useful for data that needs to be compared but not decrypted
 * 
 * @param text - Text to hash
 * @returns SHA-256 hash in hex format
 */
export function hash(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex');
}

/**
 * Generate a cryptographically secure random token
 * 
 * @param length - Length in bytes (default 32)
 * @returns Random token in hex format
 */
export function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Constant-time string comparison to prevent timing attacks
 * 
 * @param a - First string
 * @param b - Second string
 * @returns true if strings are equal
 */
export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  
  return crypto.timingSafeEqual(bufA, bufB);
}
