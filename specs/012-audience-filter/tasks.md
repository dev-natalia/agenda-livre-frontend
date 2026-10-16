# Tasks: Filtro por público-alvo

**Input**: Design documents from `/specs/012-audience-filter/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: o FR-013 da spec exige cobertura no padrão dos demais filtros; por isso há tarefas de teste (Vitest em `tests/unit/`, Playwright em `tests/e2e/`).

**Format**: `- [ ] T### [P?] [Story] Descrição com caminho de arquivo`. `[P]` = arquivos diferentes, sem dependência pendente.

## Phase 1: Setup

- [X] T001 Rodar `npm test` e anotar a linha de base (todos os testes unitários passando) antes de qualquer alteração

## Phase 2: Foundational (bloqueia todas as histórias)

**Goal**: dados e infraestrutura de teste que o filtro e o card precisam.

- [X] T002 [P] Adicionar `fetchAudiences({ scope, fetchImpl })` em `js/api/public.js`, chamando `get("/audiences/", { params: { page_size: OPTIONS_PAGE_SIZE } })`, no padrão de `fetchUnits`/`fetchCategories`
- [X] T003 [P] Em `tests/e2e/helpers/mock-api.js`, exportar `AUDIENCES` (ao menos "Adultos", "Crianças" e "Todas as idades", com `id` UUID válido, `name` e `slug`), aceitar a opção `audiences` e `failAudiences`, e rotear `${API}/audiences/**` como já é feito para `/units/` e `/categories/`; fazer `makeListing` incluir `target_audiences` nos itens
- [X] T004 [P] Em `tests/fixtures/activities.js`, garantir itens de listagem com `target_audiences` preenchido e vazio (já existe no detalhe, linhas ~59 e ~116)
- [X] T005 [P] Teste unitário de `fetchAudiences` em `tests/unit/public-api.test.js`: chama `/audiences/` com `page_size=50`, só `GET`

**Checkpoint**: `npm test` continua passando; o mock de API responde `/audiences/`.

## Phase 3: User Story 1 — Filtrar por público-alvo na Explorar (P1) 🎯 MVP

**Goal**: quarto filtro de seleção única, aplicado em "Filtrar", refletido no endereço, com opções vindas da API.

**Independent Test**: escolher um público, acionar "Filtrar", conferir `audience` na consulta e no endereço; reabrir o endereço e ver o campo preenchido.

### Testes

- [X] T006 [P] [US1] Em `tests/unit/explore-url-state.test.js`: `audience` UUID é lido; malformado vira `""` e `changed` é `true`; repetido vale o primeiro; escrita na ordem `q`, `unit`, `category`, `audience`, `date`…; `toApiParams` só inclui `audience` quando preenchido
- [X] T007 [P] [US1] Em `tests/unit/filter-options.test.js`: com `audienceSelect`, preenche opções válidas (ignora itens sem `id`/`name`); falha de `/audiences/` deixa só a opção padrão e não afeta unidades/categorias; mensagens: "Não foi possível carregar os públicos-alvo.", "as unidades e os públicos-alvo", "as categorias e os públicos-alvo", "as unidades, as categorias e os públicos-alvo"; sem `audienceSelect` (Início) o comportamento e as mensagens atuais não mudam
- [X] T008 [P] [US1] Em `tests/unit/explore-search-form.test.js`: rascunho inclui `audience`; `setCriteria` seleciona a opção; critério do endereço persiste com a lista indisponível até a pessoa mexer no campo; UUID ausente das opções (catálogo carregado) é descartado e reportado em `dropped.audience`
- [X] T009 [P] [US1] Em `tests/e2e/explore-audience.spec.js` (arquivo novo, em vez de `explore-search.spec.js`): endereço com `audience` preenche o campo e envia `audience` na consulta; escolher sem "Filtrar" não consulta; "Filtrar" combina `audience` com os demais critérios, volta à página 1 e atualiza o endereço; `?audience=abc` é ignorado e o endereço reescrito; `/audiences/` falhando mantém os outros filtros e exibe o aviso; público inexistente (lista vazia) mostra o estado vazio; paginação preserva `audience`

### Implementação

- [X] T010 [US1] Em `js/explore/url-state.js`: acrescentar `audience: ""` a `DEFAULT_CRITERIA`; ler com `uuidOrEmpty(params.get("audience"))` em `parseExploreSearch`; escrever em `buildExploreSearch` entre `category` e as datas; incluir em `toApiParams`; atualizar o comentário do contrato para citar `specs/012-audience-filter/contracts/explore-url.md`
- [X] T011 [US1] Em `js/home/filter-options.js`: aceitar `audienceSelect` e `getAudiences = fetchAudiences` opcionais; só consultar quando `audienceSelect` for passado; `failed.audience` independente; recompor `failureMessage` por campo conforme T007 (mantendo as frases atuais quando só unidade/categoria)
- [X] T012 [US1] Em `js/explore/search-form.js`: receber `audienceSelect` e `getAudiences`; estender `pending`/`touched`, `getDraft`, `setCriteria` e `loadOptions` (inclusive `dropped.audience` e a mensagem `DROPPED_MESSAGE`)
- [X] T013 [US1] Em `explorar.html`: adicionar, depois de Categoria, `<div class="explore-filters__field"><label for="filter-audience">Público-alvo</label><select id="filter-audience" name="audience" aria-describedby="filter-options-status"><option value="">Todos os públicos</option></select></div>` (o `name` mantém o fallback sem JavaScript)
- [X] T014 [US1] Em `js/pages/explore.js`: obter `filter-audience` em `els`, passar `audienceSelect` ao `initSearchForm` e tratar `dropped.audience` no descarte pós-`loadOptions` (zerando `audience` e refazendo a consulta)
- [X] T015 [US1] Em `css/components.css` (ou no CSS de filtros existente): ajustar a grade `.explore-filters` para quatro campos mais termo e período sem rolagem horizontal de 320 px a desktop; reaproveitar as classes atuais

