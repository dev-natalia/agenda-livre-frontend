# Contrato: campo `image` e seu tratamento no frontend

Fonte do formato: `agenda-livre-backend/specs/010-activity-images/spec.md` (FR-011), em desenvolvimento no backend. As fixtures seguem este formato; qualquer diferença na API real é divergência a registrar em `docs/PENDENCIAS-BACKEND.md`, não motivo para o frontend adivinhar.

## Formato

```json
{ "image": { "url": "https://…/img.webp", "alt": "Turma em aula de dança", "decorative": false } }
{ "image": { "url": "https://…/img.webp", "alt": "", "decorative": true } }
{ "image": null }
```

Presente em `GET /activities/` (cada item) e em `GET /activities/{id}/`. O campo ausente (backend sem a feature) é tratado como `null`.

## Tratamento esperado

| Entrada | Cartão e detalhes |
|---|---|
| `image` informativa, `url` http/https | `<img src alt>` com o `alt` da API; contêiner visível para tecnologias assistivas |
| `decorative: true` | `<img alt="">`, contêiner `aria-hidden="true"`; `alt` da API ignorado |
| `image: null` ou ausente | fallback visual decorativo (`aria-hidden`), sem ícone quebrado |
| `url` ausente, vazia, malformada ou de esquema não permitido | fallback visual |
| falha ao carregar a imagem | troca para o fallback visual |
| `alt` ausente em imagem não decorativa | `alt=""` (não inventar texto; o caso é registrado como divergência) |

## Testes

- Unidade: `tests/unit/image-field.test.js` (tabela acima, cartão e detalhes em jsdom).
- Navegador: `tests/e2e/image-display.spec.js` (imagem informativa, decorativa, ausente e quebrada, em cartão e detalhes; sem texto alternativo repetindo o título por padrão).
- Contrato real: `tests/contract/api-contract.test.js` (formato de `image` quando presente).
