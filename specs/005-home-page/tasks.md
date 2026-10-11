---

description: "Task list for feature 005 - Página inicial"
---

# Tasks: Página inicial

**Input**: Design documents from `/specs/005-home-page/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/explore-url.md, contracts/api-usage.md, quickstart.md

**Tests**: Incluídos (DOC-14, padrão das features 002–004): Vitest para lógica pura e orquestração com DOM (jsdom); Playwright com a API simulada por `page.route` para os fluxos e a acessibilidade (axe). Escreva cada teste antes da implementação correspondente e confirme que falha.

**Organization**: Tarefas agrupadas por user story. Caminhos relativos à raiz do repositório (o próprio frontend). Reutilize, sem alterar o comportamento: `js/api/client.js`, `js/api/errors.js`, `js/components/activity-card.js`, `js/components/region-state.js`, `js/components/error-state.js`, `js/components/config-notice.js`, `js/components/site-nav.js` e os tokens/estilos da feature 004. Dados da API só via `textContent`/atributos, nunca `innerHTML`. Nenhum valor literal de cor, fonte, espaçamento ou duração fora de `css/tokens.css` (há teste que verifica).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[Story]**: US1 = ver próximas atividades (P1), US2 = entender o carregamento (P1), US3 = pesquisar por nome (P1), US4 = filtros rápidos (P2), US5 = recuperar falha (P1), US6 = apresentação (P2)

---

## Phase 1: Setup

**Purpose**: Utilitários de teste e recursos usados por várias histórias

- [X] T001 [P] Criar `tests/e2e/helpers/mock-api.js` exportando `mockApi(page, { activities, units, categories, delayMs, failActivities })` que (a) sobrescreve `apiBaseUrl` de `js/config.js` para `http://localhost:8000/api/v1` com `page.route("**/js/config.js", …)` (padrão de `tests/e2e/api-error-retry.spec.js`), (b) responde `GET **/api/v1/activities/**`, `/units/**` e `/categories/**` com o envelope `{count,next,previous,results}` e (c) devolve um contador `requests` com `{path, search}` de cada chamada, para provar zero consultas durante digitação e seleção; incluir fábrica `makeActivity(n, overrides)` no formato de `contracts/api-usage.md`
- [X] T002 [P] Criar `tests/unit/helpers/dom.js` com `mountHomeDom()` que monta em jsdom o trecho de `index.html` (formulário, selects, regiões de status e conteúdo da seção) usando a mesma estrutura definida em T005, para os testes unitários de orquestração
- [X] T003 [P] Criar `images/hero-culture.svg`: ilustração decorativa própria (formas geométricas na paleta de `css/tokens.css`, sem texto, `viewBox` fixo, peso < 10 KB, sem scripts nem recursos externos)

---

## Phase 2: Foundational (bloqueia todas as histórias)

**Purpose**: Acesso à API, estrutura HTML e estilos base; todas as histórias dependem destes

