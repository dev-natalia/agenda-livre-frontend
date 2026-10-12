# DOC-17 — Registro de Acessibilidade

**Projeto:** Agenda Livre  
**Status:** Em elaboração (feature 009 — acessibilidade transversal)  
**Referências:** DOC-14 §9, DOC-15 §6 a §8, `specs/009-transversal-accessibility/contracts/audit-matrix.md`

## 1. Escopo e data

- Páginas: Início (`index.html`), Explorar (`explorar.html`), Detalhes (`atividade.html`), Sobre (`sobre.html`) e Contato (`contato.html`).
- Estados: carregada, menu móvel aberto, resultados, nenhum resultado, erro da API, formulário com erros e painel de confirmação (DOC-14 §9.1).
- Larguras: 1280 e 320 pixels CSS.
- Linha de base (2026-10-12, antes de qualquer mudança da feature 009): `npm test` com 575 testes aprovados e `npx playwright test` com 287 aprovados, nenhum falhando.
- Data da avaliação: 2026-10-12 (ramo `009-transversal-accessibility`).

## 2. Ambiente

- Sistema: Windows 11.
- Navegador das verificações automáticas: Chromium headless do Playwright 1.64.0 (build 1248). Firefox e WebKit não foram usados.
- Ferramentas: `@axe-core/playwright` 4.10.2 com axe-core 4.10.3 (tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`), Vitest 2.1.9, jsdom 25.0.1, Node.js 24.
- Leitor de tela: nenhum usado até o momento.

## 3. Resumo

- Verificações automáticas: 21 critérios, todos `conforme` (nenhum `nao-conforme`, nenhum `nao-aplicavel`).
- Verificações manuais: 21, todas `nao-verificado`, porque o roteiro manual (leitor de tela, zoom e inspeção visual) ainda não foi executado por uma pessoa.
- Problemas: 1 encontrado (A11Y-001), 1 corrigido, 0 pendentes, 0 exceções.
- Suíte no fim da auditoria (2026-10-12): `npm test` com 692 testes aprovados; `npx playwright test` com 624 aprovados em 3,8 minutos e 20 ignorados de propósito (hover e foco por estado rodam só em 1280 px). Só os testes de acessibilidade (`npx playwright test a11y`): 337 aprovados em 3,5 minutos com 2 workers.

## 4. Verificações

Uma linha por critério e forma de verificação. O resultado `conforme` só aparece ligado a uma evidência executada; `nao-verificado` traz o motivo. A forma manual segue o `specs/009-transversal-accessibility/quickstart.md`.

| Critério | Forma | Páginas e estados | Larguras | Resultado | Evidência |
|---|---|---|---|---|---|
| 1.1.1 Conteúdo não textual | automática | 5 páginas; carregada, resultados, formulário com erros e confirmação | 1280 | conforme | `tests/e2e/a11y-names-and-images.spec.js` (alt presente, nenhuma imagem quebrada, SVG decorativo oculto, fallback oculto); `tests/unit/a11y-static-structure.test.js`; `tests/unit/activity-card.test.js` |
| 1.3.1 Informações e relações | automática | 5 páginas; estados da matriz aplicáveis a cada uma | 1280 e 320 | conforme | `tests/unit/a11y-static-structure.test.js`; `tests/e2e/a11y-names-and-images.spec.js` (títulos, regiões); `tests/e2e/a11y-axe-matrix.spec.js` (36 cenários) |
| 1.4.1 Uso de cor | automática | navegação, paginação, formulário, botão desabilitado; links no texto | 1280 | conforme | `tests/e2e/a11y-state-cues.spec.js`; `tests/e2e/a11y-links-in-text.spec.js`; `tests/unit/state-contrast.test.js` |
| 1.4.3 Contraste (mínimo) | automática | 5 páginas; carregada, resultados, vazio, erro da API, formulário com erros, confirmação; hover e foco dos controles | 1280 e 320 | conforme | `tests/e2e/a11y-contrast-states.spec.js` (30 medições de texto, 10 de hover e foco); `tests/unit/design-tokens.test.js`; `tests/unit/state-contrast.test.js` |
| 1.4.4 Redimensionar texto | automática | 5 páginas; 6 estados | 1280 e 320 | conforme | `tests/e2e/a11y-text-spacing.spec.js` (modo "texto a 200%"); `tests/e2e/responsive-reflow.spec.js` |
| 1.4.10 Reflow | automática | 5 páginas; 6 estados | 320 | conforme | `tests/e2e/a11y-text-spacing.spec.js`; `tests/e2e/responsive-reflow.spec.js` |
| 1.4.11 Contraste não textual | automática | bordas e contorno de foco | — | conforme | `tests/unit/state-contrast.test.js` (bordas dos controles e foco a 3:1); `tests/unit/design-tokens.test.js` |
| 1.4.12 Espaçamento de texto | automática | 5 páginas; 6 estados | 1280 e 320 | conforme | `tests/e2e/a11y-text-spacing.spec.js` (modos "espaçamento" e "200% com espaçamento"); corrigido A11Y-001 |
| 2.1.1 Teclado | automática | 5 páginas; menu, filtros, paginação, formulário, tentar novamente | 1280 e 320 | conforme | `tests/e2e/a11y-keyboard.spec.js`; `tests/e2e/a11y-live-states.spec.js` |
| 2.1.2 Sem bloqueio de teclado | automática | 5 páginas | 1280 e 320 | conforme | `tests/e2e/a11y-keyboard.spec.js` (o ciclo de Tab sai da página; o foco não se repete) |
| 2.4.1 Ignorar blocos | automática | 5 páginas | 1280 e 320 | conforme | `tests/e2e/a11y-keyboard.spec.js`; `tests/unit/a11y-static-structure.test.js` |
| 2.4.3 Ordem do foco | automática | 5 páginas | 1280 e 320 | conforme | `tests/e2e/a11y-keyboard.spec.js` (ordem visual, nenhum item oculto, menu fechado fora da ordem) |
| 2.4.7 Foco visível | automática | carregada, resultados, formulário com erros, erro da API | 1280 e 320 | conforme | `tests/e2e/a11y-focus-visible.spec.js` (28 cenários); `tests/unit/a11y-css-rules.test.js` |
| 2.4.11 Foco não obscurecido | automática | carregada, resultados, formulário com erros, erro da API | 1280 e 320 | conforme | `tests/e2e/a11y-focus-visible.spec.js` (nenhum controle encoberto; sem cabeçalho fixo) |
| 3.3.1 Identificação do erro | automática | Contato: formulário com erros | 1280 e 320 | conforme | `tests/e2e/contact-validation.spec.js`; `tests/e2e/a11y-axe-matrix.spec.js`; `tests/e2e/a11y-live-states.spec.js` |
| 3.3.2 Rótulos ou instruções | automática | Contato; Início e Explorar (filtros) | 1280 e 320 | conforme | `tests/unit/a11y-static-structure.test.js` (todo campo com rótulo); `tests/e2e/contact-validation.spec.js`; axe |
| 4.1.2 Nome, função, valor | automática | 5 páginas; estados da matriz aplicáveis a cada uma | 1280 e 320 | conforme | `tests/e2e/a11y-names-and-images.spec.js` (nomes, `aria-current`, `aria-expanded`); axe; `tests/e2e/a11y-keyboard.spec.js` (menu) |
| 4.1.3 Mensagens de status | automática | Início, Explorar, Detalhes, Contato | 1280 | conforme | `tests/e2e/a11y-live-states.spec.js` (12 cenários) |
| DP movimento reduzido | automática | 5 páginas; 7 estados | 1280 e 320 | conforme | `tests/e2e/a11y-reduced-motion.spec.js` (37 testes); `tests/e2e/reduced-motion.spec.js`; `tests/unit/a11y-css-rules.test.js` |
| DP página atual (`aria-current`) | automática | 5 páginas | 1280 | conforme | `tests/e2e/a11y-names-and-images.spec.js`; `tests/unit/a11y-static-structure.test.js` |
| DP links externos em nova aba | automática | Detalhes | 1280 | conforme | `tests/e2e/a11y-names-and-images.spec.js`; `tests/e2e/details-external-link.spec.js` |
| 1.1.1 Conteúdo não textual | manual | quickstart.md §5: alternativa equivalente à finalidade da imagem | — | nao-verificado | Roteiro manual do `quickstart.md` ainda não executado: leitor de tela, zoom do navegador e inspeção visual dependem de uma pessoa. |
| 1.3.1 Informações e relações | manual | quickstart.md §4: listas de títulos e regiões com leitor de tela | — | nao-verificado | Roteiro manual do `quickstart.md` ainda não executado: leitor de tela, zoom do navegador e inspeção visual dependem de uma pessoa. |
| 1.4.1 Uso de cor | manual | quickstart.md §6: conferência visual dos estados | — | nao-verificado | Roteiro manual do `quickstart.md` ainda não executado: leitor de tela, zoom do navegador e inspeção visual dependem de uma pessoa. |
| 1.4.3 Contraste (mínimo) | manual | quickstart.md §6: ferramenta de contraste em amostra de estados | — | nao-verificado | Roteiro manual do `quickstart.md` ainda não executado: leitor de tela, zoom do navegador e inspeção visual dependem de uma pessoa. |
| 1.4.4 Redimensionar texto | manual | quickstart.md §7: zoom do navegador a 200% e 400% | — | nao-verificado | Roteiro manual do `quickstart.md` ainda não executado: leitor de tela, zoom do navegador e inspeção visual dependem de uma pessoa. |
| 1.4.10 Reflow | manual | quickstart.md §7: janela de 320 px | — | nao-verificado | Roteiro manual do `quickstart.md` ainda não executado: leitor de tela, zoom do navegador e inspeção visual dependem de uma pessoa. |
| 1.4.11 Contraste não textual | manual | quickstart.md §6: medição visual de bordas e foco | — | nao-verificado | Roteiro manual do `quickstart.md` ainda não executado: leitor de tela, zoom do navegador e inspeção visual dependem de uma pessoa. |
| 1.4.12 Espaçamento de texto | manual | quickstart.md §7: marcador de espaçamento do navegador | — | nao-verificado | Roteiro manual do `quickstart.md` ainda não executado: leitor de tela, zoom do navegador e inspeção visual dependem de uma pessoa. |
| 2.1.1 Teclado | manual | quickstart.md §2: percurso completo sem mouse | — | nao-verificado | Roteiro manual do `quickstart.md` ainda não executado: leitor de tela, zoom do navegador e inspeção visual dependem de uma pessoa. |
| 2.1.2 Sem bloqueio de teclado | manual | quickstart.md §2 | — | nao-verificado | Roteiro manual do `quickstart.md` ainda não executado: leitor de tela, zoom do navegador e inspeção visual dependem de uma pessoa. |
| 2.4.1 Ignorar blocos | manual | quickstart.md §2 | — | nao-verificado | Roteiro manual do `quickstart.md` ainda não executado: leitor de tela, zoom do navegador e inspeção visual dependem de uma pessoa. |
| 2.4.3 Ordem do foco | manual | quickstart.md §2 | — | nao-verificado | Roteiro manual do `quickstart.md` ainda não executado: leitor de tela, zoom do navegador e inspeção visual dependem de uma pessoa. |
| 2.4.7 Foco visível | manual | quickstart.md §2 | — | nao-verificado | Roteiro manual do `quickstart.md` ainda não executado: leitor de tela, zoom do navegador e inspeção visual dependem de uma pessoa. |
| 2.4.11 Foco não obscurecido | manual | quickstart.md §2 | — | nao-verificado | Roteiro manual do `quickstart.md` ainda não executado: leitor de tela, zoom do navegador e inspeção visual dependem de uma pessoa. |
| 3.3.1 Identificação do erro | manual | quickstart.md §3: erros lidos junto ao campo com leitor de tela | — | nao-verificado | Roteiro manual do `quickstart.md` ainda não executado: leitor de tela, zoom do navegador e inspeção visual dependem de uma pessoa. |
| 3.3.2 Rótulos ou instruções | manual | quickstart.md §4: rótulos e instruções lidos com leitor de tela | — | nao-verificado | Roteiro manual do `quickstart.md` ainda não executado: leitor de tela, zoom do navegador e inspeção visual dependem de uma pessoa. |
| 3.3.3 Sugestão de erro | manual | quickstart.md §3: o critério só tem forma manual | — | nao-verificado | Roteiro manual do `quickstart.md` ainda não executado: leitor de tela, zoom do navegador e inspeção visual dependem de uma pessoa. |
| 4.1.2 Nome, função, valor | manual | quickstart.md §4: nomes, funções e estados com leitor de tela | — | nao-verificado | Roteiro manual do `quickstart.md` ainda não executado: leitor de tela, zoom do navegador e inspeção visual dependem de uma pessoa. |
| 4.1.3 Mensagens de status | manual | quickstart.md §3: anúncios com leitor de tela | — | nao-verificado | Roteiro manual do `quickstart.md` ainda não executado: leitor de tela, zoom do navegador e inspeção visual dependem de uma pessoa. |
| DP movimento reduzido | manual | quickstart.md §8 | — | nao-verificado | Roteiro manual do `quickstart.md` ainda não executado: leitor de tela, zoom do navegador e inspeção visual dependem de uma pessoa. |
| DP links externos em nova aba | manual | quickstart.md §5: anúncio do aviso de nova aba | — | nao-verificado | Roteiro manual do `quickstart.md` ainda não executado: leitor de tela, zoom do navegador e inspeção visual dependem de uma pessoa. |

## 5. Problemas

### A11Y-001 — Rolagem horizontal com texto a 200% e espaçamento aumentado a 320 px

- **Critérios:** 1.4.10 Reflow e 1.4.12 Espaçamento de texto (AA); FE-040.
- **Onde:** `sobre.html` (botão "Explorar atividades"), `contato.html` (aviso "Formulário demonstrativo:") e os estados de erro da API, formulário com erros e confirmação, só em largura de 320 px com texto a 200% somado ao espaçamento da WCAG 1.4.12. Sete cenários de `tests/e2e/a11y-text-spacing.spec.js`.
- **Descrição:** uma palavra mais larga que a caixa (por exemplo, "atividades" em um botão com 200% e letras espaçadas) não quebrava e empurrava a página 10 a 56 px para fora da tela.
- **Gravidade:** prejudica (exige rolagem horizontal em uma combinação extrema de ajustes).
- **Situação:** corrigido.
- **Correção:** `overflow-wrap: anywhere` em `body` (`css/base.css`), como última defesa; antes só os títulos tinham essa regra. Os 30 cenários do modo severo e a suíte completa (618 testes de navegador) passam depois da mudança.

## 6. Exceções

Nenhuma até o momento.

## 7. Limitações conhecidas

**O que não foi verificado**

- Nenhum leitor de tela foi usado. Os anúncios de carregamento, resultado, vazio, erro e confirmação foram observados nas regiões de aviso do DOM (`tests/e2e/a11y-live-states.spec.js`), o que mostra o que seria entregue ao leitor, mas não como NVDA, VoiceOver ou outro o fala.
- Os itens manuais do `quickstart.md` (teclado de ponta a ponta, zoom do navegador a 200% e 400%, janela de 320 px, marcador de espaçamento, movimento reduzido do sistema, medição visual de contraste) não foram executados por uma pessoa. Seus testes automáticos correspondentes passam, mas não os substituem.
- A equivalência do texto alternativo à finalidade da imagem e a clareza dos textos (nomes de link, mensagens de erro, orientação para corrigir) dependem de leitura humana. Os testes só verificam presença, ausência de nomes vagos e de repetição mecânica do título.
- O contraste não textual (WCAG 1.4.11) foi verificado nos valores das regras de CSS (bordas dos controles e contorno de foco a 3:1), não por medição visual em cada estado do navegador. O contraste de texto foi medido nos estilos computados de 30 cenários e em hover e foco dos controles.
- Só o Chromium foi usado. Firefox, Safari e dispositivos móveis reais não foram testados.
- Não houve teste com pessoas usuárias de tecnologia assistiva, então o critério de sucesso SC-009 da spec não foi medido.
- O modo de cores forçadas do sistema foi verificado apenas por regra de CSS (nenhuma regra remove o contorno nesse modo), sem inspeção visual.

**Dependências da API (DOC-15 §8)**

- A API não fornece imagem de atividade (`docs/PENDENCIAS-BACKEND.md`). O fallback visual é o caso normal; o cartão está pronto para uma imagem informativa (`image: { url, alt }`), mas essa parte só foi exercitada em teste de unidade.
- A quantidade de resultados só é anunciada quando a resposta traz `count`. Sem ele, a mensagem é "Atividades carregadas." (testado).
- A distinção entre atividade inexistente e indisponível depende do que a API informa com segurança; o frontend mostra a mesma mensagem para os dois casos.

**Pendências do backend**

- Nenhuma divergência de contrato nova foi encontrada nesta auditoria; `docs/PENDENCIAS-BACKEND.md` não foi alterado.

**Observações de desenho**

- Uma nova tentativa que falha de novo repete a mensagem de erro de propósito, para que a pessoa saiba que nada mudou.
- O contorno de foco do título do cartão fica no cartão inteiro (link esticado); o do `main` é removido porque ele só recebe foco por programa, nunca por Tab.

**Prova de que a suíte percebe regressão**

- `tests/e2e/a11y-regression-guard.spec.js` estraga a página de Contato no navegador (sem rótulo, imagem sem `alt`, contraste baixo, link de pular escondido, botão sem nome, título pulando nível) e confere que a verificação certa dispara.
- Em 2026-10-12, trocar `--color-text-muted` por `#94a3b8` em `css/tokens.css` fez `design-tokens.test.js` e `state-contrast.test.js` falharem (7 testes); o valor foi restaurado em seguida.

## 8. Aviso

> Este registro documenta as verificações feitas na data indicada. Resultados de ferramentas automáticas e de testes manuais contribuem para a avaliação, mas não equivalem a certificação nem a declaração de conformidade integral com a WCAG 2.2 AA, que depende do conteúdo real, dos estados dinâmicos e de avaliação continuada.
