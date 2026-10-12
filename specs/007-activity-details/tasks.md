---

description: "Task list for feature 007 - Detalhes das atividades"
---

# Tasks: Detalhes das atividades

**Input**: Design documents from `/specs/007-activity-details/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/details-url.md, contracts/api-usage.md, quickstart.md

**Tests**: Incluídos (DOC-14, padrão das features 002–006): Vitest para lógica pura e orquestração com DOM (jsdom); Playwright com a API simulada por `page.route` para os fluxos e a acessibilidade (axe). Escreva cada teste antes da implementação correspondente e confirme que falha.

**Organization**: Tarefas agrupadas por user story. Caminhos relativos à raiz do repositório (o próprio frontend). Reutilize, sem alterar o comportamento: `js/api/client.js`, `js/api/errors.js`, `js/components/region-state.js`, `js/components/error-state.js`, `js/components/config-notice.js`, `js/components/site-nav.js`, `js/utils/format.js` (`formatOccurrence`, `activityDetailsUrl`), a classe `.image-fallback` do card e os tokens/estilos da feature 004. Dados da API só via `textContent`/atributos, nunca `innerHTML`. Nenhum valor literal de cor, fonte, espaçamento ou duração fora de `css/tokens.css` (há teste que verifica). O contrato da API e o endereço `atividade.html?id=` não mudam.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[Story]**: US1 = consultar os detalhes (P1), US2 = não encontrada e erro (P1), US3 = link externo (P2)

---

## Phase 1: Setup

**Purpose**: Utilitários de teste usados por várias histórias

- [X] T001 [P] Estender `tests/e2e/helpers/mock-api.js`: (a) exportar `makeDetails(overrides = {})` com o corpo completo de `GET /activities/{id}/` conforme `contracts/api-usage.md` (`id` UUID, `title`, `summary`, `description`, `target_audience_notes`, `unit {id,name,slug,address,neighborhood}`, `category {id,name,slug}`, `target_audiences [{id,name}]`, `external_registration_url: null`, `schedules` com uma pontual e uma recorrente (`weekdays`, `weekday_names`), `next_occurrences` com 2 itens); (b) nova opção `detailsResponder(id, url)` em `mockApi` que decide a resposta de `GET **/api/v1/activities/<uuid>/` (devolve `{ status = 200, body }`, `body` objeto serializado em JSON; padrão `404` com `{"detail":"Não encontrado."}`); (c) garantir que o handler existente de `**/activities/**` (listagem) não capture o detalhe: diferenciar por caminho terminado em UUID; (d) manter a compatibilidade com `home-*.spec.js` e `explore-*.spec.js`
- [X] T002 [P] Estender `tests/unit/helpers/dom.js` com `mountDetailsDom()`, que monta em jsdom o trecho de `atividade.html` definido em T008 (mesmos ids e atributos: `#details-back`, `#details-status`, `#details-content`, `h1`), para os testes de orquestração

---

## Phase 2: Foundational (bloqueia todas as histórias)

**Purpose**: Acesso à API, leitura do id, estrutura HTML, estilos base e esqueleto da página

- [X] T003 [P] Acrescentar a `tests/unit/public-api.test.js` (deve falhar) casos de `fetchActivityDetails(id, { scope, fetchImpl })` com `fake-fetch`: chama `GET /activities/<id>/` com barra final e sem parâmetros de consulta; codifica o id no caminho; aceita `scope` e cancela a consulta anterior do mesmo escopo; propaga `ApiError` para `404` (`not_found`), `400`, `429`, `500`, rede, tempo esgotado e JSON inválido
- [X] T004 [P] Escrever `tests/unit/details-id.test.js` (deve falhar) cobrindo `contracts/details-url.md`: `parseActivityId(search)` devolve o UUID em minúsculas quando `?id=` é um UUID válido (com espaços nas pontas e maiúsculas); devolve `null` para ausente, vazio, não UUID, UUID com sufixo ou com caracteres extras, `javascript:…`; com `id` repetido vale o primeiro; parâmetros desconhecidos e hash ignorados; aceita string com ou sem `?` inicial
- [X] T005 Implementar `fetchActivityDetails(id, { scope, fetchImpl })` em `js/api/public.js` para passar T003, reutilizando o `get()` interno e `encodeURIComponent(id)` no caminho `/activities/${id}/`
- [X] T006 Implementar `js/details/id.js` para passar T004: `parseActivityId(search)` com `URLSearchParams`, `trim`, minúsculas e expressão regular `^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$`; sem acesso a `window`/`document`
- [X] T007 [P] Escrever `tests/unit/details-page.test.js` (deve falhar) apenas com o esqueleto de orquestração (preenchido nas fases seguintes): importa `init` de `js/pages/activity-details.js` com `mountDetailsDom()`, sem `#details-content` não faz nada, e com a configuração inválida mostra o aviso de configuração existente e não deixa o conteúdo em esqueleto (FR-019)
- [X] T008 Atualizar `atividade.html`: `<title>Detalhes da atividade — Agenda Livre</title>`; no `<main id="main-content" tabindex="-1">`: `<a id="details-back" class="details-back" href="explorar.html">← Voltar para atividades</a>`, `<div id="details-status" class="visually-hidden" role="status" aria-live="polite"></div>`, `<div id="details-content" class="activity-details"></div>` e `<noscript><p>Para ver os detalhes da atividade, ative o JavaScript no navegador.</p></noscript>`; manter cabeçalho, navegação, rodapé e a ordem dos estilos; remover o `h1` e o texto provisórios (o `h1` passa a ser criado por `render.js`)
- [X] T009 [P] Acrescentar a `css/layout.css` o bloco `.activity-details` e `.details-back`: coluna única com largura máxima de leitura, espaçamentos e tipografia somente por tokens; `.activity-details__media` (reuso de `.image-fallback`, proporção fixa), `__category`, `__title`, `__summary`, `__meta`, seções com `h2` e `white-space: pre-line` na descrição; quebra de palavras longas (`overflow-wrap: anywhere`); sem rolagem horizontal em 320 px
- [X] T010 Reescrever `js/pages/activity-details.js` (esqueleto): `init()` chama `initSiteNav()`, obtém `main`, `#details-content`, `#details-status`, `#details-back`; `showConfigNotice(getConfigStatus())`; cria `createRegionState({ content, status, renderSkeleton })` com esqueleto de blocos de texto (elementos `.skeleton-card` ou equivalente com `aria-hidden="true"`); cria um `createRequestScope()`; `load()` mostra o esqueleto, lê o id com `parseActivityId(location.search)` e chama `fetchActivityDetails`; ainda sem renderizar o sucesso nem a "não encontrada" (US1 e US2); `pagehide` cancela a consulta; `init()` é exportado e chamado no fim do módulo, como nas demais páginas

**Checkpoint**: página abre, mostra esqueleto, usa o id validado e o aviso de configuração; T007 passa

---

## Phase 3: User Story 1 - Consultar os detalhes de uma atividade (P1) 🎯 MVP

**Goal**: Exibir título, categoria, unidade, descrição, público-alvo, programações e próximas datas, omitindo o que não vier, com "Voltar para atividades".

**Independent Test**: Abrir `atividade.html?id=<uuid>` de atividade pontual e de recorrente, completa e com poucos campos; conferir conteúdo, ausência de rótulos vazios, título do documento e o voltar.

### Tests for User Story 1 (escreva primeiro; devem falhar)

- [X] T011 [P] [US1] Escrever `tests/unit/details-schedule-model.test.js`: `scheduleViews(schedules, occurrences)` conforme `data-model.md` — pontual (`ONE_TIME`) devolve `kind: "one-time"` com data e horário (`14h00 às 15h00`; só início quando não há fim; só data quando não há início) e sem dias da semana; recorrente devolve `kind: "recurring"` com período `start_date`–`end_date`, `weekdaysLabel` com `weekday_names` por extenso unidos por vírgula e " e " antes do último, e horário; várias programações mantêm a ordem da API; `upcoming` com `label` e `datetime` por ocorrência (usa `formatOccurrence`), vazio quando não há; `schedules` ausente, nulo ou vazio, datas ou horas inválidas e itens nulos não quebram (omitidos); não reordena nem recalcula nada
- [X] T012 [P] [US1] Escrever `tests/unit/details-render.test.js` (jsdom): `renderDetails(data)` devolve nós com `h1` único (título), categoria acima do título, resumo, unidade (nome, bairro e endereço quando houver), bloco "Quando" com programações e "Próximas datas" (`<time datetime>`), seção "Público" (nomes e observações), seção "Sobre a atividade" (descrição) e a mídia `.image-fallback` com `aria-hidden="true"`; campos ausentes, nulos ou só com espaços omitem a seção inteira (rótulo incluído) sem "undefined"/"null"; sem ocorrências mostra "Sem data prevista"; `<script>`/HTML no título, descrição, unidade e público aparece como texto literal (sem elementos criados); títulos de seção são `h2` sem saltos; sem `unit`/`category` o bloco some; resposta sem `id` ou `title` textual lança erro de `invalid_response`
- [X] T013 [P] [US1] Acrescentar a `tests/unit/details-page.test.js` casos de sucesso com `fake-fetch`: com id válido faz uma única requisição a `/activities/<id>/`; durante a espera há esqueleto com `aria-hidden` e anúncio breve de carregamento; no sucesso substitui o esqueleto pelo conteúdo, anuncia a conclusão uma vez, define `document.title` como `<título> — Agenda Livre` e mantém o foco onde estava (nunca em elemento removido); resposta atrasada de consulta anterior não sobrescreve a mais recente; resposta `200` sem `title` vira erro com "Tentar novamente"
- [X] T014 [P] [US1] Escrever `tests/unit/details-back.test.js` (jsdom): o link `#details-back` mantém `href="explorar.html"`; com `document.referrer` da mesma origem terminando em `explorar.html` (com ou sem query) e `history.length > 1`, clique simples chama `history.back()` e cancela a navegação padrão; com Ctrl, Meta, Shift, botão do meio, referrer de outra origem, referrer de outra página ou sem referrer, segue o link normal; referrer inválido não lança
- [X] T015 [P] [US1] Escrever `tests/e2e/details-content.spec.js` (Playwright, `mockApi` com `detailsResponder`): atividade completa mostra categoria, `h1`, unidade, programação pontual e recorrente, próximas datas, público, descrição e título do documento da atividade; atividade com poucos campos não mostra rótulos nem espaços vazios; atividade sem ocorrências mostra "Sem data prevista"; abrir por link direto em contexto novo funciona; descrição com HTML aparece como texto; esqueleto visível durante resposta atrasada; clicar em um card da Início e da Explorar abre os detalhes da mesma atividade

### Implementation for User Story 1

- [X] T016 [US1] Implementar `js/details/schedule-model.js` para passar T011: `scheduleViews(schedules, occurrences)` puro, reutilizando `formatOccurrence` de `js/utils/format.js` para datas e horas (estendendo-o somente se faltar um formato de data completa para o período, sem alterar a saída usada pelo card; se estender, cobrir em `tests/unit/format.test.js`); lista de dias da semana em português com " e " final; sem DOM
- [X] T017 [US1] Implementar `js/details/render.js` (`renderDetails(data)`) para passar T012: cria nós com `document.createElement`/`textContent`, nunca `innerHTML`; omite seções vazias; `h1` com a classe `activity-details__title` e `tabindex="-1"`; mídia `.image-fallback` decorativa com ícone padrão; seções: "Quando" (programações e `Próximas datas`), "Público", "Local" (unidade com endereço e bairro), "Sobre a atividade"; classes conforme T009; lança `ApiError("invalid_response")` quando `data` não tem `id` ou `title` textual
- [X] T018 [US1] Completar `js/pages/activity-details.js` para passar T013: `show(data)` usa `renderDetails`, `region.showSuccess(nodes, { announce: "Detalhes carregados." })` e define `document.title`; erros de renderização viram `ApiError("invalid_response")` e `region.showError`; resposta cancelada é ignorada
- [X] T019 [US1] Implementar em `js/details/back-link.js` (novo) `initBackLink(link, { referrer = document.referrer, historyRef = history, origin = location.origin })` para passar T014, e chamá-lo em `js/pages/activity-details.js`; sem estado em `sessionStorage`
- [X] T020 [P] [US1] Acrescentar a `css/components.css` o estilo do bloco "Quando" (lista de programações, `<time>`, rótulos), se não coberto por T009, apenas com tokens; confirmar `prefers-reduced-motion` sem animação no esqueleto (regra global existente) e rodar `tests/unit/design-tokens.test.js` sem valores literais novos
- [X] T021 [US1] Rodar `npm test` e `npx playwright test details-content` e corrigir até T011–T015 passarem

**Checkpoint**: US1 é um MVP utilizável (detalhes completos por link direto e pelos cards)

---

## Phase 4: User Story 2 - Não encontrada e erro de comunicação (P1)

**Goal**: Estado único de "não encontrada ou não disponível" com saídas claras, e erro de comunicação distinto com "Tentar novamente".

**Independent Test**: Abrir com UUID inexistente, id inválido, sem `id` e com a API fora do ar; conferir os dois estados distintos, a ausência de requisição para id inválido e o retry.

### Tests for User Story 2 (escreva primeiro; devem falhar)

- [X] T022 [P] [US2] Acrescentar a `tests/unit/details-render.test.js` casos de `renderNotFound()`: `h1` "Atividade não encontrada ou não disponível", texto curto explicando que pode ter sido encerrada ou removida (sem afirmar qual caso), link "Explorar outras atividades" para `explorar.html` e "Voltar ao Início" para `index.html`; nenhum dado da API é usado
- [X] T023 [P] [US2] Acrescentar a `tests/unit/details-page.test.js` casos: `404` mostra o estado de não encontrada, anuncia uma vez e define `document.title` como `Atividade não encontrada — Agenda Livre`; `id` ausente, vazio ou inválido mostra o mesmo estado **sem chamar** `fetch`; rede, tempo esgotado, `500`, `429` e JSON inválido mostram a mensagem amigável e "Tentar novamente" (apenas quando `retryable`), título `Erro ao carregar a atividade — Agenda Livre`, sem detalhes técnicos e distinta da não encontrada; "Tentar novamente" refaz a consulta com esqueleto, cliques repetidos geram uma única requisição, nova falha restaura a mensagem e o sucesso mostra o conteúdo; navegar para fora cancela a consulta sem erro visível; nenhuma mudança de estado move o foco para fora de elemento visível
- [X] T024 [P] [US2] Escrever `tests/e2e/details-states.spec.js` (Playwright): UUID inexistente (`404`), `id` inválido e sem `id` exibem o mesmo estado com os dois links operáveis por teclado, e os dois últimos não geram requisição à API; erro `500`/rede mostra mensagem e "Tentar novamente" e, ao religar a API, o conteúdo aparece; cliques repetidos no botão geram uma requisição; `429` mostra mensagem de limite; configuração inválida mostra o aviso e não deixa esqueleto indefinido; JavaScript desativado mostra a mensagem estática do `noscript` e a navegação principal continua; links "Explorar outras atividades" e "Voltar ao Início" levam às páginas corretas

### Implementation for User Story 2

- [X] T025 [US2] Implementar `renderNotFound()` em `js/details/render.js` para passar T022 (nós criados com `createElement`/`textContent`; links com classe `.button` e `.button--outline`)
- [X] T026 [US2] Completar `js/pages/activity-details.js` para passar T023: `id` nulo ou `error.category === "not_found"` chama `region.showSuccess(renderNotFound(), { announce: "Atividade não encontrada ou não disponível." })` e atualiza o título; demais erros usam `region.showError(error, { onRetry: load })`; título de erro conforme `contracts/details-url.md`; erros `cancelled` ignorados; `pagehide` cancela o escopo
- [X] T027 [P] [US2] Acrescentar a `css/components.css` o estilo `.not-found` (espaçamento, ações em linha que quebram em coluna em 320 px), apenas com tokens
- [X] T028 [US2] Rodar `npm test` e `npx playwright test details-states` e corrigir até T022–T024 passarem

**Checkpoint**: US1 + US2 cobrem a página em todos os estados de carregamento

---

## Phase 5: User Story 3 - Abrir a inscrição ou informação externa (P2)

**Goal**: Botão para o site externo somente com URL `http`/`https` válida, em nova aba e com indicação acessível.

**Independent Test**: Abrir atividade com e sem link e com valores perigosos; conferir botão, nova aba, nome acessível e ausência do botão nos casos inválidos.

### Tests for User Story 3 (escreva primeiro; devem falhar)

- [X] T029 [P] [US3] Escrever `tests/unit/details-external-link.test.js`: `safeExternalUrl(value)` devolve a URL normalizada para `https://exemplo.org/inscricao?x=1` e `http://exemplo.org`; devolve `null` para nulo, indefinido, número, objeto, vazio, só espaços, `javascript:alert(1)`, `JaVaScRiPt:`, `data:text/html,…`, `file:///etc/passwd`, `ftp://…`, `//exemplo.org`, `/relativa`, `exemplo.org` sem esquema, `https://usuario:senha@exemplo.org`, `https://` e strings malformadas; apara espaços nas pontas
- [X] T030 [P] [US3] Acrescentar a `tests/unit/details-render.test.js` casos do link externo: com URL válida, `renderDetails` inclui um `<a class="button external-link" target="_blank" rel="noopener noreferrer">` com `href` igual à URL normalizada, texto visível que contém "site externo" e "nova aba" (por exemplo "Inscrição ou informações (site externo, abre em nova aba)"), sem depender só de ícone, e ícone decorativo com `aria-hidden="true"`; sem URL ou com URL inválida/perigosa não existe nenhum `<a>` externo nem espaço reservado; o texto não afirma que a inscrição ocorre no Agenda Livre
- [X] T031 [P] [US3] Escrever `tests/e2e/details-external-link.spec.js` (Playwright): com URL `https` o botão existe, tem `target="_blank"` e `rel` com `noopener` e `noreferrer`, o clique abre uma nova página (evento `popup`) e a página dos detalhes permanece; sem URL não há botão; com `javascript:alert(1)` e `data:` simulados na API não há botão e nenhum diálogo/script é executado; o foco por teclado chega ao botão e o nome acessível informa site externo e nova aba

### Implementation for User Story 3

- [X] T032 [US3] Implementar `js/details/external-link.js` para passar T029: `safeExternalUrl(value)` com `typeof value === "string"`, `trim`, `new URL()` em `try/catch`, protocolo `http:`/`https:`, `hostname` não vazio, sem `username`/`password`; devolve `url.href` ou `null`
- [X] T033 [US3] Estender `renderDetails` em `js/details/render.js` para passar T030: ao final do conteúdo, criar o `<a>` externo apenas quando `safeExternalUrl(data.external_registration_url)` não for `null`; atributos `target`, `rel`, texto visível conforme T030; ícone decorativo SVG inline opcional com `aria-hidden="true"` e `focusable="false"`
- [X] T034 [P] [US3] Acrescentar a `css/components.css` o estilo `.external-link` (reuso de `.button`, foco visível não obscurecido, quebra de linha em 320 px), apenas com tokens
- [X] T035 [US3] Rodar `npm test` e `npx playwright test details-external-link` e corrigir até T029–T031 passarem

**Checkpoint**: as três histórias funcionam de forma independente

---

## Phase 6: Polish & Cross-Cutting

**Purpose**: Retorno ao contexto da listagem, acessibilidade, regressão e documentação

- [X] T036 [P] Escrever `tests/e2e/details-return.spec.js` (Playwright): na Explorar, aplicar filtros, ir à página 2, rolar, abrir um card e acionar "Voltar para atividades": a Explorar volta com os mesmos campos, página e posição (feature 006); abrir a página dos detalhes diretamente (sem referrer da Explorar) e acionar o link leva à `explorar.html` sem critérios; o botão voltar do navegador também restaura a listagem; Ctrl+clique no link abre a Explorar em nova aba sem `history.back()`
- [X] T037 [P] Escrever `tests/e2e/details-accessibility.spec.js` (Playwright + `@axe-core/playwright`): sem violações graves em sucesso (completo e mínimo), não encontrada, erro e carregando; um único `h1` e títulos sem saltos; operação só por teclado (link voltar, link externo, links da não encontrada, "Tentar novamente"); foco visível; região de status anuncia carregamento e mudança de estado sem mover o foco; 320 px e zoom de texto a 200 % sem rolagem horizontal nem perda de conteúdo (usar `tests/e2e/helpers/viewports.js`); `reducedMotion` sem animação nos esqueletos
- [X] T038 [P] Atualizar `tests/e2e/shared-components.spec.js`, `tests/e2e/navigation.spec.js` e `tests/e2e/structure-config.spec.js` somente se algum teste dependia do texto provisório "Os detalhes da atividade estarão disponíveis em breve." ou do `h1` "Detalhes da atividade" estático de `atividade.html`; procurar por esses textos antes e ajustar para o novo comportamento
- [X] T039 Rodar a suíte completa (`npm test` e `npx playwright test`) e confirmar que nada da Início (005) nem da Explorar (006) regrediu; corrigir qualquer falha
- [ ] T040 Executar o roteiro manual de `quickstart.md` (conteúdo, link direto, voltar, não encontrada, erro, link externo, teclado, 320 px/200 %, movimento reduzido, JavaScript desativado) e preencher a tabela "Registro da revisão com leitor de tela" com data, leitor/navegador e resultado; anotar divergências em `docs/PENDENCIAS-BACKEND.md` apenas se o contrato real da API divergir do documentado
- [X] T041 [P] Atualizar `README.md` na seção de páginas/funcionalidades com a página de detalhes (endereço `atividade.html?id=`, estados e dependência do `GET /activities/{id}/`), seguindo o estilo das seções existentes

---

## Dependencies & Execution Order

- **Phase 1 → Phase 2**: T001 e T002 podem ser feitas em paralelo e antes dos testes que as usam. Na Phase 2, T003/T004/T007 (testes) antes de T005/T006/T010; T008 antes de T010 e T002; T009 independente.
- **Phase 2 bloqueia todas as histórias.**
- **US1 (Phase 3)**: testes T011–T015 em paralelo; depois T016 → T017 → T018; T019 e T020 em paralelo com T017; T021 por último.
- **US2 (Phase 4)**: depende da Phase 2 e de `js/details/render.js` (T017) existir; T022–T024 em paralelo; T025 → T026; T027 em paralelo; T028 por último.
- **US3 (Phase 5)**: depende de `renderDetails` (T017); T029–T031 em paralelo; T032 → T033; T034 em paralelo; T035 por último.
- **Polish (Phase 6)**: após as histórias desejadas; T036–T038 e T041 em paralelo; T039 e T040 por último.
- Ordem de prioridade: US1 (P1) e US2 (P1) antes de US3 (P2). US2 e US3 só tocam `render.js` depois de US1; evitar edições simultâneas nesse arquivo.

## Parallel Example: User Story 1

```text
Em paralelo (arquivos diferentes):
  T011 tests/unit/details-schedule-model.test.js
  T012 tests/unit/details-render.test.js
  T013 tests/unit/details-page.test.js (casos de sucesso)
  T014 tests/unit/details-back.test.js
  T015 tests/e2e/details-content.spec.js
Depois, em sequência: T016 → T017 → T018; em paralelo com T017: T019, T020.
```

## Implementation Strategy

- **MVP**: Phase 1 + Phase 2 + US1 (T001–T021). Entrega os detalhes por link direto e pelos cards; sem US2 a página ainda não trata inexistente, então entregar US2 logo em seguida (mesmo nível P1).
- **Incremental**: US1 → US2 → US3 → Polish, validando cada fase pelo "Independent Test" e pelo `quickstart.md`.
- **Qualidade**: cada teste novo falha antes da implementação; `design-tokens.test.js` e axe rodam a cada fase com CSS.
