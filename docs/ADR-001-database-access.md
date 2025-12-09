# ADR-001 — Acesso a Dados (Prisma único)

## Contexto
- Hoje há código misto: Prisma (schema completo) e SQL raw com `pg`.
- Setup atual cria tabelas simplificadas via script e seeds hardcoded.
- Bugs relatados no Prisma levaram ao bypass, mas o objetivo é retomá-lo.

## Decisão
- Usar **apenas Prisma** como camada de acesso a Postgres.
- Banco como fonte única; nada de tabelas paralelas fora do schema.
- Migrações via `prisma migrate` versionadas no repo.

## Consequências
- Remover/arquivar código SQL raw (`lib/db.ts`, sync raw, setup.sh legado) ou reescrever para Prisma.
- Ajustar endpoints/workers para usar Prisma e o schema oficial.
- Seeds/configs via Prisma seeding ou migrations, sem tokens hardcoded.
- Scripts de setup local devem aplicar migrações Prisma, não DDL manual.
