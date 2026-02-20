# WhatPro Manager

Sistema de gerenciamento de instâncias WhatsApp para Evolution API e Uazapi.

## 📚 Documentação

- **[Instalação](./docs/INSTALACAO.md)** - Setup inicial do projeto
- **[Como Usar](./docs/COMO_USAR.md)** - Guia de uso diário
- **[Produção](./docs/PRODUCAO.md)** - Deploy em produção
- **[Comandos](./docs/COMANDOS.md)** - Referência rápida de comandos
- **[Changelog](./CHANGELOG.md)** - Histórico de mudanças da aplicação
- **[Dev Log](./docs/DEV_LOG.md)** - Log técnico e histórico de debugs de desenvolvimento

## 🚀 Início Rápido

### Pré-requisitos
- Node.js 20.11.0+
- Docker Desktop
- Git

### Instalação
```bash
# 1. Clonar repositório
git clone <URL> whatpro_manager
cd whatpro_manager

# 2. Instalar dependências
npm install

# 3. Configurar ambiente
cp .env.example .env.local
# Editar .env.local com suas configurações

# 4. Iniciar Docker
docker-compose up -d

# 5. Executar migrações
npx prisma migrate dev

# 6. Configurar providers
npx tsx scripts/restore-providers.ts
npm run update-tokens

# 7. Sincronizar instâncias
npm run sync

# 8. Iniciar aplicação
npm run dev
```

Acesse: **http://localhost:3001**

## 📖 Comandos Principais

```bash
# Desenvolvimento
npm run dev                 # Iniciar servidor
npm run sync               # Sincronizar instâncias
npm run update-tokens      # Atualizar tokens providers

# Banco de Dados
npx prisma studio          # Interface visual
npx prisma migrate dev     # Executar migrações

# Docker
docker-compose up -d       # Iniciar containers
docker-compose down        # Parar containers
docker ps                  # Ver containers rodando

# Produção
npm run build              # Build para produção
npm start                  # Iniciar produção
pm2 start ecosystem.config.js  # Iniciar com PM2
```

## 🏗️ Estrutura do Projeto

```
whatpro_manager/
├── app/                   # Páginas e rotas Next.js
├── components/            # Componentes React
├── lib/                   # Bibliotecas e utilitários
├── prisma/               # Schema e migrações
├── scripts/              # Scripts utilitários
├── docs/                 # Documentação
└── docker-compose.yml    # Configuração Docker
```

## 🔐 Segurança

- Tokens criptografados no banco de dados (AES-256-GCM)
- Validação de variáveis de ambiente
- Secrets fortes gerados automaticamente
- Nunca commite `.env.local`

## 🛠️ Tecnologias

- **Framework:** Next.js 16
- **Banco de Dados:** PostgreSQL 15
- **Cache:** Redis 7
- **ORM:** Prisma
- **UI:** React, TailwindCSS, shadcn/ui
- **API Client:** Axios

## 📊 Features

- ✅ Gerenciamento de instâncias WhatsApp
- ✅ Suporte Evolution API e Uazapi
- ✅ Sincronização automática
- ✅ Interface intuitiva
- ✅ Configurações por instância
- ✅ Integração Chatwoot
- ✅ QR Code e Paircode
- ✅ Webhooks

## 🆘 Suporte

**Problemas?** Consulte:
1. [Troubleshooting](./docs/COMO_USAR.md#problemas-comuns)
2. [Comandos](./docs/COMANDOS.md#troubleshooting)
3. Logs: `npm run dev` ou `pm2 logs`

## 📝 Licença

Proprietary - Uso interno WhatPro

## 👥 Equipe

Desenvolvido por WhatPro Team
