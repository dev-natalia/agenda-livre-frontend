---

description: "Task list for feature 009 - Acessibilidade transversal"
---

# Tasks: Acessibilidade transversal

**Input**: Design documents from `/specs/009-transversal-accessibility/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/audit-matrix.md, contracts/accessibility-report.md, quickstart.md

**Tests**: Incluídos. Esta feature é uma auditoria: os testes **são** o instrumento. Escreva o teste primeiro e rode: se falhar, é uma lacuna real; corrija na origem compartilhada e rode de novo. Se passar de primeira, o critério está coberto e a matriz recebe a evidência. Não enfraqueça nem desative regra para obter verde. Exceção do axe só com escopo, razão e mitigação em `contracts/audit-matrix.md`.

**Organization**: Tarefas agrupadas por user story. Caminhos relativos à raiz do repositório. Reaproveite `tests/e2e/helpers/mock-api.js` (`mockApi`, `overrideConfig`, `makeListing`, `makeDetails`, `makeActivity`) e `tests/unit/helpers/css.js` (`readCss`, `rootTokens`, `contrast`, `stripComments`). Correções entram nos arquivos compartilhados (`css/tokens.css`, `css/base.css`, `css/components.css`, `js/components/*`, ou o `.html` afetado), nunca por página isolada, sem mudar o comportamento funcional das features 001 a 008. Nenhum valor literal de cor, fonte, espaçamento ou duração fora de `css/tokens.css` (há teste). Dados de teste sintéticos. Sem mudança no backend.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[Story]**: US1 = teclado e foco (P1), US2 = estrutura, nomes e imagens (P1), US3 = estados dinâmicos (P1), US4 = contraste (P2), US5 = ampliação, espaçamento e movimento (P2), US6 = registro (P2)

---

## Phase 1: Setup

**Purpose**: Linha de base e matriz compartilhada pelos testes

- [ ] T001 Rodar `npm test` e `npx playwright test` e anotar o resultado de partida (aprovados/falhas e tempo) no rascunho de `docs/17-registro-de-acessibilidade.md`; se algo já falhar, registrar antes de qualquer mudança para não confundir com regressão desta feature
- [ ] T002 Criar `tests/e2e/helpers/a11y-matrix.js` exportando `PAGES` (`index.html`, `explorar.html`, `atividade.html`, `sobre.html`, `contato.html`), `WIDTHS` (`[1280, 320]`) e `STATES`, uma lista de `{ id, pages, minWidth/maxWidth, prepare(page) }` conforme a tabela "Matriz de estados" de `data-model.md`: `carregada`, `menu-aberto` (só 320 px, clicando no botão "Menu"), `resultados`, `vazio` (`count: 0`), `erro-api` (500), `form-erros` (enviar Contato vazio), `confirmacao` (Contato com dados sintéticos válidos). Cada `prepare` usa `overrideConfig` + `mockApi` e interação real (não injeta DOM) e espera o estado estar visível; exportar também `settle(page)` (aguarda ~300 ms das transições de 150 ms, como em `tests/e2e/accessibility.spec.js`)
- [ ] T003 [P] Criar o esqueleto de `docs/17-registro-de-acessibilidade.md` com as oito seções de `contracts/accessibility-report.md` (escopo e data, ambiente, resumo, verificações, problemas, exceções, limitações, aviso obrigatório copiado literalmente), com as tabelas vazias e a linha de base de T001

---

## Phase 2: Foundational (bloqueia as histórias)

**Purpose**: Os testes transversais precisam de pontos de leitura comuns antes de qualquer auditoria

- [ ] T004 Estender `tests/unit/helpers/css.js` com `ruleBlocks(css)` (devolve `{ selector, declarations }` para cada regra, sem comentários, expandindo `@media` aninhado com a condição) para os testes de regras de CSS das próximas histórias; cobrir com um caso em `tests/unit/design-tokens.test.js` ou em arquivo próprio `tests/unit/css-rule-blocks.test.js`
- [ ] T005 [P] Criar `tests/e2e/helpers/a11y-checks.js` com funções reutilizáveis de página: `headingOutline(page)` (lista `{level, text}` de `h1`–`h6` visíveis), `landmarks(page)`, `accessibleName(locator)` (via `locator.ariaSnapshot()` ou computado), `focusOrder(page, maxSteps)` (pressiona Tab e devolve, a cada passo, `{tag, name, box, visible}` até voltar ao início ou atingir `maxSteps`), `activeElementId(page)`

**Checkpoint**: matriz e utilitários prontos; as histórias seguem na ordem de prioridade.

---

## Phase 3: User Story 1 - Navegar e operar todo o site apenas com teclado (Priority: P1) 🎯 MVP

**Goal**: Cinco páginas operáveis só com teclado: link de pular primeiro e funcional, ordem de foco lógica, menu sem links ocultos na ordem, sem armadilhas, foco visível e nunca encoberto, estados sem depender de cor.

**Independent Test**: `npx playwright test a11y-keyboard a11y-focus-visible` e `npm test -- a11y-css-rules` verdes; roteiro manual §2 do `quickstart.md` concluído nas cinco páginas.

### Tests for User Story 1

- [ ] T006 [P] [US1] Criar `tests/unit/a11y-css-rules.test.js` (Vitest, lê `css/*.css` com `ruleBlocks`): (a) nenhuma regra com `outline: none` ou `outline: 0` sem `box-shadow`/`border`/`outline` alternativo visível no mesmo seletor com `:focus`/`:focus-visible`; (b) existe regra `:focus-visible` global com `outline` de largura `var(--focus-width)` e cor `var(--focus-color)`; (c) `.skip-link` é posicionado fora da tela quando não focado e `:focus` o traz à tela com `outline`; (d) se qualquer elemento de `header`/`.site-header` tiver `position: sticky` ou `fixed`, deve existir `scroll-padding-top` em `html` (hoje não há, o teste documenta essa condição); (e) bloco `@media (forced-colors: active)` existe e não zera `outline` (ver T011)
- [ ] T007 [P] [US1] Criar `tests/e2e/a11y-keyboard.spec.js` percorrendo `PAGES × WIDTHS [1280, 320]`: (a) primeiro `Tab` após `goto` focaliza `.skip-link`, que fica visível (`boundingBox` dentro da viewport); (b) acionar com Enter move o foco para dentro de `main` e o próximo `Tab` não volta ao cabeçalho nem ao menu; (c) `focusOrder` não contém elemento oculto (`display:none`, `visibility:hidden`, `hidden`, `inert`, `aria-hidden` ancestral) e, a 320 px com menu fechado, nenhum link do `nav`; (d) a ordem é a visual (por linha, `top` e `left` não decrescentes, com tolerância de 2 px); (e) o ciclo de Tab sai da página (volta ao início do documento) em no máximo 200 passos, sem repetir o mesmo elemento em sequência (armadilha); (f) a 320 px: abrir o menu com Enter, os links passam a receber foco na ordem, `Escape` fecha e devolve o foco ao botão "Menu"
- [ ] T008 [P] [US1] Criar `tests/e2e/a11y-focus-visible.spec.js`: para cada página e largura, focalizar por Tab cada controle (até 60 passos) e verificar (a) `outline-style` não `none` e largura efetiva ≥ 2 px, ou `box-shadow` não vazio, no computado; (b) `document.elementFromPoint` no centro do elemento focado devolve ele mesmo ou um descendente (não encoberto); (c) o elemento focado está dentro da viewport após a rolagem automática. Cobrir também os estados `explorar.html` com resultados e paginação, `atividade.html` com link externo, `contato.html` com erros
- [ ] T009 [P] [US1] Criar `tests/e2e/a11y-state-cues.spec.js`: em `explorar.html` (filtros e paginação), `contato.html` (campo inválido) e navegação (página atual), conferir que cada estado (página atual, selecionado, desabilitado, inválido) tem **pelo menos um indício não cromático**: `text-decoration`, `font-weight`, `border-style`/largura diferente do normal, texto adicional ("Erro:", "página atual") ou ícone; comparar o computado do estado com o do normal e falhar se só `color`/`background-color` mudarem

### Implementation for User Story 1

- [ ] T010 [US1] Rodar T006 a T009 e corrigir cada falha **na origem compartilhada**: foco e link de pular em `css/base.css`; ordem de foco/`hidden`/`inert` do menu em `js/components/site-nav.js`; estados sem indício não cromático em `css/components.css`; ordem do DOM divergente da ordem visual no `.html` afetado. Cada correção: uma linha em "Problemas" de `docs/17-registro-de-acessibilidade.md` (campos do `data-model.md`)
- [ ] T011 [US1] Se T006(e) falhar, acrescentar a `css/base.css` um bloco `@media (forced-colors: active)` que mantém o contorno de foco (`outline-color: Highlight`), bordas de campos/botões (`border-color: ButtonText`) e `forced-color-adjust: auto`, sem valores literais de cor fora de palavras-chave de sistema; se o teste de tokens exigir, permitir essas palavras-chave
- [ ] T012 [US1] Se o cabeçalho ou qualquer elemento passar a cobrir o foco (T008b falhar), adicionar `scroll-padding-top` em `html` (altura do cabeçalho via token) e `scroll-margin-top` nos alvos de âncora em `css/base.css`/`css/layout.css`; reexecutar T008

**Checkpoint**: teclado e foco verdes e registrados; é o MVP desta feature.

---

## Phase 4: User Story 2 - Compreender a estrutura e o conteúdo com leitor de tela (Priority: P1)

**Goal**: Idioma, título de documento, um `h1`, hierarquia, regiões, nomes de link e botão, página atual, controles nativos, textos alternativos e fallback corretos nas cinco páginas, inclusive no DOM gerado por script.

**Independent Test**: `npm test -- a11y-static-structure` e `npx playwright test a11y-names-and-images` verdes; roteiro manual §4 e §5 do `quickstart.md`.

### Tests for User Story 2

- [ ] T013 [P] [US2] Criar `tests/unit/a11y-static-structure.test.js` (Vitest, jsdom ou leitura do HTML com `DOMParser`): para cada um dos cinco `.html`: `lang="pt-BR"`; `<title>` presente, único entre as páginas e terminado em "— Agenda Livre" (exceto Início, que pode ser o nome do site); exatamente um `h1` no HTML estático ou, nas páginas cujo `h1` é gerado por script, um contêiner previsto; sem níveis de título pulados; um `header` com `nav` que tenha `aria-label`; um único `main` com `id="main-content"`; um `footer`; o primeiro elemento focável do `body` é `a.skip-link` com `href="#main-content"`; todo `a[href^="#"]` aponta para um `id` existente; nenhum `div`/`span` com `onclick` ou `role="button"`/`role="link"` (controles nativos, DOC-15 §4)
- [ ] T014 [P] [US2] Criar `tests/e2e/a11y-names-and-images.spec.js` para `PAGES × estados resultados/carregada`: (a) `headingOutline` no DOM final: um `h1`, sem salto de nível, nenhum título vazio, títulos dos cartões no nível esperado; (b) `landmarks`: um `main`, um `banner`, uma `navigation` nomeada, um `contentinfo`; (c) todo `a`/`button` tem nome acessível não vazio; nenhum nome é, isolado, "clique aqui", "saiba mais", "ver mais", "aqui", "mais"; links de cartão incluem o título da atividade; (d) o item da página atual tem `aria-current="page"` e é só um; (e) todo `img` tem `alt` (vazio quando decorativo) e nenhum `img` quebrado (`naturalWidth > 0` ou `alt=""`); `svg` decorativos têm `aria-hidden="true"`; o fallback de cartão e de Detalhes não expõe nome nem papel; (f) `a[target=_blank]` tem `rel` com `noopener` e nome acessível contendo "nova aba"; (g) botão "Menu" tem `aria-expanded` coerente com o estado e `aria-controls` válido
- [ ] T015 [P] [US2] Em `tests/unit/activity-card.test.js` (ou `tests/unit/a11y-card-image.test.js`, novo), acrescentar o caso com imagem fictícia: com `image` informativa a regra do cartão gera `alt` não vazio e **diferente** do título quando não acrescenta informação; com imagem decorativa gera `alt=""`; sem imagem usa o fallback `aria-hidden`; confirmar que a função aceita o dado futuro sem mudar a acessibilidade (FR-015). Se o componente ainda não tiver contrato para imagem, documentar a regra no teste como `it.todo` e registrar a lacuna como limitação, sem inventar campo de API

### Implementation for User Story 2

- [ ] T016 [US2] Rodar T013 a T015 e corrigir cada falha na origem: títulos, regiões, nomes e `aria-current` nos `.html` e em `js/components/site-nav.js`, `js/components/activity-card.js`, `js/details/render.js`, `js/components/pagination.js`; nomes vagos trocados por nomes com contexto (ex.: `aria-label` com o título ou texto visível ampliado, preservando o rótulo visível dentro do nome acessível); `rel` e aviso de nova aba em `js/details/external-link.js`. Registrar cada problema em `docs/17-registro-de-acessibilidade.md`
- [ ] T017 [US2] Revisar `<title>` das cinco páginas contra o DOC-11 (nomes de página) e ajustar nos `.html` se houver título genérico ou repetido, atualizando T013 se a regra do Início for diferente

**Checkpoint**: estrutura e nomes verdes; US1 e US2 independentes entre si.

---

## Phase 5: User Story 3 - Ser informada sobre carregamento, resultados e erros sem perder o foco (Priority: P1)

**Goal**: Mensagens de status curtas e únicas, esqueletos ocultos às tecnologias assistivas, vazio distinto de erro, nova tentativa por teclado, foco preservado, regras iguais em Início, Explorar, Detalhes e Contato.

**Independent Test**: `npx playwright test a11y-live-states` e `a11y-axe-matrix` verdes; roteiro manual §3 do `quickstart.md` com leitor de tela.

### Tests for User Story 3

- [ ] T018 [P] [US3] Criar `tests/e2e/a11y-live-states.spec.js`: instalar, antes de cada cenário, um observador (`MutationObserver` via `page.addInitScript`) que registra o texto de cada região `[role=status]`, `[aria-live]` e `[role=alert]` a cada mudança. Cenários (com `mockApi` e `activitiesResponder` com atraso): **Início** e **Explorar**: carregando → N resultados, carregando → vazio, carregando → erro → "Tentar novamente" → resultados; **Detalhes**: sucesso, 404 e erro 500 com nova tentativa; **Contato**: envio vazio (resumo "N campos precisam de correção.") e envio válido (confirmação). Asserções: (a) uma única mensagem por transição (sem texto idêntico consecutivo na mesma região); (b) `document.activeElement` antes e depois é o mesmo quando a atualização não prevê mover o foco, e é o previsto (primeiro campo inválido, título do painel) quando prevê; (c) os esqueletos têm `aria-hidden="true"` ou ficam fora da árvore de acessibilidade; (d) o texto do vazio difere do texto do erro; (e) "Tentar novamente" é um `button`, alcançável por Tab e acionável por Enter e Espaço; (f) a quantidade ("N atividades encontradas") só aparece quando a resposta tem `count`; omitir `count` no mock e conferir ausência da frase
- [ ] T019 [P] [US3] Criar `tests/e2e/a11y-axe-matrix.spec.js`: para cada `page` de `PAGES`, cada `width` de `WIDTHS` e cada `state` de `STATES` aplicável, rodar `prepare`, `settle` e `AxeBuilder` com as tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`; falhar com a lista `id: seletores`. Nome de teste: `${page} · ${state} · ${width}px`. Sem `disableRules`; exceções só por lista `EXCEPTIONS` no topo do arquivo com `{rule, selector, reason, mitigation}` e teste que falha se a lista tiver item sem os quatro campos

### Implementation for User Story 3

- [ ] T020 [US3] Rodar T018 e T019 e corrigir na origem: mensagens e duplicidade em `js/components/region-state.js`, `js/components/error-state.js` e nos módulos que escrevem nas regiões (`js/explore/listing.js`, `js/home/upcoming-activities.js`, `js/pages/activity-details.js`, `js/contact/form.js`); regra única de "anunciar uma vez" (limpar a região antes de reescrever só quando o texto mudar); esqueletos com `aria-hidden`; foco só movido nos casos previstos. Registrar cada problema no `docs/17-registro-de-acessibilidade.md`
- [ ] T021 [US3] Se algum estado do DOC-14 §9.1 não puder ser provocado por interação real (ex.: falha de rede), usar `route.abort` via `mockApi` e registrar em `contracts/audit-matrix.md` como o estado é simulado; nenhum estado fica sem cobertura

**Checkpoint**: estados dinâmicos e axe de matriz verdes nas três histórias P1.

---

## Phase 6: User Story 4 - Ler textos e identificar controles com baixa visão (Priority: P2)

**Goal**: Contraste de texto (4,5:1 / 3:1) e de componentes (3:1) atendido nos estados reais, não só nas cores-base; links no texto distinguíveis por mais de uma característica; correção de cor centralizada.

**Independent Test**: `npm test -- state-contrast` e `npx playwright test a11y-contrast-states` verdes; roteiro manual §6.

### Tests for User Story 4

- [ ] T022 [P] [US4] Criar `tests/unit/state-contrast.test.js`: com `ruleBlocks` e `rootTokens`, resolver `var(--x)` e, para cada regra de estado em `css/components.css`/`css/layout.css`/`css/base.css` (`:hover`, `:focus-visible`, `[aria-current]`, `[aria-pressed]`, `[aria-selected]`, `:disabled`, `[aria-invalid]`, `.field-error`, `.tag`, selos, notices, `.skeleton`, texto sobre o fallback), extrair o par `color` × `background-color`/`border-color` efetivo (herdando do bloco-base quando faltar) e comparar com `contrast()`: 4,5 para texto comum, 3 para texto grande (≥ 1.5rem, ou ≥ 1.125rem em negrito) e para bordas, ícones e contornos de foco contra o fundo adjacente. Lista as falhas como `seletor: fg sobre bg: razão < mínimo`. Pares que o parser não resolver (gradiente, imagem) vão para uma lista `NEEDS_BROWSER` verificada em T023
- [ ] T023 [P] [US4] Criar `tests/e2e/a11y-contrast-states.spec.js`: para os controles reais de cada página (botão primário e secundário, link de navegação, link no texto, campo, `select`, botão desabilitado, paginação com página atual, cartão, tag, aviso, mensagem de erro, texto no fallback do cartão e de Detalhes), forçar cada estado (`hover()`, `focus()`, estado de erro enviando o formulário, `disabled`) e medir por `getComputedStyle` o texto e o fundo efetivo (subir a árvore até um fundo opaco; combinar `rgba` sobre o fundo; para gradiente/imagem usar o pior caso das paradas) com a mesma fórmula de luminância de `tests/unit/helpers/css.js` (`contrast`). Falhar abaixo dos mínimos de T022. Para o foco, medir o contorno contra o fundo e contra o elemento
- [ ] T024 [P] [US4] Em `tests/e2e/a11y-state-cues.spec.js` (T009) ou novo `tests/e2e/a11y-links-in-text.spec.js`, verificar que links dentro de parágrafos (`p a`) em Sobre, Detalhes e Contato têm `text-decoration: underline` (ou outro indício além da cor) e, se só a cor os distinguir, contraste ≥ 3:1 contra o texto ao redor

### Implementation for User Story 4

- [ ] T025 [US4] Rodar T022 a T024. Para cada falha, ajustar **só** o token ou a regra de estado mais central: `css/tokens.css` (ex.: escurecer `--color-text-muted` ou `--color-border`), ou `css/components.css` para o estado específico. Preservar a identidade do DOC-10 (menor mudança que atinja a razão); registrar no `docs/17-registro-de-acessibilidade.md` a razão **antes e depois** e atualizar `specs/004-visual-identity-responsive/contracts/design-tokens.md` se um valor de token mudar
- [ ] T026 [US4] Reexecutar `tests/unit/design-tokens.test.js`, T022 e T023 após cada ajuste de cor; reexecutar `a11y-axe-matrix` (T019) para garantir que nenhuma outra regra do axe passou a falhar

**Checkpoint**: contraste verde em todos os estados.

---

## Phase 7: User Story 5 - Ampliar o texto, reorganizar o layout e reduzir movimento (Priority: P2)

**Goal**: 200%, 320 px e espaçamento de texto sem perda; movimento reduzido respeitado; zoom do navegador não bloqueado.

**Independent Test**: `npx playwright test a11y-text-spacing responsive-reflow reduced-motion` verdes; roteiro manual §7 e §8.

### Tests for User Story 5

- [ ] T027 [P] [US5] Criar `tests/e2e/a11y-text-spacing.spec.js` para `PAGES × estados carregada/resultados/form-erros/erro-api` em 320 e 1280 px: injetar `* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }` (WCAG 1.4.12) e, com título longo de atividade (200 caracteres, como em `helpers/viewports.js`) e formulário com todos os erros, verificar: (a) `scrollWidth <= innerWidth` (sem rolagem horizontal); (b) nenhum elemento com `overflow: hidden` e `scrollHeight > clientHeight + 1` (texto cortado) nem `text-overflow: ellipsis` ativo; (c) nenhum par de controles (`button`, `a`, `input`, `select`) com caixas sobrepostas; (d) o cabeçalho não cobre o `main`
- [ ] T028 [P] [US5] Estender `tests/e2e/responsive-reflow.spec.js` ou criar `tests/e2e/a11y-zoom.spec.js`: a 320 px e 200% (`font-size: 200%`) abrir os estados de `form-erros`, `erro-api`, `vazio` e `resultados` (hoje só há sondas de cartões) e repetir as asserções de sem rolagem horizontal e sem sobreposição; confirmar `meta[name=viewport]` sem `user-scalable=no` nem `maximum-scale` < 5 em todas as páginas (já existe parte disso, não duplicar)
- [ ] T029 [P] [US5] Estender `tests/e2e/reduced-motion.spec.js` com `emulateMedia({ reducedMotion: "reduce" })` nos estados reais: menu aberto/fechado, carregamento com skeleton, painel de confirmação do Contato e foco por rolagem (`scroll-behavior: auto`); nenhum elemento com `animation-duration` ou `transition-duration` > 0,01 ms; e que a página funciona igual (menu abre, painel aparece). Incluir também a verificação de `matchMedia('(prefers-reduced-motion: reduce)')` mudando durante o uso (`page.emulateMedia` depois do carregamento) e o CSS respondendo sem recarregar

### Implementation for User Story 5

- [ ] T030 [US5] Rodar T027 a T029 e corrigir na origem em `css/base.css`, `css/layout.css` e `css/components.css`: alturas fixas (`height`, `max-height`) trocadas por `min-height`; `overflow: hidden` com texto trocado por quebra (`overflow-wrap: anywhere`, `min-width: 0` em itens flex/grid); `white-space: nowrap` em rótulos removido; truncamento por reticências removido; qualquer animação nova passa pela regra central de movimento reduzido de `css/base.css`. Registrar cada problema no `docs/17-registro-de-acessibilidade.md`

**Checkpoint**: ampliação, espaçamento e movimento verdes.

---

## Phase 8: User Story 6 - Ter um registro verificável da acessibilidade e das limitações (Priority: P2)

**Goal**: Um registro único, honesto e consultável, com evidência de cada critério da matriz e das limitações; verificações automáticas rodando a cada execução.

**Independent Test**: Ler apenas `docs/17-registro-de-acessibilidade.md` e responder, em até 10 minutos, o que foi avaliado, como, com que resultado e o que ficou pendente (SC-010); provocar uma regressão e ver o teste falhar (SC-011).

### Tests for User Story 6

- [ ] T031 [P] [US6] Criar `tests/unit/accessibility-report.test.js` que lê `docs/17-registro-de-acessibilidade.md` e `specs/009-transversal-accessibility/contracts/audit-matrix.md` e verifica: o registro contém as oito seções e o aviso obrigatório literal de `contracts/accessibility-report.md`; não contém as expressões "totalmente conforme", "100% conforme", "conformidade integral" fora do aviso; todo critério da matriz aparece no registro; nenhuma linha de resultado `conforme` está sem `evidencia`; toda linha `nao-verificado` tem motivo; todo problema `pendente` tem justificativa e mitigação; toda exceção tem os quatro campos
- [ ] T032 [P] [US6] Criar `tests/e2e/a11y-regression-guard.spec.js` (prova de que os testes pegam regressão, SC-011): para a página de Contato carregada, usar `page.evaluate` para (a) remover o `<label>` de um campo, (b) remover o `alt` de uma `img` injetada, (c) forçar `color` com contraste baixo num texto, (d) esconder o link de pular; e verificar que as respectivas verificações-chave (`AxeBuilder` para a-c, `focusOrder` para d) detectam a violação (`expect(violations).not.toEqual([])`). Os testes são "negativos controlados": nunca alteram arquivos do site

### Implementation for User Story 6

- [ ] T033 [US6] Preencher a seção "Verificações" de `docs/17-registro-de-acessibilidade.md` com uma linha por critério da matriz × página aplicável × estado × largura, com `resultado` e `evidencia` apontando para o teste automático (arquivo e nome) e, quando houver, a observação manual; preencher "Resumo" com as contagens
- [ ] T034 [US6] Executar a passada manual do `quickstart.md` §2 a §9 com NVDA e Chromium (e Firefox, se disponível) nas cinco páginas e estados; registrar em "Verificações" navegador, versão, leitor de tela e resultado de cada critério `M`/`A+M`. **Esta tarefa depende de uma pessoa executar o roteiro**; se não for possível, marcar cada item como `nao-verificado` com o motivo, e **não** marcar a tarefa como concluída até que isso esteja registrado
- [ ] T035 [US6] Preencher "Problemas" (consolidando os registrados durante T010, T016, T020, T025, T030), "Exceções" (as de T019, se houver), "Limitações conhecidas" (leitores de tela não testados, ausência de teste com pessoas usuárias se for o caso, dependências do DOC-15 §8: atividades sem imagem, total de resultados, distinção entre atividade inexistente e indisponível) e "Ambiente"; conferir que nenhuma frase excede a evidência (T031)
- [ ] T036 [US6] Se a auditoria revelar divergência de contrato com a API, registrá-la em `docs/PENDENCIAS-BACKEND.md` no formato existente (contrato, observado, impacto); caso contrário, deixar o arquivo como está e anotar "sem novas pendências" no registro

**Checkpoint**: registro completo, honesto e conferido por teste.

---

## Phase 9: Polish & Cross-Cutting

- [ ] T037 Rodar `npm test` e `npx playwright test` completos e registrar no `docs/17-registro-de-acessibilidade.md` o resultado final e o tempo da suíte de acessibilidade (meta: ≤ ~5 minutos com 2 workers); se estourar, paralelizar por página sem reduzir a matriz
- [ ] T038 [P] Atualizar `README.md` na seção de testes: citar `a11y-axe-matrix`, o comando `npx playwright test a11y`, o registro em `docs/17-registro-de-acessibilidade.md` e que a verificação automática não prova conformidade
- [ ] T039 [P] Confirmar que nenhuma regra do axe foi desativada (`grep -rn "disableRules\|\.exclude(" tests/e2e`) e que toda ocorrência está em `EXCEPTIONS` com os quatro campos; confirmar que `contracts/audit-matrix.md` tem a coluna "Resultado" preenchida
- [ ] T040 [P] Reexecutar o roteiro rápido de `quickstart.md` "Falha esperada" (SC-011) manualmente uma vez e anotar no registro que os testes falham diante da regressão
- [ ] T041 Revisar o diff completo (`git diff main...HEAD --stat`) e confirmar que nenhuma correção alterou comportamento funcional das features 001 a 008 (testes existentes verdes sem edição de asserção), que `css/tokens.css` é a única fonte de cores e que o backend não foi tocado

---

## Dependencies & Execution Order

- **Phase 1 → Phase 2** bloqueiam tudo (matriz e utilitários).
- **US1, US2, US3** (P1) são independentes entre si após a Fase 2; podem ser feitas em paralelo, mas US1 é o MVP.
- **US4** depende de US1 apenas pelos indícios não cromáticos (T009/T024); pode começar após a Fase 2.
- **US5** independente de US1–US4 após a Fase 2.
- **US6** depende de todas as correções (T010, T016, T020, T025, T030) para consolidar o registro; T031 e T032 podem ser escritos antes.
- **Polish** por último.
- Em cada história: testes (rodar, ver falhar ou passar) → correção na origem → reexecução → registro do problema.

### Parallel Opportunities

- Fase 1: T003 em paralelo com T001/T002.
- Fase 2: T004 e T005 em paralelo.
- US1: T006, T007, T008, T009 em paralelo (arquivos diferentes).
- US2: T013, T014, T015 em paralelo.
- US3: T018 e T019 em paralelo.
- US4: T022, T023, T024 em paralelo.
- US5: T027, T028, T029 em paralelo.
- US6: T031 e T032 em paralelo.
- Conflitos de arquivo: as correções (T010, T016, T020, T025, T030) tocam `css/base.css` e `css/components.css`; executá-las em sequência.

## Implementation Strategy

1. **MVP**: Fases 1–2 + US1 (teclado e foco) — a base sem a qual o resto não vale.
2. **Incremental**: US2 → US3 (fecha os três P1; o axe de matriz já protege contra regressões) → US4 → US5 → US6.
3. A cada história, rode a suíte completa para detectar efeito colateral das correções centralizadas.
4. Só considere a feature concluída quando o registro (US6) estiver preenchido e T034 estiver feita por uma pessoa ou explicitamente registrada como não verificada.