- [X] T004 [P] Escrever `tests/unit/public-api.test.js` (deve falhar) com `fake-fetch`: `fetchUpcomingActivities` chama `/activities/` com `date_from=<hoje>` e `page_size=3`; `fetchUnits` e `fetchCategories` chamam `/units/` e `/categories/` com `page_size=50`; o dia de "hoje" vem do fuso `America/Sao_Paulo` (testar às 02:30 UTC e às 12:00 UTC); todas aceitam `signal`/escopo e propagam `ApiError` (`404`, `429`, `500`, rede, tempo esgotado, JSON inválido)
- [X] T005 Atualizar `index.html` (dentro de `<main id="main-content" tabindex="-1">`, mantendo cabeçalho, skip link, rodapé e `<script type="module" src="js/pages/home.js">`): `<section class="hero">` com `<h1>` "Descubra novas maneiras de aprender, se divertir e participar!", parágrafo de apoio e `<img class="hero__image" src="images/hero-culture.svg" alt="" width height>`; `<section class="quick-search" aria-labelledby="quick-search-title">` com `<h2 id="quick-search-title">O que você procura?</h2>` e `<form id="quick-search-form" action="explorar.html" method="get">` contendo `label`+`input type="search" name="q" maxlength="100"`, três `label`+`select` (`name="unit"`, `name="category"`, `name="period"`) já com as opções fixas "Todas as unidades", "Todas as categorias" (valor vazio) e "Qualquer data", "Hoje", "Próximos 7 dias", "Este mês" (valores `any`, `today`, `week`, `month`), botão `<button type="submit">Explorar</button>` e `<p id="filter-options-status" class="visually-hidden" role="status">`; `<section class="upcoming" aria-labelledby="upcoming-title">` com `<h2 id="upcoming-title">Próximas atividades</h2>`, `<p>Confira o que está acontecendo nos CEUs!</p>`, link `<a href="explorar.html">Ver todas</a>`, `<div id="upcoming-status" role="status" aria-live="polite" class="visually-hidden">` e `<div id="upcoming-content" class="card-grid">`; manter o `<h1>` único e a ordem hero → pesquisa → próximas
- [X] T006 Implementar `js/api/public.js` para passar T004: `fetchUpcomingActivities({scope})`, `fetchUnits({scope})`, `fetchCategories({scope})` sobre `request`/`createRequestScope` de `js/api/client.js`; helper interno `todayInSaoPaulo()` (`Intl.DateTimeFormat("en-CA", {timeZone: "America/Sao_Paulo"})`) exportado para reuso em US3/US4
- [X] T007 [P] Acrescentar a `css/layout.css` os blocos `.hero`, `.quick-search` e `.upcoming` mobile-first usando só tokens e os pontos de quebra de `contracts/layout-breakpoints.md` da feature 004 (40/48/64 rem): hero em coluna no celular e duas colunas (texto + imagem) a partir de 48 rem; imagem com `max-width: 100%` e `height: auto`; formulário em coluna no celular e em linha (campo largo, três selects e botão) a partir de 48 rem; cabeçalho da seção com título e "Ver todas" lado a lado quando couber, empilhados quando não
- [X] T008 [P] Acrescentar a `css/components.css` estilos do formulário de pesquisa rápida e do link "Ver todas" reaproveitando os estilos existentes de `label`, `input`, `select` e `.button`; botão "Explorar" com a variante primária; alvos ≥ `--target-min`; nenhum valor literal fora de `var(--…)`

**Checkpoint**: `npm test` verde para `public-api`; `index.html` abre em 320 px sem rolagem horizontal, ainda sem comportamento.

---

## Phase 3: User Story 1 - Descobrir próximas atividades (Priority: P1) 🎯 MVP

**Goal**: Ao abrir a página, até 3 cards de próximas atividades em ordem, com link aos detalhes e "Ver todas", e estado vazio quando não houver nenhuma.

**Independent Test**: Com a API simulada devolvendo 3, 2 e 0 atividades, conferir cards, ordem, links diretos, fallback de imagem, "Ver todas" e mensagem de vazio (sem tratar como erro).

### Tests for User Story 1

- [X] T009 [P] [US1] Escrever `tests/unit/upcoming-activities.test.js` (deve falhar), bloco "sucesso e vazio": 3 itens → 3 cards na ordem recebida, `h3` por card, link `atividade.html?id=<id>`, fallback de imagem; 2 itens → só 2 cards, sem espaços reservados; itens sem `id` ou `title` ignorados e contagem anunciada pelos cards válidos; `count: 0` ou nenhum item válido → `showEmpty` com "Não há atividades próximas no momento." e dica "Veja todas as atividades."; item sem `next_occurrence` mostra "Sem data prevista"; nenhuma ocorrência de `innerHTML` com dados da API
- [X] T010 [P] [US1] Escrever `tests/e2e/home-upcoming.spec.js` (deve falhar), bloco "sucesso": com `mockApi` (3 atividades) conferir 3 cards `article`, ordem, que clicar em um card (mouse) e ativá-lo por Enter no link leva a `atividade.html?id=…` na mesma aba, "Ver todas" leva a `explorar.html` sem query string, a requisição de próximas contém `date_from` de hoje e `page_size=3`, e há 1 chamada a cada uma das três rotas; com 0 resultados, mensagem de vazio sem botão "Tentar novamente"

### Implementation for User Story 1