**Checkpoint**: US1 funcional e testável sozinha (`npm test`, `npm run test:e2e -- explore-search`).

## Phase 4: User Story 2 — Limpar o filtro junto com os demais (P1)

**Goal**: "Limpar filtros" e o histórico do navegador tratam o público como os outros critérios.

**Independent Test**: aplicar público + outros filtros, limpar, e navegar por voltar/avançar.

- [X] T016 [P] [US2] Em `tests/e2e/explore-audience.spec.js`: "Limpar filtros" volta o campo a "Todos os públicos", remove `audience` do endereço e consulta a listagem geral na página 1; voltar/avançar do navegador restaura campo, endereço e listagem do público
- [X] T017 [P] [US2] Em `tests/e2e/explore-audience.spec.js`: ida aos detalhes e volta com público aplicado restaura campo e listagem
- [X] T018 [US2] (nenhuma correção necessária) Corrigir, se os testes T016/T017 revelarem falha, o ponto exato em `js/pages/explore.js` ou `js/explore/search-form.js` (a lógica deve sair de T010–T014; esta tarefa só fecha lacunas)

**Checkpoint**: US1 e US2 completas.

## Phase 5: User Story 3 — Ver o público-alvo em cada card (P2)

**Goal**: card exibe `target_audiences` quando houver, sem lacuna quando não houver.

**Independent Test**: renderizar cards com e sem públicos e conferir texto e layout em 320 px.

- [X] T019 [P] [US3] Em `tests/unit/activity-card.test.js`: com `target_audiences` mostra `.activity-card__audience` com os nomes separados por vírgula na ordem recebida; ausente, `null`, `[]` ou entradas sem `name` não criam o elemento; texto via `textContent` (sem HTML interpretado)
- [X] T020 [P] [US3] Em `tests/unit/explore-snapshot.test.js`: `saveSnapshot` guarda `target_audiences` reduzido a `{ id, name }`; cópia antiga sem o campo é lida sem erro
- [X] T021 [P] [US3] Em `tests/e2e/explore-audience.spec.js`: cards da Explorar mostram o público; card sem público não deixa elemento vazio; nomes longos não geram rolagem horizontal em 320 px; a Início continua renderizando seus cards sem alteração
- [X] T022 [US3] Em `js/components/activity-card.js`: criar `audienceLabel(activity.target_audiences)` (filtra entradas com `name` textual, junta com ", ") e anexar `<p class="activity-card__audience">` após a unidade somente quando houver texto; sem ícone novo
- [X] T023 [US3] Em `js/explore/snapshot.js`: `pick()` passa a incluir `target_audiences: Array.isArray(...) ? ....map(({ id, name }) => ({ id, name })) : []`
- [X] T024 [US3] Em `css/components.css`: estilo de `.activity-card__audience` (tamanho e cor do texto secundário já usados em `.activity-card__unit`, `overflow-wrap: anywhere`, contraste conforme `tests/unit/design-tokens.test.js` e DOC-10)

**Checkpoint**: todas as histórias completas.

## Phase 6: Polish e transversais

- [X] T025 [P] Em `tests/contract/api-contract.test.js`: contra a API real, `/audiences/` devolve `id`/`name`, `?audience=<uuid>` retorna `200` e itens da listagem têm `target_audiences` (array)
- [X] T026 [P] Em `tests/e2e/explore-accessibility.spec.js`: rótulo e ordem de tabulação do novo campo (a matriz axe já cobre a página); suíte de acessibilidade executada
- [X] T027 [P] Atualizar a documentação (FR-012): `docs/16-backlog-do-frontend.md` (nova história do filtro por público), `docs/13-especificacao-interfaces-comportamentos.md` (campo, mensagens, linha do card), `docs/PENDENCIAS-BACKEND.md` se houver item relacionado, e `README.md` se listar filtros
- [X] T028 Rodar `npm test`, `npm run test:e2e` e `npm run test:a11y`; confirmar que nenhum teste anterior quebrou (SC-006)
- [ ] T029 Executar o roteiro manual de `specs/012-audience-filter/quickstart.md` (incluindo `npm run test:contract` com o backend no ar) e registrar o resultado

## Dependencies & Execution Order

- Phase 1 → Phase 2 → histórias. Phase 2 (T002–T005) bloqueia todas, pois o mock de API precisa rotear `/audiences/` para os testes e2e existentes não receberem requisições sem resposta.
- US1 (MVP) não depende das outras. US2 só valida o comportamento de US1 (T016–T018 após T010–T014). US3 é independente de US1/US2 (toca card e snapshot), podendo rodar em paralelo a elas.
- Dentro da US1: T010 → T012 → T014; T011 → T012; T013 → T014; T015 depois de T013.
- Polish após as histórias desejadas.

## Parallel Opportunities

- Fundação: T002, T003, T004, T005 juntos.
- US1 testes: T006–T009 juntos (arquivos distintos; T009 e T016 editam o mesmo arquivo, então sequenciais entre si).
- US3 inteira em paralelo com US1/US2 (T019–T021 juntos; T022–T024 em arquivos distintos, exceto T024 e T015 que tocam `css/components.css`).
- Polish: T025, T026, T027 juntos.

## Implementation Strategy

1. **MVP**: Phases 1, 2 e 3 (US1) — filtro funcional ponta a ponta; entregável sozinho.
2. Acrescentar US2 (validação de limpar/histórico) e US3 (público no card), cada uma testável de forma independente.
3. Fechar com Polish (contrato, acessibilidade, documentação, regressão completa).
