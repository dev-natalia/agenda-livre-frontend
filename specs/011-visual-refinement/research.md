# Pesquisa e decisões: Refinamento visual do frontend

Sem `NEEDS CLARIFICATION` pendente. Cada decisão registra a escolha, o motivo e as alternativas.

## D1 — Logo e ícone: SVG redesenhado a partir do guia

- **Decisão**: criar `images/brand/logo.svg` (nome "Agenda Livre" em duas linhas, azul `#1E40AF`, com os três raios laranja e amarelo), `images/brand/icon.svg` (quadrado arredondado azul com "A" branco e raios) e `images/brand/apple-touch-icon.png` (180×180, gerado do ícone). Texto do logo convertido em **curvas** (a partir da fonte Poppins 700 local) para não depender de fonte instalada.
- **Motivo**: o repositório só tem o PNG do guia (composição única, sem arquivos separados). SVG escala sem perda, pesa pouco e permite o contorno nítido em qualquer densidade. O `apple-touch-icon` cobre iOS, que não usa SVG.
- **Alternativas**: recortar o PNG do guia (borrado em telas densas, fundo não transparente); usar texto SVG com `font-family` (muda com a fonte); manter só o texto "Agenda Livre" (não cumpre o pedido de usar logo e ícone).
- **Variação para fundo escuro**: não será criada; o site tem fundos claros apenas (FR-002 autoriza omitir). Se a pessoa responsável quiser, fica como evolução.

## D2 — Logo no cabeçalho com nome acessível

- **Decisão**: `<a class="site-header__brand" href="index.html"><img src="images/brand/logo.svg" alt="Agenda Livre" width=… height=…></a>`. O nome acessível do link continua "Agenda Livre"; em falha de carga, o `alt` aparece como texto. Nas páginas além do Início, o link continua levando ao Início (comportamento atual).
- **Motivo**: preserva o nome acessível e o teste de estrutura existente, e não exige JS. O logo é conteúdo (identifica o site), por isso não é `alt=""`.
- **Alternativas**: SVG inline (repete markup nas 5 páginas); fundo CSS (perde o texto alternativo).

## D3 — Largura útil

- **Decisão**: `--content-max-width` de `72rem` para `80rem` (1280 px). Cabeçalho, `main` e rodapé continuam no mesmo seletor `body > header, main, footer`, então o alinhamento é automático. Parágrafos seguem em `--reading-max-width` (65ch); `.activity-details__article` e `.prose` mantêm largura de leitura.
- **Motivo**: em 1440 px, 72rem (1152 px) deixa margens de ~144 px de cada lado e a grade de três cards e a busca ficam apertadas; 80rem aproveita melhor sem esticar texto. O guia mostra quatro cards por linha em desktop, mas isso mudaria a densidade da grade e não é pedido (três colunas permanecem; quatro ficam como avaliação do registro de revisão).
- **Alternativas**: 90rem+ (linhas de busca esparsas); manter 72rem (não atende VIS-001).

## D4 — Cores de categoria

- **Decisão**: opção B do usuário, aplicada por **slug**, com etiqueta de fundo sólido e texto branco (como no guia). Valores com contraste do texto branco sobre a cor calculado agora:

| Slug | Cor | Contraste (branco) |
|---|---|---|
| `cultura-e-artes` | `#B91C1C` | 6,47 |
| `esporte-e-atividade-fisica` | `#15803D` | 5,02 |
| `cursos-e-formacao` | `#1D4ED8` | 6,70 |
| `eventos-e-encontros` | `#7E22CE` | 6,98 |
| `saude-e-bem-estar` | `#0F766E` | 5,47 |
| `lazer-e-recreacao` | `#C2410C` | 5,18 |
| `educacao-e-meio-ambiente` | `#BE185D` | 6,04 |
| (qualquer outro) | neutro atual (`#E6EEFA` / `#1E3A8A`) | ≥ 7 |

- **Motivo**: o guia usa Dança/Esporte/Artes/Música, mas a API só conhece as sete categorias acima; mapear por nome do guia não colorizaria quase nada. A cor sólida com texto branco reproduz o guia e garante 4,5:1 sem depender do fundo do card. O nome continua escrito (a cor nunca é a única pista).
- **Alternativas**: mapear por nome (frágil, depende de acentos e de edição no Admin); cor gerada por hash do slug (imprevisível e sem controle de contraste); cor vinda da API (exige mudança no backend, fora do escopo).
- **Regra para categoria nova**: neutro. Nova cor entra em `tokens.css` e no teste de contraste.

