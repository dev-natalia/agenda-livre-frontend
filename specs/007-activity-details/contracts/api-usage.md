# Contrato: consulta feita pelos detalhes

Base: `PUBLIC_CONFIG.apiBaseUrl` (`/api/v1`), somente `GET`, via `request()`/`createRequestScope()`. Referência: `agenda-livre-backend/specs/006-public-consultation/contracts/public-api.md`.

| # | Consulta | Quando |
|---|---|---|
| 1 | `GET /activities/{id}/` | abertura com `id` UUID válido; "Tentar novamente" |

Nenhuma outra consulta (unidades e categorias já vêm aninhadas na resposta). Cada consulta nova cancela a anterior.

## Tratamento das respostas

| Resposta | Comportamento |
|---|---|
| `200` com objeto contendo `id` e `title` textual | conteúdo; título do documento da atividade |
| `200` sem objeto, `id` ou `title` | erro `invalid_response` com "Tentar novamente" |
| `404` | estado "não encontrada ou não disponível" (inexistente, malformado, rascunho, cancelada e encerrada são indistinguíveis) |
| `400`, `5xx`, `429`, rede, tempo esgotado, JSON inválido | erro amigável (`error.userMessage`); "Tentar novamente" apenas quando `retryable` |
| configuração inválida | aviso de configuração existente; sem esqueleto indefinido |
| cancelada (nova consulta, saída da página) | ignorada |

## Campos opcionais

`summary`, `description`, `target_audience_notes`, `unit.*` exceto `name`, `category`, `target_audiences`, `external_registration_url`, `schedules` e `next_occurrences` podem faltar ou vir nulos/vazios: a seção correspondente é omitida (nunca "undefined"/"null").

## Divergências conhecidas

Nenhuma nova. A ausência de imagem segue em `docs/PENDENCIAS-BACKEND.md`; o `404` uniforme é desenho do backend e sustenta a decisão D2 do `research.md`.