- [X] T011 [US1] Implementar `js/home/upcoming-activities.js`: `initUpcoming({content, status, scope, fetchUpcoming})` que cria `createRegionState({content, status, skeletonCount: 3})` e `createRequestScope()`; `load()` executa `fetchUpcomingActivities`, converte `results` em cards com `createActivityCard(a, {headingLevel: 3})` descartando `null`, chama `showSuccess(cards, {announce})` ou `showEmpty({message: "Não há atividades próximas no momento.", hint: "Veja todas as atividades."})`; exporta `load` para uso por US2 e US5; mensagem de conclusão com singular/plural correto ("1 próxima atividade carregada." / "3 próximas atividades carregadas.")
- [X] T012 [US1] Atualizar `js/pages/home.js`: manter `initSiteNav()` e `showConfigNotice(getConfigStatus())`; localizar `#upcoming-content` e `#upcoming-status`; chamar `initUpcoming(...)` e `load()` na abertura; não alterar o `init()` exportado nem a chamada final
- [X] T013 [US1] Rodar `npm test` e `npx playwright test tests/e2e/home-upcoming.spec.js` e confirmar que T009 e T010 passam; conferir manualmente o cenário 1 a 3 e 11 do `quickstart.md` e registrar no quadro de verificação

**Checkpoint**: A página mostra próximas atividades reais (MVP navegável).

---

## Phase 4: User Story 2 - Entender o carregamento (Priority: P1)

**Goal**: Três esqueletos ocultos das tecnologias assistivas, uma única mensagem de carregamento e uma única de conclusão, sem mover o foco e sem animação em movimento reduzido.

**Independent Test**: Resposta lenta simulada; conferir esqueletos, `aria-hidden`, mensagens na região de status e foco inalterado.

### Tests for User Story 2

- [X] T014 [P] [US2] Estender `tests/unit/upcoming-activities.test.js` com o bloco "carregamento": ao iniciar, a região tem 3 `.skeleton-card[aria-hidden="true"]`; a região de status anuncia "Carregando próximas atividades…" uma vez após o atraso do `createRegionState` e nada se a resposta chegar antes do atraso; ao concluir, uma única mensagem de conclusão; `document.activeElement` não muda em nenhuma transição (foco colocado em um campo antes do início); duas chamadas seguidas a `load()` geram uma consulta em curso e a resposta antiga é ignorada
- [X] T015 [P] [US2] Estender `tests/e2e/home-upcoming.spec.js` com o bloco "carregamento": com `delayMs: 1500`, 3 esqueletos visíveis, o texto de `#upcoming-status` passa de "Carregando próximas atividades…" para a conclusão, `page.evaluate(() => document.activeElement)` permanece no campo de pesquisa focado antes da resposta; com `reducedMotion: "reduce"`, `getComputedStyle` dos esqueletos não tem `animation-name` diferente de `none`

### Implementation for User Story 2

- [X] T016 [US2] Em `js/home/upcoming-activities.js`, chamar `regionState.showLoading({announce: "Carregando próximas atividades…"})` no início de cada `load()` e passar `loadingLabel: "Carregando próximas atividades…"` ao `createRegionState`; garantir que nenhuma chamada move o foco (`focus()` proibido neste módulo)
- [X] T017 [US2] Conferir em `css/components.css` que `.skeleton-card` na grade da seção tem as mesmas dimensões dos cards reais (sem salto de layout) e que a animação do esqueleto, se houver, está coberta pela regra de movimento reduzido da feature 004; ajustar só com tokens
- [X] T018 [US2] Rodar T014 e T015 e o cenário 12 do `quickstart.md`; registrar

**Checkpoint**: Carregamento claro e acessível.

---

## Phase 5: User Story 3 - Pesquisar por nome (Priority: P1)

**Goal**: "Explorar" leva à listagem com o termo no endereço; digitar não consulta a API; sem critérios abre a listagem geral.

**Independent Test**: Digitar termos variados e acionar por clique e Enter; conferir endereço de destino e ausência de requisições durante a digitação.

### Tests for User Story 3

- [X] T019 [P] [US3] Escrever `tests/unit/search-criteria.test.js` (deve falhar), parte "termo e endereço": `normalizeTerm("  dança  ")` → `"dança"`; só espaços → `""`; `buildExploreUrl({term: "dança"})` → `explorar.html?q=dan%C3%A7a`; termo com `&`, `#`, `?`, aspas e `%` chega íntegro após `new URL(...).searchParams.get("q")`; sem critérios → `explorar.html` sem `?`; ordem de parâmetros `q, unit, category, date, date_from, date_to`; termo > 100 caracteres é cortado em 100
- [X] T020 [P] [US3] Escrever `tests/e2e/home-search.spec.js` (deve falhar), bloco "pesquisa por nome": campo com rótulo acessível e `maxlength` 100; digitar não gera requisições a `/activities/` além da consulta inicial (comparar o contador de `mockApi` antes e depois); Enter no campo e clique em "Explorar" navegam para `explorar.html?q=…`; sem termo, `explorar.html` sem query string; termo só com espaços → sem `q`; duplo clique rápido resulta em uma única navegação final; sem JavaScript (contexto com `javaScriptEnabled: false`), o envio nativo chega a `explorar.html` com a query do formulário

