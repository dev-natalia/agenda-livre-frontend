# Research: Estrutura inicial e configuração do frontend

## R1 — Fornecimento da configuração por ambiente
- **Decision**: `js/config.js` versionado, com a URL local de desenvolvimento como padrão; cada ambiente publicado altera/substitui esse único arquivo no deploy.
- **Rationale**: sem build nem variáveis de ambiente em tempo de execução; atende "um único ponto" (FR-010/011) e só contém valores públicos.
- **Alternatives**: `config.example.js` + cópia local (passo manual; config ausente viraria caso comum); `fetch` de `config.json` (requisição extra e novo ponto de falha); injeção por build (ferramenta não prevista no DOC-09).

## R2 — Validação da URL
- **Decision**: função pura `resolveConfig(rawUrl, { hostname })` usando `new URL()`; aceita só `http:`/`https:`; remove barras finais; retorna `{ status, apiBaseUrl, message }` com status `valid | missing | invalid | insecure`. `insecure` = HTTP quando `hostname` não é `localhost`/`127.0.0.1`/`[::1]`.
- **Rationale**: testável sem DOM; cobre FR-013/014/016. `javascript:` e `file:` são rejeitados pelo esquema.
- **Alternatives**: regex (frágil); validar só no cliente HTTP (feature posterior, tarde demais).
- **`insecure`**: a URL é normalizada, mas o uso é bloqueado (`getApiBaseUrl()` lança erro) fora do ambiente local. Decisão conservadora, relaxável depois.

## R3 — Caminho `/api/v1`
- **Decision**: a configuração guarda a URL base completa incluindo `/api/v1` (ex.: `http://localhost:8000/api/v1`), sem barra final; módulos futuros montam `${base}/activities/`.
- **Rationale**: DOC-05 define base `/api/v1/`; manter a versão na config permite trocá-la em um só ponto.

## R4 — Exibição de erro
- **Decision**: `components/config-notice.js` insere uma região `role="alert"` no início de `<main>` com texto em português, sem detalhes técnicos; cada módulo de página chama a verificação ao iniciar.
- **Rationale**: FR-013; acessível por padrão; o conteúdo estático continua legível.

## R5 — Páginas, links e subcaminho
- **Decision**: links relativos (`explorar.html`), `<script type="module">` por página, `<html lang="pt-BR">`, `<title>` distinto, landmarks `header/main/footer` mínimos. A navegação compartilhada completa é a FE-F03.
- **Rationale**: FR-001/005/009 e o caso de hospedagem em subcaminho. A origem de dev (ex.: `http://localhost:5500`) precisa estar em `CORS_ALLOWED_ORIGINS` no backend.

## R6 — Servir localmente e testar
- **Decision**: qualquer servidor estático (`python -m http.server` ou `npx serve`); ES Modules exigem HTTP, não `file://`. Testes com `vitest`: ambiente node para `config`, `jsdom` para o aviso.
- **Alternatives**: Vite/bundler (build desnecessário, contra a simplicidade do DOC-09).
