---

description: "Task list for feature 003 - Navegação e componentes compartilhados"
---

# Tasks: Navegação e componentes compartilhados

**Input**: Design documents from `/specs/003-navigation-shared-components/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/site-shell.md, contracts/activity-card.md, contracts/region-state.md, quickstart.md

**Tests**: Incluídos (FR-051; DOC-14): Vitest + jsdom para componentes e utilitários, Playwright para teclado/menu/estados, axe-core para acessibilidade automática. Escreva cada teste antes da implementação correspondente e confirme que falha.

**Organization**: Tarefas agrupadas por user story. Caminhos relativos à raiz do repositório (que é o próprio frontend).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[Story]**: US1 = navegação entre páginas (P1), US2 = menu móvel (P1), US3 = card + fallback de imagem (P1), US4 = estados de região (P1)

---

## Phase 1: Setup

**Purpose**: Dependência de teste e tokens/utilitários globais usados por todas as histórias

- [X] T001 Adicionar `@axe-core/playwright` (versão fixa, com pelo menos duas semanas) às `devDependencies` em `package.json` e rodar `npm install` para atualizar `package-lock.json`
- [X] T002 [P] Acrescentar a `css/tokens.css` os tokens novos: `--color-brand`, `--color-brand-contrast`, `--color-tag-background`, `--color-tag-text`, `--color-skeleton`, `--color-empty-border`, `--radius-card`, `--card-media-ratio: 16 / 9`, e um comentário documentando o ponto de troca 48 rem (768 px) usado por CSS e JS (research D3, D14); cada par texto/fundo ≥ 4,5:1 e componente ≥ 3:1
- [X] T003 [P] Acrescentar a `css/base.css` as classes `.visually-hidden` (oculta visualmente, mantém na AT) e `.skip-link` (fora da tela até `:focus`, depois fixo no topo com contraste ≥ 4,5:1), e `main[tabindex="-1"]:focus { outline: none; }`

**Checkpoint**: tokens e utilitários CSS disponíveis

---

## Phase 2: Foundational

**Purpose**: Utilitário puro e ajuste do componente de erro, pré-requisitos de US3 e US4

**⚠️ CRITICAL**: US3 e US4 dependem desta fase; US1 e US2 não dependem dela

- [X] T004 [P] Escrever `tests/unit/format.test.js` (Vitest, ambiente node): `formatOccurrence` com data/hora válidas (`{date:"2026-11-20",start_time:"14:00",end_time:"15:00"}` → `dateLabel` "sex., 20 de nov.", `timeLabel` "14h00 às 15h00", `datetime` "2026-11-20T14:00"), só início ("14h00"), sem horário (`timeLabel` null), dia inexistente `2026-02-30`, formatos inválidos, `null`/`undefined` → `null`, sem deslocamento de dia com `TZ=America/Sao_Paulo` e `TZ=UTC`; `activityDetailsUrl` com UUID simples e id com caracteres especiais (`a b&c` → codificado) devolvendo `atividade.html?id=...`; confirmar que falha
- [X] T005 Criar `js/utils/format.js` exportando `formatOccurrence(next_occurrence)` e `activityDetailsUrl(id)` conforme `contracts/activity-card.md` e research D6/D7 (`Date.UTC` + `Intl.DateTimeFormat("pt-BR", { timeZone: "UTC", ... })`, `URL`/`URLSearchParams` com base relativa); fazer o T004 passar
- [X] T006 Atualizar `tests/unit/error-state.test.js` com casos para a opção `live`: padrão (`true`) define `role="status"` e `aria-live="polite"` no contêiner (comportamento atual); `live: false` não define nenhum dos dois; botão e foco inalterados; confirmar que o novo caso falha
- [X] T007 Modificar `js/components/error-state.js`: `renderErrorState(container, error, { onRetry, live = true } = {})`, aplicando `role`/`aria-live` apenas quando `live` for `true` (research D11); fazer o T006 passar sem quebrar os testes existentes de `tests/unit/error-state.test.js` e `tests/e2e/api-error-retry.spec.js`

**Checkpoint**: formatação e erro compartilhado prontos

---

## Phase 3: User Story 1 - Navegar entre as páginas públicas (Priority: P1) 🎯 MVP

**Goal**: As cinco páginas compartilham cabeçalho, navegação, link de pular e rodapé idênticos, com página atual identificada, funcionando sem JavaScript.

**Independent Test**: Abrir cada página por URL com e sem JavaScript e percorrer com o teclado: destinos corretos, `aria-current` único (nenhum em Detalhes), ordem de foco e link de pular.

### Tests for User Story 1

- [X] T008 [P] [US1] Escrever `tests/unit/site-shell.test.js` (Vitest, `// @vitest-environment jsdom`, lê `index.html`, `explorar.html`, `atividade.html`, `sobre.html`, `contato.html` com `fs`): cada arquivo tem `lang="pt-BR"`, `.skip-link` como primeiro elemento focável do `body` com `href="#main-content"`, um `header.site-header`, `nav[aria-label="Navegação principal"]` com 4 links nos destinos de `contracts/site-shell.md`, `main#main-content[tabindex="-1"]` único, um único `h1`, `footer.site-footer` com `nav[aria-label="Rodapé"]` com links `sobre.html` e `contato.html` e nenhum link externo; exatamente um `aria-current="page"` em index/explorar/sobre/contato (no link correto) e nenhum em `atividade.html`; o HTML de `header` e `footer` é idêntico entre as páginas após remover `aria-current`; confirmar que falha
- [X] T009 [P] [US1] Escrever `tests/e2e/navigation.spec.js` (Playwright): cada uma das cinco páginas abre por URL direta e exibe os 4 links; a ordem de Tab começa em "Pular para o conteúdo principal", depois a marca e os links; ativar o link de pular foca `#main-content`; o link de pular só é visível ao receber foco; com `javaScriptEnabled: false` os links permanecem visíveis e navegáveis; o link atual tem sublinhado/peso distinto (não só cor) e `aria-current="page"`; confirmar que falha

