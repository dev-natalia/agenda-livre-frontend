# Quickstart: validar o filtro por público-alvo

Pré-requisitos: `npm install`; backend em execução com o catálogo de públicos carregado (`seed_catalog`) e `PUBLIC_CONFIG.apiBaseUrl` apontando para ele (ver README).

## Automatizado

- `npm test`: unitários (url-state, search-form, filter-options, card, snapshot, public).
- `npm run test:e2e` e `npm run test:a11y`: fluxos e acessibilidade da Explorar.
- `npm run test:contract`: contra a API real (`/audiences/`, `?audience=` e `target_audiences`).

## Manual (Explorar)

1. Abrir `explorar.html`: o filtro "Público-alvo" lista "Todos os públicos" e os públicos da API.
2. Escolher "Adultos" e acionar "Filtrar": aparecem atividades de Adultos e de "Todas as idades"; URL com `audience=<uuid>`; página 1.
3. Copiar a URL em outra aba: campo preenchido e mesma lista.
4. Combinar com unidade, categoria e período: os resultados atendem a todos os critérios.
5. Abrir `explorar.html?audience=abc`: valor ignorado, URL reescrita, lista geral.
6. Bloquear `/audiences/` (DevTools): aviso exibido e demais filtros funcionando.
7. "Limpar filtros": público volta a "Todos os públicos" e a URL fica limpa.
8. Cards mostram o público; atividade sem público não mostra a linha. Conferir em 320 px e só com teclado.
