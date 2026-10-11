# Implementation Plan: Estrutura inicial e configuração do frontend

**Branch**: `001-frontend-structure-config` | **Date**: 2026-10-11 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-frontend-structure-config/spec.md`

## Summary

Criar a base do frontend público do Agenda Livre: cinco páginas HTML estáticas (Início, Explorar, Detalhes, Sobre, Contato) com CSS e ES Modules organizados por responsabilidade, sem framework nem roteador SPA, e um único ponto de configuração da URL base da API (`js/config.js`) com validação (ausente, malformada, esquema não permitido, normalização de barra final, bloqueio de HTTP fora do ambiente local) e mensagem compreensível ao usuário. Testes unitários com Vitest cobrem a validação. O README descreve a organização real e como servir localmente.

## Technical Context

**Language/Version**: HTML5, CSS3, JavaScript ES2022 (ES Modules no navegador); Node.js 20+ apenas para ferramentas de teste

**Primary Dependencies**: nenhuma em produção; dev: `vitest`, `jsdom` (teste do aviso de configuração)

**Storage**: N/A (arquivos estáticos)

**Testing**: Vitest (unitário), conforme DOC-14 e FE-041; Playwright/axe ficam para features posteriores

**Target Platform**: navegadores modernos, servidos como arquivos estáticos (hospedagem ainda indefinida, DOC-09)

**Project Type**: web, frontend estático separado do backend Django

**Performance Goals**: sem requisitos específicos; páginas leves, sem etapa de build

**Constraints**: sem framework/SPA; sem segredos em arquivos públicos; links relativos (funcionar em subcaminho); conteúdo estático legível sem JavaScript; módulos tolerantes à ausência de elementos

**Scale/Scope**: 5 páginas, 1 módulo de configuração, 1 componente de aviso, 2 arquivos de teste

## Constitution Check

A constituição do projeto (`.specify/memory/constitution.md`) ainda é o modelo não preenchido; não há princípios a avaliar. As restrições efetivas vêm dos DOC-09/DOC-14/DOC-15 e foram usadas como gates:

- Sem framework frontend nem SPA (DOC-09): PASS
- Configuração única, só valores públicos (DOC-09 §8.1): PASS
- Sem arquivos vazios (DOC-09 §6, DOC-14): PASS
- Base de acessibilidade (`lang="pt-BR"`, título distinto, landmarks): PASS

Reavaliação pós-design: sem violações; Complexity Tracking não se aplica.

## Project Structure

### Documentation (this feature)

```text
specs/001-frontend-structure-config/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── config-module.md
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
index.html
explorar.html
atividade.html
sobre.html
contato.html
README.md
package.json            # scripts de teste e devDependencies
assets/                 # images/, icons/, fonts/ só quando houver conteúdo
css/
├── tokens.css          # variáveis visuais mínimas
├── base.css            # estilos globais e foco visível
└── layout.css
js/
├── config.js           # ÚNICO ponto da URL base da API + validação
├── components/
│   └── config-notice.js  # exibe aviso de configuração ausente/inválida
└── pages/
    ├── home.js
    ├── explore.js
    ├── activity-details.js
    ├── about.js
    └── contact.js
tests/
└── unit/
    ├── config.test.js
    └── config-notice.test.js
```

**Structure Decision**: o repositório é o próprio frontend (sem subpasta `frontend/`), seguindo a proposta do DOC-09 §6. `css/components.css`, `css/pages.css`, `js/api/`, `js/utils/` e `assets/*` só são criados pelas features que os usam (FR-007). Cada `js/pages/*.js` existe porque a página o importa; nesta feature ele apenas verifica a configuração e inicializa com guarda de elementos. Decisões em [research.md](research.md).

## Complexity Tracking

Sem violações a justificar.
