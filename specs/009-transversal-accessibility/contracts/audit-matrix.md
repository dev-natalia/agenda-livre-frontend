# Contrato: matriz de auditoria

Fonte do que é testado. Estados e larguras: ver `data-model.md`. Legenda de verificação: **A** automática, **M** manual, **A+M** ambas. A coluna "Resultado" é preenchida na implementação.

| Critério | Nível | Histórias | Verificação | Onde (teste ou roteiro) | Resultado |
|---|---|---|---|---|---|
| 1.1.1 Conteúdo não textual | A | FE-037 | A+M | `a11y-names-and-images.spec.js`; roteiro §5 | |
| 1.3.1 Informações e relações | A | FE-034 | A+M | `a11y-static-structure.test.js`; axe; roteiro §4 | |
| 1.4.1 Uso de cor | A | FE-036, FE-039 | A+M | `state-contrast.test.js`; roteiro §6 | |
| 1.4.3 Contraste (mínimo) | AA | FE-039 | A+M | `design-tokens.test.js`; `a11y-contrast-states.spec.js` | |
| 1.4.4 Redimensionar texto | AA | FE-040 | A+M | `responsive-reflow.spec.js`; roteiro §7 | |
| 1.4.10 Reflow | AA | FE-040 | A+M | `responsive-reflow.spec.js`; roteiro §7 | |
| 1.4.11 Contraste não textual | AA | FE-039 | A+M | `a11y-contrast-states.spec.js` | |
| 1.4.12 Espaçamento de texto | AA | FE-040 | A+M | `a11y-text-spacing.spec.js`; roteiro §7 | |
| 2.1.1 Teclado | A | FE-036 | A+M | `a11y-keyboard.spec.js`; roteiro §2 | |
| 2.1.2 Sem bloqueio de teclado | A | FE-036 | A+M | `a11y-keyboard.spec.js`; roteiro §2 | |
| 2.4.1 Ignorar blocos | A | FE-035 | A+M | `a11y-keyboard.spec.js`; roteiro §2 | |
| 2.4.3 Ordem do foco | A | FE-036 | A+M | `a11y-keyboard.spec.js`; roteiro §2 | |
| 2.4.7 Foco visível | AA | FE-036 | A+M | `a11y-focus-visible.spec.js`; `a11y-css-rules.test.js` | |
| 2.4.11 Foco não obscurecido | AA | FE-036 | A+M | `a11y-focus-visible.spec.js`; roteiro §2 | |
| 3.3.1 Identificação do erro | A | FE-038 | A+M | `contact-validation.spec.js`; `a11y-axe-matrix.spec.js` | |
| 3.3.2 Rótulos ou instruções | A | FE-034 | A+M | `contact-validation.spec.js`; axe | |
| 3.3.3 Sugestão de erro | AA | FE-038 | M | roteiro §3 | |
| 4.1.2 Nome, função, valor | A | FE-034 | A+M | `a11y-names-and-images.spec.js`; axe; roteiro §4 | |
| 4.1.3 Mensagens de status | AA | FE-038 | A+M | `a11y-live-states.spec.js`; roteiro §3 | |
| DP movimento reduzido | — | FE-040 | A+M | `reduced-motion.spec.js`; `a11y-css-rules.test.js`; roteiro §8 | |
| DP página atual (`aria-current`) | — | FE-034 | A | `a11y-names-and-images.spec.js` | |
| DP links externos em nova aba | — | FE-037 | A+M | `details-external-link.spec.js`; roteiro §5 | |

## Exceções registradas

Nenhuma até o momento. Formato obrigatório para cada exceção: **regra**, **seletor/escopo**, **razão**, **mitigação**, **data**.

## Regras da matriz

- Um critério só é "conforme" quando todas as suas verificações aplicáveis passaram em todas as páginas e estados em que se aplica.
- "Não verificado" nunca é convertido em "conforme". Aparece no registro com o motivo.
- Acrescentar uma página ou um estado exige acrescentá-lo a `tests/e2e/helpers/a11y-matrix.js`.

## Como os estados são provocados (T021)

Todos os sete estados do DOC-14 §9.1 são alcançados por interação real, sem injetar DOM: a API é simulada por `tests/e2e/helpers/mock-api.js` (resposta com atividades, lista vazia `count: 0`, erro `500`, detalhe `404`) e o formulário de Contato é enviado vazio e com dados sintéticos. A falha de rede (`network`) também é simulada pelo `mockApi` (`route.abort`). A definição está em `tests/e2e/helpers/a11y-matrix.js`.
