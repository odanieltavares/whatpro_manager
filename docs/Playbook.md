# Playbook — Release & Hardening

## Release (semver)
1) Atualizar versão conforme `VERSIONING.md` e changelog.
2) Rodar testes: unit + integration adapters + smoke e2e (login, listar instâncias, webhook fake).
3) Aplicar `prisma migrate deploy` em staging; validar rollbacks.
4) Deploy staging; rodar smoke: `/api/health`, `/api/instances`, webhook fake Uazapi/Evolution.
5) Deploy produção; monitorar métricas de fila/erro por 30 min.
6) Se falhar, executar rollback (tag anterior + revert migração).

## Hardening contínuo
- Secrets apenas via env/secret manager; sem hardcode.
- Lint de segredos (git hooks ou CI).
- Mascarar tokens em logs e respostas.
- Feature flags para mudanças de comportamento crítico.
- Revisar permissões Redis/Postgres (auth on, TLS se disponível).
