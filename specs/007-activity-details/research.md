# Pesquisa e decisões: Detalhes das atividades

Sem itens `NEEDS CLARIFICATION` na spec; as decisões abaixo fecham as escolhas de desenho. Fontes: DOC-09 §9, DOC-12 §6, DOC-13 §8/§9/§12, DOC-15 e `agenda-livre-backend/specs/006-public-consultation/contracts/public-api.md`.

## D1 — Consulta e identificador

- **Decisão**: `GET /activities/{id}/` por `fetchActivityDetails`, usando `request`/`createRequestScope`. O `id` vem de `?id=` (padrão de `activityDetailsUrl`), é aparado, convertido para minúsculas e validado como UUID antes de qualquer requisição.
- **Rationale**: o contrato diz que o identificador é UUID e que malformado responde `404`; validar antes evita requisição inútil e dá o mesmo resultado visível (SC-007). O id é codificado na montagem do caminho.
- **Alternativas**: enviar qualquer valor à API e confiar no `404` (requisições desnecessárias); usar `slug` (a API busca por `id`).

## D2 — Um único estado para "não encontrada ou não disponível"

- **Decisão**: `404`, `id` ausente e `id` inválido mostram o mesmo estado, com "Explorar outras atividades" e "Voltar ao Início".
- **Rationale**: o backend responde `404` uniforme para inexistente, malformado, rascunho, cancelada e encerrada, por desenho (não revelar registros). Distinguir seria inventar informação e arriscaria expor dados privados (DOC-13 §9).
- **Alternativas**: heurística por listagem anterior (frágil e enganosa); mensagens diferentes para "cancelada" (impossível no contrato atual).

## D3 — Concorrência e retry

- **Decisão**: um `createRequestScope` para a página; "Tentar novamente" desabilita o botão ao acionar (comportamento de `renderErrorState`) e refaz a consulta; a saída da página cancela a consulta (`cancelled` é ignorado).
- **Rationale**: reaproveita o que a 006 já validou; resposta atrasada nunca sobrescreve a mais recente.

## D4 — Renderização segura e campos opcionais

- **Decisão**: `render.js` constrói nós com `textContent`/atributos; cada seção só é criada quando há conteúdo (texto não vazio ou lista não vazia). A descrição preserva quebras de linha com CSS (`white-space: pre-line`) em vez de HTML. Programações e ocorrências seguem a ordem da API; a página não recalcula nada.
- **Rationale**: atende FR-007, FR-010 e FR-012. Datas reutilizam `formatOccurrence`; período e dias da semana usam `weekday_names` da API.
- **Alternativas**: converter quebras em `<br>` (mais código e risco); formatar datas do zero (divergiria do card).

## D5 — Link externo

- **Decisão**: `safeExternalUrl` aceita só strings que `new URL()` interpreta com protocolo `http:` ou `https:` e sem credenciais embutidas; qualquer outro valor devolve `null` e o botão não é criado. O `<a>` usa `target="_blank"`, `rel="noopener noreferrer"`, texto visível "Inscrição ou informações (site externo, abre em nova aba)" e a mesma informação no nome acessível; um ícone decorativo é opcional e oculto das tecnologias assistivas.
- **Rationale**: o backend já filtra, mas a defesa é do frontend também (FE-028). O rótulo genérico existe porque a API só tem um campo de URL, sem finalidade.
- **Alternativas**: confiar no backend (sem defesa em profundidade); abrir na mesma aba (contra DOC-13 §8).

## D6 — Voltar para atividades

- **Decisão**: o link tem `href="explorar.html"`. Se `document.referrer` for da mesma origem e apontar para `explorar.html` e houver histórico, o clique simples chama `history.back()`; Ctrl/Cmd/botão do meio seguem o link normal.
- **Rationale**: a 006 já restaura termo, filtros, página, resultados e rolagem em `popstate`/`back_forward`; usar o histórico reaproveita isso sem acoplar a páginas. Sem referência da Explorar, o link normal leva à Explorar sem critérios (FR-005, FR-035 da 006).
- **Alternativas**: reconstruir a URL da Explorar a partir de `sessionStorage` (acopla à estrutura interna da 006 e perde a rolagem); sempre `history.back()` (quebra links diretos).

## D7 — Estados, foco e anúncio

- **Decisão**: `createRegionState` com `content` e `status` presentes no HTML; esqueleto próprio da página (blocos de texto) via `renderSkeleton`; erro com `showError`; "não encontrada" renderizada como conteúdo com título e links. O foco não é movido por mudança de estado; ao entrar em "não encontrada", o `h1` recebe `tabindex="-1"` apenas como alvo do link "pular conteúdo" já existente.
- **Rationale**: FR-020 e DOC-13 §12. O título do documento muda por estado: "<título> — Agenda Livre", "Atividade não encontrada — Agenda Livre", "Erro ao carregar a atividade — Agenda Livre".

## D8 — Estilo e imagem ausente

- **Decisão**: cabeçalho com mídia (reuso de `.image-fallback`, `aria-hidden`), categoria, `h1`, unidade, bloco "Quando", seções com `h2` ("Sobre a atividade", "Público", "Local"), usando só tokens. Layout em coluna única, com limite de largura de leitura; sem rolagem horizontal em 320 px; esqueletos sem animação em `prefers-reduced-motion` (regra global existente).
- **Rationale**: wireframe 6 do DOC-12; sem nova variante de componente.

## D9 — Testes

- **Decisão**: unitários sem DOM para id, link externo e modelo de programações; jsdom para renderização e página, com `fake-fetch` dos helpers existentes; Playwright com `page.route` para fluxos e axe. Casos de segurança: `javascript:`, `data:`, `//host`, relativa, vazia, com credenciais, HTML e scripts em texto.
