#!/bin/bash
# WhatPro Manager - Setup (Prisma + Docker)

set -e

echo "🚀 WhatPro Manager - Setup"
echo "=========================="
echo ""

# Load env vars if .env exists
if [ -f ".env" ]; then
  echo "🔐 Carregando variáveis de ambiente de .env"
  set -a
  source .env
  set +a
fi

if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL não definido. Configure em .env antes de rodar o setup."
  exit 1
fi

# 1. Parar servidor local na porta 3001
echo "1️⃣ Parando servidor local na porta 3001 (se houver)..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
sleep 1

# 2. Limpar caches
echo "2️⃣ Limpando caches (.next, node_modules/.cache)..."
rm -rf .next node_modules/.cache

# 3. Reiniciar containers
echo "3️⃣ Reiniciando Docker (Postgres/Redis)..."
docker-compose down -v
sleep 2
docker-compose up -d
echo "⏳ Aguardando containers subirem..."
sleep 10

# 4. Aplicar migrações Prisma
echo "4️⃣ Aplicando migrações Prisma..."
npx prisma migrate deploy

# 5. Gerar client Prisma (garantia)
echo "5️⃣ Gerando client Prisma..."
npx prisma generate

echo ""
echo "✅ SETUP COMPLETO!"
echo "Próximos passos:"
echo "  - npm run dev"
echo "  - curl -X POST http://localhost:3001/api/sync-raw  # opcional, para sincronizar instâncias"
