# WhatPro Manager - Instalação e Configuração Inicial

## 📋 Pré-requisitos

### Software Necessário
- **Node.js** 20.11.0 ou superior
- **Docker Desktop** (para PostgreSQL e Redis)
- **Git** (para clonar repositório)

### Verificar Instalações
```bash
node --version  # Deve ser >= 20.11.0
npm --version   # Deve vir com Node.js
docker --version # Deve estar instalado
```

---

## 🚀 Instalação Passo a Passo

### 1. Clonar Repositório (se ainda não tiver)
```bash
cd /Users/playsuporte/Documents/DEV-WHATPRO/ParoquiaDev
git clone <URL_DO_REPOSITORIO> whatpro_manager
cd whatpro_manager
```

### 2. Instalar Dependências
```bash
npm install
```

**Aguarde:** Pode levar alguns minutos.

### 3. Configurar Variáveis de Ambiente

#### Copiar Arquivo de Exemplo
```bash
cp .env.example .env.local
```

#### Editar .env.local
Abra o arquivo `.env.local` e configure:

```bash
# Banco de Dados
DATABASE_URL="postgresql://whatpro:whatpro_secure_2024@localhost:5432/whatpro"

# Redis
REDIS_URL="redis://localhost:6379"

# API URL (para frontend)
NEXT_PUBLIC_API_URL="http://localhost:3001/api"

# Segurança (IMPORTANTE: Gerar valores fortes para produção)
JWT_SECRET="seu-secret-jwt-aqui-minimo-32-caracteres"
JWT_REFRESH_SECRET="seu-refresh-secret-aqui-minimo-32-caracteres"
DATABASE_ENCRYPTION_KEY="sua-chave-de-criptografia-aqui-minimo-32-caracteres"
API_KEY_GLOBAL="sua-api-key-global-aqui-minimo-32-caracteres"
```

**⚠️ IMPORTANTE:** Em desenvolvimento, valores padrão funcionam, mas **NUNCA use em produção!**

#### Gerar Secrets Fortes (Recomendado)
```bash
bash scripts/generate-secrets.sh
```

Isso vai gerar secrets seguros e atualizar seu `.env.local`.

### 4. Iniciar Docker
```bash
# Abrir Docker Desktop (aplicativo)
# Aguardar até ficar verde

# Iniciar containers
docker-compose up -d
```

**Verificar:**
```bash
docker ps
```

Deve mostrar containers `postgres` e `redis` rodando.

### 5. Executar Migrações do Banco
```bash
npx prisma migrate dev
```

**Saída esperada:**
```
✅ Database migrations completed
```

### 6. Gerar Prisma Client
```bash
npx prisma generate
```

### 7. Configurar Providers (Evolution e Uazapi)

#### Restaurar Configurações dos Providers
```bash
npx tsx scripts/restore-providers.ts
```

Isso cria os registros no banco para Evolution e Uazapi.

#### Atualizar Tokens
```bash
npm run update-tokens
```

Forneça os tokens corretos:
- **Evolution API Token** (da dashboard Evolution)
- **Uazapi Admin Token** (da dashboard Uazapi)

### 8. Sincronizar Instâncias
```bash
npm run sync
```

Isso busca todas as instâncias dos providers e salva no banco local.

### 9. Iniciar Aplicação
```bash
npm run dev
```

### 10. Acessar Aplicação
Abra no navegador: **http://localhost:3001**

---

## ✅ Verificação da Instalação

### Checklist
- [ ] Docker Desktop rodando
- [ ] Containers postgres e redis up (`docker ps`)
- [ ] Migrações executadas (`npx prisma migrate status`)
- [ ] `.env.local` configurado
- [ ] Providers configurados no banco
- [ ] Tokens atualizados
- [ ] Instâncias sincronizadas
- [ ] Servidor dev rodando
- [ ] Aplicação acessível em http://localhost:3001

### Testar Funcionalidades
1. **Listar Instâncias:** http://localhost:3001/instances
2. **API:** http://localhost:3001/api/instances
3. **Criar Nova Instância:** Botão "Nova Instância"

---

## 🔧 Configurações Adicionais

### Prisma Studio (Interface Visual do Banco)
```bash
npx prisma studio
```
Acesse: http://localhost:5555

### PgAdmin (Gerenciador PostgreSQL)
Já está rodando via Docker:
- URL: http://localhost:5050
- Email: whatpro.adm@gmail.com
- Senha: mysbvflnyfxohide

### Redis Commander (Gerenciador Redis)
Já está rodando via Docker:
- URL: http://localhost:8081

---

## 📦 Estrutura do Projeto

```
whatpro_manager/
├── app/                    # Páginas e rotas Next.js
│   ├── api/               # API routes
│   ├── instances/         # Página de instâncias
│   └── layout.tsx         # Layout principal
├── components/            # Componentes React
├── lib/                   # Bibliotecas e utilitários
│   ├── api/              # Cliente API
│   ├── config/           # Configurações
│   ├── providers/        # Providers (Evolution/Uazapi)
│   └── utils/            # Utilitários
├── prisma/               # Schema e migrações do banco
├── scripts/              # Scripts utilitários
├── docs/                 # Documentação
├── .env.local           # Variáveis de ambiente (NÃO commitar)
├── .env.example         # Exemplo de variáveis
├── docker-compose.yml   # Configuração Docker
└── package.json         # Dependências
```

---

## 🔐 Segurança

### Desenvolvimento
- Valores padrão funcionam
- Avisos são exibidos no console
- **NÃO use em produção!**

### Produção
- **SEMPRE** gere secrets fortes
- Use `scripts/generate-secrets.sh`
- Nunca commite `.env.local`
- Use variáveis de ambiente do servidor

---

## 🐛 Troubleshooting

### Erro: "Cannot connect to database"
```bash
# Verificar se Docker está rodando
docker ps

# Reiniciar containers
docker-compose restart postgres
```

### Erro: "Port 3001 already in use"
```bash
# Matar processo na porta
npx kill-port 3001
```

### Erro: "Prisma Client not generated"
```bash
npx prisma generate
```

### Erro: "Missing environment variable"
```bash
# Verificar .env.local
cat .env.local

# Copiar do exemplo se necessário
cp .env.example .env.local
```

---

## 📚 Próximos Passos

Após instalação bem-sucedida:
1. Leia: [COMO_USAR.md](./COMO_USAR.md) - Uso diário
2. Leia: [PRODUCAO.md](./PRODUCAO.md) - Deploy em produção
3. Leia: [COMANDOS.md](./COMANDOS.md) - Referência rápida

---

## 🆘 Suporte

**Problemas na instalação?**
1. Verifique todos os pré-requisitos
2. Siga os passos na ordem
3. Leia as mensagens de erro com atenção
4. Consulte o Troubleshooting acima
