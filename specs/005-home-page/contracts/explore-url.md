# Contrato: endereço de destino da Início para a Explorar

A Início navega para `explorar.html` com os mesmos nomes de parâmetro do contrato público da API, para que a Explorar (EP-FE-06) possa repassá-los quase sem tradução.

| Parâmetro | Quando entra | Valor |
|---|---|---|
| `q` | termo, após `trim`, não vazio | texto (≤ 100 caracteres), codificado por `URLSearchParams` |
| `unit` | unidade escolhida | UUID |
| `category` | categoria escolhida | UUID |
| `date` | período `today` | `AAAA-MM-DD` (hoje, São Paulo) |
| `date_from` | períodos `week` e `month` | `AAAA-MM-DD` (hoje) |
| `date_to` | períodos `week` e `month` | `AAAA-MM-DD` |

Regras:
- Valores padrão ("todas", "qualquer data") e vazios **não** entram.
- `date` nunca coexiste com `date_from`/`date_to` (a API responde `400`).
- Sem critérios: `explorar.html` sem query string.
- Ordem estável dos parâmetros: `q`, `unit`, `category`, `date`, `date_from`, `date_to`.
- Sem `page`: a Explorar começa na página 1.
- Mesma aba, via navegação normal (o histórico permite voltar).

Exemplos:

```text
explorar.html
explorar.html?q=dan%C3%A7a
explorar.html?q=oficina&unit=550e8400-…&category=7c9e6679-…&date_from=2026-10-11&date_to=2026-10-17
explorar.html?date=2026-10-11
```

Fallback sem JavaScript: o envio nativo leva `q`, `unit`, `category` e `period` (chaves, não datas) vazios ou preenchidos; a Explorar deve tolerar e ignorar `period` desconhecido.

Link "Ver todas": `explorar.html` sem parâmetros.
