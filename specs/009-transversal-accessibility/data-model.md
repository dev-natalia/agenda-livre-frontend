# Data Model: Acessibilidade transversal

Sem dados de negócio nem API. As entidades abaixo descrevem a **matriz de verificação** e o **registro** (documentos e dados de teste), não estruturas do site.

## Critério

| Campo | Descrição |
|---|---|
| `id` | Código WCAG (ex.: `1.4.3`) ou da decisão de projeto (ex.: `DP-skip-link`) |
| `nome` | Nome em português, como no DOC-15 §6 |
| `nivel` | `A`, `AA` ou `—` (decisão de projeto) |
| `classificacao` | `criterio`, `recomendacao` ou `decisao` (DOC-15 §3) |
| `historias` | FE-034 a FE-040 relacionadas |
| `verificacao` | `automatica`, `manual` ou `ambas` |

## Verificação

| Campo | Descrição |
|---|---|
| `criterio` | Referência ao critério |
| `pagina` | `index`, `explorar`, `atividade`, `sobre`, `contato` |
| `estado` | `carregada`, `menu-aberto`, `resultados`, `vazio`, `erro-api`, `form-erros`, `confirmacao` (apenas os aplicáveis à página) |
| `largura` | `1280` ou `320` (CSS px) |
| `ambiente` | navegador, versão, sistema; tecnologia assistiva e versão, se houver |
| `resultado` | `conforme`, `nao-conforme`, `nao-aplicavel`, `nao-verificado` |
| `evidencia` | nome do teste automático ou descrição curta da observação manual |

Regra: `nao-verificado` exige um motivo; `nao-aplicavel` exige a razão (por exemplo, a página não tem formulário).

## Problema

| Campo | Descrição |
|---|---|
| `id` | Sequencial `A11Y-001` ... |
| `criterio` | Critério afetado |
| `onde` | Página e estado |
| `descricao` | O que ocorre, em uma frase |
| `gravidade` | `bloqueia` (impede a tarefa), `prejudica` (dificulta) ou `menor` |
| `situacao` | `corrigido`, `excecao` ou `pendente` |
| `correcao` / `justificativa` | O que mudou, ou escopo, razão e mitigação da exceção |

## Matriz de estados (dados de teste)

| Estado | Páginas | Como é provocado |
|---|---|---|
| carregada | todas | abrir a página com a API simulada respondendo |
| menu-aberto | todas, só 320 px | acionar o botão de menu |
| resultados | index, explorar, atividade | resposta com atividades (e detalhe) |
| vazio | explorar, index | resposta `count: 0` |
| erro-api | index, explorar, atividade | resposta 500 / falha de rede; depois nova tentativa |
| form-erros | contato | enviar vazio |
| confirmacao | contato | enviar com dados sintéticos válidos |

## Relações

- Um `Critério` tem muitas `Verificações`; uma `Verificação` não conforme gera um `Problema`.
- O `Registro` consolida `Verificações`, `Problemas`, exceções e limitações (formato em `contracts/accessibility-report.md`).
