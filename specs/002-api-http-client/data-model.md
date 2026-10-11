# Data Model: Cliente e integração com a API

Modelos em memória (sem persistência).

## ApiError (extends Error)
| Campo | Tipo | Regra |
|---|---|---|
| `category` | enum | `config`, `network`, `timeout`, `not_found`, `bad_request`, `rate_limited`, `server`, `http`, `invalid_response`, `cancelled` |
| `status` | número \| null | status HTTP; `null` sem resposta |
| `userMessage` | string | pt-BR, sem status/exceção/endereço/corpo do servidor |
| `retryable` | boolean | `true` só para `network`, `timeout`, `server`, `rate_limited` |
| `fieldErrors` | objeto \| null | `errors` da API, só em `bad_request`; nunca exibido automaticamente |
| `cause` | any | erro original, apenas para depuração |

### Mapeamento de classificação
| Situação | category | retryable |
|---|---|---|
| Configuração ≠ `valid` | `config` | não |
| `fetch` rejeita (TypeError, CORS, offline) | `network` | sim |
| Timeout próprio estourou | `timeout` | sim |
| Abort por substituição/saída | `cancelled` | — (ignorado) |
| 400 | `bad_request` | não |
| 404 | `not_found` | não |
| 429 | `rate_limited` | sim |
| 5xx | `server` | sim |
| Outros 3xx/4xx | `http` | não |
| 2xx com JSON ilegível ou vazio indevido | `invalid_response` | não |

## RequestScope
| Campo | Descrição |
|---|---|
| `generation` | contador incrementado a cada `run`; só a geração vigente pode resolver |
| `controller` | `AbortController` da consulta vigente |
| `run(path, params, options)` | executa; cancela a anterior |
| `cancel()` | cancela a vigente (ex.: saída da página) |

Transições da consulta: `idle → loading → (success | failed | cancelled)`; um novo `run` leva a vigente a `cancelled` e inicia `loading`.

## Resultado
Resolução de `request`/`run` = JSON interpretado (objeto) ou `null` (sem corpo permitido). Lista vazia (`count: 0`) é sucesso comum.
