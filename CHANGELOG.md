# Changelog

Visão geral das mudanças, melhorias e correções feitas no WhatPro Manager.

## [Unreleased] - 2026-02-20

### Corrigido
- **Geração de Pareamento (Paircode)**: Corrigida a exibição do código de pareamento do WhatsApp na tela da instância. A API estava retornando o formato JSON incorreto (`paircode` em vez de `code`), o que deixava o campo em branco no frontend. 
- **Exclusão de Instâncias no Provedor**: A opção "Excluir também do provider" voltou a funcionar. Ao deletar uma instância no painel, o Manager agora repassa o comando para o provedor (Evolution ou Uazapi) excluir a sessão lá também, liberando recursos e mantendo a consistência.
- **Gravação de Tokens da Evolution API**: Resolvido o problema em que o token de API (`apiToken`) ficava em branco ou incorreto ao criar novas instâncias para o provedor Evolution. O sistema agora compreende todos os formatos de resposta da Evolution API v2 para garantir que o token gerado automaticamente seja salvo corretamente no banco de dados.
- **Interface Desconfigurada (Wireframes)**: Corrigida a renderização de componentes da interface (como Menus Dropdown, Modais e Selects) que estavam aparecendo sem estilo ou causando erro 500. Os componentes visuais internos do painel foram reinstalados e reconfigurados adequadamente.
