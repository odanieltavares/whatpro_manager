# Versionamento Semântico

- Formato: `MAJOR.MINOR.PATCH`
  - MAJOR: mudanças incompatíveis (contrato de API/banco quebrado).
  - MINOR: novas funcionalidades compatíveis.
  - PATCH: correções e hotfixes compatíveis.
- Migrações Prisma:
  - Mudanças compatíveis (novas colunas nulas, novos índices) podem sair em MINOR/PATCH.
  - Mudanças destrutivas (drop/rename quebrando) exigem MAJOR ou feature flag + migração em duas etapas.
- Tags Git: `vMAJOR.MINOR.PATCH` com changelog resumindo breaking changes, migrações e passos de deploy/rollback.
- Contratos públicos (Manager UI ↔ API): manter compatibilidade até MAJOR seguinte; se quebrar, marcar endpoints/props como deprecated antes.
