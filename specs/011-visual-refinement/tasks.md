---

description: "Task list for feature 011 - Refinamento visual do frontend"
---

# Tasks: Refinamento visual do frontend

**Input**: Design documents from `/specs/011-visual-refinement/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/brand-assets.md, contracts/design-tokens-delta.md, contracts/component-visuals.md, contracts/structure-changes.md, contracts/visual-review-record.md, quickstart.md

**Tests**: Incluídos. Esta feature é visual, mas a spec (FR-027 a FR-030) exige verificação objetiva: contraste, alinhamento, larguras de referência, marca e suíte existente verde. Testes novos são pequenos e medem propriedades (contraste, existência, alinhamento, rolagem), nunca pixels. **Nunca remova, desative nem enfraqueça um teste existente**; só atualize asserções que medem valores alterados de propósito, e só as listadas em `contracts/structure-changes.md`, registrando o motivo. Sem `retries`, `.only` nem `.skip` sem motivo escrito.

**Organization**: Tarefas agrupadas por user story. Caminhos relativos à raiz do repositório. Reaproveite `tests/e2e/helpers/mock-api.js` (`mockApi`, `overrideConfig`, `makeListing`, `makeDetails`, `makeActivity`), `tests/e2e/helpers/viewports.js` (`PAGES`, `mountProbeCards`), `tests/fixtures/activities.js`, `tests/unit/helpers/css.js` e `tests/unit/helpers/dom.js`. Todo valor de cor, sombra, raio, espaçamento e duração vem de `css/tokens.css` (há teste que varre `css/`). Só `tokens.css`, `base.css`, `layout.css` e `components.css`; sem pacote novo; sem mudança no backend; pontos de quebra 40/48/64rem inalterados.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[Story]**: US1 = marca, cabeçalho e rodapé (P1), US2 = Início e busca (P1), US3 = cards e estados (P1), US4 = botões, campos e superfícies (P2), US5 = páginas internas (P2), US6 = validação e registro (P1)

---

## Phase 1: Setup (linha de base e ferramentas)

**Purpose**: Medir e fotografar o estado atual **antes de qualquer alteração**

- [X] T001 Rodar `npm run test:all` (porta 5500 livre) e anotar aprovados, falhos, ignorados e duração em um rascunho de `docs/21-registro-de-revisao-visual.md` (seção "Resultados", marcada como linha de base). Esperado: 962 unitários, 647 de navegador aprovados, 20 ignorados com motivo (`docs/20-registro-de-qualidade.md`). Se algo já falhar, registrar antes de mexer, para não confundir com regressão desta feature
- [X] T002 Criar `tests/capture/capture-screens.mjs` conforme `contracts/visual-review-record.md`: sobe o servidor estático (`tests/static-server.py`, porta 5500), usa Playwright e as fixtures de `tests/fixtures/activities.js` com respostas simuladas (sem rede externa) e grava PNGs `<pagina>-<estado>-<largura>.png` em `docs/visual-review/<before|after>/`. Páginas: inicio, explorar, detalhes, sobre, contato. Larguras: 320, 768, 1440 sempre; 375 e 1024 em Início e Explorar. Estados: `resultados` (inclua atividades com e sem imagem e de categorias diferentes), `vazio` e `erro` (Início e Explorar), `nao-encontrada` (Detalhes), `confirmacao` (Contato). Argumento obrigatório `before` ou `after`; sem ele, imprime o uso e sai com erro
- [X] T003 Adicionar o script `"capture": "node tests/capture/capture-screens.mjs"` em `package.json` (sem dependência nova) e a linha "Capturas antes/depois" na seção de comandos do `README.md`
- [X] T004 Rodar `npm run capture -- before` e conferir que existem as capturas em `docs/visual-review/before/` para as cinco páginas e os estados do T002. **Commitar o conjunto `before` isolado, antes de qualquer outra mudança** (a pessoa responsável decide o commit; se não houver commit, ao menos não alterar nenhum arquivo de `css/`, `js/` ou `*.html` até o conjunto estar salvo)

---

## Phase 2: Foundational (bloqueia as histórias)

**Purpose**: Tokens e ativos de marca, usados por todas as histórias

- [X] T005 Em `css/tokens.css`, aplicar `contracts/design-tokens-delta.md`: alterar `--content-max-width` para `80rem`, `--shadow-card` para `0 1px 2px rgb(31 41 55 / 0.08), 0 2px 8px rgb(31 41 55 / 0.06)` e `--radius-card` para `12px`; acrescentar `--color-surface-tint: #eaf1fd`, `--shadow-header`, `--shadow-panel`, `--radius-panel: 16px`, `--space-8: 5rem`, `--logo-height: 2.5rem` e os sete `--color-category-*` (culture `#b91c1c`, sport `#15803d`, courses `#1d4ed8`, events `#7e22ce`, health `#0f766e`, leisure `#c2410c`, education `#be185d`). Atualizar o comentário do topo se a lista de tokens ali citada mudar
- [X] T006 Atualizar `tests/unit/design-tokens.test.js` com os pares novos de `contracts/design-tokens-delta.md` (texto branco sobre cada `--color-category-*` ≥ 4,5; `--color-text`, `--color-link`, `--color-text-muted` sobre `--color-surface-tint` ≥ 4,5; `--color-border` e `--focus-color` sobre o tint ≥ 3) e o novo valor de `--content-max-width`. Se algum par falhar, **ajustar o valor do token (e o contrato), não o limite**. Manter todas as asserções existentes
- [X] T007 [P] Criar `images/brand/logo.svg` conforme `contracts/brand-assets.md`: wordmark "Agenda Livre" em duas linhas em `#1E40AF`, **em curvas** (gerar os contornos a partir de `fonts/poppins-latin-700-normal.woff2`, por exemplo com `fontTools`, sem usar `<text>`), com os três raios `#F97316` e `#FACC15` à direita de "Livre", como no guia (`docs/Guia de Marca Agenda Livre.png`, bloco "Logo principal"). Fundo transparente, `viewBox` com a proporção do guia, abaixo de 10 KB, sem `<script>` nem referência externa
- [X] T008 [P] Criar `images/brand/icon.svg` (quadrado arredondado azul em degradê `#1E40AF` a `#2563EB`, "A" branco em curvas e raios laranja e amarelo, como o bloco "Ícone / Favicon" do guia; só formas, sem `<text>`; legível a 16 px) e gerar `images/brand/apple-touch-icon.png` (180×180, sem transparência) a partir dele
- [X] T009 [P] Criar `tests/unit/brand-assets.test.js`: os três arquivos existem; os SVGs são XML bem formado, sem `<script>`, sem `<text>`, sem `href` externo e com menos de 10 KB; o PNG tem 180×180 (ler o cabeçalho IHDR). Ainda não verifica as páginas (isso é T011)
- [X] T010 [P] Criar `tests/unit/category-colors.test.js`: para cada slug dos sete do backend (`cultura-e-artes`, `esporte-e-atividade-fisica`, `cursos-e-formacao`, `eventos-e-encontros`, `saude-e-bem-estar`, `lazer-e-recreacao`, `educacao-e-meio-ambiente`), conferir que `css/components.css` tem um seletor `[data-category="<slug>"]` que usa o token `--color-category-*` esperado como fundo e `--color-brand-contrast` como texto, e que o contraste do par resolvido atinge 4,5. Ainda falha até T025 (é o teste que guia a US3, escrito antes)

