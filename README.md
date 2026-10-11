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
  components.css    estilos de componentes compartilhados (erro, cards, estados de região)
js/
  config.js         ÚNICO ponto da URL base da API, do tempo limite e sua validação
  api/
    client.js       cliente HTTP (request, createRequestScope)
    errors.js       ApiError, categorias e mensagens amigáveis
  components/
    config-notice.js  aviso de configuração ausente ou inválida
    error-state.js    erro acessível com "Tentar novamente"
    site-nav.js       menu móvel (botão de divulgação) do cabeçalho
    activity-card.js  card de atividade com fallback de imagem
    region-state.js   estados de uma região: carregando, erro, vazio, sucesso
  utils/
    format.js         data/horário em pt-BR e endereço de detalhes
  pages/            um módulo por página (inicialização e comportamento)
tests/unit/         testes unitários (Vitest)
tests/e2e/          testes de navegador (Playwright)
specs/              especificações e planos das features (Spec Kit)
docs/               documentação de produto e design do frontend
```

Diferenças em relação à proposta do DOC-09: o repositório é o próprio frontend (não há pasta `frontend/`), e `assets/` e `css/pages.css` ainda não existem. Eles são criados somente quando uma feature precisar deles, para não manter arquivos vazios.

## Configuração da API

A URL base da API fica somente em `js/config.js` (`PUBLIC_CONFIG.apiBaseUrl`), incluindo o prefixo da versão, por exemplo `http://localhost:8000/api/v1`. Para usar outro ambiente, altere apenas esse valor (ou substitua esse arquivo no deploy).

- O arquivo é público: não coloque segredos, tokens ou credenciais.
- Barra final é opcional; o valor é normalizado.
- Aceita somente `http:` e `https:`. HTTP é permitido apenas em `localhost`, `127.0.0.1` e `[::1]`.
- Se o valor estiver ausente, inválido ou inseguro, as páginas mostram um aviso e nenhuma requisição à API deve ser feita.
- Outros módulos devem obter a URL por `getApiBaseUrl()` em `js/config.js`, sem escrever o endereço no código.

## Cliente da API

Toda consulta à API passa por `js/api/client.js`; nenhum outro módulo chama `fetch` nem escreve o endereço da API.

```js
import { createRequestScope } from "../api/client.js";
import { isCancelled } from "../api/errors.js";
import { renderErrorState, clearErrorState } from "../components/error-state.js";

const scope = createRequestScope(); // um escopo por área da página

async function load() {
  clearErrorState(region);            // region: elemento com role="status" já no HTML
  try {
    const data = await scope.run("/activities/", { params: { q, page } });
    // data.count === 0 é sucesso (lista vazia), nunca erro
  } catch (error) {
    if (isCancelled(error)) return;   // consulta substituída: ignorar
    renderErrorState(region, error, { onRetry: load });
  }
}
```

- `request(path, { params, signal, timeoutMs, allowEmpty })` faz um `GET` sem credenciais e rejeita sempre com `ApiError`.
- Categorias (`error.category`): `config`, `network`, `timeout`, `not_found`, `bad_request`, `rate_limited`, `server`, `http`, `invalid_response`, `cancelled`. `error.retryable` indica se "Tentar novamente" faz sentido; `error.fieldErrors` traz o `errors` de um `400`; `error.userMessage` é o único texto para exibir.
- Uma nova chamada em `scope.run` cancela a anterior do mesmo escopo; respostas e erros antigos nunca chegam à interface.
- O tempo limite padrão é 15 s (`PUBLIC_CONFIG.requestTimeoutMs` em `js/config.js`).
- Detalhes técnicos vão ao console apenas em `localhost`.
- Verificado contra o backend real (2026-10-11): lista, busca, lista vazia, `400`, `404` e cancelamento por escopo se comportam como esperado. `?page=999` responde `400` (não `404`, como diz o contrato do backend) e é tratado como `bad_request`.

