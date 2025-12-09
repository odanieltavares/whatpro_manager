# PRD — WhatPro Manager + Hub

## Contexto
- Painel SaaS (Manager) + Hub orquestrador substituindo fluxos n8n.
- Providers distintos (Uazapi Go, Evolution API) → contratos diferentes.
- Multi-tenant (Postgres) + filas/locks no Redis + integrações Chatwoot.
- Situação atual: Next 16/React 19, Prisma schema completo mas código misto com SQL raw e providers duplicados; auth desativada; tokens hardcoded em setup.

## Objetivos
1) Unificar backend em Prisma 100% conforme `prisma/schema.prisma`.
2) Reativar autenticação JWT segura (access/refresh) e remover “Global Access”.
3) Consolidar adapters Uazapi/Evolution seguindo specs reais (learn-lab).
4) Garantir isolamento por tenant, filas sequenciais por contato e DLQ.
5) Não expor tokens ao frontend; mascarar segredos em logs e configs.
6) Entregar UI funcional para instâncias, execuções e Chatwoot com o novo contrato.

## Não objetivos (por ora)
- Billing/assinatura.
- Observabilidade completa (APM/OTEL) além de logging estruturado básico.
- Migração automática de dados legados fora do schema atual.

## Público/Personas
- Operador/CS: gerencia instâncias, vê status, QR/Paircode, limpa filas.
- DevOps: mantém stack Postgres/Redis/Hub/Manager, monitora filas/logs.
- Backend: evolui adapters e regras de negócio.

## Requisitos Funcionais (alto nível)
- Autenticação JWT (access/refresh), RBAC por role/tenant.
- Gestão de instâncias: criar/listar/status/QR/Paircode, behavior, vínculo Chatwoot.
- Webhooks providers → Hub → Chatwoot (mensagens, status, typing, mídias).
- Outbound Chatwoot → Hub → provider com fila sequencial, retry e DLQ.
- Limpeza de filas (per contato/instância) e visibilidade de erros.
- Sincronização de instâncias (providers → banco) via jobs/endpoint.

## Requisitos Não Funcionais
- Postgres como fonte única; migrações via Prisma Migrate.
- Redis para filas, locks e caches críticos.
- Latência alvo <1s para texto simples (rede normal).
- Logs estruturados sem segredos; mascaramento de tokens.
- Idempotência em webhooks e envios; dedupe por messageId/stanzaId.

## Restrições/Assumptions
- Providers têm contratos distintos; adapters encapsulam diferenças.
- Chatwoot disponível e autenticado por tenant/inbox.
- Ambientes: dev/local (Docker), staging, prod; variáveis via `.env`.

## Métricas de sucesso
- Tempo médio texto Chatwoot→WA e WA→Chatwoot <1s (p95).
- Taxa de erro de webhook <0,5% (pós retry).
- Zero vazamento de tokens em logs/HTTP responses.
- Cobertura mínima de testes críticos (adapters, auth, filas) >70%.

## Roadmap inicial (fases)
1) Hardening base: deps, zod, envs, remover SQL raw, ativar JWT.
2) Providers: alinhar Uazapi/Evolution aos specs, testes de contrato.
3) Filas/Redis: retries, DLQ, limpeza, locks; workers estáveis.
4) UI/Manager: telas de instâncias/execuções integradas ao novo contrato.
5) Segurança: secrets via env, lint de segredos, mascaramento de logs.
