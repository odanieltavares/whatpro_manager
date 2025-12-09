# Flowchart — Fluxo Alto Nível

```mermaid
flowchart LR
  subgraph Provider["Provider WA (Uazapi/Evolution)"]
    WH[Webhook Event]
    ST[Status/Typing/Media]
  end

  subgraph Hub["Hub API (Next API / futuro Nest)"]
    WH -->|POST /webhooks/:provider/:instanceToken| VR[Valida token/tenant]
    VR --> CL[Classifica evento]
    CL --> Q[Enfileira Redis por contato]
    CL --> CFG[Cache/Config instância]
    Q --> WK[Worker]
    WK --> DLQ[Retry/DLQ]
  end

  subgraph Chatwoot["Chatwoot"]
    CW_IN[Inbound Messages]
    CW_OUT[Outbound via API]
  end

  subgraph Manager["WhatPro Manager (UI)"]
    UI[Instâncias/Status/Execuções]
  end

  ST --> VR
  WK -->|Entrega| CW_IN
  CW_OUT -->|API /cw_to_wa queue| Q
  UI -->|REST/gRPC| Hub
```

Notas:
- Filas em Redis isoladas por tenant+inbox+contato; locks para ordem.
- Retry limitado + DLQ com visibilidade e limpeza de fila.
- Tokens de instância só no Hub; Manager nunca recebe.
