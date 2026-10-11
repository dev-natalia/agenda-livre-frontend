# Implementation Plan: Exploração de atividades

**Branch**: `006-activity-exploration` | **Date**: 2026-10-11 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/006-activity-exploration/spec.md`

## Summary

Entregar o épico EP-FE-06 (FE-019 a FE-026) em `explorar.html`, reutilizando o cliente da API e o escopo de requisição (002), o card, o `createRegionState` e o aviso de configuração (003), os tokens e estilos (004) e os módulos de critérios e opções de filtro da Início (005): (1) formulário de pesquisa (`<form method="get">` com `q` limitado a 100 caracteres, três `<select>` nativos, "Filtrar" e "Limpar filtros"), válido sem JavaScript; (2) **estado na URL** como fonte da verdade: `js/explore/url-state.js` converte `URLSearchParams` em critérios normalizados (e o inverso), e cada aplicação, limpeza ou troca de página faz `history.pushState` e consulta `GET /activities/?…&page=N&page_size=12`, enquanto `popstate` relê o endereço; (3) resultados em `createRegionState` (esqueletos, vazio, erro com "Tentar novamente") e uma única região de status que anuncia carregamento, total ("N atividades encontradas") e vazio/erro; (4) componente novo de paginação com **links reais** (`?…&page=N`), `aria-current="page"`, anterior/próxima indisponíveis e janela de números para caber em 320 px; (5) página fora do intervalo (`400` do backend hoje, `404` pelo contrato) volta à página 1 com `replaceState`; (6) retorno dos detalhes: cópia dos resultados e da rolagem em `sessionStorage` com validade de 5 minutos, usada em `back_forward` e em `popstate`, sempre com reconstrução a partir do endereço quando ausente ou vencida. Lógica sem DOM fica em módulos pequenos e testáveis em `js/explore/`; `js/pages/explore.js` só orquestra.

## Technical Context

**Language/Version**: HTML5, CSS3, JavaScript ES2022 (ES Modules); Node.js 20+ apenas para testes

**Primary Dependencies**: nenhuma em produção; dev: `vitest`, `jsdom`, `@playwright/test`, `@axe-core/playwright` (existentes)

**Storage**: `sessionStorage` somente para a cópia de resultados e rolagem do retorno (FE-025), em `try/catch`, com validade de 5 minutos e no máximo 10 entradas; a página funciona sem ele. Sem `localStorage`

**Testing**: Vitest (endereço ⇄ critérios com normalização, períodos e fuso de São Paulo; janela de números da paginação; parâmetros enviados à API; cópia de retorno com validade; listagem por estado com `fake-fetch`: esqueleto, vazio, erro, retry sem consultas duplicadas, resposta atrasada ignorada, total só quando confiável, página fora do intervalo); Playwright com API simulada por `page.route` (fluxos das 6 histórias, nenhuma requisição ao digitar/selecionar, histórico voltar/avançar, ida aos detalhes e volta, 320 px/200 %, `reducedMotion`, axe nos estados); revisão manual com leitor de tela registrada em `quickstart.md`

**Target Platform**: navegadores modernos, arquivos estáticos

**Project Type**: web, frontend estático separado do backend Django

**Performance Goals**: listagem e total atualizados em < 2 s após a resposta (SC-004); 3 requisições na abertura (atividades, unidades, categorias) em paralelo; troca de página/filtro = 1 requisição; retorno dos detalhes com cópia válida = 0 requisições bloqueantes

**Constraints**: sem framework nem roteador; sem `innerHTML` com dados da API; nenhuma regra de negócio duplicada (ordem, publicação e total vêm da API); nenhum valor de cor/tamanho fora dos tokens; contrato da API inalterado; formulário e paginação válidos sem JavaScript (GET nativo e links reais); nenhum envio de valor que a API recusaria (`400`)

**Scale/Scope**: 1 página HTML alterada (`explorar.html`), 5 módulos novos em `js/explore/`, 1 componente novo (`js/components/pagination.js`), `js/api/public.js` ampliado (1 função), `js/pages/explore.js` reescrito, bloco de CSS (barra de filtros, resumo, paginação), ~7 specs de teste novas

## Constitution Check

A constituição (`.specify/memory/constitution.md`) segue como modelo não preenchido; os gates vêm do DOC-09, DOC-12 §5, DOC-13 §7/§12, DOC-15 e das decisões das features 001–005:

- HTML/CSS/JS puros, ES Modules, sem framework nem roteador JavaScript próprio (DOC-09): PASS (D1, D3: histórico nativo)
- Comunicação só pelo cliente da API existente (feature 002): PASS (D2)
- Selecionar/digitar não consulta; "Filtrar" aplica; resultados atuais ficam visíveis até aplicar (DOC-13 §7.1): PASS (D4)
- Estado de filtros e página na URL, parâmetros inválidos normalizados (DOC-09 §9.1): PASS (D3)
- Só filtros suportados pela API; nada de `neighborhood` fora do backlog (DOC-13 §14): PASS (D2)
- Ordem e total vêm da API; sem recálculo no navegador (DOC-09 §8.4): PASS (D6, D7)
- Paginação real do contrato, sem simular páginas (DOC-13 §7.3): PASS (D7, D8)
- Região de status única, foco previsível, esqueleto oculto das tecnologias assistivas (DOC-13 §7.2/§12): PASS (D5, D9)
- Resposta antiga nunca sobrescreve a recente (DOC-09 §8.5): PASS (D10)
- Dados da API só via `textContent`/atributos (feature 003): PASS
- Tokens e estilos compartilhados, WCAG 2.2 AA, reflow 320 px, movimento reduzido (feature 004, DOC-15): PASS (D11)
- Fundamento sem JavaScript: formulário GET e links de página reais: PASS (D12)

Reavaliação pós-design: sem violações. Sem entradas em Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/006-activity-exploration/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── explore-url.md        # endereço da Explorar: leitura, normalização e escrita
│   └── api-usage.md          # consultas da Explorar e tratamento de cada resposta
├── checklists/requirements.md
└── tasks.md                  # gerado por /speckit-tasks
```

