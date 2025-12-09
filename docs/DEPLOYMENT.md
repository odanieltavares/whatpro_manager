# 🚀 Deployment Guide - Critical Security Fixes

## ✅ What's Ready

All critical security vulnerabilities have been fixed and tested:

- ✅ ConfigService with environment validation
- ✅ AES-256-GCM encryption for sensitive data
- ✅ Secure JWT implementation
- ✅ Database-driven provider configuration
- ✅ All hardcoded credentials removed
- ✅ Legacy insecure code removed

## 📋 Deployment Steps

### Step 1: Generate Production Secrets

```bash
cd /Users/playsuporte/Documents/DEV-WHATPRO/ParoquiaDev/whatpro_manager

# Generate cryptographically secure secrets
./scripts/generate-secrets.sh
```

This creates `.env.secrets` with:
- JWT_SECRET (384 bits)
- JWT_REFRESH_SECRET (384 bits)  
- API_KEY_GLOBAL (256 bits)
- DATABASE_ENCRYPTION_KEY (384 bits)

### Step 2: Configure Environment

```bash
# Copy secrets to .env
cat .env.secrets >> .env

# Edit .env and update DATABASE_URL
nano .env

# Update this line with your actual database credentials:
# DATABASE_URL="postgresql://user:password@host:port/database"

# Delete secrets file for security
rm .env.secrets
```

### Step 3: Seed Provider Configurations

```bash
# Run interactive seed script
npx tsx scripts/seed-providers.ts
```

You'll be prompted for:
1. UAZ API Base URL (default: https://whatpro.uazapi.com)
2. UAZ API Admin Token
3. Evolution API Base URL (default: https://evo.whatpro.com.br)
4. Evolution API Admin Token

**Note**: Tokens will be encrypted before storing in database.

### Step 4: Migrate Existing Data (Optional)

**Only run if you have existing instances/integrations:**

```bash
# Backup database first!
pg_dump -U whatpro whatpro > backup_before_encryption.sql

# Run migration
npx tsx scripts/migrate-encryption.ts
```

This encrypts:
- Provider admin tokens
- Instance API tokens
- Chatwoot integration tokens
- Legacy chatwoot config tokens

### Step 5: Start Application

```bash
npm run dev
```

**Expected output:**
```
✓ ConfigService initialized
✓ All environment variables validated
✓ Encryption key loaded
✓ Ready on http://localhost:3001
```

## 🧪 Verification

### Test 1: Environment Validation

```bash
# Should fail with helpful error
JWT_SECRET="" npm run dev

# Expected: ❌ JWT_SECRET must be at least 32 characters long.
```

### Test 2: Encryption

```bash
npx tsx scripts/test-encryption.ts
# Expected: ✅ All encryption tests passed!
```

### Test 3: Configuration

```bash
npx tsx scripts/test-config.ts
# Expected: ✅ All ConfigService tests passed!
```

### Test 4: No Hardcoded Credentials

```bash
grep -r "8HYPx5hJLuNWHW8FC5QKhbCAYRTskPc36KDF5Fvugkn6QmVG9H" lib/ app/
# Expected: No results
```

## ⚠️ Critical Warnings

### 1. DATABASE_ENCRYPTION_KEY

**NEVER LOSE THIS KEY!**

- Without it, encrypted data cannot be decrypted
- Store securely in:
  - AWS Secrets Manager
  - HashiCorp Vault
  - 1Password / LastPass (for small teams)
  - Encrypted backup in multiple locations

### 2. Different Secrets Per Environment

```bash
# Development
JWT_SECRET="dev-secret-..."

# Staging  
JWT_SECRET="staging-secret-..."

# Production
JWT_SECRET="prod-secret-..."
```

### 3. Never Commit Secrets

Verify `.env` is in `.gitignore`:

```bash
git check-ignore .env
# Should output: .env
```

### 4. Rotate Secrets Regularly

- After team member leaves
- Every 90 days minimum
- Immediately if compromised

## 🔄 Migration Rollback (Emergency)

If encryption migration fails:

```bash
# Restore database backup
psql -U whatpro whatpro < backup_before_encryption.sql

# Remove encryption key from .env
# Comment out: DATABASE_ENCRYPTION_KEY=...

# Restart application with old code
git checkout <previous-commit>
npm run dev
```

## 📊 Production Checklist

- [ ] Generated unique production secrets
- [ ] DATABASE_ENCRYPTION_KEY backed up securely
- [ ] .env file not committed to Git
- [ ] Provider configurations seeded
- [ ] Existing data migrated (if applicable)
- [ ] All tests passing
- [ ] Environment validation working
- [ ] Different secrets for staging/production
- [ ] Team has access to secret vault
- [ ] Monitoring/alerting configured

## 🆘 Troubleshooting

### Error: "Missing required environment variable"

**Solution**: Run `./scripts/generate-secrets.sh` and copy to `.env`

### Error: "Failed to decrypt data"

**Possible causes**:
1. DATABASE_ENCRYPTION_KEY changed
2. Data corrupted
3. Migration not run

**Solution**: Restore from backup or check encryption key

### Error: "Provider not found in database"

**Solution**: Run `npx tsx scripts/seed-providers.ts`

### Error: "Invalid credentials" (login)

**Solution**: Check JWT_SECRET hasn't changed. If it has, users need to re-login.

## 📞 Support

For issues:
1. Check logs: `npm run dev` output
2. Verify `.env` has all required variables
3. Test encryption: `npx tsx scripts/test-encryption.ts`
4. Check database connection

## 🎉 Success Criteria

Application is successfully deployed when:

✅ Starts without environment variable errors  
✅ Login works and returns JWT tokens  
✅ Provider connections work  
✅ No hardcoded credentials in logs  
✅ Encryption/decryption working  
✅ All tests passing
