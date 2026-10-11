# Research: Cliente e integração com a API

Sem itens "NEEDS CLARIFICATION" abertos; abaixo as decisões de planejamento que a spec delegou.

## D1 — Tempo limite
- **Decisão**: 15 000 ms, configurável em `PUBLIC_CONFIG.requestTimeoutMs` (valor público); implementado com `AbortController` + `setTimeout` (não depende de `AbortSignal.timeout` para permitir distinguir timeout de cancelamento por substituição).
- **Racional**: atende SC-008; distinguir a causa do abort exige controle próprio.
- **Alternativas**: `AbortSignal.timeout()` (não diferencia causa sem inspecionar `reason`; suporte menos uniforme); sem timeout (viola FR-009).

## D2 — Identificação de contextos de consulta
- **Decisão**: `createRequestScope()` devolve um objeto com `run(path, params)`; cada `run` cancela a anterior do mesmo escopo (ver D3 para o retorno). Cada área da página cria seu próprio escopo, então áreas independentes não interferem.
- **Racional**: escopo por instância é explícito, sem strings mágicas nem estado global.
- **Alternativas**: nome de contexto global (estado compartilhado, difícil de testar); contador de id em cada página (duplica lógica).

## D3 — Sinalização de consulta substituída
- **Decisão**: `scope.run()` rejeita com `ApiError` de categoria `cancelled` quando substituída/abortada; os consumidores usam `isCancelled(error)` para ignorar. Além do `abort`, `run` confere um token de geração antes de resolver, cobrindo `fetch` que ignore o sinal (mocks).
- **Racional**: uma única forma de retorno (resolve = dados vigentes, rejeita = erro) simplifica o consumo; garante FR-017/FR-018 mesmo sem suporte real a abort.
- **Alternativas**: resolver com `undefined` (ambíguo com resposta sem corpo); evento global (acoplamento).

## D4 — Modelo de erro
- **Decisão**: classe `ApiError extends Error` com `category`, `status` (ou `null`), `userMessage`, `retryable`, `fieldErrors` (apenas `400`) e `cause`. Categorias: `config`, `network`, `timeout`, `not_found`, `bad_request`, `rate_limited`, `server`, `http` (demais 4xx/3xx), `invalid_response`, `cancelled`. `message` (técnico) fica para o console; a interface usa só `userMessage`.
- **Racional**: classificação por categoria permite à página decidir (404 → página 404; 400 → depende) sem ler texto (FR-008, FR-021).
- **Alternativas**: códigos numéricos soltos (vaza HTTP para a UI); erros distintos por classe (mais código sem ganho).

## D5 — Política de nova tentativa
- **Decisão**: `retryable = true` para `network`, `timeout`, `server`, `rate_limited`; `false` para `config`, `bad_request`, `not_found`, `http`, `invalid_response`. Tentativa sempre manual; sem retry automático.
- **Racional**: evita agravar `429`/indisponibilidade; `invalid_response` costuma ser proxy/manutenção, mas repetir sem mudança tende a repetir o problema — a mensagem sugere tentar mais tarde sem botão. (Revisável.)
- **Alternativas**: retry com backoff automático (fora do escopo e arriscado com limite de taxa).

## D6 — Interpretação do corpo
- **Decisão**: sucesso: `204` ou corpo vazio → `null` quando `allowEmpty` verdadeiro (padrão `false` para os endpoints atuais, todos com JSON); caso contrário JSON obrigatório, falha de `JSON.parse` → `invalid_response`. Erro HTTP: tenta ler JSON só para `errors` em `400`; qualquer outro conteúdo é ignorado e nunca exposto. Cabeçalho `Accept: application/json`; `credentials: "omit"`.
- **Racional**: cobre FR-005/FR-007 e o contrato real (`detail`/`errors` só em `400`).

## D7 — Estratégia de testes
- **Decisão**: unitários com `fetch` simulado (`vi.fn`) e timers falsos para timeout/ordem de respostas; componente com jsdom. E2E: o Playwright intercepta `**/api/v1/**` com `page.route` e exercita um módulo de verificação carregado pela página existente via `page.addScriptTag({ type: "module" })` ou `page.evaluate(import(...))`, sem criar página pública nova.
- **Racional**: FR-022; evita acoplar a feature a telas futuras.
- **Alternativas**: página de demonstração (arquivo sem função de produto, contraria a feature 001 §sem arquivos desnecessários).

## D8 — Anúncio e foco do erro
- **Decisão**: o componente renderiza num contêiner fornecido pela página com `role="status"` (já presente e vazio antes da atualização, para ser anunciado) e `aria-live="polite"`; o botão é `<button type="button">`. Não chama `focus()`. Ao acionar "Tentar novamente", o consumidor troca o erro por carregamento; o botão sai do DOM, então o foco é devolvido ao contêiner (`tabindex="-1"`) apenas nesse caso, para evitar perda de foco para `body`.
- **Racional**: DOC-13 §12 e DOC-15; a exceção do foco resolve o problema de foco descartado.
- **Alternativas**: `role="alert"` (assertivo, interrompe; o config-notice já o usa para erro de configuração estática).

## D9 — Registro técnico
- **Decisão**: `console.warn` com categoria, status e caminho do recurso (sem a query string, que pode conter o termo pesquisado), somente quando o host é local (`localhost`, `127.0.0.1`, `[::1]`).
- **Racional**: FR-021; evita ruído e vazamento em produção.