**Checkpoint**: tokens e ativos prontos; T010 pode estar vermelho até a US3.

---

## Phase 3: User Story 1 — Marca, cabeçalho e rodapé (Priority: P1) 🎯 MVP

**Goal**: Logo e ícone oficiais nas cinco páginas, largura útil melhor, cabeçalho e rodapé acabados e alinhados (VIS-001, 004, 005; FR-001 a FR-009).

**Independent Test**: Abrir as cinco páginas em 320, 768 e 1440 px e conferir logo, ícone da aba, alinhamento de cabeçalho/conteúdo/rodapé, item ativo evidente, menu móvel funcionando e ausência de rolagem horizontal.

- [X] T011 [US1] Em `index.html`, `explorar.html`, `atividade.html`, `sobre.html` e `contato.html`, de forma **idêntica**: acrescentar no `<head>` `<link rel="icon" href="images/brand/icon.svg" type="image/svg+xml">` e `<link rel="apple-touch-icon" href="images/brand/apple-touch-icon.png">` (mudanças H1 e H2 de `contracts/structure-changes.md`); trocar o texto de `.site-header__brand` por `<img src="images/brand/logo.svg" alt="Agenda Livre" width="..." height="...">` com as dimensões intrínsecas do SVG. Não alterar nenhum `id`, `aria-*`, ordem ou outro elemento
- [X] T012 [US1] Estender `tests/unit/brand-assets.test.js` (T009) para ler as cinco páginas e conferir: `<link rel="icon">` e `apple-touch-icon` presentes; exatamente um `<img>` de logo dentro de `.site-header__brand`, com `alt="Agenda Livre"` e `href="index.html"`; `width` e `height` presentes. Atualizar `tests/unit/site-shell.test.js` (e o teste de estrutura estática, se medir o texto da marca) para aceitar a marca em imagem com o mesmo nome acessível, anotando o motivo em um comentário e no rascunho de `docs/21-registro-de-revisao-visual.md` (seção "Testes atualizados")
- [X] T013 [US1] Em `css/layout.css`, refinar o cabeçalho conforme `contracts/component-visuals.md`: `box-shadow: var(--shadow-header)` além da borda; `.site-header__brand img` com `height: var(--logo-height)` e `width: auto` (`2rem` abaixo de 48rem, por `@media (max-width: 47.99rem)` ou ajuste mobile-first equivalente, sem novo ponto de quebra); espaçamento interno confortável; alinhamento vertical consistente entre logo, links e botão Menu; remover `font-family`, `font-size` e `color` obsoletos do texto da marca só se não houver mais texto
- [X] T014 [US1] Em `css/layout.css`, item ativo da navegação: manter `font-weight: 700` e acrescentar uma barra inferior espessa (`border-bottom` com `--focus-width` ou `box-shadow` inferior, usando `--color-primary`), mantendo o sublinhado atual como pista adicional; hover com sublinhado. Preservar o botão Menu, `aria-expanded`, a ordem de foco e o ponto de troca 48rem (`NARROW_QUERY` em `js/components/site-nav.js`)
- [X] T015 [US1] Em `css/layout.css`, rodapé e largura: confirmar que `body > header, main, footer` seguem no mesmo contêiner de `--content-max-width` (agora 80rem) com o mesmo `padding-inline`; fundo `--color-surface`, borda superior discreta, links com alvo mínimo; garantir que `main` ocupa o espaço restante e o rodapé fica ao final em páginas curtas. `body > main p` mantém `--reading-max-width`; `.activity-details__article` (48rem) e `.prose` mantêm largura de leitura
- [X] T016 [US1] Criar `tests/e2e/visual-refinement.spec.js` com a primeira parte: para cada página de `PAGES` e cada largura 320, 375, 768, 1024, 1440 (respostas simuladas por `mockApi`): (a) `document.documentElement.scrollWidth <= clientWidth` (sem rolagem horizontal); (b) o `left` de `header`, `main` e `footer` coincide (tolerância 1 px) e o logo carrega (`naturalWidth > 0`) com a mesma altura nas cinco páginas; (c) em 1440, `main` não passa de `80rem` e o `max-width` dos parágrafos de Sobre não ultrapassa 65ch; (d) o footer termina na base da janela quando o conteúdo é curto (Contato em 1440)
- [X] T017 [US1] Rodar `npm test`, `npx playwright test mobile-menu shared-components navigation structure-config responsive-reflow` e `npm run test:a11y`; corrigir regressões na origem (CSS), sem editar os testes além do já listado em T012

