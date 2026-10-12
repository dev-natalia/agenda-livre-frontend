# Contrato: verificação opcional contra a API real

## Como roda

```sh
API_BASE_URL=http://localhost:8000/api/v1 npm run test:contract      # sh
$env:API_BASE_URL="http://localhost:8000/api/v1"; npm run test:contract   # PowerShell
```

- Arquivo: `tests/contract/api-contract.test.js`, configuração `vitest.contract.config.js`. Não faz parte de `npm test` nem de `npm run test:all`.
- Sem `API_BASE_URL`, o `describe` é marcado como ignorado com a mensagem "API_BASE_URL não informada; verificação de contrato não executada". Nunca falha por isso e nunca acessa a rede.
- Somente `GET`. Nenhum dado é gravado. Nenhum dado pessoal é usado nem registrado.
- Cada fluxo é independente: se o backend não tiver dados (lista vazia), o fluxo de detalhe é marcado como não executável, não como falha.

## Fluxos e formato esperado

| Fluxo | Requisição | Esperado |
|---|---|---|
| Lista paginada | `GET /activities/` | `200`; `{count, next, previous, results[]}`; cada item com `id`, `title`, `unit`, `category`, `next_occurrence` ou nulo |
| Busca | `GET /activities/?q=<termo do primeiro item>` | `200`; `count ≥ 1` |
| Lista vazia | `GET /activities/?q=zzzz-inexistente-zzzz` | `200`; `count: 0`; `results: []` |
| Filtro inválido | `GET /activities/?date_from=invalido` | `400`; `{detail, errors}` com o campo |
| Página fora do intervalo | `GET /activities/?page=999` | `400` com `errors.page` (contrato corrigido na pendência de 2026-10-12) |
| Detalhe | `GET /activities/{id do primeiro item}/` | `200`; campos usados por `js/details/render.js` |
| Inexistente | `GET /activities/<uuid aleatório>/` | `404` |
| Campo `image` | itens da lista e do detalhe | `null`, ausente (backend sem a feature) ou `{url, alt, decorative}` com `url` absoluta |

## Divergências

Se um fluxo não confere, o teste falha com a mensagem "esperado X, observado Y" e a pessoa que executa registra o item em `docs/PENDENCIAS-BACKEND.md` (observado, esperado, impacto no frontend). O frontend não é alterado para acomodar a divergência sem esse registro.

## Fora da verificação

CORS (depende do navegador; coberto pelo guia de execução local), `429`, autenticação, desempenho.
