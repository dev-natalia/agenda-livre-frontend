# Contrato: endereço da Explorar (delta)

Estende `specs/006-activity-exploration/contracts/explore-url.md`.

| Parâmetro | Leitura | Escrita |
|---|---|---|
| `audience` | aceito se UUID; senão ignorado (endereço reescrito sem ele); repetido: vale o primeiro | só se escolhido |

Ordem de escrita estável: `q`, `unit`, `category`, `audience`, `date`, `date_from`, `date_to`, `page`.

Exemplo: `explorar.html?category=…&audience=…&page=2`. "Limpar filtros" remove `audience`. Os links de paginação preservam `audience`.
