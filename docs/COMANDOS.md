# WhatPro Manager - Referência Rápida de Comandos

## 🚀 Iniciar/Parar

### Desenvolvimento
```bash
# Iniciar Docker
docker-compose up -d

# Iniciar servidor dev
npm run dev

# Parar servidor dev
# Ctrl + C no terminal

# Parar Docker
docker-compose down
```

### Produção
```bash
# Iniciar (PM2)
pm2 start ecosystem.config.js

# Parar
pm2 stop whatpro-manager

# Reiniciar
pm2 restart whatpro-manager

# Ver status
pm2 status

# Ver logs
pm2 logs whatpro-manager
```

---

## 🔄 Sincronização

```bash
# Sincronizar instâncias dos providers
npm run sync

# Atualizar tokens dos providers
npm run update-tokens
```

---

## 🗄️ Banco de Dados

```bash
# Executar migrações
npx prisma migrate dev          # Desenvolvimento
npx prisma migrate deploy       # Produção

# Gerar Prisma Client
npx prisma generate

# Abrir Prisma Studio (interface visual)
npx prisma studio

# Ver status das migrações
npx prisma migrate status

# Resetar banco (CUIDADO: apaga tudo!)
npx prisma migrate reset
```

---

## 🐳 Docker

```bash
# Iniciar containers
docker-compose up -d

# Parar containers
docker-compose down

# Ver containers rodando
docker ps

# Ver logs
docker-compose logs -f
docker-compose logs -f postgres
docker-compose logs -f redis

# Reiniciar container específico
docker-compose restart postgres
docker-compose restart redis

# Remover tudo (CUIDADO: apaga volumes!)
docker-compose down -v
```

---

## 📦 NPM Scripts

```bash
# Desenvolvimento
npm run dev                     # Iniciar servidor dev

# Build
npm run build                   # Build para produção
npm run start                   # Iniciar produção

# Qualidade de Código
npm run lint                    # Rodar ESLint

# Sincronização
npm run sync                    # Sincronizar instâncias
npm run update-tokens           # Atualizar tokens providers
```

---

## 🔧 Utilitários

```bash
# Matar processo em porta específica
npx kill-port 3001

# Limpar cache do Next.js
rm -rf .next

# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install

# Verificar versões
node --version
npm --version
docker --version
```

---

## 🔐 Segurança

```bash
# Gerar secrets fortes
bash scripts/generate-secrets.sh

# Restaurar providers no banco
npx tsx scripts/restore-providers.ts

# Atualizar tokens
npm run update-tokens
```

---

## 📊 Monitoramento

```bash
# Ver logs do servidor dev
# (aparecem no terminal onde rodou npm run dev)

# Ver logs Docker
docker-compose logs -f

# Ver logs PM2 (produção)
pm2 logs whatpro-manager

# Monitorar PM2
pm2 monit

# Ver status PM2
pm2 status

# Ver uso de recursos
docker stats
```

---

## 🌐 Acessar Interfaces

```bash
# Aplicação principal
open http://localhost:3001

# Prisma Studio (banco de dados)
npx prisma studio
# Abre em: http://localhost:5555

# PgAdmin (PostgreSQL)
open http://localhost:5050
# Email: whatpro.adm@gmail.com
# Senha: mysbvflnyfxohide

# Redis Commander
open http://localhost:8081
```

---

## 🧪 Testes e Debug

```bash
# Testar API
curl http://localhost:3001/api/instances

# Testar conexão com banco
psql -U whatpro -h localhost -d whatpro

# Testar conexão com Redis
redis-cli ping

# Ver variáveis de ambiente
cat .env.local

# Verificar se porta está em uso
lsof -i:3001
```

---

## 📝 Git

```bash
# Status
git status

# Adicionar mudanças
git add .

# Commit
git commit -m "Descrição das mudanças"

# Push
git push origin main

# Pull (atualizar)
git pull origin main

# Ver histórico
git log --oneline
```

---

## 🔄 Atualização

```bash
# Desenvolvimento
git pull origin main
npm install
npx prisma migrate dev
npm run dev

# Produção
git pull origin main
npm ci --production=false
npx prisma migrate deploy
npm run build
pm2 restart whatpro-manager
```

---

## 💾 Backup

```bash
# Backup manual do banco
pg_dump -U whatpro whatpro > backup_$(date +%Y%m%d).sql

# Restaurar backup
psql -U whatpro whatpro < backup_20231209.sql

# Backup com compressão
pg_dump -U whatpro whatpro | gzip > backup_$(date +%Y%m%d).sql.gz

# Restaurar backup comprimido
gunzip < backup_20231209.sql.gz | psql -U whatpro whatpro
```

---

## 🆘 Troubleshooting

```bash
# Porta em uso
npx kill-port 3001
lsof -ti:3001 | xargs kill -9

# Docker não inicia
docker-compose down
docker-compose up -d

# Prisma Client desatualizado
npx prisma generate

# Limpar tudo e recomeçar
docker-compose down -v
rm -rf .next node_modules
npm install
docker-compose up -d
npx prisma migrate dev
npm run dev

# Ver erros detalhados
npm run dev --verbose
docker-compose logs -f
pm2 logs whatpro-manager --err
```

---

## 📱 Atalhos Úteis

### Terminal
- `Ctrl + C` - Parar processo atual
- `Ctrl + Z` - Suspender processo
- `Ctrl + L` - Limpar terminal
- `↑` / `↓` - Navegar histórico de comandos

### PM2
```bash
pm2 ls              # Listar processos
pm2 restart all     # Reiniciar todos
pm2 stop all        # Parar todos
pm2 delete all      # Deletar todos
pm2 save            # Salvar configuração
pm2 resurrect       # Restaurar processos salvos
```

---

## 🎯 Fluxo Completo

### Primeira Vez (Instalação)
```bash
npm install
cp .env.example .env.local
# Editar .env.local
docker-compose up -d
npx prisma migrate dev
npx tsx scripts/restore-providers.ts
npm run update-tokens
npm run sync
npm run dev
```

### Dia a Dia
```bash
docker-compose up -d
npm run dev
# Trabalhar...
# Ctrl + C
docker-compose down  # (opcional)
```

### Deploy Produção
```bash
git pull
npm ci --production=false
npx prisma migrate deploy
npm run build
pm2 restart whatpro-manager
pm2 logs whatpro-manager
```

---

## 📞 Ajuda

**Comando não funciona?**
1. Verifique se está no diretório correto
2. Verifique se Docker está rodando (se necessário)
3. Verifique se dependências estão instaladas (`npm install`)
4. Leia a mensagem de erro com atenção
5. Consulte documentação específica:
   - [INSTALACAO.md](./INSTALACAO.md)
   - [COMO_USAR.md](./COMO_USAR.md)
   - [PRODUCAO.md](./PRODUCAO.md)
