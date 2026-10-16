# Pesquisa: Filtro por público-alvo

Fonte do contrato: `agenda-livre-backend/docs/10-filtro-por-publico-alvo.md` e `agenda-livre-backend/specs/006-public-consultation/contracts/public-api.md` (parâmetro `audience`, campo `target_audiences` e `GET /audiences/`). Não restam pendências de esclarecimento.

## D1 — Seleção única, parâmetro `audience`
- **Decisão**: um único UUID, igual a `unit` e `category`.
- **Razão**: é o que a API aceita; mantém o padrão do formulário.
- **Alternativas**: seleção múltipla — rejeitada (fora do escopo do backend).

## D2 — Opções via `GET /audiences/?page_size=50`
- **Decisão**: nova `fetchAudiences()` em `public.js`, no padrão de `fetchUnits`/`fetchCategories`; carregada em paralelo com as demais, com falha independente.
- **Razão**: reaproveita `validItems`/`fillSelect`; nenhum valor fixo.
- **Alternativas**: lista fixa no código — rejeitada pela US-050.

## D3 — Estender `initFilterOptions` com `audienceSelect` opcional
- **Decisão**: parâmetro opcional; a Início, que não o passa, segue com duas consultas. A mensagem de falha passa a ser composta por campo (unidades, categorias, públicos-alvo).
- **Razão**: evita duplicar lógica e preserva testes e comportamento da Início.
- **Alternativas**: carregador separado só da Explorar — rejeitada por duplicação.

## D4 — Endereço
- **Decisão**: `audience` entra em `DEFAULT_CRITERIA`, é lido com `uuidOrEmpty`, escrito entre `category` e `date`, e incluído em `toApiParams`. Parâmetro repetido: `URLSearchParams.get` já devolve o primeiro.
- **Razão**: mesmas regras de `unit`/`category`; ordem de escrita estável.

## D5 — Opção removida ou inativa
- **Decisão**: com o catálogo carregado, se o UUID do endereço não estiver nas opções, descartar com o aviso já existente e refazer a consulta (mesma regra de unidade/categoria).
- **Razão**: consistência; a API devolveria lista vazia, mas o campo ficaria sem seleção coerente.

## D6 — Exibição no card
- **Decisão**: linha opcional `activity-card__audience` com os nomes separados por vírgula, na ordem da API, após a unidade; omitida se vazia ou ausente. O snapshot de volta dos detalhes passa a guardar `target_audiences`; cópias antigas sem o campo ficam sem a linha.
- **Razão**: o card é compartilhado; a ausência do campo não pode quebrar a Início nem cópias antigas.
- **Alternativas**: chips por público — adiado; texto simples cabe em 320 px com quebra de linha.

## D7 — Sem lógica de "Todas as idades" no cliente
- **Decisão**: nenhuma; a API aplica a regra inclusiva.