**Checkpoint**: marca e estrutura global prontas; as cinco páginas já mostram a nova base. Este é o MVP.

---

## Phase 4: User Story 2 — Início e busca (Priority: P1)

**Goal**: Hero coerente, busca como área única com ação principal em destaque, seção de próximas atividades com hierarquia clara (VIS-002, 003, 006 a 009; FR-005, 006, 010 a 013).

**Independent Test**: No Início, em 320, 375, 768, 1024 e 1440 px, conferir hero, agrupamento da busca, botão "Explorar" e a seção de próximas atividades; enviar uma busca e confirmar que a URL de Explorar é a mesma de antes.

- [X] T018 [US2] Em `css/layout.css`, hero conforme `contracts/component-visuals.md`: painel com `background: var(--color-surface-tint)`, `border-radius: var(--radius-panel)`, padding `--space-5`; texto e ilustração em duas colunas com `align-items: center` a partir de 48rem e uma coluna em tela estreita (ilustração depois do texto), sem apertar o título; subtítulo em `--color-text` (se `--color-text-muted` não passar sobre o tint, conforme T006). A ilustração mantém `alt=""`
- [X] T019 [US2] Em `css/layout.css` e `css/components.css`, busca do Início como painel único: `.quick-search` com fundo `--color-surface`, `--border-width` `--color-border`, `--radius-panel` e `--shadow-panel`; título "O que você procura?" e campos com rótulos acima; campo de texto em linha própria em celular e tablet; em ≥ 64rem, campo + três filtros + botão numa região equilibrada (colunas proporcionais, `align-items: end`); "Explorar" com a altura dos campos (`--target-min`); `.quick-search__notice` dentro do painel. Se o CSS não alcançar o painel único, aplicar a mudança H3 de `contracts/structure-changes.md` (classe ou `div` extra) **apenas** em `index.html`, sem alterar `id`, `name`, `for`, `aria-*`, `action`, `method` nem a ordem dos campos
- [X] T020 [US2] Em `css/layout.css`, seção de próximas atividades: `.upcoming__header` com título e "Ver todas" alinhados na base; `.upcoming__intro` logo abaixo, em `--color-text-muted` se o contraste passar (senão `--color-text`); "Ver todas" com alvo mínimo e sublinhado; espaçamento `--space-6` (celular) e `--space-8` (≥ 64rem) entre hero, busca, próximas atividades e rodapé, sem vazios sem função
- [X] T021 [US2] Estender `tests/e2e/visual-refinement.spec.js` com o Início: (a) em 1440, o título `h1` tem o maior `font-size` visível da página; (b) em 320, 375 e 768, nenhum controle da busca é mais estreito que `--target-min` nem se sobrepõe a outro (comparar `getBoundingClientRect`); (c) enviar a busca com `q`, `unit`, `category` e `period` preenchidos leva a `explorar.html` com a **mesma query string** esperada pelos testes de `home-search.spec.js` (reaproveitar a asserção); (d) a seção de próximas atividades mantém "Ver todas" visível e clicável com três cards, um card, estado vazio e erro
- [X] T022 [US2] Rodar `npx playwright test home-search home-upcoming home-accessibility responsive-reflow visual-refinement` e `npm test`; corrigir regressões na origem

