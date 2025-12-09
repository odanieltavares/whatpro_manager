# Checklists de Gate

## Design Gate
- [ ] Requisitos rastreados no PRD e histórias com critérios de aceite.
- [ ] ADR criado/atualizado para decisões relevantes.
- [ ] Diagrama/flowchart atualizado (Flowchart.md) com rotas/filas.
- [ ] Impacto em schema/migrações Prisma mapeado com rollback.
- [ ] Plano de segurança: segredos, tokens, mascaramento de logs.

## Implementação Gate
- [ ] Código usa Prisma (sem SQL raw) conforme ADR-001.
- [ ] Autenticação conforme ADR-002 (middleware aplicado, tokens não vazam).
- [ ] Lint/format/tests verdes (unit/integration/e2e relevante).
- [ ] Sem segredos hardcoded; `.env.example` atualizado.
- [ ] Logs não contêm tokens/PII; auditável.

## Release Gate
- [ ] Migrações Prisma aplicadas e verificadas.
- [ ] Changelog + versão semântica atualizada (VERSIONING.md).
- [ ] Runbook/Playbook revisados para novos cenários.
- [ ] Rollback testado ou plano documentado.
- [ ] Feature flags configuradas (quando aplicável).
