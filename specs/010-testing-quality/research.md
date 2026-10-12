# Research: Testes e qualidade do frontend

Nenhum item ficou como NEEDS CLARIFICATION. Cada decisão abaixo tem escolha, motivo e alternativas.

## D1 — Auditar e completar a suíte, não reescrevê-la

- **Decisão**: partir da suíte existente (42 arquivos unitários, 39 de navegador, linha de base 692 + 624 aprovados em 2026-10-12) e produzir a matriz de cobertura antes de escrever teste novo.
- **Motivo**: a spec e o DOC-14 pedem confiança verificável; reescrever testes que já cumprem o critério só gera risco e atraso.
- **Alternativas**: refazer a organização em `integration/` como no esboço do DOC-14 §5 (rejeitada: o esboço é ilustrativo e as pastas atuais já funcionam); medir cobertura de linhas (rejeitada: a medida de suficiência é a matriz de comportamentos).

## D2 — Estabilidade: sem retries, ignorados só com motivo

- **Decisão**: manter `workers: 2` e o servidor `tests/static-server.py`; não habilitar `retries`; os únicos ignorados são os de `a11y-contrast-states.spec.js` (hover e foco só em 1280 px), com motivo no próprio `test.skip` e no registro. Um teste para checar a ausência de `retries` e de `.only`/`.skip` sem motivo entra na matriz.
- **Motivo**: repetição automática esconde instabilidade (FR-009, SC-004).
- **Alternativas**: `retries: 1` no CI (rejeitada: mascara falhas).

## D3 — Fixtures em módulo próprio

- **Decisão**: criar `tests/fixtures/activities.js` com os casos do DOC-14 §12 e mover para lá `makeActivity`, `makeDetails`, `makeListing`; `tests/e2e/helpers/mock-api.js` reexporta, e os testes de unidade passam a importar do mesmo módulo quando precisarem. Nenhum arquivo de teste existente muda de comportamento.
- **Motivo**: hoje os casos de imagem, cancelada e recorrente estão espalhados ou ausentes; uma fonte única evita fixtures que divergem do DOC-05.
- **Alternativas**: manter tudo em `mock-api.js` (rejeitada: acopla fixtures de unidade a um helper do Playwright).

## D4 — Contrato real: opcional, somente leitura, Vitest

- **Decisão**: `tests/contract/api-contract.test.js` com `fetch` real, ligado a `API_BASE_URL`; usa `describe.skipIf(!API_BASE_URL)`, de modo que a suíte padrão o mostra como ignorado com mensagem; comando `npm run test:contract`. Só `GET`. Fluxos: lista paginada, lista vazia (`q` improvável), filtro inválido (`400`), detalhe existente (primeiro id da lista), detalhe inexistente (`404`), página fora do intervalo (`400` com `errors.page`) e formato de `image`.
- **Motivo**: DOC-14 §7 e §12 exigem não tratar o mock como prova; Vitest em Node já faz `fetch` e dispensa navegador e CORS.
- **Alternativas**: Playwright contra a API (rejeitada: mais lento e mistura contrato com interface); incluir no `npm test` (rejeitada: a suíte padrão não pode depender do backend).
- **Observação**: o backend está implementando a feature 010 (imagens) neste momento. A verificação trata `image` ausente, `null` ou objeto como estados aceitáveis e só reprova formato inválido; a diferença entre "backend ainda sem a feature" e "campo errado" fica registrada como divergência, não como falha cega.

## D5 — Segurança no frontend: o que automatizar

- **Decisão**: (a) jsdom em `security-text-as-text.test.js` com cargas como `<img src=x onerror=...>`, `<script>`, `&lt;`, aspas, `javascript:` em texto livre, verificando que o DOM só tem nós de texto e nenhum elemento novo; (b) `security-external-url.test.js` sobre `js/details/external-link.js` e `isHttpUrl` do cartão, com `javascript:`, `data:`, `vbscript:`, `file:`, `//host`, URL vazia e malformada; (c) `no-secrets.test.js` varrendo `*.html`, `css/`, `js/` por padrões (`password`, `secret`, `token`, `api_key`, `Authorization`, chaves longas) com lista curta e explícita de falsos positivos; (d) `error-messages-no-leak.test.js` percorrendo as categorias de `ApiError` e conferindo que `userMessage` não contém pilha, `localhost:8000`, `Traceback` nem corpo bruto; (e) um teste de navegador mostra o mesmo na tela com respostas `500` com corpo hostil.
- **Motivo**: cobre o DOC-14 §11 sem depender de leitura manual; os pontos de código já usam `textContent` (comentário em `activity-card.js`), então os testes são rede de proteção contra regressão.
- **Alternativas**: ESLint com regra `no-inner-html` (rejeitada: pacote novo); só revisão manual (rejeitada: não pega regressão).

