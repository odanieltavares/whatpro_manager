# Auditoria de Conexão (Uazapi & Evolution)

Este documento resume o que foi verificado na área de conexão das instâncias, como cada provider deve responder e quais testes/gates rodar para evitar as falhas que estavam aparecendo (QR/paircode em branco, 500/502 no disconnect, tabs piscando, etc.).

## Visão geral (estado atual do código)
- Providers separados (`lib/providers/uazapi.provider.ts` e `lib/providers/evolution.provider.ts`), e fábrica em `lib/providers/factory.ts` com tokens default (Uazapi admin e Evolution admin WHATPROB6D711FCD936544120E713976V2).
- Rotas de instância expostas em `/api/instances/[id]/*`:
  - `status`: chama provider correto e persiste status.
  - `qrcode`: só permite quando `status !== connected`; Uazapi usa connect/qrcode, Evolution usa `GET /instance/connect/{instance}` e devolve QR e/ou pairingCode.
  - `paircode`: Uazapi gera via paircode endpoints; Evolution gera no mesmo `connect`.
  - `disconnect`: tenta provider; se falhar, ainda marca disconnected e devolve warning (evita 500 no front).
- Front:
  - Página `app/instances/[id]/page.tsx` esconde QR/paircode quando conectado; mostra token e Owner JID sempre.
  - `QRCodeDisplay` aceita base64, data:image ou texto; se o provider retornar apenas pairingCode, exibe texto e botão copiar.
  - `PaircodeGenerator` funciona para Uazapi e Evolution; exige telefone (limpo) e bloqueia se provider não suportar.
  - `StatusDisplay` deixa de auto-refresh quando já conectado, evitando loop/piscada.

## Como deve funcionar por provider
### Uazapi
- QR: `POST /instance/connect` com token, fallback `GET /instance/qrcode`. Resposta deve ter `qrcode` (pode vir dentro de `instance`).
- Paircode: tenta `POST /instance/paircode`, `GET /instance/paircode?phone=...`, `GET /instance/paircode/{phone}`.
- Status: `GET /instance/status` com header `token`.
- Disconnect: `POST /instance/logout` com header `token`.

### Evolution
- QR/Paircode: `GET /instance/connect/{instance}` com header `apikey`. Pode devolver:
  - `base64` (data:image/png;base64,...) -> QR.
  - `qrcode` ou `qrcode.code` ou `code` -> QR textual.
  - `pairingCode`/`paircode` -> código de pareamento.
- Status: `GET /instance/connectionState/{instance}` com header `apikey` (campo `connectionStatus` ou `state`).
- Disconnect: `DELETE /instance/logout/{instance}` com header `apikey`.

## Testes rápidos (sem dependências externas)
1) **Status**: `curl -H "apikey: <EVOLUTION_KEY>" https://evo.whatpro.com.br/instance/connectionState/<inst>` ou `curl -H "token: <UAZ_TOKEN>" <baseUrl>/instance/status`. Esperado 200 e `connected|connecting|disconnected`.
2) **QR Evolution**: `curl -H "apikey: <KEY>" https://evo.whatpro.com.br/instance/connect/<inst>` deve devolver `base64` ou `pairingCode`. Se vier vazio, trate como erro do provider (não do Manager).
3) **Paircode Uazapi**: `curl -X POST -H "token: <TOKEN>" -H "Content-Type: application/json" -d '{"phone":"5511999999999"}' <baseUrl>/instance/paircode`.
4) **Disconnect**: `curl -X DELETE -H "apikey: <KEY>" https://evo.whatpro.com.br/instance/logout/<inst>` ou `curl -X POST -H "token: <TOKEN>" <baseUrl>/instance/logout`. Mesmo que devolva 404, a rota local marcará como disconnected e retornará sucesso com warning.

## Sintomas já corrigidos e checagens
- **Botão desconectar retornava 500/502**: rota agora captura erro do provider e retorna `{success:true, warning}`. Se ainda aparecer 500 no front, verifique logs do Next e reinicie o dev server para pegar o código novo.
- **QR/paircode em branco (Evolution)**: provider agora aceita `base64`, `code`, `pairingCode`. Se continuar vazio, é falta de dados na resposta do provider — validar com o curl do teste rápido.
- **Tabs de conexão piscando**: auto-refresh e load inicial são desligados quando a instância já está `connected`; use botão "Atualizar status" para revalidar manualmente.
- **Paircode sumido (Evolution)**: habilitado no front sempre que `provider` é `evolution` e instância está desconectada.
- **EADDRINUSE 3001**: se `npm run dev` falhar, subir com `PORT=3002 npm run dev` ou finalizar processo que ocupa 3001 (`lsof -i :3001`).

## Checklist mínimo por release (conexão)
- Uazapi: gerar QR, gerar paircode, conectar, desconectar, status refletido no card, behavior carregado.
- Evolution: gerar QR/paircode, copiar Owner JID, conectar (se disponível), desconectar, status refletido.
- UI: quando `status=connected`, esconder opções QR/paircode; quando `disconnected`, exibir ambas.
- Webhook (Uazapi): se usar túnel, `https://<ngrok-sub>.ngrok-free.app/api/webhooks/uazapi/<INSTANCE_TOKEN>`.

## Próximos passos sugeridos
- Centralizar logs das rotas `/api/instances/*` (logger único) para detectar rápido falhas de provider.
- Adicionar teste automatizado de smoke para providers (mockando respostas 200/404/500) para evitar regressão em QR/paircode/disconnect.