### Implementation for User Story 3

- [X] T021 [US3] Implementar em `js/home/search-criteria.js`: `normalizeTerm(value)` (`trim`, máx. 100 caracteres), `PERIODS` (chaves `any|today|week|month`, rótulos de `data-model.md`) e `buildExploreUrl({term, unit, category, period}, hoje)` seguindo `contracts/explore-url.md`; neste momento implementar `term` e a base da URL, deixando `unit`, `category` e `period` para US4 (retornar sem esses parâmetros enquanto ausentes)
- [X] T022 [US3] Em `js/pages/home.js`, adicionar `initQuickSearch(form)`: `submit` → `preventDefault()`, ler os campos, `location.assign(buildExploreUrl(...))`; desabilitar a reação a envios repetidos enquanto a navegação ocorre; garantir que não existe listener de `input`/`change` que chame a API
- [X] T023 [US3] Rodar T019 e T020 e os cenários 4 a 6 do `quickstart.md`; registrar

**Checkpoint**: Pesquisa por nome funcional de ponta a ponta até o endereço de destino.

---

## Phase 6: User Story 5 - Recuperar falha (Priority: P1)

**Goal**: Falha da seção mostra mensagem amigável e "Tentar novamente"; recuperável; isolada do restante.

**Independent Test**: Simular rede caída, `500`, `429`, tempo esgotado e configuração inválida; acionar "Tentar novamente" com nova falha e com sucesso.

### Tests for User Story 5

- [X] T024 [P] [US5] Estender `tests/unit/upcoming-activities.test.js` com o bloco "falha e nova tentativa": para `network`, `timeout`, `server` e `rate_limited` a região mostra `error.userMessage` e o botão "Tentar novamente" (via `renderErrorState`), sem cards antigos; para `config` mostra a mensagem sem botão e não fica em esqueleto; clicar no botão volta a 3 esqueletos e refaz a consulta; nova falha restaura mensagem e botão; sucesso mostra cards; cliques repetidos geram uma única consulta; resposta de consulta cancelada (troca de página/`scope.cancel()`) não altera o DOM; o foco não é movido pelo erro (foco em um campo antes)
- [X] T025 [P] [US5] Estender `tests/e2e/home-upcoming.spec.js` com o bloco "falha": com `failActivities: 500`, aparecem a mensagem e o botão; `#upcoming-status` anuncia a mensagem; a pesquisa (digitar + Enter) e os filtros continuam funcionando; ao religar a API e clicar no botão, os cards aparecem sem recarregar; com `route.abort()` (rede) e com resposta `429` o comportamento é o mesmo; com configuração de API inválida o `.config-notice` aparece e a seção não permanece em esqueleto

### Implementation for User Story 5

- [X] T026 [US5] Em `js/home/upcoming-activities.js`, tratar a rejeição de `fetchUpcomingActivities`: ignorar `isCancelled`, caso contrário `regionState.showError(error, {onRetry: load})`; garantir que `load` é reentrante (a consulta anterior é cancelada pelo escopo) e que o botão de retry já desabilitado no clique impede duplicidade (comportamento de `renderErrorState`)
- [X] T027 [US5] Em `js/pages/home.js`, garantir que nenhuma falha da seção lance exceção não tratada nem impeça `initQuickSearch` e `initFilterOptions` (US4) de rodar (cada inicializador isolado com seu próprio `try`/promessa tratada)
- [X] T028 [US5] Rodar T024 e T025 e os cenários 9 e 10 do `quickstart.md`; registrar

**Checkpoint**: Todas as histórias P1 completas e independentes.

---

## Phase 7: User Story 4 - Filtros rápidos (Priority: P2)

**Goal**: Unidade, categoria e período escolhidos na Início chegam combinados ao endereço da Explorar; sem consulta ao escolher; opções vindas da API com degradação.

**Independent Test**: Escolher combinações e acionar "Explorar"; conferir o endereço; simular falha de `/units/` e `/categories/`.

### Tests for User Story 4

