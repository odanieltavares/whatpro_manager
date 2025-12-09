# WhatPro Manager - Deploy em Produção

## 🎯 Visão Geral

Este guia cobre o deploy do WhatPro Manager em ambiente de produção.

---

## 📋 Pré-requisitos de Produção

### Servidor
- **Node.js** 20.11.0 ou superior
- **PostgreSQL** 15 ou superior
- **Redis** 7 ou superior
- **Nginx** ou outro proxy reverso (recomendado)
- **SSL/TLS** certificado (Let's Encrypt recomendado)

### Domínio
- Domínio configurado (ex: manager.whatpro.com.br)
- DNS apontando para o servidor

---

## 🔐 Segurança em Produção

### 1. Gerar Secrets Fortes

**⚠️ CRÍTICO:** Nunca use valores padrão em produção!

```bash
# Gerar secrets automaticamente
bash scripts/generate-secrets.sh
```

Isso cria/atualiza `.env.production` com:
- `JWT_SECRET` (64 caracteres)
- `JWT_REFRESH_SECRET` (64 caracteres)
- `DATABASE_ENCRYPTION_KEY` (64 caracteres)
- `API_KEY_GLOBAL` (64 caracteres)

### 2. Configurar Variáveis de Ambiente

Crie `.env.production`:

```bash
# Node Environment
NODE_ENV=production

# Banco de Dados (PostgreSQL em produção)
DATABASE_URL="postgresql://usuario:senha@host:5432/whatpro_prod"

# Redis
REDIS_URL="redis://host:6379"

# API URL (seu domínio)
NEXT_PUBLIC_API_URL="https://manager.whatpro.com.br/api"

# Segurança (gerados pelo script)
JWT_SECRET="<gerado-automaticamente>"
JWT_REFRESH_SECRET="<gerado-automaticamente>"
DATABASE_ENCRYPTION_KEY="<gerado-automaticamente>"
API_KEY_GLOBAL="<gerado-automaticamente>"

# Next.js
NEXTAUTH_URL="https://manager.whatpro.com.br"
NEXTAUTH_SECRET="<secret-forte-aqui>"
```

---

## 🗄️ Preparar Banco de Dados

### PostgreSQL em Produção

#### Opção 1: Servidor Próprio
```bash
# Conectar ao PostgreSQL
psql -U postgres

# Criar banco e usuário
CREATE DATABASE whatpro_prod;
CREATE USER whatpro_user WITH ENCRYPTED PASSWORD 'senha_forte_aqui';
GRANT ALL PRIVILEGES ON DATABASE whatpro_prod TO whatpro_user;
```

#### Opção 2: Serviço Gerenciado
- **Supabase** (recomendado, grátis até certo ponto)
- **AWS RDS**
- **Google Cloud SQL**
- **DigitalOcean Managed Database**

### Redis em Produção

#### Opção 1: Servidor Próprio
```bash
# Instalar Redis
sudo apt-get install redis-server

# Configurar senha
sudo nano /etc/redis/redis.conf
# Adicionar: requirepass sua_senha_forte

# Reiniciar
sudo systemctl restart redis
```

#### Opção 2: Serviço Gerenciado
- **Upstash** (recomendado, serverless)
- **AWS ElastiCache**
- **Redis Cloud**

---

## 📦 Build da Aplicação

### 1. Instalar Dependências
```bash
npm ci --production=false
```

### 2. Executar Migrações
```bash
npx prisma migrate deploy
```

### 3. Gerar Prisma Client
```bash
npx prisma generate
```

### 4. Build Next.js
```bash
npm run build
```

**Saída esperada:**
```
✓ Compiled successfully
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization
```

---

## 🚀 Iniciar em Produção

### Opção 1: PM2 (Recomendado)

#### Instalar PM2
```bash
npm install -g pm2
```

#### Criar ecosystem.config.js
```javascript
module.exports = {
  apps: [{
    name: 'whatpro-manager',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
  }]
};
```

#### Iniciar com PM2
```bash
# Iniciar aplicação
pm2 start ecosystem.config.js

# Salvar configuração
pm2 save

# Configurar auto-start
pm2 startup
```

#### Comandos PM2 Úteis
```bash
# Ver status
pm2 status

# Ver logs
pm2 logs whatpro-manager

# Reiniciar
pm2 restart whatpro-manager

# Parar
pm2 stop whatpro-manager

# Deletar
pm2 delete whatpro-manager
```

### Opção 2: Systemd Service

Criar `/etc/systemd/system/whatpro-manager.service`:

```ini
[Unit]
Description=WhatPro Manager
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/whatpro_manager
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm start
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Ativar:
```bash
sudo systemctl enable whatpro-manager
sudo systemctl start whatpro-manager
sudo systemctl status whatpro-manager
```

---

## 🌐 Configurar Nginx (Proxy Reverso)

### Instalar Nginx
```bash
sudo apt-get install nginx
```

### Configurar Site
Criar `/etc/nginx/sites-available/whatpro-manager`:

```nginx
server {
    listen 80;
    server_name manager.whatpro.com.br;

    # Redirecionar para HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name manager.whatpro.com.br;

    # SSL Certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/manager.whatpro.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/manager.whatpro.com.br/privkey.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Proxy para Next.js
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Logs
    access_log /var/log/nginx/whatpro-manager-access.log;
    error_log /var/log/nginx/whatpro-manager-error.log;
}
```

### Ativar Site
```bash
sudo ln -s /etc/nginx/sites-available/whatpro-manager /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Configurar SSL (Let's Encrypt)
```bash
# Instalar Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d manager.whatpro.com.br

# Renovação automática (já configurado)
sudo certbot renew --dry-run
```

---

## 🔄 Configurar Providers em Produção

### 1. Restaurar Configurações
```bash
npx tsx scripts/restore-providers.ts
```

### 2. Atualizar Tokens
```bash
npm run update-tokens
```

Forneça os tokens de produção dos providers.

### 3. Sincronizar Instâncias
```bash
npm run sync
```

---

## 📊 Monitoramento

### Logs da Aplicação
```bash
# PM2
pm2 logs whatpro-manager

# Systemd
sudo journalctl -u whatpro-manager -f
```

### Logs do Nginx
```bash
# Access log
tail -f /var/log/nginx/whatpro-manager-access.log

# Error log
tail -f /var/log/nginx/whatpro-manager-error.log
```

### Monitoramento PM2
```bash
# Dashboard
pm2 monit

# Métricas
pm2 status
```

---

## 🔄 Atualizações

### Deploy de Nova Versão
```bash
# 1. Fazer backup do banco
pg_dump -U whatpro_user whatpro_prod > backup_$(date +%Y%m%d).sql

# 2. Atualizar código
git pull origin main

# 3. Instalar dependências
npm ci --production=false

# 4. Executar migrações
npx prisma migrate deploy

# 5. Build
npm run build

# 6. Reiniciar aplicação
pm2 restart whatpro-manager

# 7. Verificar
pm2 status
pm2 logs whatpro-manager --lines 50
```

---

## 💾 Backup

### Backup Automático do Banco
Criar script `/usr/local/bin/backup-whatpro.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/whatpro"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup PostgreSQL
pg_dump -U whatpro_user whatpro_prod | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Manter apenas últimos 7 dias
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +7 -delete
```

Agendar com cron:
```bash
# Editar crontab
crontab -e

# Adicionar (backup diário às 3h)
0 3 * * * /usr/local/bin/backup-whatpro.sh
```

---

## 🔒 Hardening de Segurança

### Firewall
```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

### Fail2ban
```bash
# Instalar
sudo apt-get install fail2ban

# Configurar para Nginx
sudo nano /etc/fail2ban/jail.local
```

### Atualizações de Segurança
```bash
# Habilitar atualizações automáticas
sudo apt-get install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

---

## 📈 Performance

### Otimizações Next.js
- Build com `npm run build` (já otimizado)
- Compressão gzip no Nginx (já configurado)
- Cache de assets estáticos

### Otimizações Banco de Dados
```sql
-- Criar índices importantes
CREATE INDEX idx_instances_tenant ON instances(tenant_id);
CREATE INDEX idx_instances_status ON instances(status);
CREATE INDEX idx_instances_provider ON instances(provider);
```

### Redis Cache
- Configurar TTL apropriado
- Monitorar uso de memória

---

## 🆘 Troubleshooting Produção

### Aplicação Não Inicia
```bash
# Verificar logs
pm2 logs whatpro-manager --err

# Verificar porta
lsof -i:3001

# Verificar variáveis de ambiente
pm2 env 0
```

### Erro de Conexão com Banco
```bash
# Testar conexão
psql -U whatpro_user -h host -d whatpro_prod

# Verificar DATABASE_URL no .env.production
```

### SSL Não Funciona
```bash
# Verificar certificados
sudo certbot certificates

# Renovar manualmente
sudo certbot renew

# Testar configuração Nginx
sudo nginx -t
```

---

## ✅ Checklist de Deploy

- [ ] Servidor configurado (Node.js, PostgreSQL, Redis)
- [ ] Domínio apontando para servidor
- [ ] Secrets gerados (`generate-secrets.sh`)
- [ ] `.env.production` configurado
- [ ] Banco de dados criado
- [ ] Migrações executadas
- [ ] Build concluído com sucesso
- [ ] PM2 ou Systemd configurado
- [ ] Nginx configurado
- [ ] SSL/TLS configurado (Let's Encrypt)
- [ ] Firewall configurado
- [ ] Backup automático configurado
- [ ] Providers configurados
- [ ] Tokens atualizados
- [ ] Instâncias sincronizadas
- [ ] Monitoramento ativo
- [ ] Aplicação acessível via HTTPS

---

## 📞 Suporte

**Problemas em produção?**
1. Verifique logs (PM2/Systemd)
2. Verifique logs do Nginx
3. Teste conexões (banco, redis)
4. Verifique variáveis de ambiente
5. Consulte troubleshooting acima
