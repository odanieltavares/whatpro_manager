# Environment Variables Setup Guide

## Required Environment Variables

The following environment variables MUST be set for the application to start:

### Authentication

```bash
# JWT Secrets (minimum 32 characters each)
JWT_SECRET="your-256-bit-secret-here"
JWT_REFRESH_SECRET="your-refresh-secret-here"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# API Key (minimum 32 characters)
API_KEY_GLOBAL="your-global-api-key-here"
API_KEY_EXPOSE="false"
```

### Database

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/whatpro"
DATABASE_ENCRYPTION_KEY="your-encryption-key-here-minimum-32-chars"
```

### Redis

```bash
REDIS_URL="redis://localhost:6379"
```

## Optional Environment Variables

These have sensible defaults but can be customized:

```bash
# API URL
NEXT_PUBLIC_API_URL="http://localhost:3001"

# Security
CORS_ORIGIN="http://localhost:3001,http://localhost:3000"
CORS_METHODS="GET,POST,PUT,DELETE"
CORS_CREDENTIALS="true"

# Rate Limiting
RATE_LIMIT_ENABLED="true"
RATE_LIMIT_MAX="100"
RATE_LIMIT_WINDOW="15m"

# Environment
NODE_ENV="development"
```

## Quick Start

1. **Generate Secrets**:
   ```bash
   ./scripts/generate-secrets.sh
   ```

2. **Copy to .env**:
   ```bash
   cp .env.secrets .env
   # Then edit .env with your database credentials
   ```

3. **Delete Secrets File**:
   ```bash
   rm .env.secrets
   ```

4. **Start Application**:
   ```bash
   npm run dev
   ```

## Security Notes

- ⚠️ Never commit `.env` or `.env.secrets` to Git
- 🔒 Use different secrets for each environment
- 🔐 Store production secrets in a secure vault (AWS Secrets Manager, etc.)
- 🔄 Rotate secrets regularly
- 📝 Keep a secure backup of your `DATABASE_ENCRYPTION_KEY`

## Validation

The application will validate all required variables on startup and provide helpful error messages if any are missing or invalid.