### Implementation for User Story 1

- [X] T010 [US1] Acrescentar a `css/layout.css` os estilos `.site-header` (marca + navegação), `.site-nav ul` em linha a partir de 48 rem e em coluna abaixo, `.site-nav [aria-current="page"]` (sublinhado + peso 600), `.site-footer` e o foco visível dos links; sem `transition` nem `animation`; manter `body > header/main/footer` existentes coerentes
- [X] T011 [US1] Aplicar o invólucro exato de `contracts/site-shell.md` em `index.html` (com `aria-current="page"` em Início), preservando o `h1` e o texto provisório atual dentro de `<main id="main-content" tabindex="-1">` e substituindo o `<header>`/`<footer>` provisórios
- [X] T012 [P] [US1] Aplicar o invólucro em `explorar.html` (`aria-current` em Explorar atividades), preservando o conteúdo do `main`
- [X] T013 [P] [US1] Aplicar o invólucro em `atividade.html` (sem `aria-current` em nenhum link), preservando o conteúdo do `main`
- [X] T014 [P] [US1] Aplicar o invólucro em `sobre.html` (`aria-current` em Sobre), preservando o conteúdo do `main`
- [X] T015 [P] [US1] Aplicar o invólucro em `contato.html` (`aria-current` em Contato), preservando o conteúdo do `main`
- [X] T016 [US1] Rodar `npm test` e `npm run test:e2e -- navigation.spec.js` e corrigir até T008 e T009 passarem; rodar também `tests/e2e/structure-config.spec.js` para garantir que o aviso de configuração (`showConfigNotice` usa `main`) continua funcionando

**Checkpoint**: navegação funcional nas cinco páginas, sem JS (MVP entregável)

---

## Phase 4: User Story 2 - Usar o menu móvel (Priority: P1)

**Goal**: Em tela estreita o menu é um botão de divulgação acessível; em tela larga a navegação é em linha; sem JS tudo permanece visível.

**Independent Test**: A 320 px, só com teclado, abrir o menu, percorrer os links, fechar com Esc; verificar `aria-expanded` e que links recolhidos não são focáveis.

### Tests for User Story 2

