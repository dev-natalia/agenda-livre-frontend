# Modelo de dados: Exploração de atividades

Estruturas em memória (sem banco). Campos da API conforme `agenda-livre-backend/specs/006-public-consultation/contracts/public-api.md`.

## Criteria (critérios)

| Campo | Tipo | Regra |
|---|---|---|
| `term` | string | `normalizeTerm`: `trim`, ≤ 100 caracteres; vazio = ausente |
| `unit` | string (UUID) | formato UUID; senão descartado |
| `category` | string (UUID) | idem |
| `period` | `any` \| `today` \| `week` \| `month` | derivado de `date`/`date_from`/`date_to` por `inferPeriod`; padrão `any` |

Existe em dois estados: **rascunho** (campos do formulário) e **aplicados** (endereço + última consulta). `toApiParams(criteria, hoje)` produz `{ q, unit, category, date | date_from + date_to }` sem valores vazios; `date` nunca coexiste com `date_from`/`date_to`.

## ExploreState (aplicado)

| Campo | Tipo | Regra |
|---|---|---|
| `criteria` | Criteria | normalizado |
| `page` | inteiro ≥ 1 | inválido ou ausente → 1 |

Chave canônica: `buildExploreSearch(criteria, page)` (ordem `q, unit, category, date, date_from, date_to, page`; `page=1` omitido).

## ListingResult

| Campo | Origem | Regra |
|---|---|---|
| `count` | `count` | inteiro ≥ 0; senão **total indisponível** |
| `results` | `results` | itens sem `id`/`title` são ignorados (o card já rejeita) |
| `hasNext` / `hasPrevious` | `next` / `previous` | usado só quando `count` é indisponível |
| `pageSize` | constante 12 | enviado em `page_size` |
| `totalPages` | `ceil(count / 12)` | `0` quando `count = 0` |

## ListingView (estado de exibição, via `createRegionState`)

`idle → loading → success | empty | error`. Transições: aplicar/limpar/paginar/popstate/retry → `loading`; `success` com `results` vazio **e** `count = 0` → `empty`; `success` com `count > 0` e `results` vazio (resposta incoerente) → `error` (`invalid_response`); `cancelled` não altera o estado.

## PaginationModel

| Campo | Tipo |
|---|---|
| `current` | inteiro |
| `total` | inteiro (≥ 2 para exibir) |
| `items` | lista de `{ type: "page", number }` \| `{ type: "gap" }` — no máximo 7 |
| `previous` / `next` | número da página ou `null` (indisponível) |

## ListingSnapshot (sessionStorage)

| Campo | Tipo | Regra |
|---|---|---|
| `key` | string | `agenda-livre:explore:<search canônico>` |
| `savedAt` | epoch ms | válido por 5 minutos |
| `count`, `next`, `previous`, `results` | cópia da resposta | só campos usados pelo card |
| `scrollY` | número | posição ao sair |
| `activityId` | string \| null | último card acionado |

Máximo de 10 entradas; leitura inválida ou vencida é tratada como ausente.