**Checkpoint**: Início refinado; a busca continua enviando os mesmos parâmetros.

---

## Phase 5: User Story 3 — Cards e estados (Priority: P1)

**Goal**: Cards consistentes com etiqueta colorida por categoria e ícones, e estados vazio, carregamento e erro integrados e distinguíveis (VIS-010 a 013; FR-014 a 017, 022).

**Independent Test**: Exibir listas com muitos cards, título longo, sem imagem, com imagem informativa e decorativa e forçar vazio, carregamento e erro; conferir alinhamento, quebra, foco, cores de categoria e diferenciação dos estados.

- [X] T023 [P] [US3] Criar `js/components/activity-icons.js` com `createLocationIcon()`, `createCalendarIcon()` e `createClockIcon()`: SVG por DOM (`createElementNS`, sem `innerHTML`), `viewBox="0 0 24 24"`, `width`/`height` 16, `fill="none"`, `stroke="currentColor"`, `stroke-width="1.75"`, `aria-hidden="true"`, `focusable="false"`, no mesmo estilo de traço de `defaultIcon()` em `js/components/activity-card.js`
- [X] T024 [US3] Em `js/components/activity-card.js`, aplicar J1 e J3 de `contracts/structure-changes.md`: gravar `data-category` na etiqueta (`.activity-card__category`) com `activity.category.slug` **somente se** coincidir com `/^[a-z0-9-]+$/` (caso contrário, não gravar); prefixar a linha da unidade com o ícone de local e a da data com o de calendário (o horário, se vier junto, mantém o texto atual), ambos `aria-hidden`; o texto da unidade e da data e o `<time datetime>` permanecem exatamente como hoje; usar só `textContent` e atributos
- [X] T025 [US3] Em `css/components.css`, para cada slug de `contracts/design-tokens-delta.md`, acrescentar `.activity-card__category[data-category="<slug>"], .activity-details__category[data-category="<slug>"] { background: var(--color-category-…); border-color: var(--color-category-…); color: var(--color-brand-contrast); }`. A regra base da etiqueta continua o tratamento neutro (`--color-tag-*`) para slug ausente ou desconhecido. Rodar `npx vitest run tests/unit/category-colors.test.js` (T010) até ficar verde
- [X] T026 [US3] Em `css/components.css`, acabamento do card: `--radius-card`, borda e `--shadow-card` dos tokens; corpo com `--space-3`; etiqueta proporcional (`font-size-small`, padding `--space-1`/`--space-2`, `--radius-sm`); em `.activity-card__body` a linha da data com `margin-top: auto` para alinhar a base dos cards da mesma linha (`align-items: stretch` já existe); ícones alinhados à primeira linha do texto (`display: inline-flex`/`flex-shrink: 0`, cor `--color-text-muted`); título longo quebra sem transbordar. Preservar o link esticado e a parada de foco única
- [X] T027 [US3] Em `css/components.css`, estados: `.region-state__empty`, `.region-state__loading` e `.error-state__message` com `--radius-panel`, padding `--space-5`, texto centralizado, título em destaque e dica legível; **manter as formas distintas** (vazio tracejado, carregando pontilhado, erro com borda esquerda de 6 px e fundo de aviso). `.skeleton-card` com proporção coerente com o card (mídia 16:9 + corpo), estático. `.error-state__retry` continua com a aparência do botão primário
- [X] T028 [US3] Atualizar `tests/unit/activity-card.test.js`: `data-category` gravado para slug válido e **ausente** para slug com maiúscula, espaço, aspas ou `<script>`; o texto do nome da categoria inalterado; ícones presentes com `aria-hidden="true"` e fora do nome acessível do link; nenhuma regressão nas asserções existentes (texto, `time`, link, fallback, imagem)
- [X] T029 [US3] Estender `tests/e2e/visual-refinement.spec.js` com cards e estados: (a) em 1440 e 768, cards da mesma linha têm a mesma altura e o mesmo `top` da linha da data; (b) título com 120 caracteres sem espaços não transborda o card em 320; (c) a cor computada de fundo da etiqueta difere entre `cultura-e-artes` e `esporte-e-atividade-fisica` e é a neutra para um slug desconhecido; o texto da categoria continua visível; (d) vazio, carregamento e erro têm `border-style` (ou borda esquerda) distintos entre si; (e) teclado: um único Tab no card foca o link do título e o foco é visível
- [X] T030 [US3] Rodar `npx playwright test a11y-state-cues a11y-focus-visible shared-components home-upcoming explore-states image-display visual-consistency` e `npx vitest run tests/unit/activity-card.test.js tests/unit/state-contrast.test.js tests/unit/image-field.test.js`; corrigir regressões na origem

