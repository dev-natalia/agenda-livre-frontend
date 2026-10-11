# Contrato: consultas à API feitas pela Início

Base: `PUBLIC_CONFIG.apiBaseUrl` (`/api/v1`), somente `GET`, via `request()`. Referência: `agenda-livre-backend/specs/006-public-consultation/contracts/public-api.md`.

| # | Consulta | Quando | Para quê |
|---|---|---|---|
| 1 | `GET /activities/?date_from=<hoje>&page_size=3` | abertura e "Tentar novamente" | cards de próximas atividades |
| 2 | `GET /units/?page_size=50` | abertura | opções do filtro de unidade |
| 3 | `GET /categories/?page_size=50` | abertura | opções do filtro de categoria |

`<hoje>` é o dia do calendário em `America/Sao_Paulo`. Nenhuma outra consulta ocorre: digitar, escolher filtros e acionar "Explorar" não consultam a API.

## Tratamento das respostas

| Resposta | #1 (próximas) | #2/#3 (opções) |
|---|---|---|
| `200` com itens | até 3 cards (itens sem `id`/`title` ignorados); sem nenhum válido → vazio | opções por nome; texto via `textContent`, valor = `id` |
| `200`, `count: 0` | estado vazio ("Não há atividades próximas no momento"), com "Ver todas" | só "todas", sem aviso de falha |
| `400`, `404`, `429`, `5xx`, rede, tempo esgotado, JSON inválido, configuração inválida | erro amigável (`error.userMessage`); "Tentar novamente" apenas quando `retryable` | só "todas" + aviso "Não foi possível carregar as unidades/categorias." |
| cancelada (saída da página ou nova tentativa) | ignorada | ignorada |

Campos usados do item de atividade: `id`, `title`, `category.name`/`slug`, `unit.name`/`neighborhood`, `next_occurrence`. `summary`, `slug` e demais são ignorados. Não existe `image`: o card usa o fallback visual.

## Mensagens

| Situação | Texto (revisável) | Anúncio na região de status |
|---|---|---|
| Carregando | "Carregando próximas atividades…" | idem, após o atraso do `createRegionState` |
| Sucesso | — | "3 próximas atividades carregadas." (singular/plural corretos) |
| Vazio | "Não há atividades próximas no momento." + dica "Veja todas as atividades." | mesma mensagem |
| Erro | `error.userMessage` + "Tentar novamente" | `error.userMessage` |
