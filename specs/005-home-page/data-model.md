# Data Model: Página inicial

Sem persistência. As "entidades" são valores em memória da página. Campos da API conforme `public-api.md` do backend.

## Critérios de pesquisa (`SearchCriteria`)

| Campo | Tipo | Regra |
|---|---|---|
| `term` | texto | `trim`; vazio vira ausente; máx. 100 caracteres (também limitado no campo). |
| `unit` | UUID \| ausente | Valor da opção escolhida; "todas" = ausente. |
| `category` | UUID \| ausente | Idem. |
| `period` | `any` \| `today` \| `week` \| `month` | `any` = padrão. |

Derivados: `periodRange(period, hoje)` → `{}` \| `{date}` \| `{date_from, date_to}` (datas `AAAA-MM-DD`, dia de hoje em `America/Sao_Paulo`). `buildExploreUrl(criteria, hoje)` → `explorar.html` ou `explorar.html?...` apenas com os critérios presentes ([contracts/explore-url.md](contracts/explore-url.md)).

## Opção de período (`PeriodOption`)

| `key` | Rótulo | Janela |
|---|---|---|
| `any` (padrão) | Qualquer data | nenhuma |
| `today` | Hoje | `date = hoje` |
| `week` | Próximos 7 dias | `date_from = hoje`, `date_to = hoje + 6` |
| `month` | Este mês | `date_from = hoje`, `date_to = último dia do mês` |

## Opção de filtro (`FilterOption`)

`{ value: UUID, label: nome }`, vinda de `/units/` (unidade) ou `/categories/` (categoria). A opção padrão "todas" é fixa no HTML, com `value=""`.

## Atividade próxima (`UpcomingActivity`)

Item de `results` de `/activities/`: `id`, `title`, `slug`, `summary`, `unit{id,name,slug,neighborhood}`, `category{id,name,slug}`, `next_occurrence{date,start_time,end_time}|null`. Usado apenas para criar o card; sem `image` (a API não a fornece).

## Estado da seção de próximas atividades

Estados do `createRegionState`: `idle` → `loading` → `success` | `empty` | `error`; do `error`, "Tentar novamente" → `loading`.

| De | Evento | Para |
|---|---|---|
| `idle` | abertura da página | `loading` |
| `loading` | resposta com ≥ 1 card válido | `success` |
| `loading` | resposta sem card válido | `empty` |
| `loading` | falha (rede, tempo, 429, 5xx, resposta inválida, configuração) | `error` |
| `error` | acionar "Tentar novamente" | `loading` (consulta anterior cancelada; só uma em curso) |

Invariantes: um único estado visível por vez; resposta de consulta cancelada nunca altera o estado; o foco do teclado não é movido por nenhuma transição.

## Estado das opções dos filtros

`pending` → `ready` | `failed`, por filtro (unidade e categoria independentes). Em `failed`, apenas "todas" e um aviso associado ao filtro.
