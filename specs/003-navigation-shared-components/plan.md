# Implementation Plan: Navegação e componentes compartilhados

**Branch**: `003-navigation-shared-components` | **Date**: 2026-10-11 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/003-navigation-shared-components/spec.md`

## Summary

Entregar o épico EP-FE-03 (FE-006 a FE-010): (1) cabeçalho, navegação, link de pular e rodapé idênticos nas cinco páginas, em HTML estático (funciona sem JavaScript), com `aria-current` por página; (2) menu móvel como *disclosure* (botão + links nativos) aprimorado por `js/components/site-nav.js`, que só recolhe o menu quando o script roda; (3) componente de card `js/components/activity-card.js` com área de imagem e fallback decorativo; (4) mecanismo comum de estados de região `js/components/region-state.js` (carregando com esqueletos, erro, vazio, sucesso) que absorve o `error-state.js` da feature 002, com uma região de anúncio única por região. Nenhuma consulta à API é feita pelos componentes; as páginas dos épicos seguintes os usam.

## Technical Context

**Language/Version**: HTML5, CSS3, JavaScript ES2022 (ES Modules); Node.js 20+ apenas para testes

**Primary Dependencies**: nenhuma em produção; dev: `vitest`, `jsdom`, `@playwright/test` (existentes) e `@axe-core/playwright` (novo, FR-051/SC-009)

**Storage**: N/A

**Testing**: Vitest + jsdom (menu, card, região de estados, formatação de data, consistência do HTML compartilhado entre as cinco páginas); Playwright (navegação por teclado, menu em 320 px, esqueleto/erro/vazio/cards via módulo de verificação, axe-core nas cinco páginas); revisão manual com teclado e leitor de tela registrada em `quickstart.md`

**Target Platform**: navegadores modernos, arquivos estáticos

**Project Type**: web, frontend estático separado do backend Django

**Performance Goals**: sem animações; componentes criam DOM sem reflows em laço (um `append` por lote)

**Constraints**: sem framework; navegação utilizável sem JS; texto da API sempre via `textContent`; foco nunca movido por atualização; sem consulta à API nos componentes; sem arquivos vazios

**Scale/Scope**: 5 HTMLs ajustados, 3 módulos novos de componente (`site-nav`, `activity-card`, `region-state`) + 1 utilitário (`format.js`), refatoração pequena de `error-state.js`, CSS novo em `components.css`/`layout.css`/`tokens.css`

## Constitution Check

A constituição (`.specify/memory/constitution.md`) segue como modelo não preenchido; os gates vêm dos DOC-09, DOC-10, DOC-13 §3–§5/§8/§12 e DOC-15:

- HTML semântico, `header`/`nav`/`main`/`footer`, `lang="pt-BR"`, `main` com id estável (DOC-13 §4): PASS
- Link de pular como primeiro elemento focável, visível ao foco (DOC-13 §4): PASS
- Menu móvel por botão de divulgação, `aria-expanded`, sem papel `menu`, sem armadilha de foco (DOC-13 §5): PASS
- Links só focáveis quando visíveis (atributo `hidden`, não `visibility` parcial): PASS
- Card com link principal único, fallback decorativo oculto de AT, sem imagem quebrada (DOC-13 §8, DOC-10 §6.3): PASS
- Estados distintos (carregando/erro/vazio), anúncio único, foco preservado, esqueleto fora da AT (DOC-13 §12): PASS
- Movimento reduzido: nenhuma animação introduzida (DOC-13 §3): PASS
- Sem framework, sem roteador, sem dependência de runtime (DOC-09): PASS
- Componentes sem acesso direto à API; reuso do cliente e do erro da feature 002: PASS
- Navegação sem JS (FR-003/FR-018) versus fonte única do cabeçalho (FR-002): resolvido por HTML estático + teste de consistência; ver [research.md](research.md) D1. Desvio justificado em Complexity Tracking.

Reavaliação pós-design: sem violações não justificadas.

## Project Structure

### Documentation (this feature)

```text
specs/003-navigation-shared-components/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── site-shell.md
│   ├── activity-card.md
│   └── region-state.md
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
index.html, explorar.html, atividade.html, sobre.html, contato.html   # recebem o invólucro compartilhado
css/
├── tokens.css           # + cores do card/etiqueta/esqueleto, breakpoint documentado
├── base.css             # + .visually-hidden, .skip-link
├── layout.css           # + .site-header, .site-nav, .site-footer, grade responsiva
└── components.css       # + .activity-card, .image-fallback, .region-state, .skeleton-card
js/
├── components/
│   ├── site-nav.js         # initSiteNav(): menu móvel (aprimoramento progressivo)
│   ├── activity-card.js    # createActivityCard()
│   ├── region-state.js     # createRegionState()
│   └── error-state.js      # existente; ganha opção { live } (compatível)
├── utils/
│   └── format.js           # formatOccurrence(), activityDetailsUrl()
└── pages/*.js              # cada página chama initSiteNav()
tests/
├── unit/
│   ├── site-shell.test.js       # consistência do HTML das 5 páginas
│   ├── site-nav.test.js
│   ├── activity-card.test.js
│   ├── region-state.test.js
│   ├── format.test.js
│   └── error-state.test.js      # ajustado para a nova opção
└── e2e/
    ├── navigation.spec.js       # teclado, aria-current, sem JS, menu 320 px
    ├── shared-components.spec.js # card, fallback, estados, foco/anúncio
    └── accessibility.spec.js    # axe-core nas cinco páginas
```

**Structure Decision**: segue o DOC-09 §6 (`js/components/`, `js/utils/`). `js/utils/format.js` nasce agora porque há lógica pura (datas, URL de detalhes) a testar sem DOM; o README é atualizado para listar `utils/`. O invólucro compartilhado é marcação estática repetida nas cinco páginas (D1), validada por teste, e não gerada por script.

## Complexity Tracking

| Desvio | Por quê | Alternativa mais simples rejeitada porque |
|---|---|---|
| FR-002 pede "fonte única" do invólucro, mas o plano repete a marcação nas 5 páginas | FR-003/FR-018 exigem navegação funcional sem JS; sem build nem includes de servidor, só HTML estático cumpre isso | Injetar o cabeçalho por JS deixaria o site sem navegação se o script falhar; adicionar etapa de build contraria o DOC-09. Mitigação: `site-shell.test.js` falha se as páginas divergirem, e a spec foi ajustada (FR-002/SC-010) |