## D6 — Documentação: dois documentos, um só dono de cada assunto

- **Decisão**: `docs/19-guia-de-testes.md` é a única fonte de instruções de execução (README só resume e aponta); `docs/20-registro-de-qualidade.md` registra a execução datada (commit, ambiente, versões, contagens, ignorados, defeitos, exceções, limitações, critérios de aceite do DOC-14 §14) e referencia o DOC-17 sem copiar números. `quality-report.test.js` falha se o registro citar arquivos inexistentes, como já faz `accessibility-report.test.js` para o DOC-17.
- **Motivo**: FR-021 a FR-025; reaproveita um padrão que já funciona no projeto.
- **Alternativas**: estender o DOC-17 (rejeitada: mistura conformidade WCAG com qualidade geral).
- **Numeração**: `docs/18-backlog-refinamento-visual-frontend.md` já usa 18 (o cabeçalho interno diz DOC-16, mas o arquivo é 18); os novos seguem 19 e 20.

## D7 — Comando único

- **Decisão**: em `package.json`, `test:all` = `vitest run && playwright test` (falha se qualquer um falhar, porque `&&` interrompe), `test:a11y` = `playwright test a11y`, `test:contract` = `vitest run --config vitest.contract.config.js`. `npm test` continua sendo só a suíte unitária, para não mudar o hábito nem os scripts existentes.
- **Motivo**: FR-022 sem quebrar o que já existe; `&&` funciona igual em Windows, Linux e macOS.
- **Alternativas**: pacote `npm-run-all` (rejeitada: dependência nova).

## D8 — CI opcional com GitHub Actions

- **Decisão**: `.github/workflows/tests.yml` em `push` e `pull_request`: Node 20, `npm ci`, `npx playwright install --with-deps chromium`, `npm run test:all`; em caso de falha, publica `playwright-report`/`test-results` como artefato; não executa a verificação de contrato. O remoto é GitHub (`dev-natalia/agenda-livre-frontend`).
- **Motivo**: História 5 do spec; a equipe já usa GitHub e pull requests.
- **Alternativas**: não fazer CI (aceitável e prevista como adiamento se a pessoa preferir; a decisão final fica nas tarefas, como última etapa independente).
- **Risco**: Python precisa estar disponível no runner para o servidor estático; o `ubuntu-latest` já traz Python 3.

## D9 — Campo `image` e a página de detalhes

- **Decisão**: o formato esperado é o do backend (`image: { url, alt, decorative }` ou `null`; `contracts/api-image-contract.md`). O cartão já usa `image.url` http/https com fallback em erro; falta: tratar `decorative: true` com `alt=""` e `aria-hidden` no contêiner e ignorar `alt` nesse caso. A página de detalhes hoje sempre mostra o fallback; passa a mostrar a imagem com a mesma regra, reutilizando uma função de mídia compartilhada em vez de duplicá-la.
- **Motivo**: FR-007 e a História 1, cenário 7, exigem comportamento definido e testado nos dois lugares; sem a mudança, o teste de detalhes não teria o que verificar. É a única mudança de produto da feature e é pequena.
- **Alternativas**: apenas testar o cartão e declarar o detalhe como lacuna (rejeitada: o backend entrega `image` nas duas respostas); esperar a feature do backend (rejeitada: o formato está especificado no spec do backend, e os testes usam fixtures).

## D10 — Respostas fora de ordem

- **Decisão**: `stale-responses.spec.js` usa `activitiesResponder` com atrasos opostos (primeira consulta lenta, segunda rápida) e confirma que a tela final mostra a segunda; o mesmo para a Explorar e para a Início. O mecanismo (`createRequestScope`) já existe e tem teste unitário; falta a prova no navegador.
- **Motivo**: DOC-14 §7 e FR-020.
