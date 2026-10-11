---

description: "Task list for feature 001 - Estrutura inicial e configuração do frontend"
---

# Tasks: Estrutura inicial e configuração do frontend

**Input**: Design documents from `/specs/001-frontend-structure-config/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/config-module.md, quickstart.md

**Tests**: Incluídos apenas para a configuração, pois o FR-016 os exige. Vitest, sem arquivos de teste vazios.

**Organization**: Tarefas agrupadas por user story. Caminhos relativos à raiz do repositório (que é o próprio frontend).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[Story]**: US1 = páginas abrem direto (P1), US2 = documentação (P2), US3 = URL base da API (P1)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Ferramentas de teste e estilos mínimos compartilhados

- [X] T001 Criar `package.json` na raiz com `"type": "module"`, devDependencies `vitest` e `jsdom`, e scripts `test` (`vitest run`) e `test:watch` (`vitest`); sem dependências de produção
- [X] T002 [P] Criar `.gitignore` na raiz ignorando `node_modules/`
- [X] T003 [P] Criar `vitest.config.js` na raiz: `include: ["tests/unit/**/*.test.js"]`, ambiente padrão `node`
- [X] T004 [P] Criar `css/tokens.css` com variáveis mínimas (cores de texto/fundo com contraste adequado, família de fonte, espaçamentos, cor e espessura do foco)
- [X] T005 [P] Criar `css/base.css` com reset mínimo, tipografia legível, `:focus-visible` usando os tokens e estilo da região de aviso (`.config-notice`)
- [X] T006 [P] Criar `css/layout.css` com largura máxima do conteúdo e espaçamento de `header`, `main` e `footer`

**Checkpoint**: `npm install` e `npm test` executam (ainda sem testes, a suíte pode relatar "no test files" até a Phase 4)

---

## Phase 2: Foundational (Blocking Prerequisites)

Nenhuma tarefa bloqueante além da Phase 1: as user stories compartilham apenas os estilos criados acima.

---

## Phase 3: User Story 1 - Abrir qualquer página pública diretamente (Priority: P1) 🎯 MVP

**Goal**: Cinco páginas HTML estáticas, cada uma abrindo direto pela URL, com estilos e módulo de script próprio, sem framework nem SPA.

**Independent Test**: Servir a raiz como estático, abrir cada uma das cinco páginas diretamente e verificar zero erros no console, estilos aplicados e módulo carregado.

- [X] T007 [P] [US1] Criar `index.html` (Início): `<html lang="pt-BR">`, `<title>` distinto ("Início — Agenda Livre"), `<meta charset>` e viewport, links para `css/tokens.css`, `css/base.css`, `css/layout.css` (caminhos relativos), `header`, `main` com `<h1>`, `footer`, e `<script type="module" src="js/pages/home.js">`
- [X] T008 [P] [US1] Criar `explorar.html` (Explorar atividades) com a mesma estrutura de T007, título distinto e `<script type="module" src="js/pages/explore.js">`
- [X] T009 [P] [US1] Criar `atividade.html` (Detalhes da atividade) com a mesma estrutura, título distinto e `<script type="module" src="js/pages/activity-details.js">`; carrega sem erro mesmo sem parâmetro de atividade na URL
- [X] T010 [P] [US1] Criar `sobre.html` (Sobre) com a mesma estrutura, título distinto e `<script type="module" src="js/pages/about.js">`
- [X] T011 [P] [US1] Criar `contato.html` (Contato) com a mesma estrutura, título distinto e `<script type="module" src="js/pages/contact.js">`
- [X] T012 [P] [US1] Criar `js/pages/home.js` exportando `init()` que verifica `document.querySelector("main")` antes de agir, e executando `init()` ao carregar; sem acessar elementos de outras páginas
- [X] T013 [P] [US1] Criar `js/pages/explore.js` com o mesmo padrão de T012 (guarda de elementos, `init()`)
- [X] T014 [P] [US1] Criar `js/pages/activity-details.js` com o mesmo padrão de T012; não lê nem exige parâmetro de URL nesta feature
- [X] T015 [P] [US1] Criar `js/pages/about.js` com o mesmo padrão de T012
- [X] T016 [P] [US1] Criar `js/pages/contact.js` com o mesmo padrão de T012
- [X] T017 [US1] Verificar manualmente (quickstart passos 2, 3, 6 e 7): servir com `python -m http.server 5500`, abrir as cinco páginas, confirmar zero erros no console e conteúdo visível com JavaScript desativado; corrigir caminhos relativos se necessário

**Checkpoint**: as cinco páginas abrem e funcionam isoladamente.

---

## Phase 4: User Story 3 - Configurar a URL base da API em um único lugar (Priority: P1)

**Goal**: `js/config.js` como único ponto da URL base, com validação, aviso compreensível e bloqueio de uso quando inválida.

**Independent Test**: Alterar apenas `js/config.js` para outra URL válida e ver o frontend usá-la; esvaziar ou invalidar o valor e ver o aviso, sem requisições à API.

### Tests for User Story 3 (FR-016)

> Escrever primeiro e confirmar que falham antes de implementar.

- [X] T018 [P] [US3] Criar `tests/unit/config.test.js` cobrindo `resolveConfig`: válida com e sem barra final (resultado igual, sem barra final); ausente (`undefined`, `""`, só espaços → `missing`, `apiBaseUrl` null); malformada (`abc` → `invalid`); esquemas não permitidos (`javascript:alert(1)`, `file:///x`, `ftp://x` → `invalid`); `http:` com hostname `localhost`, `127.0.0.1` e `[::1]` → `valid`; `http:` com `site.exemplo.org` → `insecure` com URL normalizada; `https:` em qualquer host → `valid`; mensagens em pt-BR sem detalhes técnicos; `getApiBaseUrl` lança Error quando status ≠ `valid`
- [X] T019 [P] [US3] Criar `tests/unit/config-notice.test.js` (ambiente jsdom via `// @vitest-environment jsdom`) cobrindo `showConfigNotice`: status ≠ `valid` insere `role="alert"` com a mensagem no início de `<main>`; `valid` não insere nada; chamada repetida não duplica; sem `<main>` não lança erro

