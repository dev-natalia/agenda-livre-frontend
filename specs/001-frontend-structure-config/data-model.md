# Data Model: Estrutura inicial e configuração do frontend

Não há persistência. Entidades em memória:

## Configuração pública
| Campo | Tipo | Regra |
|---|---|---|
| `apiBaseUrl` (bruto) | string | Valor editado em `js/config.js`; público, sem segredo |

## Estado de configuração (resultado de `resolveConfig`)
| Campo | Tipo | Descrição |
|---|---|---|
| `status` | `valid` \| `missing` \| `invalid` \| `insecure` | Resultado da validação |
| `apiBaseUrl` | string \| null | URL normalizada (sem barra final); `null` se `missing`/`invalid` |
| `message` | string \| null | Mensagem compreensível em pt-BR; `null` se `valid` |

### Regras
- Vazio, ausente ou só espaços → `missing`.
- Não parseável por `URL`, ou esquema diferente de http/https → `invalid`.
- `http:` com host diferente de localhost/127.0.0.1/[::1] → `insecure` (URL normalizada retornada, uso bloqueado).
- Caso contrário → `valid`, com barras finais removidas.
- Somente `valid` permite requisições (FR-013).

## Página pública
`index.html`, `explorar.html`, `atividade.html`, `sobre.html`, `contato.html` — cada uma com título próprio, `lang="pt-BR"` e um módulo `js/pages/*.js`.