**Checkpoint**: cards e estados refinados, cores de categoria ativas.

---

## Phase 6: User Story 4 — Botões, campos e superfícies (Priority: P2)

**Goal**: Aparência e estados consistentes de botões, campos e superfícies em todas as páginas (VIS-014 a 016; FR-018 a 021).

**Independent Test**: Percorrer as cinco páginas comparando botões, campos, links e sombras de componentes equivalentes; verificar contraste e a ausência de valores avulsos.

- [X] T031 [US4] Em `css/components.css`, botões: manter hierarquia primário (`--color-action`), de destaque (`.button--secondary`, `--color-accent` com texto `--color-text`, como o "Ver detalhes" do guia) e contornado (`.button--outline`); altura mínima `--target-min`, raio `--radius-sm`, peso 600; estados hover, foco, ativo e desabilitado (tracejado) distinguíveis sem depender só da cor; garantir que o mesmo papel tem a mesma aparência (inclusive `.error-state__retry` e `.site-header__toggle`). Links em texto permanecem sublinhados e distintos de botões
- [X] T032 [US4] Em `css/components.css` e `css/base.css`, campos: `input`, `select`, `textarea` com altura `--target-min`, borda `--border-width-control` `--color-border`, `--radius-sm`, espaçamento interno `--space-2`/`--space-2-5`; rótulos `label` acima com `--space-1` e peso 600; texto auxiliar `.form-hint` associado visualmente; foco com contorno e halo existentes; erro com borda tracejada e prefixo "Erro:". Não tocar em atributos nem em controles nativos (zoom e comportamento preservados)
- [X] T033 [US4] Em `css/layout.css` e `css/components.css`, sombras e bordas com moderação: `--shadow-header` só no cabeçalho, `--shadow-panel` só em painéis (busca, filtros, formulário de contato), `--shadow-card` só em cards; remover qualquer combinação de sombra + borda forte + fundo contrastante no mesmo elemento sem justificativa; nenhuma sombra em campo ou botão; manter borda onde ela identifica o controle (alto contraste)
- [X] T034 [US4] Auditoria de valores avulsos: rodar o teste existente que varre `css/` em busca de cor, fonte, sombra e duração literais fora de `tokens.css` e, se ele não cobrir `box-shadow` com `rgb(`/`#` nem `border-radius` com `px` em componentes, **acrescentar** essas verificações em `tests/unit/design-tokens.test.js` (sem remover as existentes). Corrigir o CSS até passar
- [X] T035 [US4] Estender `tests/e2e/visual-refinement.spec.js` e, se necessário, `tests/e2e/visual-consistency.spec.js` (só acrescentando casos): em cada uma das cinco páginas, botão primário, de destaque e contornado têm `background-color`, `border-radius` e `min-height` iguais entre páginas; campos têm a mesma altura e borda; link em texto continua sublinhado
- [X] T036 [US4] Rodar `npx playwright test visual-consistency a11y-contrast-states a11y-focus-visible a11y-links-in-text contact-validation explore-search` e `npm test`; corrigir regressões na origem