- [X] T017 [P] [US2] Escrever `tests/unit/site-nav.test.js` (Vitest + jsdom, `matchMedia` simulado, HTML do invólucro): `initSiteNav` retorna `null` sem botão/lista; em tela estreita revela o botão, define `aria-expanded="false"`, `hidden` na lista; clique alterna `aria-expanded` e `hidden`; `Esc` com menu aberto fecha e foca o botão; `Esc` com menu fechado não faz nada; em tela larga remove `hidden` da lista e esconde o botão; mudança estreito→largo→estreito reinicia fechado; não usa `role="menu"` nem `aria-haspopup`; segunda chamada não duplica listeners; `destroy()` remove listeners; confirmar que falha
- [X] T018 [P] [US2] Escrever `tests/e2e/mobile-menu.spec.js` (Playwright, viewport 320×640): menu inicia recolhido e Tab não alcança os links; Enter/Espaço abre, links entram na ordem de foco após o botão; Esc fecha e devolve o foco ao botão; ativar um link abre a página destino com menu recolhido; a 767 px o botão aparece e a 768 px some (links em linha); `scrollWidth <= clientWidth` do documento a 320 px; confirmar que falha

### Implementation for User Story 2

- [X] T019 [US2] Criar `js/components/site-nav.js` com `initSiteNav(root = document)` conforme `contracts/site-shell.md` e research D2/D3 (`matchMedia("(max-width: 47.99rem)")`, `hidden` na lista, `aria-expanded`, `aria-controls`, `Escape`, idempotência, `destroy()`); fazer T017 passar
- [X] T020 [US2] Acrescentar a `css/layout.css` os estilos do menu: `.site-header__toggle` (botão com borda e foco visível, `display: none` a partir de 48 rem, `[hidden]` respeitado), lista em coluna abaixo de 48 rem e a 200% de zoom sem sobreposição nem rolagem horizontal
- [X] T021 [US2] Chamar `initSiteNav()` em `js/pages/home.js`, `js/pages/explore.js`, `js/pages/activity-details.js`, `js/pages/about.js` e `js/pages/contact.js` (uma linha de importação e uma chamada dentro de `init`, antes da lógica da página; `about.js` e `contact.js` mantêm o `showConfigNotice` existente)
- [X] T022 [US2] Rodar `npm test` e `npm run test:e2e -- mobile-menu.spec.js` e corrigir até T017 e T018 passarem

**Checkpoint**: navegação funciona em celular e desktop

---

## Phase 5: User Story 3 - Ver atividades em cards consistentes, mesmo sem imagem (Priority: P1)

**Goal**: Um componente de card único, com área de imagem e fallback decorativo, link principal único e tolerante a dados ausentes.

**Independent Test**: Renderizar o card com atividades sintéticas (completa, sem ocorrência, sem unidade, título longo, HTML no texto, imagem futura) e verificar estrutura, textos, link e ausência de imagem quebrada.

### Tests for User Story 3

- [X] T023 [P] [US3] Escrever `tests/unit/activity-card.test.js` (Vitest + jsdom): card completo (categoria, `h3` com um único `<a href="atividade.html?id=...">` com o título, unidade com bairro, `<time datetime>` e rótulo); `headingLevel` 2–6; sem `next_occurrence` mostra "Sem data prevista"; sem `unit` / `category` omite só o elemento; nenhum texto "undefined"/"null" em nenhuma combinação; `id` ou `title` ausentes → retorna `null`; `<img onerror=…>`, `&` e aspas no título saem como texto literal (sem elementos extras); fallback `.activity-card__media` com `aria-hidden="true"` e `<svg aria-hidden="true" focusable="false">`; nenhum `<img>` sem `activity.image`; com `image: {url, alt:"Foto"}` cria `<img alt="Foto">`, sem `alt` usa `alt=""`, nunca o título; evento `error` da imagem restaura o fallback; exatamente um elemento focável por card; nomes dos links distintos numa lista de 3 atividades; `categoryIcons` opcional aplica ícone por slug; confirmar que falha
- [X] T024 [P] [US3] Escrever `tests/e2e/shared-components.spec.js` com a parte do card (Playwright, módulo importado por `page.evaluate`, sem criar página pública): monta 3 cards em `main` e verifica uma parada de Tab por card, foco visível, clique no card abre `atividade.html?id=...` na mesma aba, ausência de imagem quebrada, ausência de rolagem horizontal a 320 px com título de 200 caracteres sem espaços; confirmar que falha

### Implementation for User Story 3

