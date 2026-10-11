# Data Model: Navegação e componentes compartilhados

Sem persistência. Estruturas em memória usadas pelos componentes.

## NavItem (estático no HTML)
| Campo | Valor |
|---|---|
| Rótulo | Início, Explorar atividades, Sobre, Contato |
| Destino | `index.html`, `explorar.html`, `sobre.html`, `contato.html` (relativos) |
| Página atual | `aria-current="page"` no item da própria página; nenhum em `atividade.html` |

Rodapé: identificação breve + links `sobre.html` e `contato.html`.

## MenuState (em memória, `site-nav.js`)
- `expanded`: boolean; só significativo em largura estreita.
- `narrow`: boolean, derivado de `matchMedia("(max-width: 47.99rem)")`.
- Regras: `narrow=false` → lista visível, botão oculto, `expanded` ignorado; `narrow=true` → lista com `hidden` salvo `expanded=true`; mudar para largo e voltar a estreito reinicia `expanded=false`.

## ActivitySummary (entrada do card; subconjunto de `GET /activities/`)
| Campo | Tipo | Obrigatório | Observação |
|---|---|---|---|
| `id` | string (UUID) | sim | sem `id` o card não é criado |
| `title` | string | sim | texto literal |
| `category` | `{ id, name, slug }` | não | omitida a etiqueta se ausente |
| `unit` | `{ id, name, slug, neighborhood }` | não | nome + bairro quando houver |
| `next_occurrence` | `{ date: "AAAA-MM-DD", start_time: "HH:MM", end_time: "HH:MM" } \| null` | não | `null` → "Sem data prevista" |
| `summary` | string | não | não exibido na v1 do card (decisão: fora do card) |
| `image` | `{ url, alt? }` | não | hoje nunca enviado pela API; extensão futura |

## FormattedOccurrence (saída de `formatOccurrence`)
`{ dateLabel: "sex., 20 de nov.", timeLabel: "14h00 às 15h00" | "14h00" | null, datetime: "2026-11-20T14:00" }` ou `null` para entrada inválida.

## RegionState
| Estado | Conteúdo visível (`content`) | Anúncio (`status`) |
|---|---|---|
| `idle` | vazio | vazio |
| `loading` | texto "Carregando…" + N esqueletos (`aria-hidden`) | "Carregando atividades…" (após 300 ms) |
| `success` | conteúdo fornecido pela página | mensagem opcional (ex.: "12 atividades encontradas") |
| `empty` | mensagem de ausência + orientação (se houver filtros) | "Nenhuma atividade encontrada." |
| `error` | `error.userMessage` + "Tentar novamente" se `error.retryable` e `onRetry` | `error.userMessage` |

Transições: qualquer estado → `loading` → (`success` \| `empty` \| `error`); `error` → `loading` por "Tentar novamente"; `cancelled` não altera o estado atual. Exatamente um estado por região.
