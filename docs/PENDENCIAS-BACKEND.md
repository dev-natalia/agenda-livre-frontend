# Pendências do backend identificadas pelo frontend

**Projeto:** Agenda Livre
**Atualizado em:** 2026-10-11 (feature 002 — cliente da API)

Divergências entre o contrato documentado no backend (`agenda-livre-backend/specs/006-public-consultation/contracts/public-api.md` e DOC-05) e o comportamento observado na API em execução (`http://localhost:8000/api/v1/`). Cada item deve ser resolvido no backend, corrigindo o código **ou** o contrato, e então marcado aqui.

## Abertas

- [ ] **Página fora do intervalo responde `400`, não `404`.**
  - Contrato: "Página fora do intervalo: `404` com o erro padrão" e "`page` inválido ou < 1 usa o padrão".
  - Observado: `GET /activities/?page=999`, `?page=2` (com `count: 1`) e `?page=0` respondem `400` com `{"detail":"Parâmetros inválidos.","errors":{"page":["Informe uma página válida."]}}`.
  - Impacto no frontend: o cliente classifica como `bad_request` (sem "Tentar novamente"), e não como `not_found`. A paginação (FE-024) precisa tratar esse caso, por exemplo voltando à página 1. Se o `400` for o comportamento desejado, basta atualizar o contrato; se o `404` ou o fallback para a página padrão for o desejado, corrigir o backend.

- [ ] **Atividades não têm imagem no backend.**
  - Contrato: nenhum campo de imagem em `GET /activities/` nem em `GET /activities/{id}/`. O backend exclui imagens de propósito (`agenda-livre-backend/specs/004-activity-management/spec.md`: "imagens não fazem parte desta versão"), mas o DOC-12/DOC-13 do frontend preveem imagem no card e na página de detalhes.
  - Impacto no frontend: todo card e a página de detalhes usam o fallback visual (FE-009) como caso normal. O componente do card fica preparado para receber uma imagem, mas nada a exibe hoje (feature 003).
  - Decisão pendente: (a) o backend passa a oferecer imagem (campo de URL, mais texto alternativo ou marcação de imagem decorativa, nos dois endpoints); ou (b) o produto aceita a versão 1 sem imagens, e os DOC-12/DOC-13 passam a tratar o fallback como padrão.

## Resolvidas

Nenhuma até o momento.

## Verificado e conforme o contrato

`200` com lista vazia (`count: 0`), `400` com `errors` por campo (`date_from` inválido), `404` para detalhe inexistente, id malformado e rota inexistente sob `/api/`, `405` para `POST`, envelope paginado `{count, next, previous, results}`, CORS para `http://localhost:5500`. O `429` não foi exercitado.

Feature 005 (código do backend, sem executar a API): `date_from` sozinho descarta atividades sem ocorrência na janela (`build_listing`), então `GET /activities/?date_from=<hoje>&page_size=3` devolve só atividades com ocorrência futura, como a página inicial espera. Confirmar com a API em execução.
