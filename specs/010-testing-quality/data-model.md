# Data Model: Testes e qualidade do frontend

Não há dados de produto novos nem armazenamento. As entidades abaixo descrevem os artefatos de teste e documentação.

## Item da matriz de cobertura

Linha de `contracts/coverage-matrix.md`.

| Campo | Regra |
|---|---|
| `item` | Identificador do DOC-14 (`6.1`, `8.3`, `11`, …) mais descrição curta. Único |
| `tipo` | `unitario`, `integracao`, `navegador`, `seguranca`, `manual` |
| `evidencia` | Caminho de um ou mais arquivos de teste existentes; obrigatório se `situacao` ≠ `lacuna` |
| `situacao` | `coberto`, `coberto-parcial`, `lacuna-automatizada` (fechada nesta feature), `lacuna-declarada` |
| `motivo` | Obrigatório para `coberto-parcial` e `lacuna-declarada`: limitação de ambiente, verificação manual ou dependência do backend |

Validação: todo arquivo em `evidencia` existe (verificado por `coverage-matrix.test.js`); nenhum item `lacuna-declarada` sem motivo; nenhum item automatizável fica `lacuna-declarada`.

## Fixture de API

Exportada por `tests/fixtures/activities.js`.

| Fixture | Representa (DOC-14 §12) |
|---|---|
| `makeActivity(n, overrides)` | item de listagem completo, sem `image` |
| `withImage(activity, { alt, decorative })` | listagem/detalhe com `image` informativa ou decorativa |
| `withNullImage(activity)` | `image: null` |
| `makeDetails(overrides)` | detalhe completo com programações pontual e recorrente |
| `makeDetailsNoUrl()` / `makeDetailsMinimal()` | sem URL externa; campos opcionais ausentes |
| `makeRecurring()` | atividade recorrente |
| `makeCancelledResponse()` | como a API trata atividade cancelada/encerrada (mesmo `404` do inexistente) |
| `makeListing(total, opts)` | paginação em várias páginas; `makeEmptyListing()` para `count: 0` |
| `HOSTILE_TEXT` | cadeia com marcação, aspas, `&` e esquemas perigosos (só para testes de segurança) |

Regras: dados sintéticos; ids em formato UUID; formato fiel ao DOC-05; nenhum dado pessoal real.

## Campo `image` (esperado da API)

| Campo | Tipo | Regra no frontend |
|---|---|---|
| `url` | texto absoluto | exibida só se `http:` ou `https:`; senão, fallback |
| `alt` | texto | usado como `alt` da imagem informativa; vazio é aceito |
| `decorative` | booleano | `true` ⇒ `alt=""`, contêiner `aria-hidden`, `alt` da API ignorado |
| (campo todo) | objeto, `null` ou ausente | `null` e ausente ⇒ fallback visual; não gera erro |

## Registro de qualidade

Documento `docs/20-registro-de-qualidade.md` (formato em `contracts/quality-report.md`).

| Seção | Conteúdo |
|---|---|
| Identificação | data, commit, ramo, pessoa que executou |
| Ambiente | sistema operacional, Node.js, Python, navegador e build, versões de Vitest, Playwright, axe-core |
| Contagens | aprovados, falhos, ignorados por suíte; duração |
| Ignorados | grupo, quantidade, motivo |
| Defeitos | id, passos de reprodução, páginas/estados, impacto, gravidade, situação, teste de regressão |
| Exceções | escopo, motivo, mitigação |
| Critérios do DOC-14 §14 | critério, situação (`atendido`, `atendido-com-ressalva`, `nao-verificado`), evidência |
| Limitações | navegadores, leitores de tela, aparelhos, API real |

Transições de um defeito: `aberto → corrigido` (com teste) ou `aberto → exceção justificada` ou `aberto → adiado` (com destino: feature própria ou pendência do backend).

## Verificação de contrato

| Campo | Regra |
|---|---|
| `fluxo` | lista, busca, vazia, filtro inválido, detalhe, inexistente, página fora do intervalo, campo `image` |
| `esperado` | formato descrito em `contracts/contract-check.md` |
| `observado` | resposta real (status e formato, sem gravar nada) |
| `resultado` | `confere`, `diverge` (vai para `PENDENCIAS-BACKEND.md`), `nao-executado` (sem `API_BASE_URL`) |