### Source Code (repository root)

```text
explorar.html                    # título, formulário de pesquisa, resumo, resultados, paginação
js/
├── api/
│   └── public.js                # + fetchActivities({ criteria, page, scope }) (page_size 12)
├── explore/
│   ├── url-state.js             # NOVO: parseExploreSearch, buildExploreSearch, toApiParams, inferPeriod
│   ├── search-form.js           # NOVO: rascunho do formulário, aplicar/limpar, opções de filtro e conciliação com o endereço
│   ├── listing.js               # NOVO: consulta + createRegionState + resumo + paginação (sem mover foco)
│   ├── snapshot.js              # NOVO: cópia dos resultados/rolagem em sessionStorage (validade 5 min)
│   └── pagination-model.js      # NOVO: pageItems(current, total) → janela de números (pura)
├── components/
│   └── pagination.js            # NOVO: renderPagination(nav, model, hrefFor) com links reais
├── home/                        # REUSO: normalizeTerm, MAX_TERM_LENGTH, PERIODS, periodRange, fillSelect, initFilterOptions
└── pages/
    └── explore.js               # orquestra: nav, aviso de config, formulário, opções, histórico, listagem
css/
├── layout.css                   # + .explore-filters (barra horizontal → coluna), .results-summary
└── components.css               # + .pagination (links, atual, indisponível)

tests/
├── unit/
│   ├── explore-url-state.test.js
│   ├── pagination-model.test.js
│   ├── pagination.test.js
│   ├── explore-snapshot.test.js
│   ├── explore-listing.test.js
│   ├── explore-listing-states.test.js
│   ├── explore-search-form.test.js
│   └── public-api.test.js       # + fetchActivities
└── e2e/
    ├── explore-search.spec.js
    ├── explore-pagination.spec.js
    ├── explore-states.spec.js
    ├── explore-return.spec.js
    └── explore-accessibility.spec.js
```

**Structure Decision**: Mantém o frontend estático por página. Lógica sem DOM em `url-state.js` e `pagination-model.js` (testáveis em Node); efeitos de DOM isolados em `listing.js`, `pagination.js` e `snapshot.js`; a página só orquestra, no padrão `init()` das demais. Os módulos de critérios e opções da Início são reutilizados no lugar (`js/home/`), sem mover arquivos, para não ampliar o diff da feature 005 ainda em revisão; uma extração para `js/shared/` fica como refatoração posterior se uma terceira página precisar deles.

## Complexity Tracking

Sem violações a justificar.
