# Checklist: Configuração do Webhook na Uazapi

## ✅ Verificações Concluídas

- ✅ Servidor Next.js rodando em `localhost:3001`
- ✅ Ngrok funcionando corretamente
- ✅ Webhook respondendo via ngrok
- ✅ CallReject habilitado na instância `whatpro_demo`

## 📋 Configuração na Uazapi

### 1. Acesse o Painel da Uazapi

Abra o painel administrativo da Uazapi onde você gerencia suas instâncias.

### 2. Localize a Instância `whatpro_demo`

- Procure pela instância com o nome `whatpro_demo`
- Ou pelo token que termina em `...0f7d`

### 3. Configure o Webhook

**URL do Webhook:**
```
https://nonreflectively-untradeable-damion.ngrok-free.dev/api/webhooks/uazapi/c4d3f378-20bb-4239-9381-0d5a11e00f7d
```

**Configurações Necessárias:**

| Campo | Valor |
|-------|-------|
| **URL** | `https://nonreflectively-untradeable-damion.ngrok-free.dev/api/webhooks/uazapi/c4d3f378-20bb-4239-9381-0d5a11e00f7d` |
| **Método** | `POST` |
| **Habilitado** | ✅ SIM |
| **Eventos** | ✅ `call` (OBRIGATÓRIO) |
| **Outros eventos** | `messages`, `messages.update` (opcional) |

### 4. Eventos que Devem Estar Marcados

**Obrigatório para CallReject:**
- ✅ `call` ou `voip`

**Recomendados (para funcionalidade completa):**
- ✅ `messages` - Mensagens recebidas
- ✅ `messages.update` - Status de mensagens
- ⚠️ `connection` - Status de conexão (opcional)

### 5. Salvar e Testar

1. **Salvar** a configuração do webhook
2. **Testar** fazendo uma chamada para o número da instância
3. **Verificar** se o webhook está recebendo eventos

---

## 🧪 Como Testar

### Teste 1: Verificar se Webhook Está Ativo

No painel da Uazapi, procure por:
- Status do webhook: **Ativo** ✅
- Últimas requisições: Deve mostrar tentativas de envio
- Código de resposta: **200 OK** ✅

### Teste 2: Fazer Chamada Real

1. **Ligue** para o número da instância `whatpro_demo`
2. **Observe:**
   - A chamada deve ser **rejeitada automaticamente**
   - Você deve receber mensagens de auto-reply (se configuradas)

### Teste 3: Verificar Logs

**No terminal do servidor:**
```bash
# Você deve ver logs como:
[UazapiWebhook] Recebido: { instanceToken: 'c4d3f378...', eventType: 'call' }
[UazapiWebhook] Evento classificado: CALL_EVENT
[UazapiWebhook] CALL_EVENT recebida de: 5511999999999@c.us
[UazapiWebhook] CallReject habilitado, rejeitando chamada
[WhatsAppProviderService] Rejeitando chamada...
[UazapiWebhook] Chamada rejeitada com sucesso
```

**No painel do ngrok:**
```
POST /api/webhooks/uazapi/c4d3f378... 200 OK
```

---

## ⚠️ Problemas Comuns

### Webhook não recebe eventos

**Possíveis causas:**
1. ❌ URL incorreta na Uazapi
2. ❌ Evento `call` não está marcado
3. ❌ Webhook está desabilitado
4. ❌ Ngrok parou de funcionar

**Solução:**
- Verifique a URL (copie e cole novamente)
- Marque o evento `call`
- Habilite o webhook
- Reinicie o ngrok se necessário

### Webhook retorna erro 404

**Causa:** Token incorreto na URL

**Solução:** Use o token completo:
```
c4d3f378-20bb-4239-9381-0d5a11e00f7d
```

### Chamada não é rejeitada

**Possíveis causas:**
1. ❌ Uazapi não está enviando eventos
2. ❌ Webhook não está configurado corretamente
3. ❌ CallReject não está habilitado

**Solução:**
- Verifique os logs da Uazapi
- Teste o webhook manualmente (use o script)
- Verifique a configuração do behavior

---

## 🔍 Formato do Evento Esperado

A Uazapi deve enviar eventos neste formato:

```json
{
  "EventType": "call",
  "instance": {
    "id": "whatpro_demo",
    "token": "c4d3f378-20bb-4239-9381-0d5a11e00f7d"
  },
  "data": {
    "id": "CALL_123456",
    "from": "5511999999999@c.us",
    "timestamp": 1702123456789,
    "status": "ringing",
    "isGroup": false,
    "isVideo": false
  }
}
```

**Campos importantes:**
- `EventType`: Deve ser `"call"` ou `"voip"`
- `data.from`: Número que está ligando (formato WhatsApp com `@c.us`)
- `data.id`: ID único da chamada

---

## 📊 Comandos Úteis

```bash
# Testar webhook via ngrok
cd whatpro_manager
node scripts/test-ngrok.js https://nonreflectively-untradeable-damion.ngrok-free.dev

# Verificar configuração
npx tsx scripts/check-callreject.ts

# Monitorar logs em tempo real
tail -f .next/server/app/api/webhooks/uazapi/\[instanceToken\]/route.js
```

---

## ✅ Checklist Final

Antes de fazer a chamada de teste, verifique:

- [ ] Ngrok está rodando (`ngrok http 3001`)
- [ ] Servidor Next.js está rodando (`npm run dev`)
- [ ] URL do webhook está correta na Uazapi
- [ ] Evento `call` está marcado
- [ ] Webhook está habilitado
- [ ] CallReject está habilitado no behavior da instância

Se todos os itens estiverem ✅, faça a chamada de teste!

---

**Última atualização:** 09/12/2025 14:51
