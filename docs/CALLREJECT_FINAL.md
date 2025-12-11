# ✅ CallReject - Configuração Final

## 🎉 Status: TUDO PRONTO!

### ✅ Verificações Concluídas:

1. ✅ **Servidor Next.js:** Rodando em `localhost:3001`
2. ✅ **Ngrok:** Rodando e acessível
3. ✅ **Webhook:** Respondendo corretamente (`200 OK`)
4. ✅ **CallReject:** Habilitado na instância `whatpro_demo`
5. ✅ **Auto-reply:** Habilitado

---

## 📋 ÚLTIMA ETAPA: Configurar na Uazapi

### URL do Webhook (COPIE EXATAMENTE):

```
https://nonreflectively-untradeable-damion.ngrok-free.dev/api/webhooks/uazapi/c4d3f378-20bb-4239-9381-0d5a11e00f7d
```

### Passos na Uazapi:

1. **Acesse o painel da Uazapi**
2. **Localize a instância `whatpro_demo`**
3. **Vá em "Webhook" ou "Configurações"**
4. **Cole a URL acima**
5. **Marque o evento:** ✅ `call`
6. **Habilite o webhook:** ✅ Ativo
7. **Salve**

---

## 🧪 TESTE AGORA!

### Passo 1: Fazer Chamada

Ligue para o número da instância `whatpro_demo`

### Passo 2: O Que Deve Acontecer

- ✅ A chamada deve ser **rejeitada automaticamente**
- ✅ Você deve receber mensagens de auto-reply (se configuradas)

### Passo 3: Verificar Logs

Abra um novo terminal e rode:

```bash
# Ver logs do servidor
tail -f /Users/playsuporte/Documents/DEV-WHATPRO/ParoquiaDev/Whatpro_manager/.next/server/app/api/webhooks/uazapi/\[instanceToken\]/route.js
```

**Ou simplesmente observe o terminal onde `npm run dev` está rodando.**

Você deve ver logs como:

```
[UazapiWebhook] Recebido: { instanceToken: 'c4d3f378...', eventType: 'call' }
[UazapiWebhook] Evento classificado: CALL_EVENT
[UazapiWebhook] CALL_EVENT recebida de: 5511999999999@c.us
[UazapiWebhook] CallReject habilitado, rejeitando chamada
[UazapiWebhook] Chamada rejeitada com sucesso
```

---

## 🔍 Verificar no Painel do ngrok

Acesse: http://localhost:4041

Você verá todas as requisições HTTP que chegam ao webhook.

Quando fizer a chamada, deve aparecer:

```
POST /api/webhooks/uazapi/c4d3f378... 200 OK
```

---

## ⚠️ Se Não Funcionar

### Problema: Chamada não é rejeitada

**Verifique:**

1. **Webhook configurado na Uazapi?**
   - URL correta? ✅
   - Evento `call` marcado? ✅
   - Webhook habilitado? ✅

2. **Uazapi está enviando eventos?**
   - Verifique os logs da Uazapi
   - Procure por tentativas de envio ao webhook

3. **Ngrok está acessível?**
   ```bash
   # Teste:
   curl https://nonreflectively-untradeable-damion.ngrok-free.dev/api/health
   ```

### Problema: Webhook retorna erro

**Verifique os logs do servidor** para ver o erro específico.

---

## 📊 Comandos Úteis

```bash
# Testar webhook manualmente
node scripts/test-ngrok.js https://nonreflectively-untradeable-damion.ngrok-free.dev

# Ver status do ngrok
curl http://localhost:4041/api/tunnels

# Verificar configuração
npx tsx scripts/check-callreject.ts
```

---

## 🎯 Checklist Final

Antes de fazer a chamada de teste:

- [x] Ngrok rodando
- [x] Servidor Next.js rodando
- [x] Webhook testado e funcionando
- [x] CallReject habilitado
- [ ] **URL configurada na Uazapi** ⬅️ FAÇA ISSO AGORA
- [ ] **Evento `call` marcado na Uazapi** ⬅️ FAÇA ISSO AGORA
- [ ] **Webhook habilitado na Uazapi** ⬅️ FAÇA ISSO AGORA

---

## 📞 FAÇA O TESTE!

Depois de configurar na Uazapi:

1. **Ligue** para o número da instância
2. **Observe** os logs
3. **Confirme** que a chamada foi rejeitada

---

**Última atualização:** 09/12/2025 14:54

**Próximo passo:** Configure na Uazapi e teste! 🚀
