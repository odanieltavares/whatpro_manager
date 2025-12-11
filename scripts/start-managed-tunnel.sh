#!/bin/bash

TOKEN="eyJhIjoiMDY1NjVkYzU1MzVkOGE2ZmQ3ZWEyNzk4YzI4MDIxNWYiLCJ0IjoiNjExNDQzOGYtODZjNi00Nzc2LWE0YjYtNjQ3YmFjNTg2ZTQyIiwicyI6IlpXWTRNRFprT1dNdFlqYzJOUzAwTWpZekxXSXdNVFF0T0RNeE16TTRZemxpTWpFMCJ9"

echo "🚀 Iniciando Cloudflare Tunnel Gerenciado..."
echo "🔗 Seus serviços estarão acessíveis nas URLs configuradas no Painel Cloudflare."
echo "----------------------------------------------------------------"

# Executa o túnel com o token.
# Se falhar porque já tem serviço rodando, mata o anterior.
pkill -f cloudflared || true

cloudflared tunnel run --token $TOKEN
