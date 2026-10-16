# Modelo de dados (cliente): Filtro por público-alvo

## Critérios de pesquisa (estendido)

| Campo | Tipo | Padrão | Regra |
|---|---|---|---|
| `term` | texto ≤ 100 | `""` | inalterado |
| `unit` | UUID ou `""` | `""` | inalterado |
| `category` | UUID ou `""` | `""` | inalterado |
| `audience` | UUID ou `""` | `""` | **novo**; malformado vira `""` |
| `period` | `any`, `today`, `week` ou `month` | `any` | inalterado |

`""` significa "Todos os públicos" e nunca é enviado à API nem escrito no endereço.

## Público-alvo (opção do filtro)

`{ id: string, name: string }`. A API também envia `slug` e `description`, ignorados. Itens sem `id` ou `name` são descartados. Ordem: a da API (por nome).

## Item da listagem (campo novo usado)

`target_audiences: Array<{ id, name }>`. Ausente, `null` ou vazio: nenhuma linha no card. Entradas sem `name` são ignoradas.

## Cópia da listagem (snapshot)

`results[i]` passa a incluir `target_audiences: [{ id, name }]`. Cópias antigas sem o campo continuam válidas.
