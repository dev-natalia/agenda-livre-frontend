# Research: Acessibilidade transversal

Sem `NEEDS CLARIFICATION` no Technical Context. Decisões tomadas a partir dos DOC-14 (§9), DOC-15, DOC-16 (EP-FE-09), das specs 001 a 008 e do código existente.

## Estado de partida (já entregue)

- Link "Pular para o conteúdo principal" nas páginas (`css/base.css` `.skip-link`), `:focus-visible` com contorno e halo (`--focus-*`), `main[tabindex="-1"]`.
- Regiões `role="status"` em Início, Explorar e Detalhes; `region-state.js` com carregamento, vazio e erro; `error-state.js`.
- Texto do link externo já diz "abre em nova aba" (`js/details/render.js`).
- Regra central de movimento reduzido em `css/base.css`; testes `reduced-motion.spec.js`, `responsive-reflow.spec.js`, `design-tokens.test.js` (pares de cor dos tokens).
- Axe por página: `accessibility.spec.js` (5 páginas, 1280 e 320 px, menu aberto), mais um arquivo de acessibilidade por feature.
- Não há `position: sticky/fixed` nos CSS: o foco hoje não é encoberto por cabeçalho fixo (verificar de novo ao final).

## D1 — Auditoria guiada por matriz, não por intuição
- **Decision**: `contracts/audit-matrix.md` lista cada critério do DOC-15 §6 com páginas, estados, forma de verificação (automática, manual, ambas) e resultado. Os testes e a passada manual são derivados dela.
- **Rationale**: a acessibilidade foi feita em seis features; sem matriz, o risco é auditar de novo o que já foi verificado e deixar passar lacunas entre páginas.
- **Alternatives**: auditar página por página (rejeitado: repete e perde regras transversais); só rodar o axe (rejeitado: DOC-14 §9.7 diz que não basta).

