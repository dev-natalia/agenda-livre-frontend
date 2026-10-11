# Research: Página inicial

Decisões da Fase 0. Não restaram incógnitas técnicas.

## D1 — Fonte de verdade do contrato

- **Decision**: usar `agenda-livre-backend/specs/006-public-consultation/contracts/public-api.md` e o código real do backend (`apps/consultation/services.py`).
- **Findings**: `GET /activities/` aceita `q` (≤ 100), `unit`, `category` (UUID), `date`, `date_from`, `date_to`, `page`, `page_size` (máx. 50); só `PUBLISHED`; ordenado pela próxima ocorrência. Com `date_from`/`date_to`, `build_listing` **descarta** atividades sem ocorrência na janela. Logo `date_from=<hoje>&page_size=3` devolve apenas atividades com ocorrência futura, já ordenadas. `/units/` e `/categories/` devolvem registros ativos por nome, paginados (padrão 12, máx. 50).
- **Rationale**: evita duplicar regras (publicação, recorrência, ordem) no navegador (DOC-13 §7.4).
- **Alternatives**: consultar sem filtro de data e descartar `next_occurrence: null` no cliente (rejeitada: pode devolver 3 itens sem ocorrência e esvaziar a seção).

## D2 — Módulo de acesso à API

- **Decision**: `js/api/public.js` com `fetchUpcomingActivities(scope)`, `fetchUnits(scope)`, `fetchCategories(scope)`, usando `request`/`createRequestScope` de `client.js` (parâmetros `date_from`, `page_size`).
- **Rationale**: caminhos e parâmetros do contrato em um só lugar, reaproveitável por Explorar e Detalhes; `buildUrl` já descarta valores vazios.
- **Alternatives**: chamar `request` direto em `home.js` (rejeitada: espalha o contrato).

## D3 — Pesquisa por GET nativo, interceptada só para limpar o endereço

- **Decision**: `<form action="explorar.html" method="get">` com `name="q"`, `name="unit"`, `name="category"`, `name="period"`. Em JS, o `submit` é interceptado: monta o endereço com `buildExploreUrl` (sem padrões/vazios e com o período convertido em `date`/`date_from`/`date_to`) e navega com `location.assign`. Sem JS, o envio nativo leva `?q=&unit=&category=&period=` a `explorar.html` (degrada, sem quebrar).
- **Rationale**: Enter e botão funcionam sem código; o endereço final sai limpo e conforme a API. O `period` bruto só existe no fallback sem JS.
- **Alternatives**: `<button>` com `click` apenas (rejeitada: perde Enter e acessibilidade nativa do formulário); `period` como parâmetro público na URL (rejeitada: o spec e o DOC-13 exigem parâmetros do contrato da API).

## D4 — Períodos

- **Decision**: chaves `any` (padrão), `today`, `week`, `month`. `periodRange(key, hoje)`: `today` → `{date: hoje}`; `week` → `{date_from: hoje, date_to: hoje+6}`; `month` → `{date_from: hoje, date_to: último dia do mês}`; `any` → `{}`. "Hoje" é o dia do calendário em `America/Sao_Paulo`, obtido com `Intl.DateTimeFormat("en-CA", {timeZone})` e aritmética de calendário em UTC.
- **Rationale**: só usa filtros que a API suporta (`date` não combina com `date_from`/`date_to`, e o módulo respeita isso); fuso igual ao da API evita divergência perto da meia-noite; a janela máxima (≤ 31 dias) está abaixo do limite de 366.
- **Alternatives**: períodos como "Este fim de semana" (rejeitada: exige regra de calendário a mais e confirmação de produto); relógio do dispositivo (rejeitada: fuso diferente do da API).

## D5 — Seção de próximas atividades

- **Decision**: `upcoming-activities.js` usa `createRegionState({content, status, skeletonCount: 3})` e um `createRequestScope()`. Fluxo: `showLoading` → `run` → `showSuccess(cards, {announce})` / `showEmpty` / `showError(err, {onRetry})`. Skeletons e `aria-hidden` já vêm do componente. O botão de retry já se desabilita enquanto a nova consulta roda (cobre FR-028); `createRequestScope` cobre resposta atrasada.
- **Rationale**: reuso integral dos componentes da feature 003; zero lógica de anúncio nova; o foco não é tocado.
- **Alternatives**: reimplementar estados na página (rejeitada: duplicaria 003).

## D6 — Cards e filtragem defensiva

- **Decision**: `createActivityCard(activity, {headingLevel: 3})`; itens que retornam `null` (sem `id`/`title`) são ignorados, e a contagem anunciada usa os cards efetivamente criados. Se nenhum sobrar, `showEmpty`. Sem recalcular ordem nem status.
- **Rationale**: robustez a dados incompletos sem duplicar regras.

## D7 — Opções dos filtros

- **Decision**: `loadFilterOptions()` faz `fetchUnits` e `fetchCategories` com `page_size=50`, em paralelo com as próximas atividades e **sem** mostrar estado de carregamento bloqueante. Os `<select>` já nascem no HTML com a opção "todas"; as opções são acrescentadas ao chegar (valor = UUID, texto = nome via `textContent`). Em falha, permanece só "todas" e um aviso curto (`<p>` ligado por `aria-describedby`, anunciado pela região de status da seção de pesquisa) informa que as opções não puderam ser carregadas.
- **Rationale**: pesquisa por nome continua utilizável imediatamente; sem salto de foco; tolerância a falha parcial (FR-013, FR-014).
- **Alternatives**: bloquear o formulário até carregar (rejeitada); mostrar botão de retry nas opções (rejeitada: fora do escopo; recarregar a página resolve).

## D8 — Visual, ilustração e responsividade

- **Decision**: ilustração decorativa em SVG próprio (`images/hero-culture.svg`, `alt=""`, dimensões explícitas para evitar salto de layout), escondida em larguras muito estreitas conforme o DOC-12 mobile (mostrada abaixo do título). Estilos usam somente tokens e pontos de quebra da feature 004; grade de cards já existente (`.card-grid`); formulário em coluna no celular e em linha a partir do breakpoint de tablet.
- **Rationale**: o backend não fornece imagens; nenhum arquivo externo ou CDN; reflow a 320 px garantido pelo layout fluido.
- **Alternatives**: foto de banco de imagens (rejeitada: licença e peso).

## D9 — Estratégia de testes

- **Decision**: pirâmide como no DOC-14: unitários para lógica pura e orquestração com DOM em jsdom; Playwright com `page.route` simulando `http://localhost:8000/api/v1/**` (padrão de `api-error-retry.spec.js`: sobrescrever `config.js`), incluindo respostas lentas, `500`, `429` e rede caída; axe em carregando, sucesso, vazio e erro; contagem de requisições registrada para provar zero consultas durante digitação/seleção.
- **Rationale**: determinismo sem backend real; verificação real com a API fica no roteiro manual do `quickstart.md`.

## D10 — Itens fora do escopo e riscos

- Explorar ainda mostra "em breve" (épico 06): a Início só garante o endereço correto (contrato `explore-url.md`).
- Sem imagem na API (PENDENCIAS-BACKEND): fallback visual é o caso normal.
- Mais de 50 unidades/categorias: só as 50 primeiras; registrar como melhoria futura.
