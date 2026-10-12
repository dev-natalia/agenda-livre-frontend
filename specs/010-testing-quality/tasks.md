---

description: "Task list for feature 010 - Testes e qualidade do frontend"
---

# Tasks: Testes e qualidade do frontend

**Input**: Design documents from `/specs/010-testing-quality/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/coverage-matrix.md, contracts/api-image-contract.md, contracts/contract-check.md, contracts/quality-report.md, quickstart.md

**Tests**: Incluídos. Esta feature é uma auditoria da suíte: os testes novos **são** a entrega. Escreva o teste primeiro e rode. Se falhar, é uma lacuna real no código: corrija na origem. Se passar de primeira, o comportamento já estava protegido e o teste vira rede de proteção contra regressão. **Prova de regressão**: para os testes de segurança e de imagem, reintroduza a falha de propósito, confirme que o teste reprova e reverta. Nunca remova, desative nem enfraqueça um teste existente; nunca use `retries`, `.only` nem `.skip` sem motivo escrito.

**Organization**: Tarefas agrupadas por user story. Caminhos relativos à raiz do repositório. Reaproveite `tests/e2e/helpers/mock-api.js` (`mockApi`, `overrideConfig`, `makeListing`, `makeDetails`, `makeActivity`, `activitiesResponder`, `detailsResponder`), `tests/unit/helpers/dom.js`, `tests/unit/helpers/fake-fetch.js` (`jsonResponse`, `pendingFetch`) e `tests/unit/helpers/css.js`. Dados sintéticos, sem dados pessoais reais. Nenhum valor literal de cor, fonte ou duração fora de `css/tokens.css` (há teste). Sem mudança no backend. Sem pacote novo.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[Story]**: US1 = auditoria, segurança e imagem (P1), US2 = comando único e guia (P1), US3 = registro de qualidade (P2), US4 = contrato com a API real (P2), US5 = integração contínua (P3)

---

## Phase 1: Setup

**Purpose**: Linha de base antes de qualquer mudança

- [X] T001 Rodar `npm test` e `npx playwright test` (porta 5500 livre) e anotar aprovados, falhos, ignorados e duração em um rascunho de `docs/20-registro-de-qualidade.md` (seção "Resultados", marcado como linha de base). Esperado: pelo menos 692 unitários e 624 de navegador aprovados, 20 ignorados. Se algo já falhar, registrar antes de qualquer mudança para não confundir com regressão desta feature
- [X] T002 [P] Criar o esqueleto de `docs/20-registro-de-qualidade.md` com as nove seções de `specs/010-testing-quality/contracts/quality-report.md` (identificação, ambiente, resultados, ignorados, defeitos, exceções, critérios do DOC-14 §14, limitações, referências), com tabelas vazias e a linha de base de T001
- [X] T003 [P] Registrar em `docs/20-registro-de-qualidade.md` (seção "Ambiente") as versões reais: `node -v`, `python --version`, versões de `vitest`, `@playwright/test`, `@axe-core/playwright` de `package.json`/`package-lock.json`, build do Chromium do Playwright e sistema operacional

---

## Phase 2: Foundational (bloqueia as histórias)

**Purpose**: Fixtures compartilhadas, usadas pelos testes de unidade e de navegador das histórias seguintes

- [X] T004 Criar `tests/fixtures/activities.js` movendo de `tests/e2e/helpers/mock-api.js` as funções `makeActivity`, `makeDetails`, `makeListing`, `UNITS`, `CATEGORIES`, `DETAILS_ID` sem alterar seu comportamento, e acrescentando conforme `data-model.md` (tabela "Fixture de API"): `withImage(activity, { alt, decorative })`, `withNullImage(activity)`, `makeDetailsNoUrl()`, `makeDetailsMinimal()` (só os campos obrigatórios; opcionais ausentes), `makeRecurring()`, `makeEmptyListing()` (`count: 0`, `results: []`, `next`/`previous` nulos) e `HOSTILE_TEXT` (marcação com `<script>`, `<img src=x onerror=...>`, aspas, `&`, `javascript:` e `data:` em texto livre). Ids em formato UUID, formato fiel ao DOC-05, nenhum dado pessoal real. `image` segue `contracts/api-image-contract.md`: `{ url, alt, decorative }` ou `null`
- [X] T005 Em `tests/e2e/helpers/mock-api.js`, trocar as definições movidas por `export { ... } from "../../fixtures/activities.js"` (mesmos nomes) para que nenhum teste existente precise mudar; rodar `npx playwright test` e `npm test` e confirmar as mesmas contagens de T001 (SC-009)

**Checkpoint**: fixtures centralizadas; as histórias seguem em ordem de prioridade.

---

## Phase 3: User Story 1 - Auditar a cobertura e fechar as lacunas (Priority: P1) 🎯 MVP

**Goal**: Cada verificação do DOC-14 (§6, §7, §8, §11, §12) tem teste automático ou lacuna declarada com motivo; as lacunas automatizáveis (segurança, imagem, respostas fora de ordem) ficam cobertas.

**Independent Test**: Escolher qualquer item do DOC-14 na matriz e chegar ao teste; reintroduzir de propósito `javascript:` no link externo, `innerHTML` no cartão e uma mensagem de erro com pilha, e ver a suíte reprovar a cada uma.

### Auditoria

- [X] T006 [US1] Ler os arquivos de teste citados em `specs/010-testing-quality/contracts/coverage-matrix.md` para cada item `a-confirmar` e substituir a situação inicial por `coberto`, `coberto-parcial`, `lacuna-automatizada` ou `lacuna-declarada`, com a evidência real (arquivo e, quando útil, o nome do teste) e o motivo quando não for `coberto`. Corrigir caminhos citados que não existam. Nenhum item pode ficar `a-confirmar`
- [X] T007 [P] [US1] Criar `tests/unit/coverage-matrix.test.js`: (a) lê `specs/010-testing-quality/contracts/coverage-matrix.md`, extrai todo caminho entre crases que comece com `tests/`, `docs/`, `.github/`, `package.json` ou `js/` e falha se algum não existir (exceto os criados por esta feature, que já devem existir ao final); (b) falha se restar `a-confirmar` ou se uma linha `lacuna-declarada` ou `coberto-parcial` não tiver motivo; (c) varre `tests/` e `playwright.config.js` e falha se achar `retries:` com valor maior que 0, `test.only` / `describe.only` / `it.only`, ou `test.skip(`/`describe.skip` / `it.skip` sem uma mensagem de motivo literal como segundo argumento (o único existente hoje, em `tests/e2e/a11y-contrast-states.spec.js`, já tem motivo)

### Segurança (DOC-14 §11)

- [X] T008 [P] [US1] Criar `tests/unit/security-text-as-text.test.js` (jsdom, helpers de `tests/unit/helpers/dom.js`): renderizar com `HOSTILE_TEXT` de `tests/fixtures/activities.js` o cartão (`createActivityCard` de `js/components/activity-card.js`), o conteúdo de detalhes (`js/details/render.js`; ler o arquivo para usar sua função exportada), a mensagem de erro (`js/components/error-state.js`) e o aviso de configuração (`js/components/config-notice.js`); afirmar que o texto aparece literal em `textContent`, que não surgiu nenhum `<script>`, `<img>` ou atributo `on*` além dos previstos pelo componente, e que `innerHTML` do contêiner não contém a marcação sem escape. Prova de regressão: trocar `textContent` por `innerHTML` em `activity-card.js`, ver reprovar, reverter
- [X] T009 [P] [US1] Criar `tests/unit/security-external-url.test.js` sobre `js/details/external-link.js` (ler a API exportada primeiro) e sobre `isHttpUrl`/`image.url` do cartão: aceitar `http://` e `https://` válidas; rejeitar `javascript:`, `JaVaScRiPt:`, `data:`, `vbscript:`, `file:`, `//host/caminho`, texto sem esquema, string vazia, `null`, espaços e URL malformada; confirmar que a URL válida gera link com `target="_blank"`, `rel` contendo `noopener` e `noreferrer` e indicação textual de site externo. Reaproveita sem duplicar o que `tests/unit/details-external-link.test.js` já cobre. Prova de regressão: aceitar `javascript:` em `external-link.js`, ver reprovar, reverter
- [X] T010 [P] [US1] Criar `tests/unit/no-secrets.test.js`: varre `index.html`, `explorar.html`, `atividade.html`, `sobre.html`, `contato.html`, `css/**/*.css` e `js/**/*.js` e falha se achar (sem diferenciar maiúsculas) `password`, `senha`, `secret`, `api_key`, `apikey`, `private_key`, `Authorization`, `Bearer ` ou cadeias longas que lembrem chave (`[A-Za-z0-9_-]{32,}` fora de `fonts/` e de URLs de ids), com uma lista curta e explícita de exceções justificadas dentro do próprio teste; confirma que `PUBLIC_CONFIG` em `js/config.js` tem somente `apiBaseUrl` e `requestTimeoutMs`. Acrescentar a verificação de que as fixtures em `tests/fixtures/activities.js` não têm e-mail nem telefone reais (e-mails só em `example.com`/`example.org`)
- [X] T011 [P] [US1] Criar `tests/unit/error-messages-no-leak.test.js`: para cada categoria de `ApiError` em `js/api/errors.js` (`config`, `network`, `timeout`, `not_found`, `bad_request`, `rate_limited`, `server`, `http`, `invalid_response`, `cancelled`), construir o erro com detalhes hostis (pilha `at Object.<anonymous> (/srv/app.py:10)`, `Traceback`, `http://localhost:8000`, `Bearer abc`, corpo HTML de erro do servidor) e afirmar que `userMessage` e o texto renderizado por `renderErrorState` não contêm nenhum desses fragmentos nem o corpo bruto; confirmar que o `console` só recebe detalhes em `localhost` (comportamento do README)
- [X] T012 [US1] Criar `tests/e2e/error-no-leak.spec.js`: com `mockApi`/`activitiesResponder` respondendo `500` com corpo `<h1>Traceback ... localhost:8000 ... Bearer abc</h1>`, JSON inválido e falha de rede, abrir `index.html`, `explorar.html` e `atividade.html?id=<uuid>`, e afirmar que `document.body.innerText` não contém `Traceback`, `Bearer`, `localhost:8000`, `at Object.` nem o corpo bruto, e que a mensagem amigável e o botão "Tentar novamente" (quando `retryable`) aparecem

### Campo de imagem (contracts/api-image-contract.md)

- [X] T013 [US1] Criar `tests/unit/image-field.test.js` (falha primeiro): para cartão e detalhes, as linhas da tabela "Tratamento esperado" de `contracts/api-image-contract.md`: informativa com `alt`; `decorative: true` (⇒ `<img alt="">` e contêiner `aria-hidden="true"`, ignorando o `alt` da API); `image: null`; campo ausente; `url` ausente, vazia, malformada, `javascript:`; falha de carga (evento `error`) troca por fallback; `alt` ausente em não decorativa ⇒ `alt=""`. O caso de detalhes é o que deve falhar hoje, porque `js/details/render.js` só mostra o fallback
- [X] T014 [US1] Em `js/components/activity-card.js`, tratar `image.decorative === true`: `<img alt="">`, contêiner `aria-hidden="true"`, sem usar o `alt` da API; manter o resto do comportamento. Extrair a criação da mídia (hoje `createMedia` e `isHttpUrl`) para um módulo compartilhado `js/components/activity-media.js` que exporta uma função usada pelo cartão e por detalhes, sem mudar a saída atual do cartão (os testes `tests/unit/activity-card.test.js` seguem verdes)
- [X] T015 [US1] Em `js/details/render.js`, trocar a função `media()` (hoje só fallback) para usar o módulo compartilhado de T014 com `data.image`, mantendo a classe `activity-details__media` e o fallback decorativo quando não houver imagem válida. Rodar `tests/unit/image-field.test.js` e `tests/unit/details-render.test.js` até verdes. Se for preciso estilo para `img` em `.activity-details__media`, usar só variáveis de `css/tokens.css` em `css/components.css` (imagem com `max-width: 100%`, proporção preservada)
- [X] T016 [P] [US1] Criar `tests/e2e/image-display.spec.js`: com `mockApi` e `withImage`/`withNullImage`, afirmar em `explorar.html` (cartões) e `atividade.html` (detalhes) que a imagem informativa tem `alt` igual ao da API e é anunciável; a decorativa tem `alt=""` e fica fora da árvore de acessibilidade; sem imagem aparece o fallback sem ícone quebrado; uma `url` que retorna `404` (interceptar com `page.route`) cai no fallback; e o `alt` não é gerado repetindo o título. Incluir também texto hostil (`HOSTILE_TEXT`) no título e no `alt` e afirmar que nada é executado (nenhum `dialog` aberto, nenhuma requisição ao domínio do `onerror`)

### Respostas fora de ordem

- [X] T017 [P] [US1] Criar `tests/e2e/stale-responses.spec.js`: em `explorar.html`, `activitiesResponder` devolve para a primeira consulta (`q=a`) uma lista lenta (`delayMs: 1500`) e para a segunda (`q=b`) uma rápida; disparar as duas pesquisas em sequência e afirmar que a tela final e a URL mostram só os resultados de `q=b`, mesmo depois de a resposta lenta chegar. Repetir para a página inicial (próximas atividades) trocando a resposta no meio da consulta, se o fluxo permitir; caso contrário, registrar em `coverage-matrix.md` o motivo
- [X] T018 [US1] Atualizar `specs/010-testing-quality/contracts/coverage-matrix.md` com os testes criados em T007 a T017 (`lacuna-automatizada` ⇒ `coberto`) e rodar `npx vitest run tests/unit/coverage-matrix.test.js` até verde. Executar uma vez cada prova de regressão indicada em T008, T009 e T011 e anotar o resultado em `docs/20-registro-de-qualidade.md` (seção "Defeitos" ou "Resultados", como verificação de sensibilidade)

**Checkpoint**: matriz sem `a-confirmar`, segurança e imagem cobertas; US1 entrega valor sozinha.

---

## Phase 4: User Story 2 - Rodar e entender a suíte com um comando documentado (Priority: P1)

**Goal**: Qualquer pessoa instala, roda as suítes e interpreta falhas seguindo um guia; existe um comando único.

**Independent Test**: Em cópia limpa do repositório, seguir só `docs/19-guia-de-testes.md` até o resultado final; quebrar um teste de propósito e conferir a mensagem; rodar `npm run test:all` duas vezes e obter o mesmo resultado.

- [X] T019 [US2] Em `package.json`, acrescentar os scripts `"test:all": "vitest run && playwright test"`, `"test:a11y": "playwright test a11y"` e `"test:contract": "vitest run --config vitest.contract.config.js"`, mantendo `test`, `test:watch` e `test:e2e` como estão. Rodar `npm run test:all` e confirmar que falha (código de saída diferente de zero) se um teste de qualquer suíte for quebrado de propósito; reverter
- [X] T020 [US2] Escrever `docs/19-guia-de-testes.md` com: objetivo e o que é automático ou manual (DOC-14 §3, §9.7), pré-requisitos (Node.js 20+, Python 3, `npm install`, `npx playwright install chromium`), comandos (`npm test`, `npm run test:watch`, `npm run test:e2e`, `npm run test:a11y`, `npm run test:all`, `npm run test:contract`), como rodar um arquivo e um teste isolado (`npx vitest run tests/unit/<arquivo>`, `-t "<nome>"`, `npx playwright test <arquivo>`, `-g`, `--headed`, `--debug`), a porta 5500 e o problema de servidor já aberto (`ERR_CONNECTION_REFUSED`), organização de `tests/unit`, `tests/e2e`, `tests/fixtures`, `tests/contract`, como usar `tests/fixtures/activities.js` e `mockApi`, como adicionar um teste, como interpretar uma falha (esperado × obtido, nome em português), dados sintéticos e relógio controlado, política sem `retries`/`.only`/`.skip` sem motivo, a matriz (`specs/010-testing-quality/contracts/coverage-matrix.md`), o registro (`docs/20-registro-de-qualidade.md`) e o DOC-17, e a afirmação de que passar na suíte não prova conformidade integral com a WCAG 2.2 AA nem substitui teclado e leitor de tela. Comandos sem sintaxe específica de Windows (mostrar variante PowerShell só para variáveis de ambiente)
- [X] T021 [US2] Em `README.md`, reduzir a seção "Testes" a um resumo curto (instalar, `npm test`, `npm run test:all`) com link para `docs/19-guia-de-testes.md`, sem repetir o conteúdo; manter a menção à matriz de acessibilidade da feature 009 apontando para `docs/17-registro-de-acessibilidade.md`; conferir que `tests/unit/` continua sem teste dependendo do texto do README
- [X] T022 [P] [US2] Auditar a reprodutibilidade: procurar em `tests/` por `Date.now()`, `new Date()` sem argumento, `Math.random`, `setTimeout` com espera fixa para sincronizar e por URLs externas (`https://` fora de `example.com`, `localhost`, `fonts`); trocar por relógio controlado (`vi.useFakeTimers`/`page.clock` do Playwright) ou espera por condição quando causar instabilidade ou dependência de data; registrar os que forem mantidos de propósito na seção "Limitações" de `docs/20-registro-de-qualidade.md`
- [X] T023 [US2] Rodar `npm run test:all` duas vezes seguidas sem mudar nada e comparar contagens (SC-004); investigar e corrigir na origem qualquer teste que oscile, sem `retries`. Anotar as duas execuções no rascunho do registro (seção "Resultados")
- [X] T024 [US2] Validar o guia em uma cópia limpa: clonar o repositório para uma pasta temporária (fora do projeto), seguir só o guia, cronometrar até o resultado final das duas suítes (meta SC-002: 15 minutos sem contar download) e corrigir no guia qualquer passo que tenha faltado

**Checkpoint**: US1 e US2 entregues; a suíte é auditada e reproduzível.

---

## Phase 5: User Story 3 - Registrar o que foi testado, com resultado e limites (Priority: P2)

**Goal**: Registro de qualidade datado, reproduzível e honesto sobre o que não foi verificado.

**Independent Test**: Ler `docs/20-registro-de-qualidade.md` sem abrir o código e responder commit, ambiente, contagens, ignorados, defeitos, limitações; conferir que os números batem com uma execução nova.

- [X] T025 [US3] Executar `npm run test:all` no commit a registrar e preencher em `docs/20-registro-de-qualidade.md` as seções "Identificação" (data, commit via `git rev-parse --short HEAD`, ramo, quem executou), "Ambiente" (de T003), "Resultados" (tabela por suíte: unitária, navegador, acessibilidade via `npm run test:a11y`, contrato; aprovados, falhos, ignorados, duração) e "Ignorados" (grupo, quantidade e motivo: ex. hover e foco só em 1280 px em `tests/e2e/a11y-contrast-states.spec.js`)
- [X] T026 [US3] Preencher "Defeitos" (id `QA-001`…, passos de reprodução, páginas e estados, impacto, gravidade, situação, teste de regressão) com tudo o que a auditoria achou (por exemplo, a página de detalhes ignorar `image`, corrigida em T015), ordenando primeiro os que bloqueiam teclado, leitor de tela ou tarefa central; "Exceções" (escopo, motivo, mitigação), ou "nenhuma" explicitamente
- [X] T027 [US3] Preencher "Critérios do DOC-14 §14" com os 11 critérios (testes unitários e de integração passam; fluxos principais passam; sem falhas críticas conhecidas; sem violações automáticas sem análise; teclado nos fluxos essenciais; leitor de tela; contraste, ampliação e reflow; estados distintos; formulário e aviso de que não envia; integração segue o contrato real; problemas e limitações registrados), cada um com situação (`atendido`, `atendido-com-ressalva`, `nao-verificado`) e evidência. Leitor de tela e teclado manual ficam `nao-verificado` (ver DOC-17); contrato real só `atendido` se T034 foi executada contra o backend
- [X] T028 [US3] Preencher "Limitações" (apenas Chromium; sem leitor de tela; sem aparelhos reais; API real só nas verificações descritas; retries desativados) e "Referências" (DOC-14, DOC-17 sem copiar números, `docs/19-guia-de-testes.md`, matriz). Usar as regras de redação de `contracts/quality-report.md`: não afirmar conformidade WCAG nem "sem defeitos"
- [X] T029 [P] [US3] Criar `tests/unit/quality-report.test.js` espelhando `tests/unit/accessibility-report.test.js` (ler esse arquivo primeiro para reaproveitar a estrutura): falhar se `docs/20-registro-de-qualidade.md` citar arquivo de teste inexistente, se faltar uma das nove seções, se um critério do DOC-14 §14 tiver situação fora do vocabulário (`atendido`, `atendido-com-ressalva`, `nao-verificado`), se houver `atendido` sem evidência, se o documento afirmar conformidade WCAG sem a ressalva, ou se repetir números do DOC-17 em vez de referenciá-lo
- [X] T030 [US3] Conferir os números: rodar de novo `npm run test:all` no mesmo commit e comparar com o registro (SC-008); ajustar o documento se divergir

**Checkpoint**: US3 entregue; a entrega tem evidência apresentável.

---

## Phase 6: User Story 4 - Verificar o contrato com a API real (Priority: P2)

**Goal**: Verificação opcional, somente leitura, que compara a API real com o que o frontend espera; ignorada sem `API_BASE_URL`.

**Independent Test**: Com o backend rodando, `API_BASE_URL=... npm run test:contract` confirma cada fluxo; sem a variável, `npm test` passa e a verificação aparece como ignorada, sem rede.

- [X] T031 [US4] Criar `vitest.contract.config.js` (`include: ["tests/contract/**/*.test.js"]`, `environment: "node"`) e garantir que `vitest.config.js` mantém `include` somente em `tests/unit/**`, de modo que `npm test` e `npm run test:all` não executem o contrato
- [X] T032 [US4] Criar `tests/contract/api-contract.test.js` conforme `contracts/contract-check.md`: `const API = process.env.API_BASE_URL;` e `describe.skipIf(!API)` com a mensagem "API_BASE_URL não informada; verificação de contrato não executada" (mostrada também por um `test.skip`/`it.todo` quando ausente); só `fetch` com método `GET`; fluxos: lista paginada (`count`, `next`, `previous`, `results` com `id`, `title`, `unit`, `category`, `next_occurrence`), busca por termo do primeiro item, lista vazia (`q=zzzz-inexistente-zzzz` ⇒ `count: 0`), filtro inválido (`date_from=invalido` ⇒ `400` com `errors`), página fora do intervalo (`page=999` ⇒ `400` com `errors.page`), detalhe do primeiro item (campos usados por `js/details/render.js`), detalhe com UUID aleatório (`404`) e o campo `image` (`null`, ausente ou `{url absoluta, alt, decorative}`). Fluxo que depende de dados e a lista vier vazia ⇒ marcado como não executável, não falha. Falha com "esperado X, observado Y". Não usar dados pessoais nem gravar nada
- [X] T033 [P] [US4] Criar `tests/unit/contract-check-guard.test.js` (roda na suíte padrão, sem rede): lê `tests/contract/api-contract.test.js` como texto e falha se contiver `method: "POST"`, `"PUT"`, `"PATCH"`, `"DELETE"`, ou `fetch(` sem estar sob o `skipIf`; e confirma que `package.json` tem `test:contract` e que `test:all` não o inclui
- [X] T034 [US4] Com o backend de demonstração em execução (se estiver disponível; a feature 010 de imagens do backend está em desenvolvimento), rodar `API_BASE_URL=http://localhost:8000/api/v1 npm run test:contract` e anotar o resultado por fluxo em `docs/20-registro-de-qualidade.md`. Cada divergência: itens em `docs/PENDENCIAS-BACKEND.md` (observado, esperado, impacto no frontend) sem alterar o frontend para acomodá-la. Se o backend não estiver disponível, registrar "não executado" na seção "Limitações" e manter o critério de contrato do DOC-14 §14 como `nao-verificado`
- [X] T035 [US4] Atualizar `specs/010-testing-quality/contracts/coverage-matrix.md` (linhas de contrato e de ordenação) e a seção correspondente de `docs/19-guia-de-testes.md` com o comando e a variável `API_BASE_URL` (sh e PowerShell)

**Checkpoint**: US4 entregue; mocks deixam de ser a única evidência de integração.

---

## Phase 7: User Story 5 - Executar a suíte em integração contínua (Priority: P3)

**Goal**: A suíte roda sozinha a cada alteração enviada, com relatório em caso de falha.

**Independent Test**: Abrir um pull request que quebra um teste de propósito e ver o resultado vermelho com relatório; reverter e ver verde.

- [X] T036 [US5] Criar `.github/workflows/tests.yml` acionado em `push` e `pull_request`: `ubuntu-latest`, `actions/checkout`, `actions/setup-node` (Node 20, `cache: npm`), `npm ci`, `npx playwright install --with-deps chromium`, `npm run test:all`; passo final `if: failure()` com `actions/upload-artifact` de `playwright-report/` e `test-results/`. Não executar `test:contract`. Usar versões fixas das ações (tags de versão exata)
- [X] T037 [US5] Garantir que `playwright.config.js` escreve o relatório em uma pasta fixa (`reporter: [["list"], ["html", { open: "never" }]]`) sem acrescentar `retries`, e que `.gitignore` ignora `playwright-report/` e `test-results/`
- [ ] T038 [US5] Documentar em `docs/19-guia-de-testes.md` a seção "Integração contínua" (o que roda, como ver o relatório, que o contrato real fica de fora, que falha não se resolve desativando teste) e conferir que `specs/010-testing-quality/contracts/coverage-matrix.md` aponta para `.github/workflows/tests.yml`. Validar o fluxo abrindo um pull request de teste, quebrando e restaurando um teste; se o GitHub Actions não estiver disponível, marcar esta história como adiada em "Limitações" do registro

**Checkpoint**: todas as histórias entregues (ou a P3 adiada com registro).

---

## Phase 8: Polish & Cross-Cutting

- [X] T039 Rodar `npm run test:all` completo e `npm run test:a11y`; conferir SC-009 (nenhum teste da linha de base removido: contagens ≥ T001) e que a matriz de acessibilidade da feature 009 segue verde sem alterações
- [X] T040 [P] Percorrer `specs/010-testing-quality/quickstart.md` do início ao fim e corrigir qualquer passo ou comando que não funcione
- [X] T041 [P] Atualizar `docs/PENDENCIAS-BACKEND.md` (item de imagens: anotar que o frontend já trata `image` em cartão e detalhes; só marcar resolvido quando a API real confirmar) e a seção "Cliente da API"/"Componentes compartilhados" do `README.md` onde a descrição de imagem mudou
- [X] T042 Revisão final de `docs/19-guia-de-testes.md` e `docs/20-registro-de-qualidade.md` contra `contracts/quality-report.md`; garantir que nenhum documento afirma conformidade integral, que todo `atendido` tem evidência e que o histórico de versões foi atualizado (número do DOC-14 §14 conferido)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências.
- **Foundational (Phase 2)**: depende do Setup; bloqueia as histórias que usam fixtures (US1, US4).
- **US1 (Phase 3)**: depende da Foundational. T006 antes de T018; T013 antes de T014 e T015; T014 antes de T015.
- **US2 (Phase 4)**: depende só de Setup; pode andar em paralelo com US1. T020 e T038 usam o resultado de T019; T023 e T024 devem vir depois de US1 para medir a suíte final.
- **US3 (Phase 5)**: depende de US1 e US2 (números e defeitos finais).
- **US4 (Phase 6)**: depende da Foundational; independente de US1 e US2; T034 usa o backend em execução.
- **US5 (Phase 7)**: depende de T019 (`test:all`) e de US2 para o guia.
- **Polish (Phase 8)**: depende de tudo o que for entregue.

### Parallel Opportunities

- Setup: T002 e T003 em paralelo.
- US1: T007, T008, T009, T010, T011 e T016 e T017 em paralelo (arquivos diferentes), depois T012; T013 → T014 → T015 em sequência.
- US2: T022 em paralelo com T020 e T021.
- US3: T029 em paralelo com o preenchimento do registro.
- US4: T033 em paralelo com T032.

### Parallel Example: User Story 1

```text
# Em paralelo, após T004 e T005:
Task: "Criar tests/unit/coverage-matrix.test.js"                 (T007)
Task: "Criar tests/unit/security-text-as-text.test.js"           (T008)
Task: "Criar tests/unit/security-external-url.test.js"           (T009)
Task: "Criar tests/unit/no-secrets.test.js"                      (T010)
Task: "Criar tests/unit/error-messages-no-leak.test.js"          (T011)
Task: "Criar tests/e2e/stale-responses.spec.js"                  (T017)
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Concluir Setup e Foundational.
2. Concluir US1: auditoria, segurança, imagem e respostas fora de ordem.
3. **Parar e validar**: matriz sem `a-confirmar`, provas de regressão reprovando, linha de base preservada.

### Incremental Delivery

1. US1 (confiança na suíte) → US2 (reprodutibilidade) → US3 (evidência) → US4 (contrato real) → US5 (CI).
2. Cada história é testável sozinha e não quebra a anterior; US5 pode ser adiada sem prejudicar o resto.

---

## Notes

- [P] = arquivos diferentes, sem dependência de tarefa incompleta.
- Correção de produto fica restrita a `js/components/activity-card.js`, `js/components/activity-media.js` (novo) e `js/details/render.js` (+ estilo de imagem de detalhes, se preciso, só com tokens); qualquer outra mudança de comportamento vira defeito registrado em `docs/20-registro-de-qualidade.md`, não correção silenciosa.
- Não desativar nem enfraquecer teste existente; não usar `retries`.
- Commit depois de cada tarefa ou grupo lógico.
- Os testes manuais (leitor de tela, teclado em aparelho real, outros navegadores) não são executados por esta feature: ficam `nao-verificado` no registro.

## Desvios registrados na implementação (2026-10-12)

- **T008, T009 e T017 não geraram arquivos novos.** A auditoria (T006) mostrou que já estavam cobertos: HTML como texto em `tests/unit/activity-card.test.js`, `details-render.test.js` e `error-state.test.js`; esquemas de URL externa em `tests/unit/details-external-link.test.js` (18 entradas rejeitadas, incluindo `javascript:`, `data:`, `file:`, `//host` e credenciais); respostas fora de ordem em `tests/e2e/explore-search.spec.js`. Duplicá-los só adicionaria manutenção. As lacunas reais de cada assunto foram cobertas em `tests/unit/image-field.test.js`, `tests/e2e/image-display.spec.js` e `tests/e2e/error-no-leak.spec.js` (texto hostil de ponta a ponta). A matriz registra essa decisão.
- **T018:** a prova de regressão foi executada para T011 (mensagem de erro com `cause.message`, 17 testes reprovaram) e para T010 (`password` e `token` em módulo de `js/`); as de T008 e T009 não se aplicam pelo motivo acima.
- **T034:** o contrato foi executado contra o backend de demonstração (7 de 7 conferem, incluindo `image`); a primeira tentativa teve `500` transitório do backend, anotado no registro.
- **T038:** a seção "Integração contínua" do guia foi escrita, mas a validação com um pull request real não foi feita (exige push e GitHub Actions); fica registrada em "Limitações" do `docs/20-registro-de-qualidade.md`.