### Implementation for User Story 3

- [X] T020 [US3] Criar `js/config.js` conforme `contracts/config-module.md`: `PUBLIC_CONFIG = { apiBaseUrl: "http://localhost:8000/api/v1" }` (único endereço de API do projeto, comentário informando que só valores públicos são permitidos), `resolveConfig(rawUrl, { hostname })` usando `new URL()` com as regras de `data-model.md` (só http/https; remove barras finais; `insecure` = http fora de localhost/127.0.0.1/[::1]; mensagens pt-BR), `getConfigStatus()` e `getApiBaseUrl()`
- [X] T021 [US3] Criar `js/components/config-notice.js` exportando `showConfigNotice(state, root = document)` conforme o contrato: `<div class="config-notice" role="alert">` como primeiro filho de `<main>`, idempotente, sem efeito sem `<main>`
- [X] T022 [US3] Atualizar `js/pages/home.js`, `explore.js`, `activity-details.js`, `about.js` e `contact.js` para, em `init()`, chamar `showConfigNotice(getConfigStatus())` importando de `../config.js` e `../components/config-notice.js`
- [X] T023 [US3] Rodar `npm test` e confirmar que T018 e T019 passam
- [X] T024 [US3] Verificar manualmente (quickstart passos 4 e 5): trocar a URL em `js/config.js`; esvaziá-la; usar `abc` e `javascript:alert(1)`; confirmar os avisos, a ausência de requisições na aba Rede e que `grep -rn "localhost:8000\|/api/v1" js` só encontra `js/config.js`; restaurar o valor padrão

**Checkpoint**: configuração única, validada e testada.

---

## Phase 5: User Story 2 - Entender e manter a organização do projeto (Priority: P2)

**Goal**: README com a organização real, responsabilidades e como servir localmente.

**Independent Test**: Alguém que não participou lê só o README e consegue servir o site, abrir as cinco páginas e dizer onde adicionar página, estilo e módulo.

- [X] T025 [US2] Criar `README.md` na raiz em português com: propósito do frontend; pré-requisitos; como servir localmente (`python -m http.server 5500` ou `npx serve -l 5500`, explicando que ES Modules exigem HTTP e não `file://`); lista das cinco páginas e URLs; árvore real de diretórios com a responsabilidade de cada pasta e arquivo (conforme a estrutura efetivamente criada, destacando diferenças da proposta do DOC-09); onde e como alterar a URL base da API por ambiente (`js/config.js`, só valores públicos); nota de CORS (`CORS_ALLOWED_ORIGINS` no backend deve incluir a origem do frontend); como rodar `npm test`; como adicionar nova página, estilo e módulo; convenção de não criar arquivos vazios
- [X] T026 [US2] Conferir se a árvore descrita em `README.md` coincide exatamente com os arquivos existentes e ajustar o que divergir

**Checkpoint**: a documentação descreve a estrutura real.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T027 [P] Inspecionar o repositório: nenhum arquivo vazio sem função e nenhum segredo/token/credencial em `js/`, `css/`, HTML ou `package.json` (SC-005)
- [X] T028 [P] Verificar que links e referências a CSS/JS são relativos, abrindo o site servido a partir de um subcaminho (ex.: servir a pasta pai e abrir `/agenda-livre-frontend/index.html`)
- [X] T029 Executar o checklist completo de `quickstart.md` e registrar divergências a corrigir

---

## Dependencies & Execution Order

- **Phase 1** → sem dependências; T002–T006 em paralelo após T001 (T001 antes de T003 por usar `vitest`).
- **Phase 3 (US1)**: depende de T004–T006 (CSS). T007–T016 em paralelo; T017 depois deles.
- **Phase 4 (US3)**: depende da Phase 1; T022 depende de T012–T016, T020 e T021. Testes T018/T019 antes de T020/T021.
- **Phase 5 (US2)**: depende de US1 e US3 concluídas (a árvore real precisa existir).
- **Phase 6**: depois de todas as histórias.

### Parallel Opportunities

- US1: T007–T016 (dez arquivos independentes).
- US3: T018 e T019 juntos; T020 e T021 juntos após os testes.
- Phase 1: T002–T006.

### Parallel Example: User Story 1

```text
T007 index.html | T008 explorar.html | T009 atividade.html | T010 sobre.html | T011 contato.html
T012 home.js | T013 explore.js | T014 activity-details.js | T015 about.js | T016 contact.js
```

## Implementation Strategy

- **MVP**: Phase 1 + US1 (cinco páginas abrindo direto). US3 entrega em seguida o outro item P1 e deve ir junto antes de qualquer feature que chame a API.
- **Incremental**: US1 → US3 → US2 → Polish; validar cada checkpoint antes de avançar.
- **Fora de escopo**: cliente HTTP, navegação compartilhada, design system completo, conteúdo funcional das páginas e Playwright/axe (features seguintes).