- [X] T029 [P] [US4] Estender `tests/unit/search-criteria.test.js` com "períodos": `periodRange("any", hoje)` → `{}`; `today` → `{date: hoje}`; `week` → `{date_from: hoje, date_to: hoje+6}`; `month` → `{date_from: hoje, date_to: último dia do mês}`; virada de mês (2026-10-31, 2026-02-28 e 2028-02-29 em ano bissexto) e de ano (2026-12-30); `buildExploreUrl` com `unit`, `category` e `period` produz a query de `contracts/explore-url.md` (valores padrão e vazios omitidos; `date` nunca junto de `date_from`/`date_to`); período desconhecido → tratado como `any`
- [X] T030 [P] [US4] Escrever `tests/unit/filter-options.test.js` (deve falhar): `fillSelect` acrescenta `<option>` com `value=id` e `textContent=nome` (nome com `<b>` não vira HTML), mantendo "todas" como primeira opção e sem duplicar em chamadas repetidas; `initFilterOptions` com unidades e categorias OK; falha só em unidades → unidades só com "todas" e aviso "Não foi possível carregar as unidades." em `#filter-options-status`, categorias normais; falha nas duas → aviso para ambas; `count: 0` → só "todas" sem aviso; mais de 50 itens recebidos são aceitos como vierem; o foco não muda
- [X] T031 [P] [US4] Estender `tests/e2e/home-search.spec.js` com "filtros": os três `select` têm rótulo visível e associado; valores padrão "todas…"/"Qualquer data"; escolher opções não gera requisições; escolher unidade + categoria + "Próximos 7 dias" + termo e acionar "Explorar" leva a `explorar.html?q=…&unit=…&category=…&date_from=<hoje>&date_to=<hoje+6>`; "Hoje" → só `date`; só categoria → só `category`; com `/units/` retornando `500` o select de unidade tem só "Todas as unidades", o aviso é anunciado e a pesquisa por nome funciona; navegação só por teclado até "Explorar"; "Hoje" usa a data de São Paulo mesmo com `timezoneId: "Pacific/Auckland"` no contexto

### Implementation for User Story 4

- [X] T032 [US4] Completar `js/home/search-criteria.js` com `periodRange(key, hoje)` (aritmética de calendário em UTC sobre `AAAA-MM-DD`, sem usar o fuso do dispositivo) e o tratamento de `unit`, `category` e `period` em `buildExploreUrl`, conforme `data-model.md` e `contracts/explore-url.md`
- [X] T033 [US4] Implementar `js/home/filter-options.js`: `fillSelect(select, items)` e `initFilterOptions({unitSelect, categorySelect, statusEl, fetchUnits, fetchCategories})` que busca unidades e categorias em paralelo (`Promise.allSettled`), preenche cada select de forma independente e, em falha, escreve o aviso correspondente em `#filter-options-status`; ignora `isCancelled`; não usa `focus()`
- [X] T034 [US4] Em `js/pages/home.js`, chamar `initFilterOptions` na abertura (em paralelo com `load()` de US1) e passar `period`, `unit` e `category` do formulário a `buildExploreUrl(criteria, todayInSaoPaulo())`
- [X] T035 [US4] Rodar T029–T031 e os cenários 7 e 8 do `quickstart.md`; registrar

**Checkpoint**: Pesquisa rápida completa (termo + filtros).

---

## Phase 8: User Story 6 - Apresentação (Priority: P2)

**Goal**: Topo com título, frase e ilustração decorativa; hierarquia de títulos correta; composição responsiva.

**Independent Test**: Abrir a página e conferir hierarquia, imagem decorativa e reflow.

### Tests for User Story 6

- [X] T036 [P] [US6] Escrever `tests/e2e/home-accessibility.spec.js` (deve falhar), bloco "estrutura": exatamente um `h1`; os `h2` de pesquisa e próximas atividades e o `h3` dos cards sem saltos; a imagem do hero tem `alt=""` e não é exposta na árvore de acessibilidade (`getByRole("img")` vazio) e, se o arquivo falhar (rota abortada), não há ícone quebrado nem mudança de layout (largura e altura reservadas); a ordem no DOM é hero → pesquisa → próximas; sem rolagem horizontal em 320, 375, 768, 1024 e 1440 px; com `font-size` ampliado a 200 % nada é cortado e "Explorar" continua visível e operável

### Implementation for User Story 6

