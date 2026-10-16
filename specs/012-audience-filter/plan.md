# Implementation Plan: Filtro por público-alvo

**Branch**: `012-audience-filter` | **Date**: 2026-10-12 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/012-audience-filter/spec.md`

## Summary

Acrescentar à página Explorar um quarto filtro de seleção única, "Público-alvo", no mesmo modelo de unidade e categoria: opções vindas de `GET /audiences/`, critério `audience` no endereço e na consulta a `/activities/`, limpeza junto com os demais. O card compartilhado passa a mostrar `target_audiences` quando houver. Nenhuma biblioteca nova: a mudança estende os módulos existentes (`public.js`, `url-state.js`, `search-form.js`, `filter-options.js`, `activity-card.js`, `snapshot.js`, `explore.js`) e o HTML/CSS da Explorar. A Início não ganha o filtro.

## Technical Context

**Language/Version**: JavaScript (ES modules) puro, HTML e CSS; sem build

**Primary Dependencies**: nenhuma em produção; testes com Vitest + jsdom e Playwright (+ axe)

**Storage**: `sessionStorage` apenas para a cópia de resultados da Explorar (já existente)

**Testing**: `npm test` (unitários), `npm run test:e2e`, `npm run test:a11y`, `npm run test:contract` (contra a API real)

**Target Platform**: navegadores modernos, desktop e mobile (≥ 320 px)

**Project Type**: site estático consumindo a API REST pública do backend

**Performance Goals**: sem consulta por digitação; uma consulta adicional na abertura (`/audiences/`), em paralelo com as outras

**Constraints**: somente `GET`; sem reclassificar resultados no navegador; dados da API sempre via `textContent`; acessibilidade já adotada (DOC-15)

**Scale/Scope**: 1 página alterada (Explorar), 1 componente compartilhado (card), ~7 módulos JS

## Constitution Check

`.specify/memory/constitution.md` é o modelo não preenchido: não há princípios formais. Aplicam-se, por convenção do projeto, os documentos em `docs/` (DOC-09 a DOC-21). Gate: sem violações previstas — mudança aditiva, sem nova dependência, mantendo acessibilidade e identidade visual. Reavaliado após o desenho: sem alteração.

## Project Structure

### Documentation (this feature)

```text
specs/012-audience-filter/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api-usage.md
│   └── explore-url.md
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
explorar.html                     # novo <select id="filter-audience">
css/components.css                # linha de público no card (e layout dos filtros, se preciso)
js/api/public.js                  # fetchAudiences()
js/home/filter-options.js         # audienceSelect opcional, falha independente
js/explore/url-state.js           # critério audience (leitura, escrita, toApiParams)
js/explore/search-form.js         # audienceSelect no rascunho, setCriteria e loadOptions
js/explore/snapshot.js            # pick() inclui target_audiences
js/components/activity-card.js    # linha de público opcional
js/pages/explore.js               # fiação do novo select e do descarte de opção removida
tests/unit/ tests/e2e/ tests/contract/ tests/fixtures/
docs/                             # backlog, DOC-13 e contrato consumido
```

**Structure Decision**: manter o layout atual de arquivos; nenhuma pasta nova.

## Complexity Tracking

Sem violações a justificar.
