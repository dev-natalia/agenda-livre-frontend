# Research: Navegação e componentes compartilhados

Sem itens `NEEDS CLARIFICATION` na spec; as decisões abaixo fecham o que a spec deixou ao planejamento.

## D1 — Onde mora o invólucro compartilhado
- **Decisão**: marcação estática idêntica em cada HTML (link de pular, `header` com marca e `nav`, `main#main-content`, `footer`). Só o `aria-current="page"` e o `<title>`/conteúdo do `main` variam. `tests/unit/site-shell.test.js` lê os cinco arquivos e falha se o cabeçalho/rodapé divergirem (após normalizar `aria-current`).
- **Racional**: FR-003/FR-018 (funcionar sem JS) e DOC-09 (sem build/framework). Quatro links e um rodapé curto custam pouco para manter e o teste evita divergência.
- **Alternativas**: injeção por JS (quebra sem script, flash de layout); *Server Side Includes* (depende do servidor de hospedagem, não existente); etapa de build (fora do DOC-09). Consequência: FR-002 e SC-010 da spec foram reescritos para "consistência garantida por verificação automática".

## D2 — Menu móvel como aprimoramento progressivo
- **Decisão**: o HTML traz a lista de links visível e o botão "Menu" com `hidden`. `initSiteNav()` mostra o botão, define `aria-expanded="false"` e `aria-controls`, e aplica `hidden` à lista quando a janela é estreita (`matchMedia("(max-width: 47.99rem)")`). Em largura ampla remove `hidden` da lista e esconde o botão; um listener de `change` do `matchMedia` mantém o estado coerente. Abrir/fechar alterna `hidden` na lista e `aria-expanded`. `Esc` fecha e devolve o foco ao botão. Sem JS: botão permanece oculto e a lista, visível.
- **Racional**: o atributo `hidden` remove os links da ordem de foco e da árvore de acessibilidade (FR-013); padrão *Disclosure* do APG (FR-015); sem JS tudo visível (FR-018). Sem animação, o que cumpre FR-019 por construção.
- **Alternativas**: esconder por CSS e abrir só por CSS (`:checked`, não expõe estado ao AT); `role="menu"` (rejeitado por DOC-13 §5); fechar ao clicar fora (não exigido; evita regras extras).

## D3 — Ponto de troca
- **Decisão**: 48 rem (768 px). Largura estreita = menu recolhível; ampla = navegação em linha. O valor fica em `tokens.css` como comentário de referência e nas duas consultas (CSS e `matchMedia`) com a mesma constante documentada.
- **Racional**: quatro rótulos curtos cabem em linha a partir de ~600 px; 768 px acompanha tablets em retrato e é o ponto usado nos wireframes (grade 3→2→1 colunas). CSS e JS precisam do mesmo valor; um teste e2e verifica 767/768 px.
- **Alternativas**: 40 rem (apertado com zoom 200%, que reduz a largura útil e já aciona o menu móvel, desejável).

## D4 — Página atual
- **Decisão**: `aria-current="page"` escrito em cada HTML no link correspondente; estilo visual por seletor `[aria-current="page"]` (sublinhado + peso, não só cor). `atividade.html` não marca nenhum link.
- **Racional**: FR-005/FR-006; funciona sem JS; sem lógica de comparação de URL (evita erros com `index.html`, barra final, parâmetros).

## D5 — Link de pular e destino
- **Decisão**: `<a class="skip-link" href="#main-content">` como primeiro filho do `body`; `<main id="main-content" tabindex="-1">`. Visível só em `:focus`.
- **Racional**: `tabindex="-1"` garante que o foco realmente siga para `main` em todos os navegadores (DOC-13 §4: "verificar que o destino seja alcançável e que o foco continue de forma previsível"). `main` não recebe contorno chamativo (`:focus` com `outline: none` só em `main`, que não é controle interativo; mantém conformidade porque o próximo Tab segue do ponto atual).

## D6 — Formato do endereço de detalhes
- **Decisão**: `atividade.html?id=<uuid>` (relativo, como os demais links; funciona em subcaminho). Implementado em `activityDetailsUrl(id)` com `URL`/`URLSearchParams`. O `slug` não é usado no endereço.
- **Racional**: o detalhe da API é por UUID (`/activities/{id}/`); a feature de detalhes lê `id` de `location.search`. Sem roteador SPA (DOC-09). O formato é compatível com preservar estado da listagem por parâmetros (FE-025).
- **Alternativas**: `atividade.html#<id>` (hash não vai ao servidor, pior para 404/compartilhamento); `/atividades/<slug>` (exige reescrita de rotas no servidor).

## D7 — Datas e horários
- **Decisão**: `formatOccurrence({date, start_time, end_time})` interpreta `AAAA-MM-DD` manualmente e formata com `Intl.DateTimeFormat("pt-BR", { timeZone: "UTC", weekday: "short", day: "numeric", month: "short" })` sobre `Date.UTC(y, m-1, d)`; horário `HH:MM` mostrado como `14h00–15h00` em pt-BR (`14:00 – 15:00` aceito, ver contrato). Devolve também o valor `datetime` ISO para `<time>`. Entradas inválidas → `null` e o card usa "Sem data prevista".
- **Racional**: a data da API é um dia-calendário sem fuso (America/Sao_Paulo); `new Date("2026-11-20")` interpretaria como UTC e, em UTC−3, recuaria o dia. Fixar o fuso `UTC` sobre uma data construída em UTC evita deslocamento (FR-026).

