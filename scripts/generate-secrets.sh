#!/bin/bash

# WhatPro Manager - Secure Secrets Generator
# Generates cryptographically secure secrets for production use

set -e

echo "🔐 WhatPro Manager - Secure Secrets Generator"
echo "=============================================="
echo ""

# Check if openssl is available
if ! command -v openssl &> /dev/null; then
    echo "❌ Error: openssl is not installed"
    echo "   Please install openssl first"
    exit 1
fi

# Create secrets file
SECRETS_FILE=".env.secrets"
echo "# Generated Secrets - $(date)" > "$SECRETS_FILE"
echo "# ⚠️  IMPORTANT: Copy these to your .env file, then DELETE this file!" >> "$SECRETS_FILE"
echo "# Never commit this file to Git!" >> "$SECRETS_FILE"
echo "" >> "$SECRETS_FILE"

# Generate JWT secrets (48 bytes = 384 bits)
echo "Generating JWT secrets..."
JWT_SECRET=$(openssl rand -base64 48)
JWT_REFRESH_SECRET=$(openssl rand -base64 48)

echo "JWT_SECRET=\"$JWT_SECRET\"" >> "$SECRETS_FILE"
echo "JWT_REFRESH_SECRET=\"$JWT_REFRESH_SECRET\"" >> "$SECRETS_FILE"
echo "JWT_EXPIRES_IN=\"15m\"" >> "$SECRETS_FILE"
echo "JWT_REFRESH_EXPIRES_IN=\"7d\"" >> "$SECRETS_FILE"
echo "" >> "$SECRETS_FILE"

# Generate API key (32 bytes = 256 bits)
echo "Generating API key..."
API_KEY=$(openssl rand -hex 32)

echo "API_KEY_GLOBAL=\"$API_KEY\"" >> "$SECRETS_FILE"
echo "API_KEY_EXPOSE=\"false\"" >> "$SECRETS_FILE"
echo "" >> "$SECRETS_FILE"

# Generate encryption key (48 bytes = 384 bits)
echo "Generating database encryption key..."
ENCRYPTION_KEY=$(openssl rand -base64 48)

echo "DATABASE_ENCRYPTION_KEY=\"$ENCRYPTION_KEY\"" >> "$SECRETS_FILE"
echo "" >> "$SECRETS_FILE"

# Add other required env vars
echo "# Other required environment variables" >> "$SECRETS_FILE"
echo "DATABASE_URL=\"postgresql://whatpro:password@localhost:5432/whatpro\"" >> "$SECRETS_FILE"
echo "REDIS_URL=\"redis://localhost:6379\"" >> "$SECRETS_FILE"
echo "NEXT_PUBLIC_API_URL=\"http://localhost:3001\"" >> "$SECRETS_FILE"
echo "" >> "$SECRETS_FILE"

echo "# Security settings" >> "$SECRETS_FILE"
echo "CORS_ORIGIN=\"http://localhost:3001,http://localhost:3000\"" >> "$SECRETS_FILE"
echo "CORS_METHODS=\"GET,POST,PUT,DELETE\"" >> "$SECRETS_FILE"
echo "CORS_CREDENTIALS=\"true\"" >> "$SECRETS_FILE"
echo "RATE_LIMIT_ENABLED=\"true\"" >> "$SECRETS_FILE"
echo "RATE_LIMIT_MAX=\"100\"" >> "$SECRETS_FILE"
echo "RATE_LIMIT_WINDOW=\"15m\"" >> "$SECRETS_FILE"
echo "" >> "$SECRETS_FILE"

echo "NODE_ENV=\"development\"" >> "$SECRETS_FILE"

echo ""
echo "✅ Secrets generated successfully!"
echo ""
echo "📝 Next steps:"
echo "   1. Review the generated secrets in: $SECRETS_FILE"
echo "   2. Copy the contents to your .env file"
echo "   3. DELETE $SECRETS_FILE (important!)"
echo "   4. Ensure .env is in your .gitignore"
echo ""
echo "⚠️  Security reminders:"
echo "   - Never commit .env or .env.secrets to Git"
echo "   - Use different secrets for each environment"
echo "   - Store production secrets in a secure vault"
echo "   - Rotate secrets regularly"
echo ""
