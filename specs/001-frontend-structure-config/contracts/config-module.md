# Contract: módulo de configuração (`js/config.js`)

Interface interna entre a configuração e os demais módulos do frontend.

```text
export const PUBLIC_CONFIG = { apiBaseUrl: string }   // único lugar editável por ambiente

export function resolveConfig(rawUrl, { hostname }) -> {
  status: "valid" | "missing" | "invalid" | "insecure",
  apiBaseUrl: string | null,
  message: string | null
}

export function getConfigStatus() -> ReturnType<resolveConfig>
  // usa PUBLIC_CONFIG e location.hostname; para páginas exibirem o aviso

export function getApiBaseUrl() -> string
  // retorna a URL validada; lança Error com mensagem compreensível se status != "valid"
```

## Exemplos de `resolveConfig`
| Entrada | hostname | status | apiBaseUrl |
|---|---|---|---|
| `http://localhost:8000/api/v1/` | localhost | valid | `http://localhost:8000/api/v1` |
| `https://api.exemplo.org/api/v1` | qualquer | valid | `https://api.exemplo.org/api/v1` |
| vazio / `undefined` | — | missing | null |
| `abc` | — | invalid | null |
| `javascript:alert(1)`, `file:///x` | — | invalid | null |
| `http://api.exemplo.org/api/v1` | `site.exemplo.org` | insecure | `http://api.exemplo.org/api/v1` |

## Aviso (`js/components/config-notice.js`)
`showConfigNotice(state, root = document)` — para `state.status` diferente de `valid`, insere no início de `<main>` um elemento `role="alert"` com `state.message`; idempotente (não duplica); sem efeito se `<main>` não existir.

## Contrato de página
Todo `js/pages/*.js` executa uma função `init()` ao carregar: obtém o estado da configuração, chama `showConfigNotice` e verifica elementos antes de usá-los, sem nunca lançar erro por ausência de elementos.
