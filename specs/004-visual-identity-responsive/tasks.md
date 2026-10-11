---

description: "Task list for feature 004 - Identidade visual e responsividade"
---

# Tasks: Identidade visual e responsividade

**Input**: Design documents from `/specs/004-visual-identity-responsive/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/design-tokens.md, contracts/layout-breakpoints.md, contracts/motion.md, quickstart.md

**Tests**: Incluídos (FR-044; DOC-14): Vitest para contraste/tokens/pontos de quebra/regra de movimento; Playwright para reflow, ampliação, grade, alvos de toque, fontes bloqueadas, movimento reduzido e axe. Escreva cada teste antes da implementação correspondente e confirme que falha.

**Organization**: Tarefas agrupadas por user story. Caminhos relativos à raiz do repositório (que é o próprio frontend). Esta feature só altera apresentação: **não** mude estrutura HTML (exceto `<head>` das páginas), textos, comportamento JS nem contrato da API (FR-042).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[Story]**: US1 = identidade visual consistente (P1), US2 = layout responsivo (P1), US3 = movimento reduzido (P1)

---

## Phase 1: Setup

**Purpose**: Arquivos de fonte e utilitários de teste usados por todas as histórias

- [X] T001 Adicionar `@fontsource-variable/inter` e `@fontsource/poppins` como `devDependencies` em `package.json` (`npm install -D`), apenas como origem dos arquivos; nada é carregado em produção a partir de `node_modules`
- [X] T002 Copiar para `fonts/` os arquivos `.woff2` do subconjunto latin: `inter-latin-wght-normal.woff2` (variável 400–700), `poppins-latin-600-normal.woff2` e `poppins-latin-700-normal.woff2`; registrar origem e licença (OFL) em `fonts/README.md`
- [X] T003 [P] Criar `tests/unit/helpers/css.js` com funções para ler `css/*.css`, extrair custom properties de `:root` de `css/tokens.css`, listar valores de `@media` e calcular a razão de contraste WCAG entre duas cores hexadecimais
- [X] T004 [P] Criar `tests/e2e/helpers/viewports.js` exportando `WIDTHS = [320, 375, 768, 1024, 1440]`, `PAGES = ["index.html","explorar.html","atividade.html","sobre.html","contato.html"]` e uma função `mountProbeCards(page, count)` que monta `count` cards sintéticos em `.card-grid` reaproveitando o padrão de `tests/e2e/shared-components.spec.js`

---

## Phase 2: Foundational (bloqueia todas as histórias)

**Purpose**: Tokens centrais e testes que travam as regras; todas as histórias consomem estes valores

- [X] T005 [P] Escrever `tests/unit/design-tokens.test.js` (deve falhar): (a) razões de contraste de todos os pares da tabela em `contracts/design-tokens.md` (≥ 4,5 texto; ≥ 3 componentes), listando os pares reprovados; (b) nenhum literal de cor hexadecimal, `font-family` ou duração (`ms`/`s`) em `css/base.css`, `css/layout.css`, `css/components.css` fora de `var(--…)`; (c) `@media` só com `min-width` em {40rem, 48rem, 64rem} e `max-width: 47.99rem` em `js/components/site-nav.js` coerente com o de 48rem
- [X] T006 Reescrever `css/tokens.css` conforme `contracts/design-tokens.md`: cores (incluindo `--color-primary`, `--color-action`, `--color-action-hover`, `--color-accent`, `--color-accent-strong`, `--color-highlight`, `--color-text-muted`, borda `#64748B`, etiqueta `#E6EEFA`/`#1E3A8A`), tipografia (`--font-heading`, `--font-body`, tamanhos com `rem`/`clamp`), `--space-1…8` (múltiplos de 4 px, mantendo `--space-1…5` existentes sem mudar o aspecto), raios, sombras, `--focus-*` e halo, `--motion-duration: 150ms`, `--motion-ease`, `--target-min: 2.75rem`, `--reading-max-width: 65ch`; manter todos os nomes já usados pelas features 001–003 e comentar os três pontos de quebra (40/48/64 rem) no topo
- [X] T007 Confirmar que `npm test` passa em `tests/unit/design-tokens.test.js` item (a) com os novos tokens (itens (b) e (c) continuam falhando até a migração dos CSS)

**Checkpoint**: tokens definidos e contraste verificado; histórias podem começar.

---

## Phase 3: User Story 1 - Interface visualmente consistente (Priority: P1) 🎯 MVP

**Goal**: mesma paleta, tipografia, espaçamento, botões, links, campos, etiquetas e estados em todas as páginas e componentes, sem depender só de cor, com contraste adequado.

**Independent Test**: abrir as cinco páginas e a sonda de componentes, conferir fontes, estilos de botão/link, estados e razões de contraste; `npm test` verde e axe sem violações de contraste.

### Tests for User Story 1

- [X] T008 [P] [US1] Escrever `tests/e2e/visual-consistency.spec.js` (deve falhar): em cada página, `getComputedStyle` do `h1` usa Poppins e do `body` usa Inter; links dentro de `main` têm `text-decoration-line: underline`; a sonda de botões (`.button--primary/secondary/outline`) mede contraste texto/fundo ≥ 4,5 e `min-height` ≥ 44 px; foco por teclado em link, botão, campo e botão de menu produz `outline-width` ≥ 3 px e contraste ≥ 3:1; botão desabilitado tem `border-style: dashed`; etiqueta de categoria mostra o nome escrito
- [X] T009 [P] [US1] Escrever em `tests/e2e/visual-consistency.spec.js` o teste de escala de cinza e de fontes bloqueadas: com `page.route("**/fonts/**", r => r.abort())` o texto permanece visível (`opacity`/`visibility`), sem sobreposição entre `header` e `main`; aplicar `filter: grayscale(1)` e verificar que os estados de aviso, erro, carregando e vazio ainda diferem por `border-style`/texto (comparar estilos computados, não cor)

### Implementation for User Story 1

- [X] T010 [US1] Em `css/base.css`: declarar `@font-face` para Inter (variável) e Poppins 600/700 apontando para `fonts/*.woff2` com `font-display: swap`; adicionar `@font-face` de reserva com `size-adjust`/`ascent-override` para evitar deslocamento; aplicar `--font-body` ao `body`, `--font-heading` a `h1…h6`, escala de títulos (`--font-size-h1`, `--font-size-h2`, `--font-size-card-title`), sublinhado em links de texto corrido, `:focus-visible` com contorno + `--shadow-focus-halo`, `forced-colors` seguro (usar `outline`/`border`) e `@media print` mínimo (fundo branco, ocultar navegação)
- [X] T011 [US1] Em `css/components.css`: criar `.button`, `.button--primary`, `.button--secondary`, `.button--outline` com estados repouso, hover, foco, pressionado e desabilitado conforme `contracts/design-tokens.md` (pista não cromática em cada estado), `min-height: var(--target-min)`; migrar `.error-state__retry` e `.site-header__toggle` para os mesmos valores via seletores CSS, sem mudar o HTML
- [X] T012 [US1] Em `css/components.css`: migrar `.error-state__message`, `.region-state__*`, `.skeleton-card`, `.activity-card*`, `.image-fallback`, `.config-notice` (em `base.css`) para `var(--…)`; remover literais de cor/borda/raio/fonte; manter etiqueta com tratamento neutro padrão e nome sempre visível; erro com borda esquerda grossa, vazio tracejado, carregando pontilhado (preservar distinção atual)
- [X] T013 [P] [US1] Em `css/components.css`: estilos de campos (`input`, `select`, `textarea`, `label`) e grupos de filtros preparados para os próximos épicos: rótulo acima, borda `--color-border`, estado erro com borda tracejada + texto, foco visível, `min-height: var(--target-min)`
- [X] T014 [US1] Em `css/layout.css`: substituir literais por tokens em cabeçalho, navegação, rodapé, botão de menu e item atual (`aria-current`) mantendo sublinhado + peso; garantir tom `--color-primary` na marca e fundo `--color-surface` no cabeçalho
- [X] T015 [P] [US1] Em `index.html`, `explorar.html`, `atividade.html`, `sobre.html` e `contato.html`: adicionar no `<head>` `<link rel="preload" as="font" type="font/woff2" crossorigin>` para Inter e Poppins 600; nenhuma outra alteração
- [X] T016 [US1] Documentar em `fonts/README.md` e atualizar `README.md` (seção de estilos) com o mapa dos tokens, os ajustes de contraste e a regra "valores só em `tokens.css`"
- [X] T017 [US1] Rodar `npm test` e `npx playwright test visual-consistency accessibility` e corrigir até que `design-tokens.test.js` (a)(b), `visual-consistency` e axe (contraste) passem

**Checkpoint**: US1 entregue e testável isoladamente.

---

## Phase 4: User Story 2 - Usar o site em qualquer tela (Priority: P1)

**Goal**: layout mobile-first sem rolagem horizontal de 320 a 1440 px, grade de cards 1→2→3+, texto a 200% e zoom 400% sem perdas, alvos de toque adequados, zoom não bloqueado.

**Independent Test**: `npx playwright test responsive-reflow` verde nas cinco páginas e larguras; revisão manual de zoom registrada.

### Tests for User Story 2

- [X] T018 [P] [US2] Escrever `tests/e2e/responsive-reflow.spec.js` (deve falhar) com: para cada `PAGES` × `WIDTHS`, `scrollWidth <= innerWidth`; com `html { font-size: 200% }` injetado em 320 e 768, ausência de rolagem horizontal e de sobreposição entre `header`, menu aberto e `main`; `meta[name=viewport]` sem `maximum-scale` e sem `user-scalable=no`
- [X] T019 [P] [US2] Escrever em `tests/e2e/responsive-reflow.spec.js` os testes da grade e dos alvos: sonda com 6 cards (via `mountProbeCards`) mede 1 coluna em 375, 2 em 768, 3+ em 1280, com alturas de área de imagem iguais; links, botões, botão de menu e campos da sonda têm caixa ≥ 24×24 e (botões/menu/itens de navegação) ≥ 44 px de altura, sem sobreposição entre alvos adjacentes; título de 200 caracteres sem espaços não estoura em 320 px
- [X] T020 [P] [US2] Escrever em `tests/e2e/responsive-reflow.spec.js` o teste de pontos de quebra (SC-007): em 639, 640, 767, 768, 1023 e 1024 px exatamente, nunca há duas navegações (botão de menu visível e lista em linha) nem nenhuma; e o teste de retrato/paisagem (390×844 e 844×390) sem rolagem horizontal
- [X] T021 [P] [US2] Escrever em `tests/unit/design-tokens.test.js` o item (c) completo: `@media` só com {40rem, 48rem, 64rem}, `max-width: 47.99rem` em `site-nav.js` coerente, e ausência de `width`/`height` fixos em `px` em seletores de contêineres de conteúdo

### Implementation for User Story 2

- [X] T022 [US2] Em `css/layout.css`: aplicar `body { min-height: 100vh; min-height: 100dvh; display: flex; flex-direction: column }` e `main { flex: 1 0 auto }` (rodapé ao fim); contêineres com `padding-inline` mínimo `var(--space-3)` e `max-width: var(--content-max-width)`; parágrafos em `main` com `max-width: var(--reading-max-width)`; imagens/mídias `max-width: 100%; height: auto`
- [X] T023 [US2] Em `css/components.css`: reescrever `.card-grid` mobile-first (1 coluna base; `@media (min-width: 40rem)` 2 colunas; `@media (min-width: 64rem)` `repeat(auto-fill, minmax(18rem, 1fr))` limitado a 4), `align-items: stretch`, `min-width: 0` nos cards; área de imagem do card com `aspect-ratio` constante
- [X] T024 [US2] Em `css/layout.css` e `css/components.css`: garantir `min-height: var(--target-min)` em itens de navegação, botão de menu e botões; substituir `px` fixos de largura/altura por `rem`/`min-*`; adicionar `overflow-x: auto` apenas dentro de contêineres de conteúdo bidimensional (classe `.scroll-x`)
- [X] T025 [US2] Em `css/layout.css`: confirmar o ponto de troca do menu em `@media (min-width: 48rem)` igual a `NARROW_QUERY` de `js/components/site-nav.js`; documentar os três pontos de quebra em `contracts/layout-breakpoints.md` (já escrito) e referenciá-los no comentário de `tokens.css`
- [X] T026 [P] [US2] Fallback para navegadores sem recursos modernos em `css/components.css`: declarar `.card-grid` como `display: block` antes de `display: grid` (com `@supports (display: grid)`) para cair em uma coluna simples
- [X] T027 [US2] Rodar `npm test` e `npx playwright test responsive-reflow accessibility` e corrigir até passar; incluir verificação do `target-size` do axe (tag `wcag22aa`)

**Checkpoint**: US1 e US2 funcionando independentemente.

---

## Phase 5: User Story 3 - Reduzir o movimento quando eu preferir (Priority: P1)

**Goal**: uma regra central de movimento reduzido; sem preferência, transições curtas e discretas; nenhuma informação depende de animação.

**Independent Test**: `npx playwright test reduced-motion` verde com `reducedMotion: reduce` e `no-preference`.

### Tests for User Story 3

- [X] T028 [P] [US3] Escrever `tests/unit/motion-rule.test.js` (deve falhar): `css/base.css` contém o bloco `@media (prefers-reduced-motion: reduce)` com `--motion-duration: 0s`, `animation-duration: 0.01ms !important`, `transition-duration: 0.01ms !important` e `scroll-behavior: auto !important`; `scroll-behavior: smooth` só dentro de `(prefers-reduced-motion: no-preference)`; nenhuma `transition`/`animation` com duração literal fora de `tokens.css`; `--motion-duration` em `tokens.css` > 0
- [X] T029 [P] [US3] Escrever `tests/e2e/reduced-motion.spec.js` (deve falhar): com `page.emulateMedia({ reducedMotion: "reduce" })`, `transition-duration` computada de botão, campo, card, botão de menu e `.skeleton-card` é ≈ 0 e `scroll-behavior` é `auto`; menu abre e fecha sem deslocamento; com `no-preference`, duração ≤ 300 ms e o menu continua operável por teclado; alternar a emulação com a página aberta muda os valores sem recarregar
- [X] T030 [P] [US3] Escrever em `tests/e2e/reduced-motion.spec.js` a verificação de ausência de movimento automático: nenhuma `animation-name` diferente de `none` fora de regras que o bloco de redução anula, e nenhum elemento `marquee`/carrossel nas cinco páginas

### Implementation for User Story 3

- [X] T031 [US3] Em `css/base.css`: adicionar o bloco de movimento reduzido de `contracts/motion.md` (zera `--motion-duration`, rede de segurança universal) e o bloco `no-preference` com `html { scroll-behavior: smooth }`
- [X] T032 [US3] Em `css/components.css` e `css/layout.css`: aplicar `transition: <propriedades permitidas> var(--motion-duration) var(--motion-ease)` a botões, links, campos, cards, botão de menu e itens de navegação; remover o bloco local `@media (prefers-reduced-motion: reduce)` de `.skeleton-card` (agora central) mantendo o esqueleto estático; garantir que o menu use só o atributo `hidden`, sem transição de deslocamento
- [X] T033 [US3] Rodar `npm test` e `npx playwright test reduced-motion` e corrigir até passar

**Checkpoint**: as três histórias funcionando.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T034 Rodar a suíte completa (`npm test` e `npm run test:e2e`) e corrigir regressões das features 001–003 (navegação, menu, card, estados, erro/tentar novamente); nenhum teste anterior pode ser alterado para passar, exceto seletores de estilo
- [X] T035 [P] Atualizar `contracts/design-tokens.md` com os valores finais adotados e as razões medidas pelo teste (se algum token mudou durante a implementação)
- [X] T036 [P] Atualizar `README.md` (estrutura de pastas com `fonts/`, comando de testes novos e regra de breakpoints)
- [ ] T037 Executar a revisão manual de `quickstart.md` (zoom 200%/400%, fonte grande, 320 px retrato/paisagem, escala de cinza, alto contraste do SO, movimento reduzido do SO, teclado + leitor de tela) e preencher a tabela com resultado e data
- [X] T038 Conferir `docs/PENDENCIAS-BACKEND.md`: nenhuma nova pendência é esperada; se alguma divergência surgir, registrar lá
- [X] T039 Executar o roteiro completo do `quickstart.md` do início ao fim e marcar o critério de conclusão

---

## Dependencies & Execution Order

- **Phase 1 → Phase 2 → histórias**: T001–T002 (fontes) antes de T010; T003/T004 antes dos testes que os usam; T006 (tokens) bloqueia todas as histórias.
- **US1 (T008–T017)**: depende da Phase 2. É o MVP: sem ela, US2 e US3 não têm tokens migrados.
- **US2 (T018–T027)**: depende de T006 e de T011–T014 (componentes migrados) para medir alvos e grade; pode começar os testes (T018–T021) em paralelo com US1.
- **US3 (T028–T033)**: depende de T006 e da migração dos componentes (T011–T014) para aplicar `var(--motion-duration)`; testes (T028–T030) podem ser escritos em paralelo.
- **Polish**: depende de US1–US3.

### Parallel opportunities

- Phase 1: T003 e T004 em paralelo.
- Phase 2: T005 em paralelo com T006 (arquivos diferentes), mas T007 depende de ambos.
- US1: T008, T009, T013, T015 em paralelo.
- US2: T018–T021 e T026 em paralelo.
- US3: T028–T030 em paralelo.
- Polish: T035 e T036 em paralelo.

## Implementation Strategy

1. **MVP**: Phases 1–3 (fontes, tokens, migração visual, botões/estados). Já entrega a consistência visual e o contraste verificado.
2. **Incremento 2**: Phase 4 (layout responsivo) sobre os tokens.
3. **Incremento 3**: Phase 5 (movimento reduzido), com a regra central.
4. **Fechamento**: Phase 6 com suíte completa e revisão manual registrada.

Em todas as fases: escrever o teste, vê-lo falhar, implementar, vê-lo passar; `npm test` e `npm run test:e2e` devem permanecer verdes ao fim de cada fase.
