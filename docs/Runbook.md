# Runbook — Incidentes Comuns

## Login/Refresh falhando
- Sintoma: 401 em /auth/login ou /auth/refresh.
- Checar envs: `JWT_SECRET`, `JWT_REFRESH_SECRET`, `JWT_EXPIRES_IN`.
- Ver logs de erro em `generateTokens`/`verify*`.
- Ação: regerar segredos, redeploy, invalidar tokens antigos; rodar smoke `/api/health`.

## Migração Prisma falhou
- Sintoma: app não sobe; erro de tabela/coluna.
- Checar `prisma/migrations` aplicada? `prisma migrate status`.
- Ação: aplicar `prisma migrate deploy`; se quebrar, rodar `prisma migrate reset` só em dev; para prod, usar rollback da migração anterior.

## Fila parada / DLQ crescendo
- Sintoma: workers não consumindo, DLQ aumentando.
- Checar Redis `LLEN` das filas e locks.
- Ver logs do worker (outbound/inbound).
- Ação: restart worker; se lock preso, limpar lock via Redis; usar endpoint de limpeza de fila com rastreabilidade.

## Provider indisponível
- Sintoma: erros 5xx Uazapi/Evolution.
- Ação: retries até limite; se DLQ, notificar operador; pausar fila da instância; registrar incidente.

## Tokens vazando em logs
- Sintoma: logs com tokens/segredos.
- Ação: rotacionar segredos; ajustar logger para mascarar; revisar código de logs e pipelines.
