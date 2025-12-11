#!/bin/bash

# Verifica se cloudflared está instalado
if ! command -v cloudflared &> /dev/null; then
    echo "❌ Erro: 'cloudflared' não encontrado."
    echo "📝 Instale com: brew install cloudflared (Mac) ou veja docs/CLOUDFLARE_MIGRATION_GUIDE.md"
    exit 1
fi

echo "🚀 Iniciando Cloudflare Quick Tunnel para http://localhost:3001..."
echo "⚠️  Copie a URL que aparecerá abaixo (ex: https://crazy-name.trycloudflare.com)"
echo "----------------------------------------------------------------"

# Inicia o túnel apontando para a porta 3001 (Whatpro Manager)
cloudflared tunnel --url http://localhost:3001
