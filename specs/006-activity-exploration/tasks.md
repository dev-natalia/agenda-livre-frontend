---

description: "Task list for feature 006 - Exploração de atividades"
---

# Tasks: Exploração de atividades

**Input**: Design documents from `/specs/006-activity-exploration/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/explore-url.md, contracts/api-usage.md, quickstart.md

**Tests**: Incluídos (DOC-14, padrão das features 002–005): Vitest para lógica pura e orquestração com DOM (jsdom); Playwright com a API simulada por `page.route` para os fluxos e a acessibilidade (axe). Escreva cada teste antes da implementação correspondente e confirme que falha.

**Organization**: Tarefas agrupadas por user story. Caminhos relativos à raiz do repositório (o próprio frontend). Reutilize, sem alterar o comportamento: `js/api/client.js`, `js/api/errors.js`, `js/components/activity-card.js`, `js/components/region-state.js`, `js/components/error-state.js`, `js/components/config-notice.js`, `js/components/site-nav.js`, `js/home/search-criteria.js` (`normalizeTerm`, `MAX_TERM_LENGTH`, `PERIODS`, `periodRange`), `js/home/filter-options.js` (`fillSelect`, `initFilterOptions`), `js/utils/dates.js` e os tokens/estilos da feature 004. Dados da API só via `textContent`/atributos, nunca `innerHTML`. Nenhum valor literal de cor, fonte, espaçamento ou duração fora de `css/tokens.css` (há teste que verifica).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[Story]**: US1 = ver e percorrer a listagem (P1), US2 = pesquisar e filtrar com estado na URL (P1), US3 = limpar os filtros (P1), US4 = quantidade de resultados (P1), US5 = vazio, erro e página inexistente (P1), US6 = voltar dos detalhes (P2)

---

## Phase 1: Setup

**Purpose**: Utilitários de teste usados por várias histórias

- [X] T001 [P] Estender `tests/e2e/helpers/mock-api.js`: (a) nova opção `activitiesResponder(url)` em `mockApi` que, quando informada, decide a resposta de `GET **/api/v1/activities/**` a partir de um `URL` (devolve `{ status = 200, body }`, com `body` objeto serializado em JSON), substituindo a lista fixa e permitindo testar `q`, `unit`, `category`, datas e `page`; (b) exportar `makeListing(total, { page = 1, pageSize = 12 } = {})` que devolve o envelope `{count: total, next, previous, results}` com os itens (de `makeActivity`) da página pedida, `next`/`previous` coerentes e `results` vazio quando a página está além do total; (c) manter o contador `requests` com `{path, search}` e a compatibilidade com `home-*.spec.js`
- [X] T002 [P] Estender `tests/unit/helpers/dom.js` com `mountExploreDom()`, que monta em jsdom o trecho de `explorar.html` definido em T009 (mesmos ids e atributos: `#explore-form`, `#search-q`, `#filter-unit`, `#filter-category`, `#filter-period`, `#filter-options-status`, `#explore-clear`, `#results-heading`, `#results-summary`, `#results-status`, `#results-content`, `#results-pagination`), para os testes de orquestração

---

## Phase 2: Foundational (bloqueia todas as histórias)

**Purpose**: Acesso à API, conversão endereço ⇄ critérios, modelo de paginação, estrutura HTML e estilos base

- [X] T003 [P] Acrescentar a `tests/unit/public-api.test.js` (deve falhar) casos de `fetchActivities({ criteria, page, scope })` com `fake-fetch`: chama `/activities/` com `page_size=12`; omite `page` na página 1 e envia `page=N` para N ≥ 2; envia `q`, `unit`, `category` apenas quando presentes; período `today` envia só `date`; `week` e `month` enviam `date_from` e `date_to` (nunca `date` junto), calculados a partir de `todayInSaoPaulo()` (testar às 02:30 UTC e às 12:00 UTC); nenhum parâmetro vazio; aceita `scope` e propaga `ApiError` (`400`, `404`, `429`, `500`, rede, tempo esgotado, JSON inválido)
- [X] T004 [P] Escrever `tests/unit/explore-url-state.test.js` (deve falhar) cobrindo `contracts/explore-url.md`: `parseExploreSearch(search, hoje)` devolve `{ criteria: { term, unit, category, period }, page, changed }`; termo com `trim` e cortado em 100 caracteres, só espaços = vazio; `unit`/`category` aceitos somente se UUID; `page` ausente, `0`, negativo, decimal ou texto = 1; chave `period` (`any|today|week|month`) traduzida e outras ignoradas; `date` aceito só se for `AAAA-MM-DD` real igual a `hoje`; `date_from`/`date_to` aceitos só em par igual a `week` (hoje..hoje+6) ou `month` (hoje..fim do mês), caso contrário descartados; `date` junto de `date_from`/`date_to` nunca produz combinação recusada pela API; parâmetros desconhecidos ignorados; `changed = true` quando a leitura alterou algo. `buildExploreSearch(criteria, page, hoje)` escreve na ordem `q, unit, category, date, date_from, date_to, page`, omite padrões, vazios e `page=1`, e codifica acentos, `&`, `#`, aspas e espaços sem corromper. `inferPeriod(range, hoje)` e `toApiParams(criteria, hoje)`. Testar virada de mês e de ano e fuso do dispositivo diferente de São Paulo
- [X] T005 [P] Escrever `tests/unit/pagination-model.test.js` (deve falhar): `pageItems(current, total)` devolve no máximo 7 itens; `total ≤ 7` lista todas as páginas; `total` maior mostra primeira, última, atual ±1 e `gap` nos saltos; atual nas pontas mantém 7 itens; `buildPaginationModel({ current, count, pageSize = 12 })` calcula `total = ceil(count / 12)`, `previous`/`next` como número da página ou `null` nas pontas, e `null` (sem paginação) quando `total ≤ 1`; `count` ausente, negativo, decimal ou não numérico devolve modelo reduzido por `{ hasPrevious, hasNext }` (de `previous`/`next`) sem números
- [X] T006 Implementar `fetchActivities({ criteria, page, scope, fetchImpl })` em `js/api/public.js` para passar T003, usando `toApiParams` de `js/explore/url-state.js` (T007); `PAGE_SIZE = 12` exportado
- [X] T007 Implementar `js/explore/url-state.js` para passar T004: `parseExploreSearch`, `buildExploreSearch`, `inferPeriod`, `toApiParams`, reutilizando `normalizeTerm`, `MAX_TERM_LENGTH`, `periodRange` de `js/home/search-criteria.js` e `addDays`, `lastDayOfMonth`, `todayInSaoPaulo` de `js/utils/dates.js`; UUID validado por expressão regular `^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$` (sem diferenciar maiúsculas); sem acesso a `window`/`document`
- [X] T008 Implementar `js/explore/pagination-model.js` para passar T005 (função pura, sem DOM)
- [X] T009 Atualizar `explorar.html` (dentro de `<main id="main-content" tabindex="-1">`, mantendo cabeçalho com `aria-current="page"` em "Explorar atividades", skip link, rodapé e trocando o script para `<script type="module" src="js/pages/explore.js">`): `<h1>Explorar atividades</h1>` e parágrafo "Encontre cursos, eventos e atividades nos CEUs."; `<form id="explore-form" class="explore-filters" role="search" aria-label="Pesquisar atividades" action="explorar.html" method="get">` com `label`+`input type="search" id="search-q" name="q" maxlength="100"` antes dos filtros, três `label`+`select` (`id="filter-unit" name="unit"`, `id="filter-category" name="category"`, `id="filter-period" name="period"`, os dois primeiros com `aria-describedby="filter-options-status"`) com as opções fixas de `index.html` ("Todas as unidades"/"Todas as categorias" com valor vazio; "Qualquer data", "Hoje", "Próximos 7 dias", "Este mês" com `any|today|week|month`), `<button type="submit" class="button">Filtrar</button>`, `<button type="button" id="explore-clear" class="button button--outline">Limpar filtros</button>` e `<p id="filter-options-status" class="explore-filters__notice" role="status"></p>`; `<section aria-labelledby="results-heading">` com `<h2 id="results-heading" tabindex="-1">Resultados</h2>`, `<p id="results-summary" class="results-summary"></p>` (fora de região viva), `<div id="results-status" class="visually-hidden" role="status" aria-live="polite"></div>`, `<div id="results-content" class="card-grid"></div>`, `<nav id="results-pagination" aria-label="Paginação" hidden></nav>` e `<noscript><p>Para ver as atividades, ative o JavaScript no navegador.</p></noscript>`; um único `<h1>`, cards em `h3`
- [X] T010 [P] Acrescentar a `css/layout.css` os blocos `.explore-filters` e `.results-summary` mobile-first usando só tokens e os pontos de quebra 40/48/64 rem da feature 004: campo de texto em linha própria; filtros e botões em coluna no celular e em linha (texto, três selects, "Filtrar", "Limpar filtros") a partir de 48 rem; botões com área de toque mínima já definida em `css/tokens.css`; aviso `.explore-filters__notice:empty` sem espaço reservado; sem rolagem horizontal em 320 px

**Checkpoint**: `npm test` verde para T003–T005; `explorar.html` abre estático com a estrutura nova

---

## Phase 3: User Story 1 - Ver e percorrer a listagem de atividades (Priority: P1)

**Goal**: A página abre com a listagem ordenada (como a API devolve) e paginação por links reais, trocando de página sem recarregar.

**Independent Test**: Abrir `explorar.html` com a API simulada com 27 atividades; ver 12 cards, paginação com "Próxima", ir à página 2 e à 3, e conferir endereço, filtros preservados e foco.

### Tests for User Story 1 ⚠️ escreva e veja falhar

- [X] T011 [P] [US1] Escrever `tests/unit/pagination.test.js`: `renderPagination(nav, model, hrefFor)` mostra `<nav aria-label="Paginação">` com lista; a página atual é `<a aria-current="page">` com nome acessível "Página N, atual"; demais páginas são `<a href>` com nome "Ir para a página N"; reticências são `aria-hidden`; "Anterior"/"Próxima" indisponíveis são `<span aria-disabled="true">` não focáveis; modelo `null` esconde o `nav` (`hidden`) e esvazia a lista; modelo reduzido (sem números) mostra só anterior/próxima; nenhum `innerHTML`; reconstrução não duplica itens
- [X] T012 [P] [US1] Escrever `tests/unit/explore-listing.test.js` (parte US1) com `mountExploreDom()` e `fake-fetch`: `initListing({ content, status, summary, nav, … }).load({ criteria, page })` consulta uma vez, mostra esqueletos antes da resposta, renderiza os cards na ordem recebida (sem reordenar), não renderiza itens sem `id`/`title`, esconde a paginação quando `totalPages ≤ 1`, mantém atividade sem `next_occurrence` íntegra ("Sem data prevista"), não move o foco, e uma resposta atrasada de uma consulta anterior não sobrescreve a mais recente
- [X] T013 [P] [US1] Escrever `tests/e2e/explore-pagination.spec.js` (`mockApi` com `activitiesResponder` + `makeListing(27)`): abre `explorar.html`, vê 12 cards e a paginação (páginas 1–3, "Anterior" indisponível); aciona a página 2 e confere `?page=2`, novos cards, esqueletos durante a espera e página 2 com `aria-current`; foco no título "Resultados" após acionar a página; na página 3 "Próxima" fica indisponível; abrir `explorar.html?page=2` direto já mostra a página 2; Ctrl+clique/abrir em nova aba carrega a mesma página; paginação não aparece com 5 resultados; atividades canceladas/encerradas nunca são renderizadas pelo frontend (a lista é exatamente a recebida)

### Implementation for User Story 1

- [X] T014 [P] [US1] Implementar `js/components/pagination.js` para passar T011: `renderPagination(nav, model, hrefFor)` usando só `createElement`/`textContent`; `hrefFor(page)` devolve `explorar.html?<critérios>&page=N` (sem `page` na 1)
- [X] T015 [US1] Implementar `js/explore/listing.js` (parte US1) para passar T012: `initListing({ content, status, summary, nav, headingEl, fetchActivities })` com `createRequestScope()` e `createRegionState({ content, status, skeletonCount: 12, loadingLabel: "Carregando atividades…" })`; `load({ criteria, page })` mostra esqueletos, consulta com `fetchActivities`, ignora `cancelled`, converte `results` em cards (`createActivityCard(activity, { headingLevel: 3 })`), monta o modelo com `buildPaginationModel` e chama `renderPagination`; nunca ordena nem filtra; nunca move o foco
- [X] T016 [US1] Reescrever `js/pages/explore.js` (parte US1): `initSiteNav()`, `showConfigNotice(getConfigStatus())`, ler `location.search` com `parseExploreSearch`, `load` inicial e interceptar cliques simples (sem Ctrl/Cmd/Shift/botão do meio) nos links de `#results-pagination` para `history.pushState` + `load` e mover o foco para `#results-heading`; manter o `init()` com guardas de existência dos elementos
- [X] T017 [P] [US1] Acrescentar a `css/components.css` o bloco `.pagination` usando só tokens: itens em linha com quebra, links com área de toque mínima, página atual com fundo e borda (não só cor), indisponíveis com estilo e texto distintos, foco visível, funcionando em 320 px sem rolagem horizontal

**Checkpoint**: US1 funcional e testável sozinha (listagem geral + paginação)

---

## Phase 4: User Story 2 - Pesquisar e filtrar com estado na URL (Priority: P1)

**Goal**: Termo, unidade, categoria e período só aplicam em "Filtrar"; o endereço reflete e restaura o estado; voltar/avançar funciona.

**Independent Test**: Preencher todos os campos, confirmar zero requisições até "Filtrar", conferir endereço e página 1; abrir o endereço em nova janela e ver os mesmos campos e resultados.

### Tests for User Story 2 ⚠️ escreva e veja falhar

- [X] T018 [P] [US2] Escrever `tests/unit/explore-search-form.test.js` (jsdom): digitar e alterar selects não chama `fetchActivities` nem `fetchUnits`; `submit` (e Enter) lê os campos, normaliza o termo (`trim`, 100 caracteres) e chama `onApply(criteria)` uma vez; `setCriteria()` preenche campo e selects, incluindo `unit`/`category` ainda não carregados (aplicados após `fillSelect`); id ausente nas opções carregadas descarta o critério, usa o padrão e avisa "Um dos filtros do endereço não está mais disponível e foi desconsiderado."; falha ao carregar opções mantém o valor do endereço, oferece só "todas" e avisa via `#filter-options-status`; cliques repetidos em "Filtrar" durante consulta não geram consultas redundantes
- [X] T019 [P] [US2] Escrever `tests/e2e/explore-search.spec.js`: abrir `explorar.html?q=oficina&unit=<id>&category=<id>&date_from=<hoje>&date_to=<hoje+6>` preenche os campos (período "Próximos 7 dias"), consulta uma vez com os parâmetros certos e mostra os resultados; digitar e selecionar não geram requisições (contador `requests` constante) e os resultados atuais continuam visíveis; "Filtrar" por clique e por Enter mostra esqueletos, volta à página 1 (partindo da `?page=3`), faz `pushState` com os critérios e consulta com os critérios combinados; voltar/avançar do navegador restaura campos, endereço e listagem do ponto do histórico; `?period=week` é reescrito para datas (`replaceState`, sem nova entrada); parâmetros inválidos (`page=0`, `unit=xyz`, `q` com 150 caracteres, `date` + `date_from`, `foo=bar`) abrem a página normalizada sem consulta recusável; termo com acentos, `&`, `#`, aspas e espaços chega íntegro à API; duas pesquisas em rápida sucessão mostram só o resultado da última (resposta antiga atrasada via `delayMs`/responder); unidade removida/inexistente no endereço cai no padrão com aviso; unidades/categorias com falha de rede oferecem só "todas" com aviso e a pesquisa por texto continua funcionando

### Implementation for User Story 2

- [X] T020 [US2] Implementar `js/explore/search-form.js` para passar T018: `initSearchForm({ form, unitSelect, categorySelect, periodSelect, termInput, noticeEl, onApply, onClear })` com `getDraft()`, `setCriteria(criteria)`, `reconcile(optionsResult)` e proteção contra envios repetidos; sem listeners de `input`/`change` que consultem a API; reutiliza `initFilterOptions`/`fillSelect` de `js/home/filter-options.js` (carrega unidades e categorias em paralelo com a primeira listagem, sem esperá-la)
- [X] T021 [US2] Integrar em `js/pages/explore.js`: `submit` → `buildExploreSearch(draft, 1)`; `pushState` se o endereço mudou, `replaceState` se idêntico; `load` com página 1; se `parseExploreSearch(...).changed` na abertura, `replaceState` com o endereço canônico; `popstate` relê o endereço, chama `setCriteria` e `load`; ao descartar critério na reconciliação das opções, `replaceState` + nova consulta sem o critério
- [X] T022 [P] [US2] Acrescentar a `css/components.css`/`css/layout.css` o que faltar para campos, selects e botões da barra de filtros usando só tokens, com rótulos sempre visíveis, foco visível e 200 % de texto sem corte

**Checkpoint**: US1 + US2 funcionam; a busca é compartilhável por endereço

---

## Phase 5: User Story 3 - Limpar os filtros e recomeçar (Priority: P1)

**Goal**: "Limpar filtros" volta ao padrão e à listagem geral automaticamente.

**Independent Test**: Aplicar critérios, acionar "Limpar filtros" e conferir campos padrão, endereço `explorar.html`, página 1 e listagem geral carregada sem novo clique.

### Tests for User Story 3 ⚠️ escreva e veja falhar

- [X] T023 [P] [US3] Acrescentar a `tests/e2e/explore-search.spec.js` o cenário de limpeza: com critérios aplicados e na página 2, "Limpar filtros" restaura termo e selects, `pushState` para `explorar.html`, consulta única sem parâmetros, esqueletos durante a espera; critérios digitados e não aplicados também são descartados; estando já sem critérios não quebra nem deixa estado inconsistente; após a limpeza o foco permanece em elemento visível (o próprio botão) e nenhum anúncio move o foco; vazio e erro após a limpeza usam os mesmos estados das demais consultas

### Implementation for User Story 3

- [X] T024 [US3] Implementar `onClear` em `js/explore/search-form.js` e integrar em `js/pages/explore.js`: `setCriteria` com os padrões, `buildExploreSearch` vazio, `pushState` (ou `replaceState` se já era `explorar.html`), `load({ criteria: padrão, page: 1 })`; mantém o foco no botão

**Checkpoint**: US1–US3 completas

---

## Phase 6: User Story 4 - Saber quantas atividades foram encontradas (Priority: P1)

**Goal**: Total geral com singular/plural corretos, anunciado uma vez e nunca inventado.

**Independent Test**: Resultados com 1, 12 e 27 itens mostram "1 atividade encontrada", "12 atividades encontradas" e "27 atividades encontradas" (também na página 2); sem `count` confiável nada é mostrado.

### Tests for User Story 4 ⚠️ escreva e veja falhar

- [X] T025 [P] [US4] Acrescentar a `tests/unit/explore-listing-states.test.js`: `count = 1` → "1 atividade encontrada"; `count = 12` e `27` → "N atividades encontradas"; na página 2 o resumo continua sendo o total geral (não o número de cards); `count` ausente, negativo, decimal ou texto → resumo vazio, paginação reduzida, cards ainda exibidos; durante o carregamento o resumo anterior é ocultado (não aparece como atual) e a região de status recebe só "Carregando atividades…"; a conclusão anuncia "N atividades encontradas." uma única vez em `#results-status`, sem anúncio duplicado pelo resumo visível; foco inalterado

### Implementation for User Story 4

- [X] T026 [US4] Estender `js/explore/listing.js`: `countLabel(count)` (singular/plural), preencher `#results-summary` via `textContent` somente com `count` inteiro ≥ 0, esvaziá-lo ao carregar, anunciar o total via `showSuccess(..., { announce })` e usar o modelo reduzido de paginação quando o total não for confiável

**Checkpoint**: US1–US4 completas

---

## Phase 7: User Story 5 - Vazio, erro e página inexistente (Priority: P1)

**Goal**: Lista vazia, erro de API e página fora do intervalo são estados distintos, acessíveis e recuperáveis.

**Independent Test**: Termo sem correspondência mostra "Nenhuma atividade encontrada"; parar a API mostra erro com "Tentar novamente"; `?page=999` volta à página 1 sem erro técnico.

### Tests for User Story 5 ⚠️ escreva e veja falhar

- [X] T027 [P] [US5] Acrescentar a `tests/unit/explore-listing.test.js`: `count = 0` → `showEmpty` com "Nenhuma atividade encontrada." e orientação "Altere ou limpe os filtros para ver mais atividades.", sem resumo nem paginação, anunciado uma vez; `count > 0` com `results` vazio → erro `invalid_response`; erro de rede, tempo esgotado, `429`, `500`, JSON inválido e configuração inválida → mensagem amigável (`userMessage`) e "Tentar novamente" apenas quando `retryable`, sem exibir resultados anteriores; "Tentar novamente" refaz a consulta com os mesmos critérios e página, mostra esqueletos, nova falha restaura a mensagem, cliques repetidos não geram consultas redundantes; `400` com `fieldErrors.page` ou `404` com `page > 1` chamam `onPageOutOfRange` uma única vez e, na página 1, tratam como erro comum; nunca entra em laço
- [X] T028 [P] [US5] Escrever `tests/e2e/explore-states.spec.js`: pesquisa sem resultado mostra a mensagem de vazio (distinta de erro), orientação e campos editáveis, sem paginação; falha de rede e `500` mostram erro + "Tentar novamente" com foco preservado (anúncio por região de status, sem mover foco); retry com a API de volta mostra os cards; retry com nova falha restaura o erro; `?page=999` (responder `400` com `errors.page`) e `?page=5` (responder `404`) retornam à página 1 com `replaceState`, sem erro técnico e com uma única consulta extra; `apiBaseUrl` inválida mostra o aviso de configuração e a listagem não fica em esqueleto; o conteúdo de `<noscript>` está presente no HTML

### Implementation for User Story 5

- [X] T029 [US5] Estender `js/explore/listing.js`: `showEmpty` com mensagem e dica de `contracts/api-usage.md`, validação de coerência (`count > 0` e `results` vazio → `ApiError("invalid_response")`), `showError(error, { onRetry: () => load(last) })` e guarda de consulta em andamento
- [X] T030 [US5] Implementar em `js/explore/listing.js` + `js/pages/explore.js` o fallback de página: `onPageOutOfRange` faz `replaceState` sem `page` e `load` da página 1, no máximo uma vez por navegação; nenhum efeito para `page = 1`
- [X] T031 [P] [US5] Garantir em `css/components.css` que mensagens de vazio e erro dentro de `#results-content` ocupem a largura da grade (`grid-column: 1 / -1`) e mantenham foco visível no botão "Tentar novamente", reutilizando as classes `.region-state__*` e `.error-state__*` existentes

**Checkpoint**: US1–US5 completas; núcleo P1 da página entregue

---

## Phase 8: User Story 6 - Voltar dos detalhes para a listagem (Priority: P2)

**Goal**: Voltar dos detalhes reapresenta campos, página, resultados e rolagem quando a cópia é válida; senão reconstrói pelo endereço.

**Independent Test**: Aplicar critérios, ir à página 2, rolar, abrir um card e voltar pelo histórico; repetir após a cópia vencer.

### Tests for User Story 6 ⚠️ escreva e veja falhar

- [X] T032 [P] [US6] Escrever `tests/unit/explore-snapshot.test.js` (jsdom, `sessionStorage` real do jsdom e relógio falso): `saveSnapshot(search, data)` e `readSnapshot(search, now)`; cópia com ≤ 5 minutos é válida, com mais de 5 minutos é descartada; chave `agenda-livre:explore:<search>`; guarda só `count`, `next`, `previous`, `results`, `savedAt`, `scrollY`, `activityId`; no máximo 10 entradas (a mais antiga sai); JSON corrompido, estrutura inválida e `sessionStorage` indisponível (lança erro) tratados como ausente, sem exceção; `updateScroll(search, scrollY, activityId)` atualiza a entrada existente
- [X] T033 [P] [US6] Escrever `tests/e2e/explore-return.spec.js`: aplicar critérios, ir à página 2, rolar, abrir um card (navegação para `atividade.html`), `page.goBack()`: campos, endereço, página e resultados iguais, **sem** requisição de `/activities/` e sem esqueletos, rolagem restaurada aproximadamente; avançar o relógio do navegador além de 5 minutos (ou limpar `sessionStorage`) e voltar: uma nova consulta pelo endereço, listagem correta; `popstate` dentro da página com cópia válida não consulta de novo; abrir `atividade.html?id=…` direto e conferir que a navegação principal oferece "Explorar atividades" (caminho para a listagem, FR-035)

### Implementation for User Story 6

- [X] T034 [US6] Implementar `js/explore/snapshot.js` para passar T032 (funções puras de armazenamento com `try/catch`, sem acessar o DOM)
- [X] T035 [US6] Integrar em `js/explore/listing.js` e `js/pages/explore.js`: salvar a cópia após cada listagem bem-sucedida; ao acionar um link de card (`click` delegado em `#results-content`) e em `pagehide`, gravar `scrollY` e `activityId`; na abertura, se `performance.getEntriesByType("navigation")[0]?.type === "back_forward"` e a cópia for válida, renderizar sem esqueleto nem anúncio de carregamento, definir `history.scrollRestoration = "manual"` e restaurar a rolagem (rolar até o card quando `activityId` existir); o mesmo para `popstate`; cópia ausente ou vencida → `load` normal; cópia nunca apresentada como atual além de 5 minutos

**Checkpoint**: todas as histórias funcionais

---

## Phase 9: Polish & Cross-Cutting

**Purpose**: Acessibilidade transversal, documentação e verificação final

- [X] T036 [P] Escrever `tests/e2e/explore-accessibility.spec.js`: axe sem violações graves nos estados padrão, carregando, vazio e erro; um único `<h1>`, hierarquia `h1 > h2 > h3` sem saltos; rótulos associados; ordem de foco coerente (skip link → navegação → busca → filtros → "Filtrar" → "Limpar filtros" → cards → paginação); teclado percorre filtros, aplica com Enter e troca de página sem mouse; região de status única com anúncios de carregamento, total, vazio e erro sem mover o foco; esqueletos com `aria-hidden`; 320 px de largura e texto a 200 % sem rolagem horizontal nem perda de função (paginação incluída); `reducedMotion: "reduce"` sem animação nos esqueletos
- [X] T037 [P] Rodar `npm test` e `npm run test:e2e`, corrigir regressões em `tests/unit/design-tokens.test.js` (nenhum valor literal fora de `css/tokens.css`), `visual-consistency`, `responsive-reflow`, `reduced-motion`, `navigation` e `shared-components`; confirmar que a Início (`home-*.spec.js`) continua passando com a extensão de `mock-api.js`
- [X] T038 Atualizar `specs/006-activity-exploration/quickstart.md` (servidor estático `python -m http.server 5500`, como em `playwright.config.js`, em vez de `npx serve`) e executar o roteiro manual com a API real e leitor de tela, registrando data, ferramenta e resultado na tabela; atualizar `docs/PENDENCIAS-BACKEND.md` se a execução com a API real revelar divergências (em especial `?page=999`), mantendo "Verificado e conforme o contrato" em dia
- [X] T039 Atualizar o bloco "Source Code" de `specs/006-activity-exploration/plan.md` com `js/explore/search-form.js` (criado em T020) e revisar `README.md` se houver lista de páginas ou scripts

---

## Dependencies & Execution Order

- **Phase 1** (T001–T002): sem dependências; paralelas.
- **Phase 2** (T003–T010): T003–T005 e T010 em paralelo; T006 depende de T007; T007 e T008 independentes entre si; T009 antes de T002 poder ser usado em testes de DOM (mas T002 pode ser escrito em paralelo seguindo o contrato de ids).
- **US1 (Phase 3)** depende da Phase 2. US2 depende de US1 (reaproveita `explore.js` e `listing.js`). US3 depende de US2 (usa `search-form.js`). US4 e US5 estendem `listing.js` e dependem de US1; entre si não dependem, mas editam o mesmo arquivo, então não em paralelo de implementação (os testes sim). US6 depende de US1 e US2.
- **Polish** depende de todas as histórias desejadas.
- Dentro de cada história: testes ([P]) → falhar → implementação.

### Parallel Opportunities

- Phase 1: T001 ‖ T002.
- Phase 2: T003 ‖ T004 ‖ T005 ‖ T010 (arquivos de teste e CSS distintos).
- US1: T011 ‖ T012 ‖ T013; depois T014 ‖ T017.
- US2: T018 ‖ T019; T022 em paralelo com T020.
- US4/US5: os testes T025, T027 e T028 ‖ entre si (T025 e T027 editam o mesmo arquivo: coordenar).
- US6: T032 ‖ T033; T034 antes de T035.

## Implementation Strategy

- **MVP**: Phases 1–3 (US1): listagem geral com paginação por links. Já entrega valor sozinho, mas só fecha o núcleo utilizável com US2 e US5.
- **Núcleo P1 completo**: US1 → US2 → US3 → US4 → US5 (cada uma testável e demonstrável isoladamente).
- **Incremento P2**: US6 (retorno dos detalhes) depois do núcleo, sem bloquear a entrega.
- Fechar com a Phase 9: testes de acessibilidade, regressão completa e roteiro manual.
