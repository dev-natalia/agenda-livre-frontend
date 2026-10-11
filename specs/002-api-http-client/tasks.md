---

description: "Task list for feature 002 - Cliente e integração com a API"
---

# Tasks: Cliente e integração com a API

**Input**: Design documents from `/specs/002-api-http-client/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api-client.md, contracts/error-state.md, quickstart.md

**Tests**: Incluídos, pois o FR-022 os exige (Vitest + jsdom com `fetch` simulado; um teste Playwright). Escreva cada teste antes da implementação correspondente e confirme que falha.

**Organization**: Tarefas agrupadas por user story. Caminhos relativos à raiz do repositório (que é o próprio frontend).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[Story]**: US1 = cliente único (P1), US2 = erros classificados (P1), US3 = falha ≠ lista vazia + "Tentar novamente" (P1), US4 = descarte de respostas antigas (P2)

---

## Phase 1: Setup

**Purpose**: Ajuste mínimo de configuração pública

- [X] T001 Adicionar `requestTimeoutMs: 15000` a `PUBLIC_CONFIG` em `js/config.js` (valor público, comentário indicando que é ajustável) e exportar `getRequestTimeoutMs()` que devolve esse valor se for número positivo, senão 15000; cobrir em `tests/unit/config.test.js`

**Checkpoint**: `npm test` continua verde.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Modelo de erro usado por todas as histórias

- [X] T002 [P] Escrever `tests/unit/api-errors.test.js`: `classifyStatus` para 400 (`bad_request`, não retryable), 404 (`not_found`), 429 (`rate_limited`, retryable), 500/502/503 (`server`, retryable), 401/403/405/3xx (`http`, não retryable); `ApiError` expõe `category`, `status`, `userMessage`, `retryable`, `fieldErrors`, `cause`; `isCancelled`; nenhuma `userMessage` contém dígitos de status, "Error", "http", "fetch" nem "undefined" (SC-003)
- [X] T003 Criar `js/api/errors.js` conforme `contracts/api-client.md` e `data-model.md`: `ERROR_CATEGORIES` congelado, `ApiError extends Error`, `classifyStatus`, `isCancelled`, mensagens pt-BR da tabela do contrato; `retryable` verdadeiro somente para `network`, `timeout`, `server`, `rate_limited`; `fieldErrors` só preenchido em `bad_request`

**Checkpoint**: `tests/unit/api-errors.test.js` verde.

---

## Phase 3: User Story 1 - Consultar a API por um único ponto de acesso (Priority: P1) 🎯 MVP

**Goal**: `request()` monta o endereço, faz `GET` e devolve dados interpretados.

**Independent Test**: Chamar `request` com `fetchImpl` simulado e conferir URL, parâmetros codificados, corpo e rejeições de configuração/resposta inválida.

### Tests for User Story 1

- [X] T004 [P] [US1] Escrever `tests/unit/api-client.test.js` (parte URL e sucesso): `buildUrl` junta base com/sem barra final e caminho com/sem barra inicial sem duplicar; omite `null`, `undefined` e `""`; aceita string, número e boolean; codifica `"café & chá=1#x"` sem afetar outros parâmetros; lança `TypeError` para objeto, array e função; `request` resolve com o JSON em 200; resolve `{count:0,results:[]}` sem erro; chama `fetch` com método `GET`, `Accept: application/json` e `credentials: "omit"`
- [X] T005 [P] [US1] Acrescentar em `tests/unit/api-client.test.js`: 204/corpo vazio resolve `null` apenas com `allowEmpty: true` e rejeita `invalid_response` por padrão; 200 com HTML ou JSON malformado rejeita `ApiError` `invalid_response`; configuração ausente/inválida/insegura rejeita `ApiError` `config` e `fetch` nunca é chamado; `request` só rejeita com `ApiError`

### Implementation for User Story 1

- [X] T006 [US1] Criar `js/api/client.js` com `buildUrl(baseUrl, path, params)` e `request(path, { params, signal, timeoutMs, allowEmpty, fetchImpl })`: usa `getConfigStatus()`/`getApiBaseUrl()` de `js/config.js` (config ≠ `valid` → `ApiError` `config` com a mensagem da configuração, sem chamar a rede); `fetch` por padrão `globalThis.fetch`; verifica `response.ok`; interpreta JSON conforme research D6; nunca monta URL fora de `buildUrl`
- [X] T007 [US1] Auditar o código: `fetch(` e a URL da API só podem aparecer em `js/api/client.js` e `js/config.js` (`grep` em `js/`); documentar o resultado no PR/README se houver exceção (SC-001)

**Checkpoint**: US1 verde isoladamente; MVP do cliente.

---

## Phase 4: User Story 2 - Receber erros classificados de forma consistente (Priority: P1)

**Goal**: Toda falha vira `ApiError` classificado, com mensagem amigável e sem vazamento técnico.

**Independent Test**: Simular cada falha e verificar categoria, `retryable`, `userMessage` e ausência de dados técnicos.

### Tests for User Story 2

- [X] T008 [P] [US2] Escrever `tests/unit/api-client-errors.test.js`: `fetch` rejeitando `TypeError` → `network` retryable; timeout com timers falsos (`vi.useFakeTimers`) após `timeoutMs` → `timeout` retryable e a requisição abortada; 400 com `{detail, errors:{date_from:["x"]}}` → `bad_request` com `fieldErrors` igual a `errors`; 404 → `not_found`; 429 → `rate_limited`; 500/503 → `server`; 403/405 → `http`; corpo de erro HTML/vazio/texto → classifica só pelo status e `userMessage` não contém o texto do corpo; `userMessage` de todas as categorias sem status, URL, nome de exceção
- [X] T009 [P] [US2] Acrescentar teste de registro em `tests/unit/api-client-errors.test.js`: `console.warn` é chamado com categoria, status e caminho (sem query string) apenas quando `location.hostname` é `localhost`/`127.0.0.1`/`[::1]`; nunca contém corpo da resposta nem cabeçalhos

### Implementation for User Story 2

- [X] T010 [US2] Em `js/api/client.js`, implementar tratamento de falhas: `try/catch` em torno do `fetch`; timeout com `AbortController` + `setTimeout` próprio, limpo ao concluir, distinguindo timeout de abort externo (`signal`) → `cancelled`; em `!response.ok` classificar com `classifyStatus`, ler JSON do corpo somente para `errors` em 400 e ignorar qualquer outro corpo; usar `getRequestTimeoutMs()` por padrão
- [X] T011 [US2] Em `js/api/client.js`, adicionar `logTechnicalError(error, path)` chamando `console.warn` somente em host local (research D9), usado por `request` antes de rejeitar (exceto `cancelled`)

**Checkpoint**: US1 e US2 verdes; toda falha tem categoria.

---

## Phase 5: User Story 3 - Distinguir falha de lista vazia e recuperar-se (Priority: P1)

**Goal**: Componente reutilizável de erro com região de status acessível e "Tentar novamente".

**Independent Test**: Renderizar erros retryable e não retryable em jsdom; acionar o botão; e no navegador simular falha seguida de sucesso.

### Tests for User Story 3

- [X] T012 [P] [US3] Escrever `tests/unit/error-state.test.js` (`// @vitest-environment jsdom`): `renderErrorState` insere `userMessage` via `textContent` (um `<img onerror>` em `userMessage` não vira elemento); botão "Tentar novamente" (`<button type="button">`) só existe com `retryable` e `onRetry`; sem botão para `bad_request`/`not_found`/`config`/`invalid_response`; clique chama `onRetry` uma vez e desabilita o botão contra cliques repetidos; contêiner mantém `role="status"` e `aria-live="polite"`; nenhuma chamada a `focus()` ao renderizar; ao clicar com o foco no botão, o foco vai para o contêiner (`tabindex="-1"`); `clearErrorState` esvazia o contêiner; erro `cancelled` não renderiza nada; lista vazia (`count: 0`) não passa pelo componente (teste de contrato em `tests/unit/api-client.test.js` já cobre sucesso vazio)
- [X] T013 [P] [US3] Escrever `tests/e2e/api-error-retry.spec.js` (Playwright): interceptar `**/api/v1/activities/**` com `page.route`; primeira resposta falha (`abort()` ou 503), carregar `/index.html`, importar `/js/api/client.js` e `/js/components/error-state.js` via `page.evaluate`/`addScriptTag type=module` num contêiner `role="status"` injetado; ver a mensagem e o botão; segunda resposta com `{count:0,next:null,previous:null,results:[]}`; acionar o botão e ver o erro desaparecer sem recarregar a página e sem mover o foco para fora do contêiner; repetir com `400` e verificar que não há botão

### Implementation for User Story 3

- [X] T014 [P] [US3] Criar `css/components.css` com `.error-state` (mensagem, botão com `:focus-visible` usando os tokens de `css/tokens.css`, estado `:disabled` identificável sem depender só de cor) e vincular com `<link rel="stylesheet" href="css/components.css">` em `index.html`, `explorar.html` e `atividade.html` após `layout.css`
- [X] T015 [US3] Criar `js/components/error-state.js` conforme `contracts/error-state.md`: `renderErrorState(container, error, { onRetry })` e `clearErrorState(container)`; usar `textContent`; ignorar `isCancelled(error)`; nunca chamar `focus()` na renderização; mover o foco ao contêiner somente quando o botão que o possuía é acionado
- [X] T016 [US3] Rodar `npm run test:e2e` e corrigir até `tests/e2e/api-error-retry.spec.js` passar

**Checkpoint**: US1–US3 verdes; recuperação de falha funcional.

---

## Phase 6: User Story 4 - Ver sempre o resultado da última pesquisa (Priority: P2)

**Goal**: Consultas substituídas são canceladas e nunca alteram a interface.

**Independent Test**: Duas consultas consecutivas com a primeira mais lenta; só a segunda resolve com dados.

### Tests for User Story 4

- [X] T017 [P] [US4] Escrever `tests/unit/request-scope.test.js`: com `fetchImpl` controlável, `scope.run` A seguido de B, resolvendo B antes de A → A rejeita `cancelled`, B resolve com seus dados; resolver A depois não altera nada; A falhando com 500 depois de substituída rejeita `cancelled`, não `server`; o sinal de abort é acionado em A; dois escopos distintos não se cancelam; `scope.cancel()` cancela a vigente sem erro visível (`isCancelled`); `fetchImpl` que ignora o sinal ainda é descartado pelo token de geração; 3 `run` rápidos → só o último resolve; cancelamento nunca é classificado como `network`

### Implementation for User Story 4

- [X] T018 [US4] Em `js/api/client.js`, implementar `createRequestScope()` (research D2/D3): contador de geração + `AbortController` por `run`; `run` cancela a anterior; antes de resolver ou rejeitar confere a geração e, se antiga, rejeita `ApiError` `cancelled`; `cancel()` expõe a mesma lógica; sem estado global entre escopos
- [X] T019 [US4] Em `js/components/error-state.js` e na documentação do contrato (`specs/002-api-http-client/contracts/api-client.md`), registrar o padrão de uso para consumidores: `try { data = await scope.run(...) } catch (e) { if (isCancelled(e)) return; renderErrorState(...) }`, e que o estado de carregamento só é encerrado pela consulta vigente (FR-020)

**Checkpoint**: Todas as histórias verdes.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [X] T020 [P] Atualizar `README.md`: seção "Cliente da API" com `request`, `createRequestScope`, categorias de erro, uso de `renderErrorState` e como ajustar `requestTimeoutMs`; atualizar a árvore de diretórios com `js/api/`, `css/components.css` e os novos testes
- [X] T021 [P] Conferir restrições: nenhum arquivo sem função, nenhuma dependência de produção adicionada em `package.json`, nenhuma URL fixa fora de `js/config.js`, mensagens sem detalhes técnicos
- [X] T022 Executar o `quickstart.md` (passos 1–3): `npm test`, `npm run test:e2e` e a verificação manual com DevTools *Offline*; anotar leitor de tela/teclado para o erro (SC-007)
- [X] T023 Registrar a pendência do passo 4 do `quickstart.md` (integração com o backend real, CORS e `?page=999` → `not_found`) em `README.md` ou no PR, sem marcá-la como concluída até ser executada

---

## Dependencies & Execution Order

- **Phase 1 → Phase 2 → Phases 3–6 → Phase 7.**
- US1 depende de T003 (Foundational). US2 estende `js/api/client.js` de US1 (T010 depois de T006). US3 depende de `errors.js` (T003) e é independente de US2 em código, mas o E2E usa o cliente (T006, T010). US4 depende de T006 e T010 (`createRequestScope` usa o mesmo pipeline).
- Em cada story: testes primeiro (devem falhar), depois implementação.

### Parallel Opportunities

- T002 em paralelo com T001.
- US1: T004 e T005 em paralelo.
- US2: T008 e T009 em paralelo.
- US3: T012, T013 e T014 em paralelo; T015 depois de T012.
- US4: T017 pode ser escrito em paralelo com a fase US3 (arquivo próprio).
- Polish: T020 e T021 em paralelo.

## Implementation Strategy

- **MVP**: Phases 1–3 (T001–T007): cliente funcional com `config` e `invalid_response`.
- **Entrega incremental**: + US2 (erros completos) → + US3 (nova tentativa visível, fecha FE-004) → + US4 (FE-005, P2).
- Nenhuma tela de listagem, detalhes ou página inicial é criada (FR-024).
