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

_A preencher conforme a auditoria avança. Campos: id, critério, onde, descrição, gravidade, situação, correção ou justificativa._

## 6. Exceções

Nenhuma até o momento.

## 7. Limitações conhecidas

_A preencher. Já conhecidas, do DOC-15 §8: a API não fornece imagem de atividade (o fallback visual é o caso normal); a quantidade de resultados só é anunciada quando a API a informa; a distinção entre atividade inexistente e indisponível depende do que a API informa com segurança._

## 8. Aviso

> Este registro documenta as verificações feitas na data indicada. Resultados de ferramentas automáticas e de testes manuais contribuem para a avaliação, mas não equivalem a certificação nem a declaração de conformidade integral com a WCAG 2.2 AA, que depende do conteúdo real, dos estados dinâmicos e de avaliação continuada.
