# Dev Log: Detalhamento Técnico das Correções

Este documento registra a fundo os desafios técnicos encontrados e as soluções arquiteturais implementadas durante o ciclo de depuração e desenvolvimento.

## 2026-02-20: Correções de APIs e Provedores

### 1. Desajuste no Contrato de Geração de Paircode
**Problema:** O componente React `PaircodeGenerator` no frontend esperava que o endpoint `/api/instances/[id]/paircode` retornasse um objeto com a propriedade `code`, de acordo com a interface TypeScript estrita `PaircodeResponse`. No entanto, a lógica dentro de `app/api/instances/[id]/paircode/route.ts` extraía os dados do provedor (qualquer que fosse o provedor) e os remontava de forma inconsistente, empacotando o código na propriedade `paircode`. Isso causava falha silenciosa no client-side (valor `undefined`).

**Resolução:** Foi feita uma modificação no wrapper da API do backend. Adicionamos a propriedade correta `code: pairData.code` contendo os 8 dígitos, compatibilizando a comunicação entre a interface TypeScript do `lib/api/types` e a implementação do Next.js route handler.

### 2. Deleção Órfã de Instâncias (DeleteFromApi)
**Problema:** Usuários reportaram que excluir uma instância no Manager marcando a caixa de seleção "Excluir também do provider" não produzia efeito na API do WhatsApp. 

**Resolução:** Identificou-se que a caixa de seleção no componente `<DeleteInstanceDialog>` emitia o boolean `deleteFromApi` corretamente em seus callbacks `onConfirm`, mas as chamadas para `instancesApi.delete` em `app/instances/page.tsx` e `app/instances/[id]/page.tsx` omitiam o envio desse argumento. Atualizou-se o wrapper Axios em `lib/api/endpoints/instances.ts` para suportar queries opcionais e inseriu-se o parâmetro via query string (`?deleteFromApi=true`), fechando o circuito desde o form do React até a interceptação no backend `DELETE /api/instances/[id]`.

### 3. Variação Estrutural na Resposta da Evolution API v2 (Tokens)
**Problema:** Ao criar uma instância Evolution, o painel do WhatPro Manager deveria salvar o token de autenticação gerado pelo provedor. Contudo, em algumas versões da Evolution v2, a API não retorna a chave sob o objeto padrão (`instance.token`), mas sim em um header ou hash externo. Documentações antigas mostravam que isso seria retornado estruturado (`hash: { apikey: "..." }`), mas a versão atual em execução devolvia o hash como uma simples *flat string* (`hash: "61255F8A..."`). Isso levava o Manager a salvar uma string vazia e usar o falback (nome da instância) como token corrompendo as autenticações subsequentes.

**Resolução:** Modificou-se o arquivo `lib/providers/evolution.provider.ts`. Implementou-se uma heurística resiliente de tipagem dinâmica: o código agora verifica o tipo primitivo retornado pela call `fetch()`. Se for *string* em `data.hash`, assume-se ser o token. Caso contrário, faz *chaining fallback* consultando `data.hash?.apikey`, `data.instance?.token` ou `data.apikey`. Isso garantiu compatibilidade irrestrita com a Evolution v1 e v2.

### 4. Componentes UI Ausentes e Erros de Renderização (Wireframes)
**Problema:** A interface do painel em páginas chave (como em `/instances`) estava aparecendo de forma "crua", semelhante a um *wireframe* sem estilos CSS, e algumas rotas quebravam com Erro 500 Interno. Isso ocorria porque os componentes da biblioteca **Shadcn UI** (como `<Dialog>`, `<Select>`, `<DropdownMenu>`) dependiam de arquivos locais no diretório `components/ui/` que estavam ausentes ou corrompidos, fazendo com que o React não conseguisse importar e montar a árvore do DOM com os estilos do TailwindCSS corretamente.

**Resolução:** Foi necessário auditar as dependências de UI injetadas no projeto e re-inicializar a configuração do Shadcn usando seu respectivo CLI. Instalamos novamente os componentes visuais faltantes para popular a pasta `components/ui/` com as implementações base do Radix UI exigidas, além de assegurar que as classes tailwind correspondentes estavam corretas no `tailwind.config.ts`. As importações em páginas essenciais como `app/instances/page.tsx` foram corrigidas, restabelecendo a aparência limpa e funcional do painel.