## D5 — Ícones de apoio

- **Decisão**: módulo `js/components/activity-icons.js` com três SVGs (localização, calendário, relógio) no traço do `defaultIcon()` existente, `aria-hidden="true"` e `focusable="false"`, usados nos metadados do card e dos detalhes. O texto ("CEU X · Bairro", data, horário) não muda.
- **Motivo**: o guia os mostra e a spec os permite (FR-022); reaproveita o padrão de SVG por DOM já usado e testado, sem `innerHTML` (DOC-14 §11).
- **Alternativas**: sprite SVG externo (requisição extra, `<use>` externo é frágil); biblioteca de ícones (proibida sem justificativa); fonte de ícones (acessibilidade e carregamento piores).

## D6 — Acessibilidade preservada por construção

- **Decisão**: o refinamento troca valores (cor, raio, sombra, espaçamento), não estrutura semântica. Mantêm-se: `:focus-visible` com halo, alvo mínimo 2,75 rem, `aria-current`, `aria-expanded`, link de pular, regra central de movimento reduzido (`--motion-duration`), bordas dos controles e formas distintas dos estados. Sombra nunca substitui borda de controle. Hover/foco do card seguem as regras atuais.
- **Motivo**: a feature 009 construiu e testou essa base (matriz axe, foco, espaçamento de texto, movimento reduzido); tocá-la sem necessidade criaria risco sem ganho.

## D7 — Painéis de hero e busca

- **Decisão**: o hero ganha fundo de tinta clara (`--color-surface-tint`), raio de painel e espaçamento maior; a busca do Início vira painel branco com borda e `--shadow-panel`; o botão "Explorar" ocupa a coluna final na linha do campo (como o guia em desktop). Se o CSS por si só não permitir o agrupamento, o HTML ganha **apenas** um contêiner (registrado em `contracts/structure-changes.md`). Em Explorar, a barra de filtros recebe o mesmo painel.
- **Motivo**: VIS-006/007/017 pedem área única e delimitada, sem "caixa dentro de caixa": só o painel externo tem superfície; os campos mantêm a borda de controle.
- **Alternativas**: unir hero e busca em um só bloco como no guia (muda a ordem do DOM e do foco; adiado, pode ser avaliado depois).

## D8 — Testes existentes

- **Decisão**: rodar a suíte completa antes de qualquer mudança (linha de base), manter todos os testes e atualizar só as asserções que medem valores alterados de propósito: `--content-max-width`, novos tokens no teste de contraste, marca do cabeçalho em `site-shell`/estrutura, ícones em `activity-card`. Cada atualização é listada no registro de revisão com o motivo. `coverage-matrix.test.js` continua impedindo `.only` e `.skip` sem motivo.
- **Motivo**: DOC-14 §13 e a regra da feature 010: nenhum teste removido ou enfraquecido para ficar verde.

## D9 — Captura antes/depois

- **Decisão**: `tests/capture/capture-screens.mjs`, executado à mão (`npm run capture`), usa Playwright e o servidor estático de teste com respostas simuladas (fixtures da feature 010) para tirar PNGs das cinco páginas em 320, 768 e 1440 (e 375/1024 quando útil), nos estados com resultados, vazio e erro, gravando em `docs/visual-review/before` e `after`. **O "antes" é capturado primeiro, antes de qualquer alteração de código.**
- **Motivo**: VIS-024 exige capturas comparáveis e reproduzíveis. Fora do `npm test` para não criar teste frágil baseado em pixels nem tornar a suíte lenta.
- **Alternativas**: comparação de pixels automática (frágil por antialiasing e fonte); capturas manuais (não reproduzíveis).

## D10 — Backend

- Sem mudança. Verificado nos specs do backend: o campo `image` (`{url, alt, decorative}` ou `null`) já é tratado; `category.slug` e `category.name` vêm em lista e detalhe; `docs/PENDENCIAS-BACKEND.md` não tem item aberto que afete a apresentação (o `400` fora do intervalo já é tratado).

## D11 — Fora do escopo confirmado

Favoritar, ordenar, contador de resultados, filtros em lista suspensa recolhível, carrossel, busca no cabeçalho, foto do prédio, ícone de público e quatro colunas de cards. Um possível ajuste de quatro colunas é avaliação do registro, não requisito.
