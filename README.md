# Whatpro Manager

Plataforma moderna para gerenciamento completo de instâncias WhatsApp via **Uazapi API**.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🚀 Funcionalidades

- ✅ **Gerenciamento de Instâncias WhatsApp** - Criar, conectar (QR Code/Paircode) e monitorar instâncias
- ✅ **Envio de Mensagens** - Texto, mídia e documentos
- ✅ **Webhooks** - Configuração e logs de eventos
- ✅ **Integração Chatwoot** - Sincronização nativa de conversas
- ✅ **UI Responsiva** - Sidebar colapsável (desktop) e menu mobile
- ✅ **Tema Claro/Escuro** - Alternância com persistência de preferência
- ✅ **TypeScript** - Type-safety completo

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: TailwindCSS 4
- **Componentes**: shadcn/ui
- **State**: Zustand
- **HTTP Client**: Axios
- **Ícones**: Lucide React
- **Charts**: Recharts
- **Notificações**: Sonner

## 📦 Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/whatpro-manager.git

# Entre na pasta
cd whatpro-manager

# Instale as dependências
npm install

# Configure variáveis de ambiente (opcional)
cp .env.example .env.local

# Inicie o servidor de desenvolvimento
npm run dev
```

Acesse: `http://localhost:3001`

## ⚙️ Configuração

### 1. Admin Token

1. Obtenha seu Admin Token do Uazapi
2. Acesse **Configurações** no menu
3. Cole o Admin Token e salve

### 2. URL Base (Opcional)

- Padrão: `https://free.uazapi.com`
- Para servidor próprio: altere em Configurações

### 3. Criar Primeira Instância

1. Vá em **Instâncias**
2. Clique em "Nova Instância"
3. Escaneie o QR Code no WhatsApp

## 🎨 Recursos Visuais

- **Sidebar Responsiva**: Colapsável no desktop (64px ↔ 256px)
- **Menu Mobile**: Overlay com backdrop
- **Dark Mode**: Tema claro/escuro com animações suaves
- **Componentes Modernos**: shadcn/ui com tema Neutral

## 📝 Scripts Disponíveis

```bash
npm run dev      # Desenvolvimento (porta 3001)
npm run build    # Build para produção
npm start        # Produção (porta 3001)
npm run lint     # Lint
```

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env.local`:

```env
NEXT_PUBLIC_UAZAPI_URL=https://free.uazapi.com
NEXT_PUBLIC_UAZAPI_ADMIN_TOKEN=seu_token_aqui
```

> **Nota**: Você também pode configurar esses valores diretamente na UI em **Configurações**.

## 🏗️ Estrutura do Projeto

```
whatpro_manager/
├── app/
│   ├── (pages)/          # Páginas da aplicação
│   ├── layout.tsx        # Layout raiz
│   └── page.tsx          # Dashboard
├── components/
│   ├── ui/               # Componentes shadcn/ui
│   ├── sidebar.tsx       # Navegação lateral
│   └── ...
├── lib/
│   ├── uazapi/           # Cliente API
│   └── store/            # Zustand stores
└── types/                # TypeScript types
```

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se livre para:

1. Fazer fork do projeto
2. Criar uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Add: Minha feature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abrir um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🙋 Suporte

Para suporte, abra uma [issue](https://github.com/seu-usuario/whatpro-manager/issues) no GitHub.

## 🔗 Links Úteis

- [Documentação Uazapi](https://uazapi.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com)

---

**Desenvolvido com ❤️ usando Next.js e TailwindCSS**
