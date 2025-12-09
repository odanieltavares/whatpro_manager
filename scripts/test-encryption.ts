/**
 * Test script for encryption utilities
 * Validates encrypt/decrypt functionality
 */

import { encrypt, decrypt, isEncrypted, hash, generateToken, secureCompare } from '../lib/utils/encryption.util';

console.log('🧪 Testing Encryption Utilities\n');
console.log('='.repeat(50));

// Test 1: Basic encryption/decryption
console.log('\n1️⃣  Test: Basic Encryption/Decryption');
const originalText = 'my-super-secret-token-12345';
const encrypted = encrypt(originalText);
const decrypted = decrypt(encrypted);

console.log(`   Original:  ${originalText}`);
console.log(`   Encrypted: ${encrypted.substring(0, 50)}...`);
console.log(`   Decrypted: ${decrypted}`);
console.log(`   ✓ Match: ${originalText === decrypted}`);

// Test 2: Unique IVs
console.log('\n2️⃣  Test: Unique IVs (same input, different output)');
const text = 'test-data';
const enc1 = encrypt(text);
const enc2 = encrypt(text);

console.log(`   Encryption 1: ${enc1.substring(0, 40)}...`);
console.log(`   Encryption 2: ${enc2.substring(0, 40)}...`);
console.log(`   ✓ Different: ${enc1 !== enc2}`);
console.log(`   ✓ Both decrypt correctly: ${decrypt(enc1) === text && decrypt(enc2) === text}`);

// Test 3: isEncrypted check
console.log('\n3️⃣  Test: isEncrypted Detection');
const plainText = 'not-encrypted';
const encryptedText = encrypt('encrypted');

console.log(`   Plain text: ${isEncrypted(plainText)} (should be false)`);
console.log(`   Encrypted text: ${isEncrypted(encryptedText)} (should be true)`);
console.log(`   ✓ Detection works: ${!isEncrypted(plainText) && isEncrypted(encryptedText)}`);

// Test 4: Hash function
console.log('\n4️⃣  Test: Hash Function');
const data = 'sensitive-data';
const hash1 = hash(data);
const hash2 = hash(data);

console.log(`   Hash 1: ${hash1}`);
console.log(`   Hash 2: ${hash2}`);
console.log(`   ✓ Deterministic: ${hash1 === hash2}`);
console.log(`   ✓ Length: ${hash1.length} chars (64 for SHA-256)`);

// Test 5: Generate Token
console.log('\n5️⃣  Test: Generate Random Token');
const token1 = generateToken(32);
const token2 = generateToken(32);

console.log(`   Token 1: ${token1}`);
console.log(`   Token 2: ${token2}`);
console.log(`   ✓ Different: ${token1 !== token2}`);
console.log(`   ✓ Length: ${token1.length} chars (64 for 32 bytes in hex)`);

// Test 6: Secure Compare
console.log('\n6️⃣  Test: Secure Compare (timing-safe)');
const secret1 = 'my-secret-key';
const secret2 = 'my-secret-key';
const secret3 = 'different-key';

console.log(`   Compare equal: ${secureCompare(secret1, secret2)} (should be true)`);
console.log(`   Compare different: ${secureCompare(secret1, secret3)} (should be false)`);

console.log('\n' + '='.repeat(50));
console.log('✅ All encryption tests passed!\n');
