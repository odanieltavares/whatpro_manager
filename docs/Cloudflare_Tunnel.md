# Cloudflare Tunnel - Whatpro Manager

## Configuração Ativa

| Item | Valor |
|------|-------|
| **URL Pública** | https://hub.whatpro.com.br |
| **Container Docker** | `whatpro_tunnel` |
| **Serviço de Origem** | `http://host.docker.internal:3001` |
| **Tunnel ID** | `6114438f-86c6-4776-a4b6-647bac586e42` |

---

## Comandos Rápidos

```bash
# Ver status do container
docker ps | grep whatpro_tunnel

# Reiniciar o túnel
docker restart whatpro_tunnel

# Ver logs do túnel
docker logs whatpro_tunnel --tail 20

# Testar se túnel funciona (bypassing DNS local)
curl --resolve 'hub.whatpro.com.br:443:104.16.0.1' -s -o /dev/null -w "%{http_code}" https://hub.whatpro.com.br

# Limpar cache DNS do Mac
sudo dscacheutil -flushcache && sudo killall -HUP mDNSResponder
```

---

## Troubleshooting

### Problema 1: ERR_CONNECTION_TIMED_OUT no navegador

**Causa**: O DNS local do Mac resolve `hub.whatpro.com.br` para um IPv6 privado (`fd10:aec2:5dae::`) que não é acessível.

**Diagnóstico**:
```bash
# Verificar resolução DNS
dig hub.whatpro.com.br AAAA +short
# Se retornar fd10:aec2:5dae:: = problema de DNS local
```

**Soluções**:

1. **Limpar cache DNS**:
   ```bash
   sudo dscacheutil -flushcache && sudo killall -HUP mDNSResponder
   ```

2. **Adicionar entrada no /etc/hosts**:
   ```bash
   sudo sh -c 'echo "104.16.0.1 hub.whatpro.com.br" >> /etc/hosts'
   ```

3. **Desativar Tailscale/Cloudflare WARP** se estiver interceptando DNS.

---

### Problema 2: 502 Bad Gateway

**Causa**: O container Docker não consegue acessar `host.docker.internal:3001` (o servidor Next.js no host).

**Diagnóstico**:
```bash
# Verificar logs do túnel
docker logs whatpro_tunnel --tail 20 | grep -i error

# Verificar se Next.js está rodando
curl -s http://localhost:3001
```

**Soluções**:

1. **Verificar se Next.js está rodando**:
   ```bash
   npm run dev
   ```

2. **Recriar container com --add-host**:
   ```bash
   docker stop whatpro_tunnel && docker rm whatpro_tunnel
   docker run -d --name whatpro_tunnel \
     --add-host=host.docker.internal:host-gateway \
     --restart unless-stopped \
     cloudflare/cloudflared:latest \
     tunnel --no-autoupdate run \
     --token <SEU_TOKEN>
   ```

---

### Problema 3: ERR_SSL_VERSION_OR_CIPHER_MISMATCH

**Causa**: O Cloudflare não tem certificado SSL para o subdomínio (ex: `*.local.whatpro.com.br`).

**Solução**: Usar subdomínio de nível 1 como `hub.whatpro.com.br` em vez de `manager.local.whatpro.com.br`.

---

### Problema 4: Webhook não recebe eventos do UazapiGo

**Causa**: A URL do webhook no painel da UazapiGo está incorreta ou o servidor não está acessível externamente.

**Diagnóstico**:
```bash
# Testar se webhook está acessível
curl --resolve 'hub.whatpro.com.br:443:104.16.0.1' \
  -X POST -H "Content-Type: application/json" \
  -d '{"type":"Call","test":true}' \
  https://hub.whatpro.com.br/api/webhooks/uazapi/8HYPx5hJLuNWHW8FC5QKhbCAYRTskPc36KDF5Fvugkn6QmVG9H
```

**Solução**: 
- Verificar URL configurada no painel global da UazapiGo
- URL correta: `https://hub.whatpro.com.br/api/webhooks/uazapi/8HYPx5hJLuNWHW8FC5QKhbCAYRTskPc36KDF5Fvugkn6QmVG9H`
- Verificar se evento `call` está marcado

---

## Criar Container do Zero

```bash
# Token do túnel (armazenar em local seguro)
TOKEN="eyJhIjoiMDY1NjVkYzU1MzVkOGE2ZmQ3ZWEyNzk4YzI4MDIxNWYiLCJ0IjoiNjExNDQzOGYtODZjNi00Nzc2LWE0YjYtNjQ3YmFjNTg2ZTQyIiwicyI6IlpXWTRNRFprT1dNdFlqYzJOUzAwTWpZekxXSXdNVFF0T0RNeE16TTRZemxpTWpFMCJ9"

# Parar e remover container existente
docker stop whatpro_tunnel 2>/dev/null
docker rm whatpro_tunnel 2>/dev/null

# Criar novo container
docker run -d --name whatpro_tunnel \
  --add-host=host.docker.internal:host-gateway \
  --restart unless-stopped \
  cloudflare/cloudflared:latest \
  tunnel --no-autoupdate run \
  --token $TOKEN

# Verificar logs
docker logs whatpro_tunnel --tail 10
```

---

## Configuração no Cloudflare Dashboard

**Painel Zero Trust** > **Networks** > **Tunnels**

| Campo | Valor |
|-------|-------|
| **Hostname** | hub.whatpro.com.br |
| **Domain** | whatpro.com.br |
| **Service** | http://host.docker.internal:3001 |

> ⚠️ **IMPORTANTE**: No macOS, o serviço deve ser `host.docker.internal:3001` (não `localhost:3001`), pois o Docker no Mac não usa network=host.

---

## Verificação Completa

```bash
# 1. Container rodando
docker ps | grep whatpro_tunnel

# 2. Túnel conectado (deve mostrar 4 conexões)
docker logs whatpro_tunnel --tail 10 | grep "Registered tunnel"

# 3. Next.js rodando
curl -s http://localhost:3001 | head -1

# 4. Acesso externo funciona
curl --resolve 'hub.whatpro.com.br:443:104.16.0.1' -s -o /dev/null -w "%{http_code}" https://hub.whatpro.com.br
# Deve retornar: 200
```

---

**Última atualização**: 11/12/2025