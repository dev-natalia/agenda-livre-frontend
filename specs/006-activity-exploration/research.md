# Pesquisa e decisões: Exploração de atividades

Sem `NEEDS CLARIFICATION` pendente. Cada decisão abaixo resolve uma escolha de projeto da spec. Referências: DOC-09, DOC-12 §5, DOC-13 §7, DOC-15, contrato da API (`agenda-livre-backend/specs/006-public-consultation/contracts/public-api.md`) e `docs/PENDENCIAS-BACKEND.md`.

## D1 — Módulos e reuso

- **Decisão**: lógica nova em `js/explore/` (`url-state`, `listing`, `snapshot`, `pagination-model`) e componente `js/components/pagination.js`. Reutiliza, no lugar, `normalizeTerm`, `MAX_TERM_LENGTH`, `PERIODS`, `periodRange` (`js/home/search-criteria.js`) e `fillSelect`/`initFilterOptions` (`js/home/filter-options.js`).
- **Motivo**: a Explorar usa os mesmos nomes de parâmetro, as mesmas janelas de período e as mesmas opções de filtro que a Início; duplicar criaria regras divergentes.
- **Alternativas**: mover para `js/shared/` agora (amplia o diff da 005, ainda em PR); copiar (duplicação). Rejeitadas.

## D2 — Consulta da listagem

- **Decisão**: `fetchActivities({ criteria, page, scope })` em `js/api/public.js`: `GET /activities/` com `q`, `unit`, `category`, `date`/`date_from`/`date_to` (apenas os presentes), `page` (omitido na 1) e `page_size=12` fixo. Nenhum filtro `neighborhood`.
- **Motivo**: contrato da API; 12 é o padrão do backend e múltiplo da grade de 3 colunas; bairro não consta no backlog nem nos wireframes.
- **Alternativas**: `page_size` maior (menos páginas, mas cards demais por tela e skeletons mais longos); expor bairro (fora do escopo).

## D3 — URL como fonte da verdade e histórico

- **Decisão**: o endereço é lido por `parseExploreSearch(search, hoje)` → critérios normalizados + página; escrito por `buildExploreSearch(criteria, page)` com ordem estável `q, unit, category, date, date_from, date_to, page`. Aplicar, limpar e trocar de página usam `history.pushState`; normalização inicial e fallback de página usam `replaceState`; `popstate` relê o endereço e recarrega (via cópia, se válida). Sem roteador: apenas a API de histórico nativa.
- **Motivo**: DOC-09 §9 pede URL compartilhável e histórico nativo; `pushState` evita recarregar a página inteira a cada filtro e mantém voltar/avançar coerente (FR-014).
- **Alternativas**: navegação completa por GET a cada filtro (recarrega a página, perde a cópia em memória e os anúncios; porém é o fallback sem JavaScript); só `replaceState` (voltar sairia da página).

## D4 — Rascunho versus critérios aplicados

- **Decisão**: dois estados: *rascunho* (valores nos campos) e *aplicados* (último endereço consultado). Nenhum listener de `input`/`change` consulta; "Filtrar" (clique ou Enter no formulário) lê o rascunho, normaliza e aplica; "Limpar filtros" zera campos e aplicados e consulta direto; popstate e carga inicial sobrescrevem o rascunho com os aplicados.
- **Motivo**: FR-006/FR-007: resultados atuais intactos até aplicar; Enter submete o formulário nativo.

## D5 — Região de status e foco

- **Decisão**: uma região `role="status"` (a do `createRegionState`) anuncia carregamento ("Carregando atividades…"), conclusão com total ("12 atividades encontradas."), vazio e erro. O texto visível do total fica em um `<p>` fora da região viva (evita anúncio duplo) e é ocultado durante o carregamento. O foco não se move por atualização. Exceção deliberada: ao acionar um **link de página** o elemento focado é destruído na reconstrução, então o foco vai para o título "Resultados" (`tabindex="-1"`), que é o início da lista; "Filtrar", "Limpar filtros" e "Tentar novamente" mantêm o foco (este último já usa o contêiner do erro).
- **Motivo**: DOC-13 §3/§7.2; o foco não pode ficar em elemento removido.
- **Alternativas**: manter a paginação montada durante o carregamento (foco preservado, mas links ativos sobre dados antigos); rejeitada por permitir cliques em páginas obsoletas.

## D6 — Total confiável e ordem

- **Decisão**: `count` válido (inteiro ≥ 0) é o total. Resumo: `count === 1` → "1 atividade encontrada"; senão "N atividades encontradas". `count` ausente ou inválido → sem resumo e paginação reduzida a anterior/próxima conforme `previous`/`next`. A ordem dos `results` é preservada; nenhum `sort` no frontend.
- **Motivo**: FR-019/FR-022; a ordenação é responsabilidade do backend (DOC-09 §8.4).

## D7 — Paginação