**CORS:** a origem do frontend (por exemplo `http://localhost:5500`) precisa constar em `CORS_ALLOWED_ORIGINS` no backend.

## Estrutura compartilhada das páginas

Todas as páginas repetem o mesmo bloco de HTML: link "Pular para o conteúdo principal", `header.site-header` (marca, botão "Menu" e `nav` principal), `main#main-content` e `footer.site-footer`. A repetição é proposital: a navegação precisa funcionar sem JavaScript. Para mudar um link ou rótulo, edite as cinco páginas; `tests/unit/site-shell.test.js` falha se o cabeçalho ou o rodapé divergirem entre elas.

- `aria-current="page"` fica no link da própria página (Início, Explorar, Sobre, Contato). A página de detalhes não marca nenhum.
- O botão "Menu" nasce com `hidden`; `initSiteNav()` (chamado por todo `js/pages/*.js`) o revela só em tela estreita (< 48 rem, igual ao `@media` de `css/layout.css`). Sem JavaScript, os links ficam sempre visíveis.

## Componentes compartilhados

Os componentes não consultam a API: recebem dados e ações da página.

```js
import { createActivityCard } from "../components/activity-card.js";
import { createRegionState } from "../components/region-state.js";

// HTML da página, presente desde o carregamento:
//   <p id="status" class="visually-hidden" role="status" aria-live="polite"></p>
//   <div id="content"></div>
const region = createRegionState({
  content: document.getElementById("content"),
  status: document.getElementById("status"),
});

async function load() {
  region.showLoading({ announce: "Carregando atividades…" });   // 3 esqueletos
  try {
    const data = await scope.run("/activities/");
    if (data.count === 0) return region.showEmpty({ hint: "Altere ou limpe os filtros." });
    const grid = document.createElement("div");
    grid.className = "card-grid";
    grid.append(...data.results.map((a) => createActivityCard(a, { headingLevel: 2 })));
    region.showSuccess(grid, { announce: `${data.count} atividades encontradas.` });
  } catch (error) {
    region.showError(error, { onRetry: load });   // ignora consulta cancelada
  }
}
```

- `createActivityCard(activity, { headingLevel, categoryIcons })` devolve um `<article>` com um único link para `atividade.html?id=<id>`, ou `null` sem `id`/`title`. A API não envia imagem, então a área de imagem mostra o fallback decorativo; se `activity.image = { url, alt }` existir, a imagem é usada (e volta ao fallback se falhar).
- `createRegionState` mantém `content` fora de qualquer região `live` e anuncia uma mensagem por troca em `status`. O anúncio de "carregando" só sai após 300 ms. Nenhuma troca move o foco.
- `renderErrorState(container, error, { onRetry, live })`: com `live: false` o contêiner não vira região de status (é o que `createRegionState` usa).

## Testes

```sh
npm install
npm test
```

Os testes unitários usam Vitest e ficam em `tests/unit/`.

Os testes de navegador usam Playwright (`tests/e2e/`) e sobem o servidor local sozinhos. Na primeira vez: `npx playwright install chromium`. Depois: `npm run test:e2e`. A suíte usa 2 workers de propósito: o servidor estático de teste recusa conexões com mais paralelismo. `tests/e2e/accessibility.spec.js` roda axe-core nas cinco páginas e nos estados dos componentes; ele não substitui a revisão manual com teclado e leitor de tela.

## Como adicionar...

- **Uma página:** crie o `.html` na raiz (com `lang="pt-BR"`, `<title>` próprio e os três CSS), crie `js/pages/<nome>.js` e inclua-o com `<script type="module">`.
- **Um estilo:** crie o arquivo em `css/` com responsabilidade clara e referencie-o nas páginas que o usam.
- **Um módulo de script:** crie-o na pasta de `js/` correspondente à sua responsabilidade e importe-o apenas onde for usado.

Convenção: não criar arquivos vazios; módulos e testes só existem quando há funcionalidade correspondente. Todo módulo de página deve verificar a presença dos elementos de que depende antes de usá-los.
