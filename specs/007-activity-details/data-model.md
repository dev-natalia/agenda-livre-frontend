# Modelo de dados: Detalhes das atividades

Dados somente de leitura vindos de `GET /activities/{id}/`. O frontend não persiste nada.

## Atividade (detalhe) — resposta da API

| Campo | Tipo | Obrigatório na tela | Observações |
|---|---|---|---|
| `id` | UUID | sim | usado só na consulta |
| `title` | texto | sim | `h1`; sem título, a resposta é tratada como inválida (`invalid_response`) |
| `slug` | texto | não | não exibido |
| `summary` | texto ou nulo | não | exibido sob o título quando houver |
| `description` | texto ou nulo | não | seção "Sobre a atividade"; quebras de linha preservadas |
| `target_audience_notes` | texto ou nulo | não | exibido na seção "Público" |
| `unit` | `{ id, name, slug, address, neighborhood }` | não | nome obrigatório para exibir o bloco; endereço e bairro opcionais |
| `category` | `{ id, name, slug }` | não | rótulo acima do título |
| `target_audiences` | lista de `{ id, name }` | não | seção "Público" quando não vazia |
| `external_registration_url` | texto ou nulo | não | validado em `safeExternalUrl` |
| `schedules` | lista de Programação | não | seção "Quando"; ordem da API |
| `next_occurrences` | lista de Ocorrência (até 5) | não | vazia significa "Sem data prevista" |

Resposta sem objeto, sem `id` ou sem `title` textual: `invalid_response` (mensagem genérica com "Tentar novamente").

## Programação

| Campo | Tipo | Regra de exibição |
|---|---|---|
| `schedule_type` | `ONE_TIME` \| `RECURRING` | decide o formato |
| `start_date`, `end_date` | `AAAA-MM-DD` | pontual: uma data; recorrente: período |
| `start_time`, `end_time` | `HH:MM` ou nulo | sem início, só a data; sem fim, só o início |
| `weekday_names` | lista de texto | recorrente: dias por extenso; pontual: ignorada |

Valores inválidos de data ou hora são omitidos sem quebrar a página (mesmas regras de `formatOccurrence`).

## Ocorrência

`{ date, start_time, end_time }`, na ordem da API, até 5. Cada uma vira um item de lista com `<time datetime>`.

## Visão derivada (`scheduleViews`)

Função pura que recebe `schedules` e `next_occurrences` e devolve:

```text
{
  items: [{ kind: "one-time" | "recurring", title, periodLabel, timeLabel, weekdaysLabel }],
  upcoming: [{ label, datetime }],   // vazio → "Sem data prevista"
}
```

## Estados da página

Mutuamente exclusivos e comunicados por uma única região de status:

| Estado | Entrada | Saída |
|---|---|---|
| `loading` | abertura, "Tentar novamente" | `success`, `not_found` ou `error` |
| `success` | `200` com dados válidos | — |
| `not_found` | `404`, `id` ausente ou inválido | — (links para Explorar e Início) |
| `error` | rede, tempo esgotado, `5xx`, `429`, `400`, JSON ou dados inválidos, configuração inválida | `loading` (retry) |

`cancelled` não gera estado.

## Link externo (`safeExternalUrl`)

Entrada: valor da API. Saída: URL normalizada ou `null`. Aceita apenas `http:` e `https:` sem usuário e senha; rejeita nulo, vazio, relativas, `//host`, `javascript:`, `data:`, `file:` e malformadas.