- [X] T037 [US6] Ajustar `index.html`/`css/layout.css` conforme os resultados de T036 (título/frase de apoio, proporção e posição da imagem em telas estreitas segundo o wireframe mobile do DOC-12, `width`/`height` do `<img>` coerentes com o SVG), mantendo textos de `contracts` e sem novos valores literais
- [X] T038 [US6] Rodar T036 e conferir visualmente 320 px, 768 px e 1440 px; registrar

**Checkpoint**: Todas as histórias completas.

---

## Phase 9: Polish & Cross-Cutting

**Purpose**: Acessibilidade em todos os estados, consistência e registro final

- [X] T039 [P] Estender `tests/e2e/home-accessibility.spec.js` com axe (`@axe-core/playwright`, incluindo `color-contrast` e `target-size`) nos quatro estados da seção (carregando, sucesso, vazio e erro), com e sem o aviso de opções de filtro; ordem de foco (skip link → menu → campo → filtros → "Explorar" → cards → "Ver todas") e indicador de foco visível em cada controle; nenhum `console.error` em nenhum estado
- [X] T040 [P] Rodar `tests/unit/design-tokens.test.js` e corrigir qualquer literal de cor/fonte/duração introduzido por T007/T008/T017/T037; atualizar `specs/005-home-page/quickstart.md` §Registro de verificação com data, verificação e resultado de cada cenário executado
- [ ] T041 [P] Revisão manual com leitor de tela (NVDA ou VoiceOver) conforme `quickstart.md` §3 (rótulos, anúncio único de carregando/concluído/erro, esqueletos e ilustração ignorados, hierarquia) e com a API real do backend (cenários 1 a 12); registrar achados e correções
- [X] T042 Atualizar `docs/PENDENCIAS-BACKEND.md` se a verificação com a API real mostrar divergência do contrato (por exemplo, `date_from` devolvendo atividades sem ocorrência, ou limite de `page_size`); caso contrário, anotar "verificado e conforme" a consulta de próximas atividades na seção correspondente
- [X] T043 Executar a suíte completa (`npm test` e `npm run test:e2e`), confirmar que as features 001–004 continuam verdes (menu, skip link, tokens, reflow, movimento reduzido) e registrar o resultado final no `quickstart.md`

---

## Dependencies & Execution Order

- **Phase 1** (T001–T003): sem dependências; todas em paralelo.
- **Phase 2** (T004–T008): depende da Phase 1 só para T002 (que espelha T005); T004 antes de T006; T007 e T008 em paralelo com T004–T006. **Bloqueia todas as histórias.**
- **US1** (P1, MVP): depende da Phase 2. Cria `upcoming-activities.js` e liga a página.
- **US2** e **US5** (P1): dependem de US1 (estendem o mesmo módulo e os mesmos arquivos de teste); entre si são sequenciais só pelo arquivo compartilhado.
- **US3** (P1): depende só da Phase 2 e **pode rodar em paralelo com US1/US2/US5** (arquivos distintos: `search-criteria.js`, `home-search.spec.js`), exceto pelo trecho de `home.js`.
- **US4** (P2): depende de US3 (completa `search-criteria.js`, `home.js` e `home-search.spec.js`).
- **US6** (P2): depende só da Phase 2; pode rodar em paralelo, mas ajusta `index.html`/`layout.css`, então sincronizar com T005/T007.
- **Polish** (T039–T043): depende das histórias desejadas.

### Dependências entre histórias

```text
Setup → Foundational → US1 → US2 → US5
                    ↘ US3 → US4
                    ↘ US6
                              ↘ Polish
```

## Parallel Examples

- Phase 1: T001, T002 e T003 juntos.
- Phase 2: T004 em paralelo com T007 e T008; depois T006.
- Testes antes da implementação: T009 e T010 (US1); T014 e T015 (US2); T019 e T020 (US3); T024 e T025 (US5); T029, T030 e T031 (US4).
- Em equipe: uma pessoa em US1→US2→US5 (seção) e outra em US3→US4 (pesquisa) após a Phase 2; US6 por quem terminar primeiro.

## Implementation Strategy

- **MVP**: Phase 1 + Phase 2 + **US1**. Entrega a primeira integração real com a API e uma página inicial útil.
- **Incremental**: acrescentar US2 e US5 (completam a seção, todas P1), depois US3 (pesquisa por nome), depois US4 (filtros) e US6 (apresentação), e fechar com o Polish.
- Cada história termina com testes verdes, o cenário correspondente do `quickstart.md` registrado e `npm test` sem regressões das features 001–004.
