# Implementation Plan: Acessibilidade transversal

**Branch**: `009-transversal-accessibility` | **Date**: 2026-10-12 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/009-transversal-accessibility/spec.md`

## Summary

Entregar o épico EP-FE-09 (FE-034 a FE-040) como uma **auditoria transversal com correção de lacunas e registro de evidências**, sem funcionalidade nova. As features 003 a 008 já entregaram link de pular, foco visível, regiões de status, fallback de imagem, movimento reduzido e axe por página; falta verificar o conjunto, fechar o que ficou sem cobertura e documentar. Escolhas: (1) uma **matriz de verificação** (`contracts/audit-matrix.md`) mapeia cada critério do DOC-15 §6 a página, estado e forma de verificação, e é a fonte do que testar; (2) **regras que valem para todas as páginas viram testes parametrizados** em `tests/e2e/a11y-*.spec.js` e `tests/unit/` (idioma, `h1` único, hierarquia de títulos, regiões, link de pular como primeiro foco, ordem de foco sem itens ocultos, nomes de link/botão não vagos, foco não encoberto, espaçamento de texto da WCAG 1.4.12), em vez de repetir casos por página; (3) o **axe é ampliado para a matriz completa de estados** do DOC-14 §9.1 nas cinco páginas, em 1280 e 320 px, num único arquivo que falha com violação nova; (4) o **contraste é medido nos estados reais** (normal, hover, foco, selecionado, desabilitado, erro, sobre fallback) por script que lê estilos computados no navegador, além do teste de tokens existente; (5) **correções ficam centralizadas** em `css/tokens.css`, `css/base.css`, `css/components.css` e nos componentes compartilhados em `js/components/`, nunca página a página; (6) a **passada manual** (teclado, leitor de tela, zoom 200%, reflow, espaçamento, movimento reduzido) segue o `quickstart.md`, e o resultado vai para `docs/17-registro-de-acessibilidade.md`, que não declara conformidade integral; (7) divergências de contrato achadas vão para `docs/PENDENCIAS-BACKEND.md`.

## Technical Context

**Language/Version**: HTML5, CSS3, JavaScript ES2022 (ES Modules); Node.js 20+ apenas para testes

**Primary Dependencies**: nenhuma em produção; dev: `vitest`, `jsdom`, `@playwright/test`, `@axe-core/playwright` (existentes). Nenhum pacote novo

**Storage**: nenhum

**Testing**: Vitest (regras puras e leitura de CSS: contraste dos tokens, regras `forced-colors`/`prefers-reduced-motion`, ausência de `outline: none` sem substituto); Playwright com axe parametrizado por página, estado e largura; testes de estrutura, foco, ordem de Tab, nomes acessíveis, espaçamento de texto, contraste computado por estado; passada manual em Chromium com NVDA (Windows) e registro das limitações. Dados sintéticos via `tests/e2e/helpers/mock-api.js`

**Target Platform**: navegadores modernos, arquivos estáticos

**Project Type**: web, frontend estático separado do backend Django

**Performance Goals**: suíte de acessibilidade completa em no máximo ~5 minutos com 2 workers; nenhuma regressão de carregamento (as correções não adicionam scripts)

**Constraints**: sem framework; sem desativar regras do axe para obter execução verde (exceção só com escopo, razão e mitigação, em `contracts/audit-matrix.md`); correção de cor preserva a identidade (DOC-10) e fica nos tokens; não alterar comportamento funcional das features 001 a 008; nenhuma mudança no backend

**Scale/Scope**: 5 páginas × 7 estados × 2 larguras na matriz do axe; ~6 specs de navegador e ~3 de unidade novas; ajustes de CSS e de componentes conforme os achados; 1 documento de registro (`docs/17-registro-de-acessibilidade.md`)

## Constitution Check

A constituição (`.specify/memory/constitution.md`) segue como modelo não preenchido; os gates vêm do DOC-14 §9, DOC-15 (§4 a §9) e das decisões das features 001 a 008:

- HTML/CSS/JS puros, ES Modules, sem framework (DOC-09): PASS
- WCAG 2.2 AA como meta, sem declarar conformidade integral (DOC-14 §9.7, DOC-15 §1, §8): PASS (D1, D8)
- Axe nas cinco páginas e nos estados do DOC-14 §9.1, sem ignorar alerta (DOC-14 §9.1): PASS (D2)
- Teclado, leitor de tela, contraste, zoom e movimento verificados manualmente e registrados (DOC-14 §9.2 a §9.6, DOC-15 §7): PASS (D6, D8)
- Controles nativos antes de ARIA (DOC-15 §4): PASS (D3)
- Mensagens de status sem mover o foco; vazio distinto de erro (DOC-15 §5.5): PASS (D4)
- Correções centralizadas nos tokens e componentes (004): PASS (D5)
- Backend e contrato da API inalterados; divergências em `PENDENCIAS-BACKEND.md` (002): PASS
- Escopo de testes gerais mantido no EP-FE-10: PASS

Reavaliação pós-design: sem violações. Sem entradas em Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/009-transversal-accessibility/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── audit-matrix.md        # critério × página × estado × verificação; exceções
│   └── accessibility-report.md # formato do registro e regras de redação
├── checklists/requirements.md
└── tasks.md                   # gerado por /speckit-tasks

docs/
└── 17-registro-de-acessibilidade.md   # NOVO: evidências e limitações (resultado da entrega)
```

### Source Code (repository root)

```text
css/
├── tokens.css          # ajustes de cor só se a medição mostrar falha
├── base.css            # foco, scroll-margin, forced-colors, espaçamento de texto, se faltar
└── components.css      # estados (hover/selecionado/desabilitado/erro) se faltar contraste/indício
js/components/          # só correções de nome/estado/anúncio em componentes compartilhados
*.html                  # só correções de semântica pontuais (títulos, regiões, nomes)

tests/
├── unit/
│   ├── a11y-static-structure.test.js   # lang, h1, títulos, regiões, link de pular em cada .html
│   ├── a11y-css-rules.test.js          # sem outline:none sem substituto, forced-colors, reduced-motion
│   └── state-contrast.test.js          # pares de cor por estado extraídos do CSS
└── e2e/
    ├── helpers/a11y-matrix.js          # páginas, estados, larguras e preparação de cada estado
    ├── a11y-axe-matrix.spec.js         # axe em toda a matriz
    ├── a11y-keyboard.spec.js           # primeiro Tab, pular, ordem, menu, armadilhas
    ├── a11y-focus-visible.spec.js      # foco visível e não encoberto
    ├── a11y-names-and-images.spec.js   # nomes de link/botão, alt, ícones, fallback
    ├── a11y-live-states.spec.js        # status anunciados uma vez, foco preservado, esqueletos
    ├── a11y-contrast-states.spec.js    # contraste computado por estado real
    └── a11y-text-spacing.spec.js       # espaçamento WCAG 1.4.12 + 200% + 320 px
```

**Structure Decision**: Mantém o frontend estático por página e a suíte já existente. Os testes novos são transversais e parametrizados pela matriz em `helpers/a11y-matrix.js`, para que acrescentar uma página ou um estado seja uma linha. Os testes de acessibilidade por página das features anteriores permanecem; os novos não os duplicam, só cobrem o que ficou fora (ordem de foco, espaçamento, estados de contraste, matriz completa). Qualquer correção entra no arquivo compartilhado que a origina.

## Complexity Tracking

Sem violações a justificar.
