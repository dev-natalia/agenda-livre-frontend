# Contrato: regras visuais por componente

Valores sempre por token. "Preserva" lista o que não pode mudar. Histórias: VIS-001 a VIS-020 do `docs/18-backlog-refinamento-visual-frontend.md`; requisitos FR-xxx da spec.

## Estrutura global (VIS-001 a 005; FR-003 a 009)

- `body > header, main, footer`: mesmo contêiner (`--content-max-width`), mesmo `padding-inline`. Texto corrido em `--reading-max-width`.
- Seções principais separadas por `--space-6` (celular) e `--space-8` (≥ 64rem); título e conteúdo relacionados por `--space-3` ou menos.
- Cabeçalho: fundo `--color-surface`, borda inferior e `--shadow-header`; logo à esquerda com `--logo-height`; links com `--target-min` de altura; item ativo com **barra inferior espessa e negrito** (além da cor); hover com sublinhado. Preserva: botão Menu, `aria-expanded`, ordem de foco, link de pular, ponto de troca 48rem.
- Rodapé: mesmo contêiner, borda superior discreta, fundo `--color-surface`; marca em texto pequeno ou logo reduzido; links com alvo mínimo; sempre ao final da janela (corpo em coluna, `main` com `flex: 1 0 auto`).
- Tipografia: h1 e h2 nos tokens atuais; Poppins só em títulos; texto auxiliar nunca abaixo de `--font-size-small`.

## Início (VIS-006 a 009; FR-010 a 013)

- Hero: painel com `--color-surface-tint`, `--radius-panel`, padding `--space-5`; em ≥ 48rem, duas colunas (texto, ilustração) com `align-items: center`; em tela estreita, uma coluna com ilustração depois do texto; ilustração `alt=""`. O h1 é o maior texto da página.
- Busca: painel `--color-surface`, `--border-width`, `--shadow-panel`, `--radius-panel`; rótulos acima; campo de texto em linha própria (celular e tablet) e, em ≥ 64rem, campo + 3 filtros + botão na mesma região, sem larguras desproporcionais; botão "Explorar" primário, mesma altura dos campos; `quick-search__notice` dentro do painel. Preserva: `action`, `method`, nomes dos campos, `aria-describedby`, `role="status"`.
- Próximas atividades: cabeçalho da seção com título e "Ver todas" alinhados na base; introdução logo abaixo; "Ver todas" com alvo mínimo e sublinhado; espaçamento `--space-6`/`--space-8` da busca e do rodapé.

## Cards e etiquetas (VIS-010, 011; FR-014, 015, 022)

- Card: `--radius-card`, borda `--border-width` `--color-border`, `--shadow-card`; hover troca a cor da borda; foco no contêiner com contorno atual. Mídia 16:9; corpo com `--space-3`.
- Ordem no corpo: etiqueta, título, unidade (com ícone de local), data (com ícone de calendário e horário). Ícones `aria-hidden`; textos intactos. Cards da mesma linha com altura igual (`align-items: stretch`) e rodapé alinhado (a data fica na base com `margin-top: auto`).
- Link esticado e parada de foco única preservados.
- Etiqueta: `data-category="<slug>"`; fundo sólido por categoria (`design-tokens-delta.md`) e texto `--color-brand-contrast`; neutra por padrão; mesma regra no card e nos detalhes.

## Estados (VIS-012, 013; FR-016, 017)

- Painel de estado: `--radius-panel`, padding `--space-5`, texto centralizado, título em destaque e dica em `--color-text-muted`.
- Formas distintas **preservadas**: vazio tracejado, carregando pontilhado, erro com borda esquerda grossa e fundo de aviso. Distinguíveis em escala de cinza (teste existente `state-contrast`/`a11y-state-cues`).
- Esqueletos: proporção igual à do card (mídia + corpo), estáticos. Erro: botão "Tentar novamente" como primário.

## Botões, campos e superfícies (VIS-014 a 016; FR-018 a 021)

- Primário `--color-action`/branco; de destaque `--color-accent` com texto `--color-text` (como o "Ver detalhes" do guia); contornado branco com borda e texto `--color-primary`. Altura mínima `--target-min`, raio `--radius-sm`, peso 600. Estados: hover, foco (contorno e halo), ativo, desabilitado (tracejado), todos além da cor.
- Campos: altura `--target-min`, borda `--border-width-control` `--color-border`, raio `--radius-sm`, foco com contorno atual, erro com borda tracejada e texto "Erro:". Preserva: `aria-invalid`, `aria-describedby`, mensagens, zoom e controles nativos.
- Sombra só em cabeçalho, painéis e cards; nunca em campo nem botão; nenhuma superfície combina sombra, borda forte e fundo contrastante.

## Páginas internas (VIS-017 a 020; FR-023 a 026)

- Explorar: título e descrição em bloco; filtros em painel como a busca do Início (`--shadow-panel`), "Filtrar" primário e "Limpar filtros" contornado na mesma linha de ações; resultados em seção separada por `--space-6`; resumo em linha própria acima da grade. Preserva URL, histórico, paginação e foco do título de resultados.
- Detalhes: coluna de leitura (`48rem`); título e metadados (categoria, unidade com ícone de local, próxima data) antes da descrição; blocos de programação com título e lista; link externo com texto "abre em nova aba/site externo" mantido; "não encontrada" com título e ação "Explorar atividades" em botão.
- Sobre: seções separadas por `--space-5`, subtítulos em h2, largura de leitura; convite "Explorar atividades" como botão primário no fim.
- Contato: formulário em painel `--color-surface` (largura `40rem`), aviso de demonstração acima dos campos com fundo de aviso e borda lateral, campos com `--space-4` entre eles, "Enviar" primário e "Limpar" contornado; resumo de erros e confirmação mantêm hierarquia. Continua sem rede.

## Responsividade (VIS-022; FR-027)

Larguras de verificação: 320, 375, 768, 1024, 1440. Quebras: 40, 48 e 64 rem. Nenhuma rolagem horizontal em 320; títulos longos quebram (`overflow-wrap: anywhere` mantido); zoom nunca bloqueado (`viewport` sem `user-scalable=no`).
