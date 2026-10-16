# Contrato: consultas à API feitas pela Explorar (delta)

Estende `specs/006-activity-exploration/contracts/api-usage.md`. Referência do backend: `agenda-livre-backend/docs/10-filtro-por-publico-alvo.md`.

| # | Consulta | Quando | Mudança |
|---|---|---|---|
| 1 | `GET /activities/?[q][&unit][&category][&audience][&date \| &date_from&date_to][&page]&page_size=12` | igual à Explorar | `audience` (UUID) enviado só quando escolhido |
| 4 | `GET /audiences/?page_size=50` | abertura, em paralelo a #2 e #3 | opções do filtro de público |

Digitar ou escolher o público **não** consulta a API.

## Valores que nunca são enviados

Acrescenta: `audience` malformado.

## Respostas

- #1 com `audience`: mesmos tratamentos de #1. `200` com lista vazia (público inexistente ou inativo) cai no estado vazio padrão.
- #4: falha → só "Todos os públicos" + aviso "Não foi possível carregar os públicos-alvo."; combinações com unidades e categorias compõem a frase ("as unidades e os públicos-alvo", "as categorias e os públicos-alvo", "as unidades, as categorias e os públicos-alvo"). Itens sem `id`/`name` são ignorados.

## Campos usados

Item da listagem: acrescenta `target_audiences[].name`. Opção: `id`, `name`.
