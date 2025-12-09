# SDLC — Ciclo de Vida de Desenvolvimento

## Fluxo
1) Descoberta/Requisitos: alinhar com PRD e ADRs, validar contratos (providers/Chatwoot).
2) Design: ADRs e diagramas; revisar contra `Checklists.md`.
3) Implementação: feature branch; testes locais (unit/integration/e2e leve).
4) Revisão: code review focado em segurança/contratos/rollback.
5) Release: versionamento semântico, changelog, migrações Prisma aplicadas e validadas.
6) Observação pós-release: monitorar filas/erros; rollback script pronto.

## Qualidade mínima por fase
- Requisitos: user stories + critérios de aceite + riscos mapeados.
- Design: ADR aprovado; diagrama mermaid atualizado; impacto em schema/infra listado.
- Código: lint/format/tests verdes; sem segredos em git; logs não sensíveis.
- Release: tag criada, migrações aplicadas, runbook para rollback testado.

## Artefatos obrigatórios
- ADR por decisão relevante (dados, auth, providers, filas).
- Testes automatizados para adapters, auth, filas (retry/DLQ) e endpoints.
- Runbooks/playbooks atualizados quando novos casos surgirem.

## Change Management
- Toda migração Prisma requer plano de rollback.
- Backward compatibility: APIs do Manager devem manter contratos anunciados pelo VERSIONING.
- Feature flags para mudanças de comportamento em produção quando possível.
