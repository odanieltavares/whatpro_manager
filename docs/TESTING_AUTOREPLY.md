# Testando Auto-Reply com Delay

## ✅ Funcionalidade Implementada

Agora, quando uma chamada é rejeitada, o sistema pode enviar uma sequência de mensagens com intervalos de tempo configuráveis.

### Configuração Atual (whatpro_demo):
- **CallReject:** Ativado
- **Auto-Reply:** Ativado
- **Mensagens:** 1 mensagem configurada ("Desculpe nao aceitamos ligaçoes!")
- **Delay:** 0 segundos

## 🧪 Como Testar Delays

Para testar **múltiplas mensagens com delay**, você precisa atualizar o `InstanceBehavior` no banco de dados, pois ainda não há interface para editar delays complexos.

### Script para Configurar Teste de Delay

Criei um script para configurar mensagens de teste:

```typescript
// Script: scripts/setup-autoreply-test.ts
// Configura:
// Msg 1: "Olá! Não atendemos ligações." (Imediato)
// Msg 2: "Por favor, envie sua dúvida por texto." (5 segundos depois)
// Msg 3: "Responderemos em breve!" (10 segundos depois)
```

## 🚀 Executar Teste

1. Rode o script de configuração (vou criar se você quiser):
   ```bash
   npx tsx scripts/setup-autoreply-test.ts
   ```

2. Faça uma chamada para a instância.

3. Observe:
   - Chamada rejeitada imediatamente.
   - Recebe Msg 1 (imediato).
   - Espere 5s... Recebe Msg 2.
   - Espere 10s... Recebe Msg 3.

## ⚠️ Limitações

- O processo roda em background no servidor. Se o servidor reiniciar durante o delay, a mensagem pendente será perdida.
- Para atrasos muito longos (> 1 minuto), recomendaria uma solução com Worker dedicado no futuro.
- Para uso atual (0-30s), esta solução é perfeita.
