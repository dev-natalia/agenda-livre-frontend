# Contract: `js/api/client.js` e `js/api/errors.js`

Interface interna entre o cliente HTTP e as páginas/componentes.

```text
// errors.js
export const ERROR_CATEGORIES = Object.freeze({...})   // valores listados em data-model.md
export class ApiError extends Error { category, status, userMessage, retryable, fieldErrors, cause }
export function isCancelled(error) -> boolean           // category === "cancelled"
export function classifyStatus(status) -> { category, retryable }   // pura, testável

// client.js
export function buildUrl(baseUrl, path, params?) -> URL
  // junta sem barras duplicadas; omite null/undefined/""; aceita string/number/boolean;
  // lança TypeError para objetos/arrays/funções (programação), nunca envia "[object Object]"

export async function request(path, { params, signal, timeoutMs, allowEmpty, fetchImpl } = {}) -> Promise<object | null>
  // GET apenas; Accept: application/json; credentials: "omit"
  // config inválida -> rejeita ApiError("config") sem chamar a rede
  // rejeita sempre com ApiError

export function createRequestScope() -> { run(path, opts?) -> Promise<object|null>, cancel() }
  // run() cancela a anterior; a substituída rejeita com ApiError("cancelled")
  // resposta/erro de geração antiga nunca resolve/rejeita com dados/erro de falha real
```

## Garantias
1. Nenhuma outra parte do código chama `fetch` nem contém a URL da API (SC-001).
2. `request` jamais rejeita com algo que não seja `ApiError`.
3. `userMessage` não contém status, nome de exceção, URL ou corpo do servidor.
4. Lista vazia com 2xx resolve normalmente.
5. Somente `GET`; sem cookies/credenciais/cabeçalhos de autenticação.

## Mensagens (`userMessage`)
| Categoria | Texto |
|---|---|
| `config` | mensagem da configuração (feature 001) |
| `network` | "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente." |
| `timeout` | "O servidor demorou para responder. Tente novamente." |
| `not_found` | "Não encontramos o que você procurava." |
| `bad_request` | "Não foi possível processar a pesquisa. Revise os filtros e tente novamente." |
| `rate_limited` | "Muitas consultas em pouco tempo. Aguarde um instante e tente novamente." |
| `server` | "O serviço está indisponível no momento. Tente novamente em instantes." |
| `http`, `invalid_response` | "Não foi possível carregar as informações. Tente novamente mais tarde." |

## Padrão de uso pelos consumidores
```js
try { data = await scope.run(path, opts); }
catch (e) { if (isCancelled(e)) return; renderErrorState(region, e, { onRetry: load }); }
```
O estado de carregamento só é encerrado pela consulta vigente: consultas canceladas retornam sem tocar na interface (FR-020).
