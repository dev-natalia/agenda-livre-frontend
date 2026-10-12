# DOC-17 — Registro de Acessibilidade

**Projeto:** Agenda Livre  
**Status:** Em elaboração (feature 009 — acessibilidade transversal)  
**Referências:** DOC-14 §9, DOC-15 §6 a §8, `specs/009-transversal-accessibility/contracts/audit-matrix.md`

## 1. Escopo e data

- Páginas: Início (`index.html`), Explorar (`explorar.html`), Detalhes (`atividade.html`), Sobre (`sobre.html`) e Contato (`contato.html`).
- Estados: carregada, menu móvel aberto, resultados, nenhum resultado, erro da API, formulário com erros e painel de confirmação (DOC-14 §9.1).
- Larguras: 1280 e 320 pixels CSS.
- Linha de base (2026-10-12, antes de qualquer mudança da feature 009): `npm test` com 575 testes aprovados e `npx playwright test` com 287 aprovados, nenhum falhando.
- Data da avaliação final: _a preencher_.

## 2. Ambiente

_A preencher: navegador e versão, sistema, leitor de tela e versão, axe-core e Playwright (versões do `package-lock.json`)._

## 3. Resumo

_A preencher: contagem de verificações por resultado (`conforme`, `nao-conforme`, `nao-aplicavel`, `nao-verificado`) e de problemas por situação._

## 4. Verificações

_A preencher: critério, página, estado, largura, resultado e evidência._

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

_A preencher. Já conhecidas, do DOC-15 §8: a API não fornece imagem de atividade (o fallback visual é o caso normal); a quantidade de resultados só é anunciada quando a API a informa; a distinção entre atividade inexistente e indisponível depende do que a API informa com segurança._

## 8. Aviso

> Este registro documenta as verificações feitas na data indicada. Resultados de ferramentas automáticas e de testes manuais contribuem para a avaliação, mas não equivalem a certificação nem a declaração de conformidade integral com a WCAG 2.2 AA, que depende do conteúdo real, dos estados dinâmicos e de avaliação continuada.