- [X] T025 [US3] Criar `js/components/activity-card.js` com `createActivityCard(activity, { headingLevel = 3, categoryIcons = {} } = {})` conforme `contracts/activity-card.md` e research D8/D9 (somente `textContent`/`createElement`; SVG inline decorativo padrão; `formatOccurrence`/`activityDetailsUrl` de `js/utils/format.js`; imagem opcional com fallback em `error`); fazer T023 passar
- [X] T026 [US3] Acrescentar a `css/components.css` os estilos `.activity-card` (superfície branca, borda, `--radius-card`), `.activity-card__media`/`.image-fallback` (`aspect-ratio: var(--card-media-ratio)`, fundo da identidade visual, ícone centralizado), `.activity-card__category` (etiqueta com texto), `.activity-card__title a::after` (link esticado cobrindo o card), `:focus-within`/`:has(a:focus-visible)` com contorno visível ≥ 3:1, `overflow-wrap: anywhere` no corpo e `.card-grid` (3 colunas ≥ 64 rem, 2 colunas ≥ 40 rem, 1 coluna abaixo)
- [X] T027 [US3] Rodar `npm test` e `npm run test:e2e -- shared-components.spec.js` e corrigir até T023 e T024 passarem

**Checkpoint**: card reutilizável pronto para Início e Explorar

---

## Phase 6: User Story 4 - Entender se a área está carregando, falhou ou está vazia (Priority: P1)

**Goal**: Mecanismo comum de estados (carregando com esqueletos, erro, vazio, sucesso) com uma região de anúncio por região, foco preservado e erro integrado à feature 002.

**Independent Test**: Alternar uma região de teste entre carregando, erro (com e sem nova tentativa), vazio e sucesso; verificar conteúdo, anúncio único por troca e foco.

### Tests for User Story 4

- [X] T028 [P] [US4] Escrever `tests/unit/region-state.test.js` (Vitest + jsdom, timers falsos): `showLoading` monta texto visível + `skeletonCount` (padrão 3) elementos `.skeleton-card[aria-hidden="true"]` e só anuncia no `status` após 300 ms; `showSuccess`/`showEmpty`/`showError` antes de 300 ms cancelam o anúncio de carregamento; cada `show*` substitui todo o `content` e escreve exatamente uma mensagem em `status` (limpando antes, mesmo repetindo texto); `showEmpty` usa texto distinto do erro e mostra `hint` só se fornecida; `showError` com erro `retryable` mostra `error.userMessage` e "Tentar novamente", sem botão para `bad_request`/`config`, e ignora `cancelled`; o contêiner `content` não tem `role`/`aria-live`; clicar em "Tentar novamente" chama `onRetry` uma vez e move o foco para `content` (`tabindex="-1"`) apenas se o botão tinha foco; nenhum `show*` chama `focus()` fora dessa regra; HTML em mensagens vira texto literal; `getState()` e `destroy()` (cancela temporizadores); confirmar que falha
- [X] T029 [US4] Estender `tests/e2e/shared-components.spec.js` com a parte de estados (Playwright, `page.route` em `**/api/v1/**`, módulo importado por `page.evaluate`): sequência carregando→erro→"Tentar novamente"→carregando→sucesso com cards; vazio (`count: 0`) mostra a mensagem de vazio e não a de erro; o foco do teclado num campo da página não muda em nenhuma troca; `status` recebe uma mensagem por troca; esqueletos têm `aria-hidden="true"`; sem animação de esqueleto com `prefers-reduced-motion: reduce`; confirmar que falha

### Implementation for User Story 4

- [X] T030 [US4] Criar `js/components/region-state.js` com `createRegionState({ content, status, skeletonCount, announceDelayMs, renderSkeleton, loadingLabel })` e os métodos de `contracts/region-state.md` e research D10/D12, delegando o erro a `renderErrorState(content, error, { onRetry, live: false })` e ignorando `isCancelled`; fazer T028 passar
- [X] T031 [US4] Acrescentar a `css/components.css` os estilos `.region-state__message`/`.region-state__hint` (vazio: borda tracejada e prefixo textual, distinto de `.error-state__message`), `.region-state__loading` e `.skeleton-card` (mesma proporção do card, fundo `--color-skeleton` e borda, sem animação, com regra `@media (prefers-reduced-motion: reduce)` documentada como no-op), sem depender só de cor
- [X] T032 [US4] Rodar `npm test` e `npm run test:e2e -- shared-components.spec.js` e corrigir até T028 e T029 passarem

**Checkpoint**: todos os estados de região prontos para as páginas dos épicos seguintes

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Acessibilidade automática, documentação e verificação final

