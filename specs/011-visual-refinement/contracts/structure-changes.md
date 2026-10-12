# Contrato: mudanças permitidas em HTML e JavaScript

O refinamento é de CSS. As mudanças abaixo são as **únicas** de estrutura ou comportamento autorizadas (FR-031), todas necessárias para um resultado visual ou de marca. Qualquer outra precisa ser acrescentada aqui, com justificativa, antes de ser feita.

## HTML (as cinco páginas, de forma idêntica)

| # | Mudança | Motivo | Preserva |
|---|---|---|---|
| H1 | `<img>` do logo dentro de `.site-header__brand`, com `alt="Agenda Livre"` | FR-001 | link para `index.html`, nome acessível, posição na ordem de foco |
| H2 | `<link rel="icon">` e `<link rel="apple-touch-icon">` no `<head>` | FR-001 | ordem dos demais `<link>` e do `<script>` |
| H3 | (condicional, só Início) um `<div class="quick-search__panel">` ou classe extra no formulário, se o CSS não alcançar o painel único | FR-011 | `id`, `name`, `for`, `aria-*`, `action`, `method` e a ordem dos campos |
| H4 | (condicional, Explorar) classe extra no formulário para o painel de filtros | FR-023 | idem |

Rodapé: texto "Agenda Livre" pode virar o logo reduzido **só se** o nome continuar acessível; do contrário permanece texto.

## JavaScript

| # | Mudança | Motivo | Preserva |
|---|---|---|---|
| J1 | `activity-card.js`: gravar `data-category` na etiqueta com o `slug` quando `/^[a-z0-9-]+$/` | FR-015 | texto do nome, `textContent`, nenhuma `innerHTML` |
| J2 | `details/render.js`: o mesmo `data-category` na categoria da página de detalhes | FR-015 | idem |
| J3 | novo `activity-icons.js` e seu uso nos metadados do card e dos detalhes | FR-022 | texto dos metadados e testes de texto (os ícones são `aria-hidden` e não entram no texto acessível) |

Não mudam: `js/api/*`, `js/pages/*`, `js/explore/*`, `js/home/*`, `js/contact/*`, `js/components/site-nav.js`, `config.js`.

## Testes afetados (atualização justificada, nunca remoção)

| Teste | Motivo da atualização |
|---|---|
| `tests/unit/design-tokens.test.js` | novos tokens e pares de contraste; `--content-max-width` |
| `tests/unit/site-shell.test.js` e estrutura estática | marca com `<img>` no cabeçalho; `<link>` de ícone |
| `tests/unit/activity-card.test.js` e `details-render.test.js` | `data-category` e ícones; assertivas de texto inalteradas |
| `tests/e2e/responsive-reflow.spec.js`, `visual-consistency.spec.js` | só se medirem valores alterados de propósito |

Qualquer falha fora desta lista é regressão e se corrige no código, não no teste.
