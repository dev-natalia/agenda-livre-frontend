# Contrato: consultas à API feitas pela Explorar

Base: `PUBLIC_CONFIG.apiBaseUrl` (`/api/v1`), somente `GET`, via `request()`/`createRequestScope()`. Referência: `agenda-livre-backend/specs/006-public-consultation/contracts/public-api.md`.

| # | Consulta | Quando | Para quê |
|---|---|---|---|
| 1 | `GET /activities/?[q][&unit][&category][&date \| &date_from&date_to][&page]&page_size=12` | abertura, "Filtrar", "Limpar filtros", troca de página, `popstate` sem cópia válida, "Tentar novamente", fallback de página | cards, total e paginação |
| 2 | `GET /units/?page_size=50` | abertura | opções de unidade |
| 3 | `GET /categories/?page_size=50` | abertura | opções de categoria |

Digitar, escolher filtros e passar o foco **não** consultam a API. Cada consulta nova cancela a anterior do mesmo escopo.

## Valores que nunca são enviados

Termo > 100 caracteres, UUID malformado, data inválida, `date` junto de `date_from`/`date_to`, `date_from` > `date_to`, intervalo > 366 dias (os períodos oferecidos têm no máximo 31 dias), `page` < 1.

## Tratamento das respostas (#1)

| Resposta | Comportamento |
|---|---|
| `200`, `count > 0`, `results` não vazio | cards na ordem recebida; resumo "N atividade(s) encontrada(s)"; paginação se `ceil(count/12) > 1`; anúncio único do total |
| `200`, `count = 0` | estado vazio ("Nenhuma atividade encontrada" + orientação e ação "Limpar filtros"); sem resumo nem paginação |
| `200`, `count > 0` e `results` vazio | resposta incoerente → erro (`invalid_response`) com "Tentar novamente" |
| `200`, `count` ausente/inválido | cards sem resumo; paginação só com anterior/próxima conforme `previous`/`next` |
| `400` com `errors.page` ou `404`, com `page > 1` | `replaceState` sem `page` e nova consulta da página 1 (uma vez) |
| `400` (outro campo), `404` com `page = 1`, `5xx`, `429`, rede, tempo esgotado, JSON inválido, configuração inválida | erro amigável (`error.userMessage`); "Tentar novamente" apenas quando `retryable` |
| cancelada (nova consulta, saída da página) | ignorada |

## Tratamento das respostas (#2/#3)

Idêntico à Início (`specs/005-home-page/contracts/api-usage.md`): falha → só "todas" + aviso "Não foi possível carregar as unidades/as categorias/as unidades e as categorias."; itens sem `id`/`name` ignorados.

## Campos usados do item

`id`, `title`, `category.name`/`slug`, `unit.name`/`neighborhood`, `next_occurrence`. Demais campos são ignorados. Não existe `image`: o card usa o fallback visual.

## Mensagens (revisáveis)

| Situação | Texto | Anúncio na região de status |
|---|---|---|
| Carregando | "Carregando atividades…" | idem, após o atraso do `createRegionState` |
| Sucesso | "1 atividade encontrada" / "N atividades encontradas" (resumo visível) | "1 atividade encontrada." / "N atividades encontradas." |
| Vazio | "Nenhuma atividade encontrada." + "Altere ou limpe os filtros para ver mais atividades." | mesma mensagem |
| Erro | `error.userMessage` + "Tentar novamente" | `error.userMessage` |
| Opção de filtro indisponível no endereço | "Um dos filtros do endereço não está mais disponível e foi desconsiderado." | idem (aviso de opções) |
