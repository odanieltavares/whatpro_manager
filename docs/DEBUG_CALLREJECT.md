# Guia de Debug do CallReject

## ✅ Status Atual

### Configuração Verificada:
- ✅ Instância `whatpro_demo` encontrada
- ✅ Status: `connected`
- ✅ Provider: `UAZAPI`
- ✅ `autoRejectCalls`: **HABILITADO**
- ✅ `autoReplyCallsEnabled`: **HABILITADO**
- ✅ Webhook funcionando localmente

### Token da Instância:
```
c4d3f378-20bb-4239-9381-0d5a11e00f7d
```

### URL do Webhook:
```
http://localhost:3001/api/webhooks/uazapi/c4d3f378-20bb-4239-9381-0d5a11e00f7d
```

---

## 🔍 Problema Identificado

O CallReject **ESTÁ IMPLEMENTADO E FUNCIONANDO**, mas há um problema:

**Se você está rodando localmente (`localhost:3001`), a Uazapi NÃO CONSEGUE acessar o webhook!**

A Uazapi precisa enviar eventos HTTP para o seu servidor, mas `localhost` só é acessível na sua máquina.

---

## 🛠️ Soluções

### Opção 1: Usar ngrok (Recomendado para Testes)

1. **Instalar ngrok:**
   ```bash
   brew install ngrok
   # ou baixe de https://ngrok.com/download
   ```

2. **Criar túnel:**
   ```bash
   ngrok http 3001
   ```

3. **Copiar a URL gerada** (exemplo: `https://abc123.ngrok.io`)

4. **Configurar na Uazapi:**
   - Acesse o painel da Uazapi
   - Vá em configurações de webhook da instância `whatpro_demo`
   - Cole a URL: `https://abc123.ngrok.io/api/webhooks/uazapi/c4d3f378-20bb-4239-9381-0d5a11e00f7d`
   - Marque o evento `call`
   - Salve

5. **Testar:**
   - Faça uma chamada para o número da instância
   - Verifique os logs do ngrok e do servidor

### Opção 2: Deploy em Servidor Acessível

1. **Fazer deploy em servidor com IP público** (VPS, cloud, etc.)
2. **Configurar webhook na Uazapi** com a URL pública
3. **Testar**

### Opção 3: Testar Localmente (Simulação)

Use o script que criei para simular eventos:

```bash
node scripts/test-webhook-call.js c4d3f378-20bb-4239-9381-0d5a11e00f7d
```

**Resultado esperado:**
```
✅ Status: 200 OK
📦 Resposta: { "success": true }
🎉 Webhook respondeu com sucesso!
```

---

## 📊 Como Verificar se Está Funcionando

### 1. Verificar Logs do Servidor

Quando uma chamada chega, você deve ver:

```
[UazapiWebhook] Recebido: { instanceToken: 'c4d3f378...', eventType: 'call' }
[UazapiWebhook] Evento classificado: CALL_EVENT
[UazapiWebhook] CALL_EVENT recebida de: 5511999999999@c.us
[UazapiWebhook] CallReject habilitado, rejeitando chamada
[WhatsAppProviderService] Rejeitando chamada...
[UazapiWebhook] Chamada rejeitada com sucesso
```

### 2. Verificar na Uazapi

- Acesse o painel da Uazapi
- Vá em "Webhooks" ou "Logs"
- Verifique se os eventos estão sendo enviados
- Status deve ser `200 OK`

### 3. Testar Chamada Real

1. **Com ngrok rodando:**
   - Ligue para o número da instância
   - A chamada deve ser rejeitada automaticamente
   - Você deve receber mensagens de auto-reply (se configuradas)

2. **Verificar logs em tempo real:**
   ```bash
   # Terminal 1: Servidor
   npm run dev
   
   # Terminal 2: ngrok
   ngrok http 3001
   
   # Terminal 3: Fazer chamada e observar
   ```

---

## 🐛 Troubleshooting

### Webhook retorna "Instance not found"
- ✅ **Resolvido:** Use o token completo `c4d3f378-20bb-4239-9381-0d5a11e00f7d`

### Webhook retorna "action": "discarded"
- ✅ **Resolvido:** Use `EventType: 'call'` no payload

### Chamada não é rejeitada
- ⚠️ Verifique se a Uazapi está enviando eventos
- ⚠️ Verifique se o webhook está acessível (use ngrok)
- ⚠️ Verifique os logs do servidor

### Auto-reply não funciona
- ⚠️ Funcionalidade ainda não implementada (TODO na linha 420-430)
- ⚠️ Mensagens são logadas mas não enviadas

---

## 📝 Formato do Evento Esperado

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

---

## ✅ Próximos Passos

1. **Configurar ngrok** para expor localhost
2. **Atualizar webhook na Uazapi** com URL do ngrok
3. **Fazer chamada de teste**
4. **Verificar logs** para confirmar rejeição
5. **Implementar auto-reply com delay** (se necessário)

---

## 🎯 Comandos Úteis

```bash
# Verificar configuração
npx tsx scripts/check-callreject.ts

# Testar webhook localmente
node scripts/test-webhook-call.js c4d3f378-20bb-4239-9381-0d5a11e00f7d

# Iniciar ngrok
ngrok http 3001

# Ver logs em tempo real
tail -f .next/server/app/api/webhooks/uazapi/\[instanceToken\]/route.js
```

---

**Última atualização:** 09/12/2025 14:40