## D8 — Estrutura do card e link único
- **Decisão**: `<article class="activity-card">` com área de imagem (`div.activity-card__media`, `aria-hidden="true"` no fallback), etiqueta de categoria (`<p class="activity-card__category">`), `<h3>` (nível configurável) contendo o `<a>`, linhas de unidade e `<time>`. O link cobre o card inteiro por `::after { position:absolute; inset:0 }` (padrão *stretched link*), mantendo **uma** parada de foco. O nome acessível do link é o texto do título (distinto por atividade); foco visível desenhado no card via `:focus-within`/`:has(a:focus-visible)`.
- **Racional**: FR-024/FR-030/SC-006; evita link duplicado por imagem+título; título como nome acessível é distinto e descreve o destino (a spec cita o prefixo "Ver detalhes:" apenas como exemplo).
- **Alternativas**: `aria-label="Ver detalhes: título"` (substitui o texto visível e causa divergência com Label in Name, WCAG 2.5.3); card inteiro dentro de `<a>` (agrupa blocos num link verboso).

## D9 — Fallback e imagem futura
- **Decisão**: o fallback é `div.image-fallback` com fundo da paleta e um `<svg>` inline decorativo (`aria-hidden="true"`, `focusable="false"`). Nenhuma lista paralela de categorias: um único ícone padrão agora; o componente aceita um mapa opcional `categoryIcons` (slug → função/SVG) injetado pela página, vazio por padrão. Se `activity.image` (`{ url, alt }`) existir, cria `<img>` com `alt` fornecido (`""` se ausente) e, em `error`, substitui pelo fallback. Hoje a API não envia imagem (ver `docs/PENDENCIAS-BACKEND.md`).
- **Racional**: FR-032–FR-036 e a pendência registrada; evita código morto grande, mas deixa o ponto de extensão definido e testado.

## D10 — Região de estados e anúncio
- **Decisão**: `createRegionState({ content, status, ... })` recebe dois elementos já presentes no HTML: `content` (conteúdo visível, **não** live) e `status` (`role="status"` + `aria-live="polite"`, visualmente oculto). Cada troca escreve uma mensagem curta no `status` (limpando antes, para repetir mensagens iguais) e monta o conteúdo visível em `content`. O anúncio de "carregando" só ocorre após 300 ms (`announceDelayMs`); se o estado mudar antes, o anúncio é cancelado e apenas o resultado é comunicado. Esqueletos e o texto visível de carregamento ficam em `content` com `aria-hidden="true"` nos esqueletos.
- **Racional**: evita anúncio duplo (conteúdo live + texto) e anúncio de conteúdo grande (cards) por região live; FR-043, FR-044 e o caso de borda de resposta rápida. Estende a ideia da feature 002 (região existente antes da mudança).
- **Alternativas**: tornar o próprio `content` live (leitores leriam todos os cards); `role="alert"` (interrompe, desproporcional).

## D11 — Integração com `error-state.js`
- **Decisão**: `renderErrorState(container, error, { onRetry, live = true })`. Com `live: false` não define `role`/`aria-live` no contêiner (o anúncio é da região). O padrão `live: true` preserva o contrato e os testes da feature 002. `region-state` usa `live: false` e passa o `onRetry`. A regra de foco da feature 002 (botão removido → foco no contêiner `tabindex="-1"`) é mantida; o contêiner passa a ser `content`.
- **Racional**: FR-047 (um só mecanismo de erro) sem quebrar a API pública anterior.

## D12 — Esqueleto
- **Decisão**: `skeleton` renderizado por função da página (`renderSkeleton(count)`), com padrão do próprio componente: `count` blocos `div.skeleton-card[aria-hidden="true"]` da mesma proporção do card. Sem animação (estático); o estilo usa fundo `--color-surface` e borda, para continuar visível sem cor/animação.
- **Racional**: FR-038/FR-039/FR-045; não depende de `prefers-reduced-motion` porque nunca anima. Se um dia animar, a regra `@media (prefers-reduced-motion: reduce)` já fica prevista no CSS como no-op documentado.

## D13 — Testes e acessibilidade automática
- **Decisão**: `@axe-core/playwright` (versão fixa) como devDependency, executado nas cinco páginas e nos estados montados pelo módulo de verificação (carregando, erro, vazio, cards com e sem dados). Mesma estratégia da feature 002: o e2e importa os componentes na página existente (`page.evaluate(import(...))`), sem criar página pública nova. Teste de unidade lê os HTMLs via `fs` para a consistência (D1). A revisão manual (teclado, NVDA/VoiceOver, 200%, 320 px) é um checklist em `quickstart.md`.
- **Racional**: FR-051, SC-009, DOC-14.

## D14 — Estilos e tokens
- **Decisão**: novos tokens em `tokens.css` (cores de etiqueta, fundo do fallback, esqueleto, `--breakpoint-nav` como comentário). A paleta do DOC-10 é aplicada com os ajustes de contraste já usados (`--color-link` etc.); cada par texto/fundo novo é conferido a 4,5:1 e componentes a 3:1 (registrado em `quickstart.md`). Familia tipográfica da feature 001 mantida; a adoção de Poppins/Inter fica para EP-FE-04 (FE-011).
- **Racional**: FR-048 sem antecipar o épico de identidade visual.
