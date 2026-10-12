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

A página Explorar guarda termo, filtros e página no endereço (`q`, `unit`, `category`, `date`, `date_from`, `date_to`, `page`; contrato em `specs/006-activity-exploration/contracts/explore-url.md`), usa o histórico nativo do navegador e guarda por 5 minutos uma cópia dos resultados em `sessionStorage` para a volta dos detalhes.

A página de detalhes abre por `atividade.html?id=<uuid>` (o mesmo endereço dos cards; contrato em `specs/007-activity-details/contracts/details-url.md`) e consulta `GET /activities/{id}/`. Mostra categoria, título, unidade, programações (pontuais e recorrentes), próximas datas, público, descrição e local, omitindo o que a API não informar. A API responde o mesmo `404` para atividade inexistente, malformada, cancelada ou encerrada, então todos esses casos (e `id` ausente ou inválido, que nem chega à API) mostram um único estado "Atividade não encontrada ou não disponível"; falhas de comunicação mostram erro com "Tentar novamente". O link de inscrição ou informações só aparece para URLs `http`/`https`, abre em nova aba com `rel="noopener noreferrer"` e indica no texto que é um site externo. "Voltar para atividades" usa o histórico quando a pessoa veio da Explorar (restaurando filtros, página e rolagem) e leva à Explorar sem critérios nos demais casos.

Sobre e Contato existem só no frontend: o backend não tem endpoint para elas (DOC-05 §3.3), então as duas páginas não consultam a API nem mostram o aviso de configuração. O formulário de Contato é demonstrativo: valida Nome (2 a 100 caracteres), E-mail (formato válido, até 254), Assunto (3 a 100) e Mensagem (10 a 1000) pelos limites de `js/contact/validation.js`, mostra todos os erros de uma vez com foco no primeiro campo inválido e, se tudo estiver válido, troca o formulário por um painel que diz que nenhuma mensagem foi enviada. Não há `fetch`, `action`, nem armazenamento: nada digitado sai da página (`specs/008-institutional-pages/contracts/`). O botão de envio nasce desabilitado no HTML e só o script o habilita, para que, sem JavaScript, o navegador não envie os dados pela URL.

Cada página abre diretamente pela própria URL. Os links usam caminhos relativos para funcionar também em subcaminhos.

## Organização dos arquivos

```text
index.html, explorar.html, atividade.html, sobre.html, contato.html
fonts/              Inter e Poppins (.woff2, hospedadas localmente)
css/
  tokens.css        única fonte dos valores visuais (cores, fontes, espaçamentos, foco, movimento)
  base.css          fontes (@font-face), tipografia, links, foco visível, regra central de movimento reduzido
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
    activity-media.js imagem da atividade (cartão e detalhes): informativa, decorativa ou fallback
    region-state.js   estados de uma região: carregando, erro, vazio, sucesso
  contact/
    validation.js     limites (CONTACT_LIMITS) e validateContact, sem DOM
    form.js           formulário demonstrativo: erros, foco, painel de confirmação
  utils/
    format.js         data/horário em pt-BR e endereço de detalhes
  pages/            um módulo por página (inicialização e comportamento)
tests/unit/         testes unitários (Vitest)
tests/e2e/          testes de navegador (Playwright)
specs/              especificações e planos das features (Spec Kit)
docs/               documentação de produto e design do frontend
```

Diferenças em relação à proposta do DOC-09: o repositório é o próprio frontend (não há pasta `frontend/`), e `assets/` e `css/pages.css` ainda não existem. Eles são criados somente quando uma feature precisar deles, para não manter arquivos vazios.

## Identidade visual e responsividade

- **Tokens:** cores, fontes, espaçamentos, raios, sombras, foco e duração de transição só existem em `css/tokens.css`; os demais CSS usam `var(--nome)`. Um teste (`tests/unit/design-tokens.test.js`) falha se aparecer cor, fonte ou duração literal fora dele.
- **Contraste:** os pares texto/fundo estão no teste e em `specs/004-visual-identity-responsive/contracts/design-tokens.md`, com os ajustes em relação ao DOC-10 (texto escuro sobre o laranja, `#C2410C` quando o laranja for linha ou texto, amarelo só decorativo).
- **Pontos de quebra:** `40rem` (cards em 2 colunas), `48rem` (navegação em linha, igual a `site-nav.js`) e `64rem` (3 colunas). `@media` não aceita variáveis; o teste rejeita outros valores.
- **Botões:** `.button--primary`, `.button--secondary` e `.button--outline`; o "Tentar novamente" usa o primário por seletor.
- **Movimento:** transições usam `var(--motion-duration)`; `base.css` zera a duração e desliga a rolagem suave sob `prefers-reduced-motion: reduce`. Não declare duração literal em componentes.
- **Fontes:** ver `fonts/README.md`.

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

- `createActivityCard(activity, { headingLevel, categoryIcons })` devolve um `<article>` com um único link para `atividade.html?id=<id>`, ou `null` sem `id`/`title`. A área de imagem usa o campo `image` da API (`{ url, alt, decorative }` ou `null`; `js/components/activity-media.js`, o mesmo módulo dos detalhes): imagem informativa com o `alt` da API; `decorative: true` com `alt=""` e contêiner oculto da tecnologia assistiva; `null`, campo ausente, endereço que não seja `http(s)` ou imagem que falha ao carregar mostram o fallback decorativo (formato em `specs/010-testing-quality/contracts/api-image-contract.md`).
- `createRegionState` mantém `content` fora de qualquer região `live` e anuncia uma mensagem por troca em `status`. O anúncio de "carregando" só sai após 300 ms. Nenhuma troca move o foco.
- `renderErrorState(container, error, { onRetry, live })`: com `live: false` o contêiner não vira região de status (é o que `createRegionState` usa).

## Testes

```sh
npm install
npx playwright install chromium   # só na primeira vez
npm test                          # unitários (Vitest), cerca de 6 s
npm run test:all                  # unitários e depois navegador (Playwright), cerca de 4 min
```

Pré-requisitos, todos os comandos, como rodar uma parte, como ler falhas, as fixtures de teste, a verificação opcional contra a API real e a integração contínua estão em [`docs/19-guia-de-testes.md`](docs/19-guia-de-testes.md). Os resultados de cada execução ficam em [`docs/20-registro-de-qualidade.md`](docs/20-registro-de-qualidade.md), e os de acessibilidade (matriz axe-core, teclado, contraste, o que ainda é manual) em [`docs/17-registro-de-acessibilidade.md`](docs/17-registro-de-acessibilidade.md). Passar nas verificações automáticas não prova conformidade com a WCAG 2.2 AA.

Atenção: a porta 5500 precisa estar livre; se já houver um servidor nela, encerre-o antes de rodar os testes de navegador.

## Como adicionar...

- **Uma página:** crie o `.html` na raiz (com `lang="pt-BR"`, `<title>` próprio e os três CSS), crie `js/pages/<nome>.js` e inclua-o com `<script type="module">`.
- **Um estilo:** crie o arquivo em `css/` com responsabilidade clara e referencie-o nas páginas que o usam.
- **Um módulo de script:** crie-o na pasta de `js/` correspondente à sua responsabilidade e importe-o apenas onde for usado.

Convenção: não criar arquivos vazios; módulos e testes só existem quando há funcionalidade correspondente. Todo módulo de página deve verificar a presença dos elementos de que depende antes de usá-los.