**Checkpoint**: componentes harmonizados em todas as páginas.

---

## Phase 7: User Story 5 — Páginas internas (Priority: P2)

**Goal**: Explorar, Detalhes, Sobre e Contato com o mesmo acabamento (VIS-017 a 020; FR-023 a 026).

**Independent Test**: Em cada página interna, conferir hierarquia e composição em 320 e 1440 px; filtrar com todos os critérios, paginar e usar Voltar; abrir uma atividade inexistente; enviar o formulário de Contato vazio e preenchido.

- [X] T037 [US5] Em `css/layout.css`, Explorar: título e descrição em bloco com `--space-3` entre eles; `.explore-filters` como painel (`--color-surface`, `--border-width`, `--radius-panel`, `--shadow-panel`, padding `--space-4`) separado dos resultados por `--space-6`; ações "Filtrar" (primário) e "Limpar filtros" (contornado) na mesma linha; resumo `.results-summary` em linha própria acima da grade; funcionamento com todos os filtros em 320 px. Se o CSS não bastar, aplicar H4 de `contracts/structure-changes.md` (só uma classe extra em `explorar.html`)
- [X] T038 [US5] Em `js/details/render.js` e `css/layout.css`, Detalhes: gravar `data-category` na categoria (`.activity-details__category`) com a mesma validação do T024 (J2); ícone de local na unidade e de calendário/relógio na próxima data e nos horários (importando `js/components/activity-icons.js`, `aria-hidden`); ordem visual título → categoria/unidade/próxima data → descrição → programação; descrição em largura de leitura; blocos com títulos e `--space-4` entre eles; "não encontrada" com título e botão "Explorar atividades" evidentes. Nenhum dado inventado: seção só existe se houver conteúdo (como hoje). Atualizar `tests/unit/details-render.test.js` só acrescentando asserções de `data-category` (válido e inválido) e do `aria-hidden` dos ícones
- [X] T039 [P] [US5] Em `css/layout.css`, Sobre: `.prose` com seções separadas por `--space-5`, `h2` com `--space-2` abaixo, largura `--reading-max-width`, e o convite "Explorar atividades" (`.button`) no fim como ação principal; sem alterar o texto de `sobre.html`
- [X] T040 [P] [US5] Em `css/layout.css` e `css/components.css`, Contato: o formulário em painel (`--color-surface`, `--border-width`, `--radius-panel`, `--shadow-panel`, padding `--space-4`) com largura `40rem`; `.demo-notice` acima dos campos com fundo de aviso e borda lateral de 6 px (continua evidente); `--space-4` entre campos; "Enviar" primário e "Limpar" contornado distinguíveis; `.form-summary`, `.field-error` e `.confirmation` mantêm hierarquia e acessibilidade. Continua sem rede e sem armazenar dados (nenhuma mudança em `js/contact/*`)
- [X] T041 [US5] Estender `tests/e2e/visual-refinement.spec.js` com as páginas internas: (a) Explorar com todos os filtros em 320 sem sobreposição e sem rolagem horizontal; Filtrar → URL com parâmetros e Limpar → URL sem parâmetros (como em `explore-search.spec.js`); (b) Detalhes: a categoria tem `data-category`, o título vem antes da descrição na ordem do DOM e `getBoundingClientRect().top` do título é menor que o da descrição; "não encontrada" mostra o botão para Explorar; (c) Sobre: a largura dos parágrafos não passa de 65ch; (d) Contato: o aviso de demonstração está visível acima do primeiro campo; enviar vazio mostra o resumo de erros; preencher e enviar mostra a confirmação e **nenhuma requisição de rede** (como em `contact-no-network.spec.js`)
- [X] T042 [US5] Rodar `npx playwright test explore-search explore-pagination explore-return explore-states details-content details-states details-return details-external-link about contact-validation contact-confirmation contact-no-network` e `npm test`; corrigir regressões na origem