- **Decisão**: `totalPages = ceil(count / 12)`; paginação oculta se `totalPages ≤ 1`. Itens via `pageItems(current, total)`: primeira, última, atual ±1 e reticências, no máximo 7 itens, de modo que cabe em 320 px. Cada número é um `<a href="explorar.html?…&page=N">`; a atual é `<a aria-current="page">` sem ação extra (ou texto), com rótulo "Página N, atual". "Anterior"/"Próxima" indisponíveis viram `<span aria-disabled="true">` (não focáveis). Clique simples é interceptado para `pushState` + consulta; Ctrl/Cmd/botão do meio abrem a página normalmente.
- **Motivo**: DOC-13 §7.3 (links navegam; estados indisponíveis comunicados); links reais funcionam sem JavaScript e permitem abrir em nova aba.
- **Alternativas**: botões (não são endereços compartilháveis); lista completa de números (estoura 320 px com muitas páginas).

## D8 — Página fora do intervalo

- **Decisão**: erro `bad_request` com `fieldErrors.page`, ou `not_found`, em consulta com `page > 1`, dispara `replaceState` removendo `page` e uma nova consulta da página 1, uma única vez por navegação (sem laço). Para `page = 1` esses erros seguem como erro comum.
- **Motivo**: o backend responde `400` hoje, o contrato diz `404` (pendência aberta); tratar ambos torna a interface imune à decisão do backend. `page` inválido na URL (≤ 0, não numérico) já é normalizado antes de consultar (D3).

## D9 — Opções de filtro e critérios do endereço

- **Decisão**: `initFilterOptions` carrega unidades e categorias em paralelo com a primeira listagem (sem esperar). Depois de preenchidas, o valor vindo do endereço é aplicado ao `<select>`; se o id não existir e a lista carregou, o critério é descartado, o endereço é reescrito (`replaceState`), um aviso informa que o filtro não pôde ser aplicado e a listagem é refeita sem ele. Se a lista falhou, o critério é mantido e enviado (a API trata UUID inexistente como lista vazia).
- **Motivo**: não bloquear a listagem por uma consulta secundária (FR-011), sem deixar o campo inconsistente com os resultados.
- **Alternativas**: aguardar as opções antes de listar (atrasa o conteúdo principal até o tempo limite se a API de opções estiver lenta).

## D10 — Concorrência

- **Decisão**: `createRequestScope()` próprio para a listagem (cancela a anterior) e outro para as opções. Controles que disparam consulta ficam protegidos enquanto a consulta de mesma chave está em andamento (clique repetido em "Tentar novamente" já é tratado por `renderErrorState`); respostas canceladas viram `cancelled` e são ignoradas.
- **Motivo**: FR-030; padrão já validado na feature 005.

## D11 — Visual e responsividade

- **Decisão**: barra horizontal de filtros a partir de 48 rem e coluna abaixo; grade de cards 3/2/1 colunas já existente (`.card-grid`); paginação em linha com quebra; estados com tokens existentes; esqueletos sem animação em `prefers-reduced-motion` (regra central da 004).
- **Motivo**: DOC-10 §filtros, DOC-12 §5.3, FR-036.

## D12 — Sem JavaScript

- **Decisão**: `<form action="explorar.html" method="get">` com `q`, `unit`, `category`, `period`; a leitura do endereço aceita `period` (chaves `any|today|week|month`, ignorando outras) e o normaliza para datas com `replaceState`. `<noscript>` explica que a listagem depende de JavaScript.
- **Motivo**: FR-015/FR-038 e contrato da feature 005 (`explore-url.md`, "Fallback sem JavaScript").

## D13 — Cópia para o retorno dos detalhes (FE-025)

- **Decisão**: `snapshot.js` guarda em `sessionStorage` (chave `agenda-livre:explore:<search>`): resultados (`count`, `next`, `previous`, `results` mínimos), `savedAt` e `scrollY`. Salva após cada listagem bem-sucedida; atualiza `scrollY` e o id do card ao acionar um link de card (`click` delegado) e em `pagehide`. Restaura quando `navigation.type === "back_forward"` ou em `popstate`, se a cópia tiver ≤ 5 minutos: renderiza sem esqueleto, restaura a rolagem (`history.scrollRestoration = "manual"` apenas nesse caso) e **não** anuncia carregamento. Cópia ausente, vencida ou corrompida → consulta normal pelo endereço. Mantém no máximo 10 entradas (descarta as mais antigas).
- **Motivo**: FR-033/FR-034; validade curta evita apresentar dados velhos como atuais; `sessionStorage` é por aba, o que casa com o histórico daquela aba.
- **Alternativas**: depender só de bfcache (não garantido); `localStorage` (vaza entre abas e vence mal); revalidar em segundo plano e trocar o conteúdo (causa saltos de layout e anúncios extras) — pode ser adicionado depois.

## D14 — Período vindo do endereço

- **Decisão**: o campo "Quando?" é preenchido por `inferPeriod(criteria, hoje)`: `date = hoje` → `today`; `date_from = hoje` e `date_to = hoje+6` → `week`; `date_from = hoje` e `date_to = fim do mês` → `month`; ausência → `any`. Um endereço com datas que **não** coincidem com nenhum período de hoje (por exemplo, link de ontem) tem as datas descartadas na normalização, com `replaceState` e aviso "O período do endereço não vale mais e foi desconsiderado."
- **Motivo**: a interface só oferece os quatro períodos (FR-005); manter datas arbitrárias deixaria o campo inconsistente com os resultados.
- **Alternativas**: opção dinâmica "Período personalizado" (complexidade sem pedido no backlog).
