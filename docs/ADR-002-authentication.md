# ADR-002 — Autenticação e Autorização

## Contexto
- Rotas de auth existem, mas `generateTokens` está desativado (“Global Access”).
- Front consome tokens (axios interceptors), mas hoje falha.
- Segurança é requisito crítico; não expor tokens de instância ao frontend.

## Decisão
- Reativar JWT com access/refresh, assinado por segredos via env.
- RBAC por role/tenant em middleware (`withAuth/withRole`).
- Tokens de provider/instância nunca saem do backend; operações sensíveis via endpoints autenticados.

## Consequências
- Implementar `generateTokens` e alinhar rotas `/auth/login`, `/auth/refresh`, `/auth/me`.
- UI deve usar cliente novo (`lib/api/client.ts`) com tokens em memória (sem localStorage) ou storage seguro.
- Proteger endpoints de instâncias/comportamento/filas com middleware.
- Ajustar testes e docs para fluxo de login/refresh/logout.