**Checkpoint**: as cinco páginas refinadas.

---

## Phase 8: User Story 6 — Validação e registro (Priority: P1)

**Goal**: Comprovar consistência, responsividade e acessibilidade e registrar o antes e depois (VIS-021 a 024; FR-027 a FR-030).

**Independent Test**: Executar as suítes e as verificações manuais; abrir o registro e as capturas lado a lado.

- [X] T043 [US6] Rodar a suíte completa: `npm run test:all` e `npm run test:a11y`. Todas verdes, com os mesmos 20 ignorados justificados, e nenhuma violação nova de axe em relação à linha de base. Qualquer falha é regressão e se corrige no código; só os testes de `contracts/structure-changes.md` podem ter sido atualizados
- [X] T044 [P] [US6] (cobertura já existente reaproveitada: texto a 200%, espaçamento de texto, zoom e rolagem horizontal continuam em `responsive-reflow.spec.js` e `a11y-text-spacing.spec.js`, aprovados; nada foi duplicado em `visual-refinement.spec.js`) Revisão de responsividade: com `tests/e2e/visual-refinement.spec.js` já cobrindo 320/375/768/1024/1440 nas cinco páginas, acrescentar ali o estado "texto a 200%" (`page.addStyleTag` com `font-size: 200%` na raiz ou `deviceScaleFactor` equivalente) e o de espaçamento de texto da WCAG 1.4.12 (reaproveitar o helper de `a11y-text-spacing.spec.js`): sem corte, sem sobreposição, sem rolagem horizontal em 320. Confirmar que o `viewport` das páginas não bloqueia zoom
- [ ] T045 [US6] (PENDENTE: exige uma pessoa; não foi feito pelo Claude e está declarado como não realizado em `docs/21-registro-de-revisao-visual.md`, seção 7) Verificação manual por teclado dos fluxos principais (navegar pelo cabeçalho, pular para o conteúdo, Menu em celular, buscar no Início, filtrar e paginar em Explorar, abrir uma atividade, voltar, enviar o Contato vazio e preenchido): foco visível, ordem lógica, sem armadilha. Também com `prefers-reduced-motion: reduce` ativado. Anotar resultado e problemas em `docs/21-registro-de-revisao-visual.md` (seção "Acessibilidade"), marcando claramente o que é manual e o que não foi verificado (leitor de tela, aparelhos reais, outros navegadores)
- [X] T046 [US6] Rodar `npm run capture -- after` e conferir as capturas em `docs/visual-review/after/` com os mesmos nomes do `before`. Comparar lado a lado cada página, estado e largura, anotando diferenças aprovadas e problemas restantes. Avaliar legibilidade, consistência e acessibilidade, não só gosto; registrar também a avaliação de quatro colunas de cards em desktop (adotar ou não, com motivo)
- [X] T047 [US6] Criar `docs/21-registro-de-revisao-visual.md` completo conforme `contracts/visual-review-record.md` (identificação, ambiente, resultados com comparação à linha de base, testes atualizados com motivo, revisão entre páginas, matriz de responsividade, acessibilidade, antes e depois com links das capturas, problemas VR-001…, decisões, limites). Quantidades copiadas da saída real dos comandos; nenhuma declaração de conformidade WCAG integral
- [X] T048 [P] [US6] Criar `tests/unit/visual-review-record.test.js` no padrão de `tests/unit/quality-report.test.js`: o registro existe, tem as 11 seções do contrato, e cada arquivo de captura citado existe em `docs/visual-review/`; cada teste citado como evidência existe; não afirma "conformidade total" ou equivalente