- [X] T033 [P] Escrever `tests/e2e/accessibility.spec.js` com `@axe-core/playwright` (WCAG 2.2 A/AA): as cinco páginas com menu fechado e aberto (320 px) e a 1280 px; a região em carregando, erro, vazio e com cards (via módulo importado); toda violação é corrigida ou justificada por escrito no próprio arquivo; documentar no teste que axe não prova conformidade integral
- [X] T034 [P] Atualizar `README.md`: listar `js/utils/format.js`, `site-nav.js`, `activity-card.js`, `region-state.js`, a nova opção `live` de `error-state.js`, o invólucro compartilhado (cópia estática validada por `tests/unit/site-shell.test.js`) e como usar `createActivityCard`/`createRegionState` em uma página
- [ ] T035 Executar os cenários manuais de `quickstart.md` (teclado, leitor de tela, 200%, 320 px, movimento reduzido, JS desativado), conferir contrastes dos pares novos e registrar os resultados (data, ambiente, problemas) na descrição do PR ou em `specs/003-navigation-shared-components/quickstart.md` numa seção "Resultados"
- [X] T036 Rodar `npm test` e `npm run test:e2e` completos, confirmar que nada da feature 001/002 regrediu e que nenhum arquivo vazio ou sem função foi criado; marcar o item de imagens em `docs/PENDENCIAS-BACKEND.md` como ainda aberto (sem alteração, apenas conferir que o fallback é usado)

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup (Phase 1)**: sem dependências.
- **Foundational (Phase 2)**: depende apenas do necessário em T001–T003 para rodar testes; bloqueia US3 e US4.
- **US1 (Phase 3)**: depende de T002 e T003 (tokens e `.skip-link`); independente da Phase 2.
- **US2 (Phase 4)**: depende de US1 (invólucro HTML e CSS de layout); independente da Phase 2.
- **US3 (Phase 5)**: depende de T002, da Phase 2 (T005) e de T003; independente de US1/US2 no código, mas o e2e usa o invólucro já aplicado.
- **US4 (Phase 6)**: depende de T003, da Phase 2 (T007) e do card de US3 apenas para o e2e (sucesso com cards); o código de `region-state.js` é independente.
- **Polish (Phase 7)**: depende de todas as histórias.

### Within Each User Story
- Testes primeiro (devem falhar), depois implementação, depois a tarefa de verificação.
- CSS em `layout.css`/`components.css` é por história; tarefas que editam o mesmo arquivo não são [P] entre si (T010→T020 em `css/layout.css`; T026→T031 em `css/components.css`).

### Parallel Opportunities
- T002 e T003 em paralelo.
- T004 em paralelo com T006 (arquivos diferentes); T005 depois de T004, T007 depois de T006.
- T008 e T009 em paralelo; T012–T015 em paralelo após T011.
- T017 e T018 em paralelo.
- T023 e T024 em paralelo; US3 e US4 podem ser feitas por pessoas diferentes após a Phase 2.
- T033 e T034 em paralelo.

### Parallel Example: User Story 1
```text
Task: "T008 [US1] tests/unit/site-shell.test.js"
Task: "T009 [US1] tests/e2e/navigation.spec.js"
# depois, após T011:
Task: "T012 explorar.html" · "T013 atividade.html" · "T014 sobre.html" · "T015 contato.html"
```

---

## Implementation Strategy

### MVP First (User Story 1)
1. Phase 1 (Setup) → T001–T003.
2. Phase 3 (US1) → T008–T016: o site passa a ter navegação funcional nas cinco páginas, mesmo sem JS.
3. Validar com `quickstart.md` §1 antes de seguir.

### Incremental Delivery
1. Setup + US1 → navegação básica.
2. US2 → menu móvel utilizável (o MVP real em celular).
3. Foundational + US3 → cards reutilizáveis (desbloqueia Início e Explorar).
4. US4 → estados de região (desbloqueia carregamento/erro/vazio das páginas de dados).
5. Polish → axe-core, README e verificação manual.

### Notas
- Os componentes não chamam a API; as páginas dos épicos EP-FE-05 a EP-FE-07 os conectam ao cliente da feature 002.
- A API não envia imagem; o fallback é o caso normal (`docs/PENDENCIAS-BACKEND.md`).
