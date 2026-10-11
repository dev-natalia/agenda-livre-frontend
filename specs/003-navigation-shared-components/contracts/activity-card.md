# Contract: `js/components/activity-card.js` e `js/utils/format.js`

```text
export function createActivityCard(activity, { headingLevel = 3, categoryIcons = {} } = {}) -> HTMLElement | null
  // Retorna <article class="activity-card"> ou null se activity.id ou activity.title forem inválidos.

export function activityDetailsUrl(id) -> string        // "atividade.html?id=<id codificado>"
export function formatOccurrence(next_occurrence) -> FormattedOccurrence | null
```

## Estrutura produzida

```html
<article class="activity-card">
  <div class="activity-card__media image-fallback" aria-hidden="true"><svg …/></div>
  <div class="activity-card__body">
    <p class="activity-card__category">Cultura e Artes</p>        <!-- omitido sem categoria -->
    <h3 class="activity-card__title"><a href="atividade.html?id=…">Oficina de dança</a></h3>
    <p class="activity-card__unit">CEU Navegantes · Grajaú</p>     <!-- omitido sem unidade -->
    <p class="activity-card__when"><time datetime="2026-11-20T14:00">sex., 20 de nov. · 14h00 às 15h00</time></p>
    <!-- sem próxima ocorrência: <p class="activity-card__when">Sem data prevista</p> -->
  </div>
</article>
```

Regras:
- Todo texto via `textContent`; nenhum `innerHTML` com dados.
- `headingLevel` (2–6) define `h2`…`h6`; a página escolhe pelo contexto, sem pular níveis.
- Um único `<a>` por card, cobrindo o card por pseudo-elemento; nome acessível = título.
- Fallback decorativo sempre oculto da AT; `.activity-card__media` mantém `aspect-ratio` fixo (16/9).
- Imagem opcional: se `activity.image?.url` existir, `<img src alt loading="lazy">` com `alt = image.alt ?? ""`; em `error`, troca por fallback. Nunca `alt` igual ao título por padrão.
- Campos ausentes: omite só o elemento correspondente; nenhum texto "undefined"/"null".
- Texto longo: `overflow-wrap: anywhere` no corpo do card.
- Não chama `fetch` nem a API; não adiciona listeners de clique (o link é nativo).

## `formatOccurrence`
- Entrada válida: `date` `AAAA-MM-DD` (dia existente) e `start_time` `HH:MM`; `end_time` opcional.
- `timeLabel`: `"14h00 às 15h00"`; só início → `"14h00"`; sem horário → `null` (a data aparece sozinha).
- Sem deslocamento de fuso (D7 do research). Entrada inválida/`null` → `null`.

## `activityDetailsUrl`
- Usa `URL`/`URLSearchParams` com base relativa; `id` é codificado; devolve caminho relativo (`atividade.html?id=...`).