**Checkpoint**: refinamento validado e registrado.

---

## Phase 9: Polish e documentação

- [X] T049 [P] Atualizar `docs/10-identidade-visual-design-system.md`: trocar "arquivos finais do logotipo ainda precisam ser preparados" pelo registro dos ativos de `images/brand/` e do guia de marca; documentar as cores de categoria por slug e a regra de cor neutra para categorias novas; atualizar a seção 12 (pendências) e a data
- [X] T050 [P] Atualizar `README.md`: estrutura de `images/brand/`, comando `npm run capture`, referência a `docs/21-registro-de-revisao-visual.md` e à pasta `docs/visual-review/`
- [X] T051 [P] Corrigir o título de `docs/18-backlog-refinamento-visual-frontend.md` de "DOC-16" para "DOC-18", sem alterar o conteúdo, e conferir se alguma referência cruzada em `docs/` ou `specs/` usa o número antigo para este documento
- [X] T052 Executar `quickstart.md` do início ao fim, conferir que a lista de requisitos FR-001 a FR-032 tem cobertura (teste, captura ou verificação manual registrada) e marcar como concluído o checklist `specs/011-visual-refinement/checklists/requirements.md`. Rodar `npm run test:all` uma última vez e anotar o resultado final no registro

---

## Dependencies & Execution Order

- **Setup (T001–T004)** primeiro; **T004 (capturas "antes") antes de qualquer mudança em `css/`, `js/` ou `*.html`**.
- **Foundational (T005–T010)** depois do Setup e antes das histórias. T007, T008, T009 e T010 em paralelo entre si; T006 depende de T005.
- **US1 (T011–T017)**: depende do Foundational. É o MVP.
- **US2 (T018–T022)**, **US3 (T023–T030)**, **US4 (T031–T036)**, **US5 (T037–T042)**: dependem do Foundational e da estrutura da US1 (T015, largura); entre si são quase independentes, mas todas tocam `css/layout.css` e `css/components.css`, então **não rodam em paralelo no mesmo arquivo**. Ordem sugerida: US2 → US3 → US4 → US5. US5 (T038) usa o módulo de ícones da US3 (T023) e a validação do `data-category` (T024).
- **US6 (T043–T048)**: depois das demais histórias.
- **Polish (T049–T052)**: por último.

### Dependências entre histórias

```text
Setup → Foundational → US1 → US2 → US3 → US4 → US5 → US6 → Polish
                                 \_____________↗ (T023/T024 antes de T038)
```

## Parallel Opportunities

- Foundational: T007 (logo), T008 (ícone), T009 (teste de ativos) e T010 (teste de cores) em paralelo.
- US3: T023 (módulo de ícones) em paralelo com a preparação de T025–T027 (arquivos diferentes só enquanto não editam o mesmo CSS).
- US5: T039 (Sobre) e T040 (Contato) são blocos distintos, mas editam o mesmo CSS; executar em sequência se houver conflito.
- US6: T044 e T048 em paralelo.
- Polish: T049, T050 e T051 em paralelo.

## Implementation Strategy

- **MVP**: Setup + Foundational + **US1** (marca, cabeçalho, rodapé e largura). Já muda a percepção das cinco páginas e é entregável sozinho.
- **Incremental**: US2 (porta de entrada) → US3 (conteúdo central) → US4 e US5 (acabamento e páginas internas) → US6 (validação). Rodar as suítes ao fim de cada fase (tarefas T017, T022, T030, T036, T042) e não acumular regressões.
- **Regra de ouro**: falha em teste existente = regressão no código, nunca motivo para enfraquecer o teste. Exceção: as atualizações listadas em `contracts/structure-changes.md`, com motivo registrado.
- **Prova de regressão** (recomendada): depois de T025, trocar de propósito o fundo de uma categoria por uma cor clara e confirmar que `category-colors.test.js` reprova; reverter.

## Notes

- Total: 52 tarefas (Setup 4, Foundational 6, US1 7, US2 5, US3 8, US4 6, US5 6, US6 6, Polish 4).
- Nenhuma tarefa altera o backend, a API, as rotas, os parâmetros de URL ou `js/api`, `js/explore`, `js/home`, `js/contact`, `js/pages` e `site-nav.js`.
