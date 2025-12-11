# Guia de Migração: Ngrok -> Cloudflare Tunnel

Este guia orienta a instalação e configuração do Cloudflare Tunnel para substituir o Ngrok, conforme solicitado no PRD de Segurança.

## 1. Instalação do Agente (`cloudflared`)

### macOS (Recomendado)
```bash
brew install cloudflared
```

### Windows
```powershell
winget install helpers.cloudflared
# OU baixe o .msi em: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation
```

### Linux
```bash
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared.deb
```

---

## 2. Como usar (Quick Tunnel - Dev Rápido)
Ideal para testes rápidos sem autenticação.

1.  Rode o script auxiliar:
    ```bash
    chmod +x scripts/start-cloudflared-tunnel.sh
    ./scripts/start-cloudflared-tunnel.sh
    ```
2.  O terminal mostrará uma URL temporária: `https://<random-name>.trycloudflare.com`.
3.  Use essa URL nos Webhooks da Uazapi/Evolution.

---

## 3. Como usar (Tunnel Gerenciado - Fixo/Produção)
Ideal para ter URLs fixas como `webhooks.seudominio.com`.

### Onde achar os dados necessários?

#### A) Login e Autenticação
*   **Comando:** `cloudflared tunnel login`
*   **O que acontece:** Abre o navegador. Selecione o domínio da sua conta Cloudflare.

#### B) Criar o Túnel
*   **Comando:** `cloudflared tunnel create whatpro-dev`
*   **Resultado:** Gera um `Tunnel-UUID` e um arquivo de credenciais em `~/.cloudflared/`.

#### C) Configurar DNS (Domínio/Hostname)
*   **Onde:** Painel Cloudflare > Zero Trust > Access > Tunnels.
*   **Ou via CLI:**
    ```bash
    cloudflared tunnel route dns whatpro-dev webhooks.seudominio.com
    ```
*   **Recomendação:** Use subdomínios explicítos:
    *   `app.dev...` (Frontend)
    *   `api.dev...` (Backend)
    *   `webhooks.dev...` (Webhooks - evite passar pelo Access se a origem não suportar auth)

#### D) Configurar Roteamento Local
Crie um arquivo `config.yml`:
```yaml
tunnel: <Tunnel-UUID>
credentials-file: /Users/voce/.cloudflared/<Tunnel-UUID>.json

ingress:
  - hostname: webhooks.seudominio.com
    service: http://localhost:3001
  - service: http_status:404
```
**Rodar:** `cloudflared tunnel run whatpro-dev`

---

## 4. Checklist Pós-Migração
*   [ ] Remover `ngrok` dos scripts de startup.
*   [ ] Atualizar URLs de webhook no banco de dados/providers.
*   [ ] Testar recebimento de eventos (Use `scripts/monitor-full.js`).
*   [ ] Verificar se headers de segurança estão passando.
