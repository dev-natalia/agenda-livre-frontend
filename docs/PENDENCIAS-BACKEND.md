# Pendências do backend identificadas pelo frontend

**Projeto:** Agenda Livre
**Atualizado em:** 2026-10-11 (feature 002 — cliente da API)

Divergências entre o contrato documentado no backend (`agenda-livre-backend/specs/006-public-consultation/contracts/public-api.md` e DOC-05) e o comportamento observado na API em execução (`http://localhost:8000/api/v1/`). Cada item deve ser resolvido no backend, corrigindo o código **ou** o contrato, e então marcado aqui.

## Abertas

- [ ] **Página fora do intervalo responde `400`, não `404`.**
  - Contrato: "Página fora do intervalo: `404` com o erro padrão" e "`page` inválido ou < 1 usa o padrão".
  - Observado: `GET /activities/?page=999`, `?page=2` (com `count: 1`) e `?page=0` respondem `400` com `{"detail":"Parâmetros inválidos.","errors":{"page":["Informe uma página válida."]}}`.
  - Impacto no frontend: o cliente classifica como `bad_request` (sem "Tentar novamente"), e não como `not_found`. A paginação (FE-024) precisa tratar esse caso, por exemplo voltando à página 1. Se o `400` for o comportamento desejado, basta atualizar o contrato; se o `404` ou o fallback para a página padrão for o desejado, corrigir o backend.

## Resolvidas

Nenhuma até o momento.

## Verificado e conforme o contrato

`200` com lista vazia (`count: 0`), `400` com `errors` por campo (`date_from` inválido), `404` para detalhe inexistente, id malformado e rota inexistente sob `/api/`, `405` para `POST`, envelope paginado `{count, next, previous, results}`, CORS para `http://localhost:5500`. O `429` não foi exercitado.
