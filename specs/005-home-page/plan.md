# Implementation Plan: Página inicial

**Branch**: `005-home-page` | **Date**: 2026-10-11 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/005-home-page/spec.md`

## Summary

Entregar o épico EP-FE-05 (FE-014 a FE-018) em `index.html`, reutilizando o cliente da API (002), o card, o estado de região e o aviso de configuração (003) e os tokens/estilos (004): (1) apresentação (título, frase, ilustração decorativa); (2) formulário de pesquisa rápida (`<form method="get" action="explorar.html">` com campo `q` limitado a 100 caracteres e três `<select>` nativos) cujo envio é interceptado apenas para montar um endereço limpo, sem valores padrão ou vazios; (3) opções de unidade e categoria carregadas de `/units/` e `/categories/` uma vez na abertura, com degradação para só "todas"; (4) seção "Próximas atividades" com `createRegionState` (3 esqueletos, vazio, erro com "Tentar novamente") alimentada por `GET /activities/?date_from=<hoje>&page_size=3`. A lógica pura (normalização do termo, janelas de período no fuso de São Paulo, montagem do endereço, filtragem defensiva de itens inválidos) fica em módulos pequenos e testáveis em `js/home/`, e `js/pages/home.js` só orquestra.

## Technical Context

**Language/Version**: HTML5, CSS3, JavaScript ES2022 (ES Modules); Node.js 20+ apenas para testes

**Primary Dependencies**: nenhuma em produção; dev: `vitest`, `jsdom`, `@playwright/test`, `@axe-core/playwright` (existentes)

**Storage**: N/A (sem cache, sem `localStorage`; estado só no DOM)

**Testing**: Vitest (critérios → endereço; períodos no fuso de São Paulo, incluindo virada de mês/ano e fuso do dispositivo diferente; carregamento das opções com `fake-fetch`; seção de próximas atividades por estado, anúncio único, foco inalterado, retry sem consultas duplicadas, resposta atrasada ignorada); Playwright com API simulada por `page.route` (fluxos das 6 histórias, nenhuma requisição durante digitação/seleção, Enter e clique, 320 px/200 %, `reducedMotion`, axe nos 4 estados); revisão manual com leitor de tela registrada em `quickstart.md`

**Target Platform**: navegadores modernos, arquivos estáticos

**Project Type**: web, frontend estático separado do backend Django

**Performance Goals**: indicador de carregamento em < 1 s; seção resolvida em < 3 s em conexão comum (SC-001); 3 requisições na abertura (atividades, unidades, categorias), disparadas em paralelo

**Constraints**: sem framework nem roteador; sem `innerHTML` com dados da API; nenhuma regra de negócio duplicada (ordem e publicação vêm da API); nenhum valor de cor/tamanho fora dos tokens; contrato da API inalterado; o formulário deve continuar válido sem JavaScript (envio nativo GET para `explorar.html`)

**Scale/Scope**: 1 página HTML alterada (`index.html`), 3 módulos novos em `js/home/`, 1 módulo de acesso à API (`js/api/public.js`), `js/pages/home.js` reescrito, ~1 bloco de CSS (hero, pesquisa, seção), 1 ilustração SVG, ~6 specs de teste novas

## Constitution Check

A constituição (`.specify/memory/constitution.md`) segue como modelo não preenchido; os gates vêm do DOC-09, DOC-12 §4, DOC-13 §6/§12, DOC-15 e das decisões das features 001–004:

- HTML/CSS/JS puros, ES Modules, sem framework (DOC-09): PASS
- Comunicação só pelo cliente da API existente, sem `fetch` direto nas páginas (feature 002): PASS (D2)
- Selecionar/digitar não dispara consulta; "Explorar" aplica (DOC-13 §6.1, FR-004): PASS (D3)
- Região de status única, foco inalterado, esqueleto oculto das tecnologias assistivas (DOC-13 §6.3/§12): PASS (D5, reuso de `createRegionState`)
- Falha isolada da seção, com retry sem dados antigos (DOC-13 §6.4): PASS (D5)
- Dados da API só via `textContent`/atributos (feature 003): PASS
- Apenas filtros suportados pela API; sem inventar parâmetros (DOC-13 §14): PASS (D4)
- Nada de regras de negócio divergentes do backend (ordem, publicação): PASS (D6)
- Tokens e estilos compartilhados, WCAG 2.2 AA, reflow 320 px, movimento reduzido (feature 004, DOC-15): PASS (D8)
- Fundamento sem JavaScript: formulário continua enviando por GET nativo: PASS (D3)

Reavaliação pós-design: sem violações. Sem entradas em Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/005-home-page/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── explore-url.md        # endereço de destino produzido pela Início
│   └── api-usage.md          # consultas que a Início faz e como trata cada resposta
├── checklists/requirements.md
└── tasks.md                  # gerado por /speckit-tasks
```

### Source Code (repository root)

```text
index.html                       # apresentação, formulário, seção de próximas atividades
js/
├── api/
│   └── public.js                # NOVO: fetchUpcomingActivities, fetchUnits, fetchCategories (usam request/createRequestScope)
├── home/
│   ├── search-criteria.js       # NOVO: normalizeTerm, PERIODS, periodRange(key, hoje), buildExploreUrl(criteria)
│   ├── filter-options.js        # NOVO: loadFilterOptions(), fillSelect(); falha → só "todas" + aviso
│   └── upcoming-activities.js   # NOVO: liga createRegionState + escopo de requisição + cards
└── pages/
    └── home.js                  # orquestra: nav, aviso de config, formulário, opções, próximas atividades
css/
├── layout.css                   # + .hero, .quick-search, .upcoming (usa tokens/breakpoints existentes)
└── components.css               # + estilos do formulário de pesquisa rápida e aviso das opções
images/
└── hero-culture.svg             # NOVO: ilustração decorativa própria (sem texto)

tests/
├── unit/
│   ├── search-criteria.test.js
│   ├── filter-options.test.js
│   ├── public-api.test.js
│   └── upcoming-activities.test.js
└── e2e/
    ├── home-search.spec.js
    ├── home-upcoming.spec.js
    └── home-accessibility.spec.js
```

**Structure Decision**: Mantém o frontend estático por página. Lógica sem DOM em `js/home/search-criteria.js` (testável em Node), efeitos de DOM isolados em `filter-options.js` e `upcoming-activities.js`, e a página só orquestra, no mesmo padrão `init()` das demais. `js/api/public.js` concentra os caminhos e parâmetros do contrato público para que Explorar e Detalhes (épicos 06 e 07) os reaproveitem.

## Complexity Tracking

Sem violações a justificar.
