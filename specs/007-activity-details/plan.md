# Implementation Plan: Detalhes das atividades

**Branch**: `007-activity-details` | **Date**: 2026-10-12 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/007-activity-details/spec.md`

## Summary

Entregar o épico EP-FE-07 (FE-027 a FE-029) em `atividade.html`, hoje um esqueleto, reutilizando o cliente da API e o escopo de requisição (002), `createRegionState`, o estado de erro e o aviso de configuração (003), os tokens e estilos (004), o formatador de datas (`js/utils/format.js`) e o visual de imagem ausente do card. Escolhas: (1) `GET /activities/{id}/` via nova `fetchActivityDetails(id, { scope })` em `js/api/public.js`, com validação prévia do UUID (identificador ausente ou inválido nunca chega à API); (2) **estado único** de "não encontrada ou não disponível" para `404`, `id` ausente e `id` inválido, porque a API não distingue cancelada, encerrada e inexistente; erros de comunicação seguem o fluxo "Tentar novamente"; (3) módulos sem DOM em `js/details/` (`id.js`, `external-link.js`, `schedule-model.js`) e um módulo de renderização (`render.js`) que usa só `textContent`/atributos, omitindo seções vazias; (4) link externo validado no frontend (só `http`/`https`), em nova aba com `rel="noopener noreferrer"` e texto/`aria-label` que informam site externo e nova aba; (5) "Voltar para atividades": se a pessoa veio da Explorar (mesma origem, `document.referrer` em `explorar.html`) o clique aciona `history.back()`, o que reaproveita a restauração da feature 006 (cópia, página, rolagem); caso contrário é um link normal para `explorar.html`; (6) título do documento atualizado por estado; (7) `<noscript>` estático. `js/pages/activity-details.js` só orquestra.

## Technical Context

**Language/Version**: HTML5, CSS3, JavaScript ES2022 (ES Modules); Node.js 20+ apenas para testes

**Primary Dependencies**: nenhuma em produção; dev: `vitest`, `jsdom`, `@playwright/test`, `@axe-core/playwright` (existentes)

**Storage**: nenhum; não lê nem grava `sessionStorage` (a restauração da listagem é da feature 006)

**Testing**: Vitest (validação do id; validação do link externo com esquemas perigosos; modelo de programações pontual/recorrente/sem data; renderização com campos ausentes, HTML literal em texto e quebras de linha; `fetchActivityDetails`; página por estado com `fake-fetch`: esqueleto, sucesso, `404`, id inválido sem requisição, erro com retry sem consultas duplicadas, resposta atrasada ignorada, título do documento); Playwright com API simulada por `page.route` (fluxos das 3 histórias, voltar vindo da Explorar com estado restaurado e sem histórico, link externo em nova aba, 320 px/200 %, `reducedMotion`, axe em todos os estados); revisão manual com leitor de tela registrada em `quickstart.md`

**Target Platform**: navegadores modernos, arquivos estáticos

**Project Type**: web, frontend estático separado do backend Django

**Performance Goals**: conteúdo completo em < 2 s após a resposta (SC-004); 1 requisição na abertura; 0 requisições para id ausente ou inválido

**Constraints**: sem framework nem roteador; sem `innerHTML` com dados da API; nenhuma regra de negócio duplicada (publicação, ordem e ocorrências vêm da API); nenhum valor de cor/tamanho fora dos tokens; contrato da API inalterado; endereço dos cards (`atividade.html?id=`) inalterado; página legível sem JavaScript apenas pela mensagem estática e pela navegação

**Scale/Scope**: 1 página HTML alterada (`atividade.html`), 4 módulos novos em `js/details/`, `js/api/public.js` ampliado (1 função), `js/pages/activity-details.js` reescrito, bloco de CSS (cabeçalho da atividade, programações, link externo, estado não encontrada), ~6 specs de teste novas

## Constitution Check

A constituição (`.specify/memory/constitution.md`) segue como modelo não preenchido; os gates vêm do DOC-09 §9, DOC-12 §6, DOC-13 §8/§9/§12, DOC-15 e das decisões das features 001–006:

- HTML/CSS/JS puros, ES Modules, sem framework nem roteador (DOC-09): PASS
- Comunicação só pelo cliente da API existente (002): PASS (D1)
- URL direta e compartilhável por atividade (DOC-13 §8): PASS (D1)
- Campos opcionais ausentes não geram rótulos nem espaços vazios (DOC-12 §6.4): PASS (D4)
- Link externo só com URL válida, nova aba, segura, indicado de forma acessível (DOC-13 §8): PASS (D5)
- Distinção indisponível × inexistente só quando o contrato permite; sem expor dados privados (DOC-13 §9): PASS (D2)
- Ordem e ocorrências vêm da API; sem recálculo no navegador (DOC-09): PASS (D4)
- Retorno preserva busca, filtros e página quando possível (DOC-13 §7.5): PASS (D6)
- Região de status única, foco previsível, esqueleto oculto das tecnologias assistivas (DOC-13 §12): PASS (D7)
- Resposta antiga nunca sobrescreve a recente (DOC-09 §8.5): PASS (D3)
- Dados da API só via `textContent`/atributos (003): PASS (D4)
- Tokens e estilos compartilhados, WCAG 2.2 AA, reflow 320 px, movimento reduzido (004, DOC-15): PASS (D8)

Reavaliação pós-design: sem violações. Sem entradas em Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/007-activity-details/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── details-url.md        # endereço dos detalhes: leitura do id e caminho de volta
│   └── api-usage.md          # consulta do detalhe e tratamento de cada resposta
├── checklists/requirements.md
└── tasks.md                  # gerado por /speckit-tasks
```

### Source Code (repository root)

```text
atividade.html                   # título, regiões de status/conteúdo, noscript
js/
├── api/
│   └── public.js                # + fetchActivityDetails(id, { scope, fetchImpl })
├── details/
│   ├── id.js                    # NOVO: parseActivityId(search) → uuid em minúsculas ou null
│   ├── external-link.js         # NOVO: safeExternalUrl(value) → URL http(s) ou null
│   ├── schedule-model.js        # NOVO: scheduleViews(schedules, occurrences) (pura)
│   └── render.js                # NOVO: renderDetails(data) → nós; renderNotFound(); omite seções vazias
└── pages/
    └── activity-details.js      # orquestra: nav, aviso de config, consulta, estados, título, voltar
css/
├── layout.css                   # + .activity-details (cabeçalho, seções, lista de programações)
└── components.css               # + .external-link, .not-found (reuso de .button e region-state)

tests/
├── unit/
│   ├── details-id.test.js
│   ├── details-external-link.test.js
│   ├── details-schedule-model.test.js
│   ├── details-render.test.js
│   ├── details-page.test.js
│   └── public-api.test.js       # + fetchActivityDetails
└── e2e/
    ├── details-content.spec.js
    ├── details-states.spec.js
    ├── details-external-link.spec.js
    ├── details-return.spec.js
    └── details-accessibility.spec.js
```

**Structure Decision**: Mantém o frontend estático por página. Lógica sem DOM em `id.js`, `external-link.js` e `schedule-model.js` (testáveis em Node); efeitos de DOM em `render.js`; a página orquestra, no padrão `init()` das demais. A formatação de data e horário reutiliza `js/utils/format.js` (estendido apenas se faltar formatar data completa de período, sem alterar o formato do card).

## Complexity Tracking

Sem violações a justificar.
