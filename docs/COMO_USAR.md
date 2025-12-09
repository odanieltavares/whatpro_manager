# WhatPro Manager - Guia de Uso Diário

## 🚀 Iniciando a Aplicação

### 1. Iniciar Docker Desktop
```bash
# Abra o aplicativo Docker Desktop
# Aguarde até o ícone ficar verde (Docker rodando)
```

### 2. Iniciar Banco de Dados
```bash
cd /Users/playsuporte/Documents/DEV-WHATPRO/ParoquiaDev/whatpro_manager
docker-compose up -d
```

**Saída esperada:**
```
✅ Container whatpro_postgres  Started
✅ Container whatpro_redis     Started
```

### 3. Iniciar Servidor de Desenvolvimento
```bash
npm run dev
```

**Saída esperada:**
```
▲ Next.js 16.0.6
- Local:        http://localhost:3001
✓ Ready in 2.3s
```

### 4. Acessar Aplicação
Abra no navegador: **http://localhost:3001**

---

## 🔄 Sincronizando Instâncias

### Quando Sincronizar?
- Após criar novas instâncias nos providers (Evolution/Uazapi)
- Quando instâncias não aparecem na lista
- Periodicamente para manter dados atualizados

### Como Sincronizar
```bash
npm run sync
```

**O que acontece:**
- Busca todas as instâncias da Evolution API
- Busca todas as instâncias da Uazapi
- Atualiza banco de dados local
- Mostra resumo: quantas criadas/atualizadas/removidas

**Exemplo de saída:**
```
✅ Sync completed!
  - Synced: 3 instances
  - Created: 0
  - Updated: 3
  - Removed: 0
```

---

## 🔑 Atualizando Tokens dos Providers

### Quando Atualizar?
- Erro "Unauthorized" ao sincronizar
- Tokens expirados ou alterados
- Após recriar providers

### Como Atualizar
```bash
npm run update-tokens
```

**O script vai pedir:**
1. **Token da Evolution API** (apikey)
2. **Token da Uazapi** (admin token)

**Onde encontrar os tokens:**

#### Evolution API
- Acesse: https://evo.whatpro.com.br
- Vá em: Settings → API Keys
- Copie: Global API Key

#### Uazapi
- Acesse: https://whatpro.uazapi.com
- Vá em: Configurações → API
- Copie: Admin Token

**Exemplo de uso:**
```bash
$ npm run update-tokens

Evolution API Token (apikey): WHATPROB6D711FCD936544120E713976V2
✅ Evolution token updated

Uazapi Admin Token: 8HYPx5hJLuNWHW8FC5QKhbCAYRTskPc36KDF5Fvugkn6QmVG9H
✅ Uazapi token updated

✅ Tokens updated successfully!
```

---

## 🛑 Parando a Aplicação

### 1. Parar Servidor de Desenvolvimento
No terminal onde está rodando `npm run dev`:
```bash
# Pressione Ctrl + C
```

### 2. Parar Banco de Dados (Opcional)
```bash
docker-compose down
```

**Nota:** Você pode deixar o Docker rodando se for usar novamente em breve.

### 3. Parar Docker Desktop (Opcional)
```bash
# Feche o aplicativo Docker Desktop
# Ou: Docker Desktop → Quit Docker Desktop
```

---

## 📊 Verificando Status

### Verificar se Servidor Está Rodando
```bash
curl http://localhost:3001/api/instances
```

Se retornar JSON com instâncias = está funcionando ✅

### Verificar Docker
```bash
docker ps
```

Deve mostrar containers `postgres` e `redis` rodando.

### Verificar Logs
```bash
# Logs do Docker
docker-compose logs -f

# Logs do Next.js
# Aparecem no terminal onde rodou npm run dev
```

---

## 🔧 Comandos Úteis

### Reiniciar Servidor Dev
```bash
# Ctrl + C para parar
npm run dev
```

### Limpar Cache do Next.js
```bash
rm -rf .next
npm run dev
```

### Acessar Banco de Dados
```bash
npx prisma studio
```
Abre interface visual em: http://localhost:5555

### Ver Instâncias no Banco
```bash
npx prisma studio
# Clique em "Instance" para ver todas as instâncias
```

---

## ⚠️ Problemas Comuns

### Porta 3001 em Uso
```bash
# Matar processo na porta
npx kill-port 3001

# Ou manualmente
lsof -ti:3001 | xargs kill -9
```

### Docker Não Inicia
```bash
# Verificar se Docker Desktop está aberto
# Reiniciar Docker Desktop
# Verificar se há espaço em disco
```

### Instâncias Não Aparecem
```bash
# 1. Verificar se API funciona
curl http://localhost:3001/api/instances

# 2. Verificar .env.local
cat .env.local | grep NEXT_PUBLIC_API_URL

# 3. Deve ter: NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Erro "Unauthorized" no Sync
```bash
# Atualizar tokens
npm run update-tokens
```

---

## 📱 Acessando de Outros Dispositivos

### Na Mesma Rede
1. Descubra seu IP local:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

2. Acesse de outro dispositivo:
```
http://SEU_IP:3001
```

### Via Túnel (ngrok)
```bash
# Instalar ngrok
brew install ngrok

# Criar túnel
ngrok http 3001
```

Copie a URL fornecida (ex: https://abc123.ngrok.io)

---

## 🎯 Fluxo de Trabalho Diário

### Manhã (Iniciar)
```bash
# 1. Abrir Docker Desktop
# 2. Iniciar containers
docker-compose up -d

# 3. Iniciar servidor
npm run dev

# 4. Abrir navegador
open http://localhost:3001
```

### Durante o Dia
```bash
# Sincronizar quando necessário
npm run sync

# Atualizar tokens se necessário
npm run update-tokens
```

### Noite (Parar)
```bash
# 1. Parar servidor (Ctrl + C)
# 2. Parar Docker (opcional)
docker-compose down
```

---

## 📞 Suporte

**Problemas?** Verifique:
1. Docker Desktop está rodando?
2. Containers estão up? (`docker ps`)
3. Servidor dev está rodando? (veja terminal)
4. `.env.local` está configurado?

**Logs para debug:**
```bash
# Ver logs do Docker
docker-compose logs -f postgres
docker-compose logs -f redis

# Ver logs do Next.js
# Aparecem no terminal do npm run dev
```