## D2 — Axe numa matriz única de estados e larguras
- **Decision**: `helpers/a11y-matrix.js` define estados (carregada, menu aberto, resultados, nenhum resultado, erro da API, formulário com erros, painel de confirmação) por página aplicável e larguras 1280 e 320. `a11y-axe-matrix.spec.js` percorre tudo com as tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`. Estados são provocados pela API simulada (`mock-api.js`) e por interação real, nunca por injeção de DOM quando houver caminho real.
- **Rationale**: DOC-14 §9.1 pede exatamente esses estados; hoje cada arquivo cobre os seus, sem garantia de cobertura completa.
- **Alternatives**: manter só os arquivos por feature (rejeitado: lacunas, como Detalhes com erro em 320 px); desativar regras ruidosas (rejeitado: proibido pelo DOC-14 §9.1).
- **Exceções**: só em `audit-matrix.md`, com escopo, razão e mitigação, e `disableRules` restrito ao seletor afetado.

## D3 — Regras estruturais testadas em todas as páginas
- **Decision**: teste unitário lê os cinco `.html` e confere `lang="pt-BR"`, `<title>` único e específico, um `h1`, ausência de níveis pulados, `header`/`nav` com nome/`main`/`footer`, link de pular como primeiro elemento focável e `href` apontando para um `id` existente. Teste de navegador repete a hierarquia no DOM final (com conteúdo gerado por script) e verifica nomes acessíveis de links e botões (nenhum "clique aqui", "saiba mais", "ver mais" isolado; links de cartão incluem o título).
- **Rationale**: FE-034 e FE-035 valem para as cinco páginas; o conteúdo dinâmico (cartões, estados) muda a hierarquia depois do carregamento.
- **Alternatives**: confiar nas regras do axe (rejeitado: o axe não avalia se o título é específico nem se o nome do link faz sentido).

## D4 — Estados dinâmicos: regras iguais nas quatro páginas
- **Decision**: teste de navegador observa o conteúdo das regiões de status ao longo de cada transição (carregando → resultado, vazio, erro, nova tentativa; formulário inválido; confirmação) e confere: uma mensagem por transição, sem repetição na mesma busca idêntica, esqueletos com `aria-hidden`, `document.activeElement` inalterado quando a atualização não pede foco, vazio e erro com textos distintos.
- **Rationale**: FR-017 a FR-022; hoje o comportamento é testado por página, não como regra comum.
- **Alternatives**: verificar só manualmente com leitor de tela (rejeitado: regressões passam despercebidas); observar o leitor de tela por automação (rejeitado: instável e fora do ambiente).

## D5 — Contraste por estado real, com correção centralizada
- **Decision**: (a) `state-contrast.test.js` lê o CSS e calcula a razão dos pares de cada regra de estado (`:hover`, `[aria-current]`, `[aria-pressed]`/selecionado, `:disabled`, `[aria-invalid]`, `.field-error`, tags, selos, textos sobre fallback), complementando o teste de tokens; (b) `a11y-contrast-states.spec.js` mede em Chromium, por `getComputedStyle`, texto e fundo efetivos (subindo pela árvore até um fundo opaco) para elementos reais em cada estado forçado por teclado/mouse. Falha abaixo de 4,5:1 (texto comum), 3:1 (texto grande e componentes). Correções vão para `tokens.css`/`components.css`, com a razão nova registrada.
- **Rationale**: o DOC-15 e o FR-025 pedem os estados reais; o teste de tokens só vê as cores-base.
- **Alternatives**: auditar com extensão do navegador à mão (rejeitado como único meio: sem regressão automática; mantém-se como conferência pontual); `prefers-contrast` próprio (rejeitado: fora do escopo).
- **Texto desabilitado**: exceção da WCAG para componentes inativos; se o texto precisar ser lido (por exemplo, "Anterior" na primeira página), mantém-se 4,5:1 e a razão fica registrada.

## D6 — Teclado, foco visível e foco não encoberto
- **Decision**: `a11y-keyboard.spec.js` percorre cada página com Tab e confere: o primeiro foco é o link de pular; o foco do link de pular fica visível; ao acioná-lo o próximo Tab não repete o cabeçalho; nenhum elemento oculto, `inert`, `display:none` ou menu fechado recebe foco; a ordem de foco segue a ordem visual (posição `y` e `x` não decrescente por linha); nenhum armadilha (Tab percorre o ciclo e sai da página). `a11y-focus-visible.spec.js` mede o contorno computado em cada tipo de controle e confere por `elementFromPoint` que o centro do elemento focado não está coberto por outro elemento, em 1280 e 320 px, com rolagem automática do navegador. Teste de CSS garante que não existe `outline: none/0` sem substituto visível e que `scroll-margin-top`/`scroll-padding-top` existe se algum cabeçalho vier a ser fixo.
- **Rationale**: FR-007 a FR-013; WCAG 2.4.3, 2.4.7, 2.4.11.
- **Alternatives**: teste só do `:focus-visible` no CSS (rejeitado: não prova que aparece nos fundos reais).

## D7 — Imagens, ícones, fallback e links externos
- **Decision**: teste de navegador percorre todas as `img`, `svg` e pseudo-conteúdo de ícones nas páginas: imagem informativa tem `alt` não vazio e não igual ao título quando redundante; decorativa tem `alt=""` ou `aria-hidden`; o fallback é CSS/`aria-hidden`, sem `img` quebrada; link com `target="_blank"` tem `rel="noopener"` e o nome acessível contém "nova aba". Como a API não traz imagem, uma prova do componente do cartão com imagem fictícia confere a regra para quando o dado existir.
- **Rationale**: FR-014 a FR-016; `PENDENCIAS-BACKEND.md` registra a ausência de imagens.
- **Alternatives**: esperar o backend (rejeitado: o componente precisa estar pronto).

## D8 — Espaçamento de texto, ampliação e reflow
- **Decision**: `a11y-text-spacing.spec.js` injeta as quatro configurações da WCAG 1.4.12 (altura de linha 1,5, espaço entre parágrafos 2×, entre letras 0,12×, entre palavras 0,16× o tamanho da fonte) e confere em cada página e estado: sem rolagem horizontal, nenhum texto cortado (`scrollHeight > clientHeight` com `overflow` oculto), nenhum par de controles se sobrepondo. Reaproveita o teste de 200% e 320 px já existentes. Completa-se com passada manual de zoom do navegador (200% e 400%).
- **Rationale**: FR-027 a FR-029; é o único critério AA da lista que ainda não tem teste.
- **Alternatives**: confiar no teste de 200% (rejeitado: espaçamento e ampliação são critérios diferentes).

## D9 — Passada manual e registro
- **Decision**: leitor de tela NVDA com Chromium e Firefox (Windows) como combinação mínima, mais VoiceOver/iOS só se disponível; roteiro em `quickstart.md`, com resultado em `docs/17-registro-de-acessibilidade.md`, no formato de `contracts/accessibility-report.md`. Tudo que não for verificado consta como "não verificado", com motivo. Teste com pessoas usuárias (SC-009) só se houver participantes.
- **Rationale**: DOC-14 §9.3, DOC-15 §7.3 e §8; o registro não pode afirmar mais do que foi feito.
- **Alternatives**: registro dentro do `quickstart.md` (rejeitado: o quickstart é guia de execução; o registro é entregável de projeto); declarar "conforme WCAG 2.2 AA" (rejeitado: DOC-14 §9.7).

## D10 — Dependências da API
- **Decision**: anunciar a quantidade só quando `count` for confiável; sem imagem, fallback; detalhe indisponível versus inexistente conforme o que a API informa. Qualquer divergência nova vai para `docs/PENDENCIAS-BACKEND.md`.
- **Rationale**: DOC-15 §8; spec FR-036.
