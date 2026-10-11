# Agenda Livre — Frontend

Frontend público do Agenda Livre, feito com HTML, CSS e JavaScript puro (ES Modules). Não usa framework nem roteador SPA: cada página é um arquivo HTML e a navegação é feita por links nativos. O frontend consome a API REST do backend (`agenda-livre-backend`).

## Como servir localmente

Os módulos ES exigem HTTP; abrir os arquivos por `file://` não funciona. Na raiz do repositório, use qualquer servidor estático:

```sh
python -m http.server 5500
# ou
npx serve -l 5500
```

Depois abra `http://localhost:5500/`.

## Páginas

| Arquivo | Página | Módulo de script |
|---|---|---|
| `index.html` | Início | `js/pages/home.js` |
| `explorar.html` | Explorar atividades | `js/pages/explore.js` |
| `atividade.html` | Detalhes da atividade | `js/pages/activity-details.js` |
| `sobre.html` | Sobre | `js/pages/about.js` |
| `contato.html` | Contato | `js/pages/contact.js` |

Cada página abre diretamente pela própria URL. Os links usam caminhos relativos para funcionar também em subcaminhos.

## Organização dos arquivos

```text
index.html, explorar.html, atividade.html, sobre.html, contato.html
css/
  tokens.css        variáveis visuais (cores, fonte, espaçamentos, foco)
  base.css          estilos globais, foco visível e aviso de configuração
  layout.css        largura e espaçamento de header, main e footer
js/
  config.js         ÚNICO ponto da URL base da API e sua validação
  components/
    config-notice.js  aviso de configuração ausente ou inválida
  pages/            um módulo por página (inicialização e comportamento)
tests/unit/         testes unitários (Vitest)
tests/e2e/          testes de navegador (Playwright)
specs/              especificações e planos das features (Spec Kit)
docs/               documentação de produto e design do frontend
```

Diferenças em relação à proposta do DOC-09: o repositório é o próprio frontend (não há pasta `frontend/`), e `assets/`, `css/components.css`, `css/pages.css`, `js/api/` e `js/utils/` ainda não existem. Eles são criados somente quando uma feature precisar deles, para não manter arquivos vazios.

## Configuração da API

A URL base da API fica somente em `js/config.js` (`PUBLIC_CONFIG.apiBaseUrl`), incluindo o prefixo da versão, por exemplo `http://localhost:8000/api/v1`. Para usar outro ambiente, altere apenas esse valor (ou substitua esse arquivo no deploy).

- O arquivo é público: não coloque segredos, tokens ou credenciais.
- Barra final é opcional; o valor é normalizado.
- Aceita somente `http:` e `https:`. HTTP é permitido apenas em `localhost`, `127.0.0.1` e `[::1]`.
- Se o valor estiver ausente, inválido ou inseguro, as páginas mostram um aviso e nenhuma requisição à API deve ser feita.
- Outros módulos devem obter a URL por `getApiBaseUrl()` em `js/config.js`, sem escrever o endereço no código.

**CORS:** a origem do frontend (por exemplo `http://localhost:5500`) precisa constar em `CORS_ALLOWED_ORIGINS` no backend.

## Testes

```sh
npm install
npm test
```

Os testes unitários usam Vitest e ficam em `tests/unit/`.

Os testes de navegador usam Playwright (`tests/e2e/`) e sobem o servidor local sozinhos. Na primeira vez: `npx playwright install chromium`. Depois: `npm run test:e2e`.

## Como adicionar...

- **Uma página:** crie o `.html` na raiz (com `lang="pt-BR"`, `<title>` próprio e os três CSS), crie `js/pages/<nome>.js` e inclua-o com `<script type="module">`.
- **Um estilo:** crie o arquivo em `css/` com responsabilidade clara e referencie-o nas páginas que o usam.
- **Um módulo de script:** crie-o na pasta de `js/` correspondente à sua responsabilidade e importe-o apenas onde for usado.

Convenção: não criar arquivos vazios; módulos e testes só existem quando há funcionalidade correspondente. Todo módulo de página deve verificar a presença dos elementos de que depende antes de usá-los.
