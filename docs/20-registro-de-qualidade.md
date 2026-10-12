# DOC-20 — Registro de Qualidade

**Projeto:** Agenda Livre  
**Status:** Registro da feature 010 — testes e qualidade do frontend  
**Referências:** DOC-14 §14 e §15, `docs/19-guia-de-testes.md`, `specs/010-testing-quality/contracts/quality-report.md`, `specs/010-testing-quality/contracts/coverage-matrix.md`

Este registro documenta as verificações feitas na data indicada. Passar nas verificações automáticas não prova conformidade com a WCAG 2.2 AA nem a ausência de defeitos. Os números e as evidências de acessibilidade ficam em `docs/17-registro-de-acessibilidade.md`.

## 1. Identificação

- Data: 2026-10-12.
- Linha de base: commit `50ea710` (ramo `main`), antes das mudanças da feature 010.
- Execução final: ramo da feature 010, com as mudanças ainda não commitadas no momento do registro (a árvore de trabalho é a evidência; o commit definitivo é anotado no pull request).
- Executado por: a pessoa desenvolvedora, com apoio do Claude Code.

## 2. Ambiente

- Sistema: Windows 11.
- Node.js 24.16.0; Python 3.14.5 (servidor estático dos testes de navegador).
- Navegador: Chromium headless do Playwright 1.64.0 (build 1248). Firefox e WebKit não foram usados.
- Ferramentas: Vitest 2.1.9, jsdom 25.0.1, `@playwright/test` 1.64.0, `@axe-core/playwright` 4.10.2.
- API real: backend de demonstração em `http://localhost:8000/api/v1`, usado só pela verificação de contrato (seção 3).
- Não usados: leitor de tela, aparelhos reais, Firefox, WebKit.

## 3. Resultados

| Suíte | Comando | Aprovados | Falhos | Ignorados | Duração |
|---|---|---|---|---|---|
| Linha de base, unitária | `npm test` | 692 (41 arquivos) | 0 | 0 | 5,8 s |
| Linha de base, navegador | `npx playwright test` | 624 | 0 | 20 | 3,8 min |
| Final, unitária | `npm test` | 962 (47 arquivos) | 0 | 0 | 11,6 s |
| Final, navegador | `npm run test:e2e` | 647 | 0 | 20 | 3,6 min |
| Final, só acessibilidade | `npm run test:a11y` | 337 | 0 | 20 | 3,3 min |
| Contrato com a API real | `npm run test:contract` | 7 | 0 | 0 | menos de 2 s |

- Nenhum teste da linha de base foi removido ou enfraquecido. O acréscimo da feature 010 é de testes novos (imagem, mensagens de erro, segredos, matriz de cobertura, contrato, registro) e das fixtures centralizadas.
- Duas execuções completas consecutivas de `npm run test:all` sem mudar nada deram o mesmo resultado: 962 unitários e 647 de navegador aprovados, 20 ignorados, nenhum falho, nas duas vezes.
- Verificação de contrato: executada em 2026-10-12 contra o backend de demonstração com a feature de imagens já aplicada. Os 7 fluxos conferem: lista paginada, busca, lista vazia, filtro inválido (`400`), página fora do intervalo (`400` com `errors.page`), detalhe, detalhe inexistente (`404`) e o formato de `image` (`{url, alt, decorative}`, `url` absoluta em `https`). Numa primeira tentativa, minutos antes, `GET /activities/` respondeu `500`; o backend estava com a feature de imagens em andamento e voltou a responder normalmente na tentativa seguinte, sem mudança no frontend. Registrado em `docs/PENDENCIAS-BACKEND.md` como observação, não como divergência.

## 4. Ignorados

| Grupo | Quantidade | Motivo |
|---|---|---|
| `tests/e2e/a11y-contrast-states.spec.js` | 20 | hover e foco por estado rodam só em 1280 px; os estados vazio e erro da API já são cobertos nos outros cenários (o motivo está escrito no próprio `test.skip`) |

Nenhum teste foi desativado para obter resultado verde. `tests/unit/coverage-matrix.test.js` impede `.only`, `retries` e `.skip` sem motivo.

## 5. Defeitos

### QA-001 — Página de detalhes ignorava o campo `image` da API

- **Onde:** `atividade.html` (Detalhes), qualquer atividade com `image` preenchido.
- **Passos:** abrir `atividade.html?id=<id de uma atividade com imagem>` com a API devolvendo `image: { url, alt, decorative }`.
- **Esperado:** a imagem aparece, com o `alt` da API (ou `alt=""` se decorativa).
- **Observado:** a página sempre mostrava o fallback decorativo, mesmo havendo imagem. O cartão já tratava `image`; os detalhes não.
- **Impacto:** a pessoa não via a imagem da atividade nos detalhes; a imagem informativa e seu texto alternativo não eram entregues. Não bloqueia nenhuma tarefa.
- **Gravidade:** moderada (funcionalidade prevista não entregue; sem bloqueio de teclado, leitor de tela ou tarefa central).
- **Situação:** corrigido.
- **Correção:** módulo compartilhado `js/components/activity-media.js` usado por `js/components/activity-card.js` e `js/details/render.js`; `decorative: true` passa a gerar `alt=""` e contêiner oculto; estilo da imagem em `css/layout.css`.
- **Teste de regressão:** `tests/unit/image-field.test.js` (cartão e detalhes) e `tests/e2e/image-display.spec.js`.

### QA-002 — Cartão não tratava `decorative: true`

- **Onde:** cartões de atividade (Início e Explorar).
- **Observado:** a imagem decorativa recebia o `alt` da API em vez de `alt=""`, e o contêiner não era ocultado da tecnologia assistiva.
- **Impacto:** um leitor de tela poderia anunciar uma imagem que a API marcou como decorativa.
- **Gravidade:** leve a moderada.
- **Situação:** corrigido junto com QA-001.
- **Teste de regressão:** `tests/unit/image-field.test.js`.

Nenhum defeito de segurança foi encontrado nas verificações descritas: texto da API é exibido como texto, URLs com `javascript:` e similares são recusadas, mensagens de falha não vazam detalhes internos e não há segredos nos arquivos publicados (`tests/unit/no-secrets.test.js`, `tests/unit/error-messages-no-leak.test.js`, `tests/e2e/error-no-leak.spec.js`). Provas de que os testes percebem regressão: reintroduzir `cause.message` na mensagem ao usuário reprovou 17 testes de `error-messages-no-leak.test.js`; acrescentar `password` e `token` a um módulo de `js/` reprovou `no-secrets.test.js`; ambos foram revertidos.

## 6. Exceções

Nenhuma. Em `tests/unit/no-secrets.test.js`, a expressão `url.password` (propriedade usada por `js/details/external-link.js` para **recusar** endereços com credenciais) é ignorada de propósito; é a única exceção, e está comentada no teste.

## 7. Critérios de aceite do DOC-14 §14

| Critério | Situação | Evidência |
|---|---|---|
| Testes unitários e de integração previstos passam | atendido | `npm test` e `npm run test:e2e` sem falhas (seção 3); matriz em `specs/010-testing-quality/contracts/coverage-matrix.md` |
| Fluxos principais das cinco páginas passam no navegador | atendido | `tests/e2e/navigation.spec.js`, `tests/e2e/explore-search.spec.js`, `tests/e2e/details-content.spec.js`, `tests/e2e/contact-validation.spec.js` e demais arquivos da matriz |
| Sem falhas críticas conhecidas que impeçam os fluxos principais | atendido-com-ressalva | nenhum defeito crítico encontrado nas verificações descritas (seção 5); verificação manual com pessoas e tecnologia assistiva não feita |
| Sem violações automáticas de acessibilidade sem análise ou justificativa | atendido | `tests/e2e/a11y-axe-matrix.spec.js` e `docs/17-registro-de-acessibilidade.md` |
| Navegação por teclado funciona nos fluxos essenciais | atendido-com-ressalva | `tests/e2e/a11y-keyboard.spec.js`; a passada manual de ponta a ponta continua pendente (DOC-17) |
| Testes manuais de leitor de tela da entrega executados | nao-verificado | nenhum leitor de tela foi usado; roteiro em `specs/009-transversal-accessibility/quickstart.md` |
| Contraste, ampliação e reflow verificados | atendido-com-ressalva | `tests/e2e/a11y-contrast-states.spec.js`, `tests/e2e/a11y-text-spacing.spec.js`, `tests/e2e/responsive-reflow.spec.js`; zoom real do navegador e medição visual são manuais |
| Erros, carregamento, lista vazia e sucesso são comunicados de forma distinta | atendido | `tests/e2e/explore-states.spec.js`, `tests/e2e/shared-components.spec.js`, `tests/e2e/a11y-live-states.spec.js` |
| Formulário identifica erros e deixa claro que não envia mensagens | atendido | `tests/e2e/contact-validation.spec.js`, `tests/e2e/contact-confirmation.spec.js`, `tests/e2e/contact-no-network.spec.js` |
| Integração com a API segue o contrato real | atendido-com-ressalva | `tests/contract/api-contract.test.js` executado em 2026-10-12 contra o backend de demonstração (7 de 7); a regra de ordenação por próxima ocorrência e a exclusão de canceladas dependem do backend e não foram exercitadas em profundidade |
| Problemas, limitações e exceções registrados | atendido | seções 5, 6 e 8 de `docs/20-registro-de-qualidade.md` |

## 8. Limitações conhecidas

- Só o Chromium foi usado. Firefox, WebKit e dispositivos reais não foram testados.
- Nenhum leitor de tela foi usado; as verificações de teclado de ponta a ponta, zoom do navegador a 200% e 400% e medição visual de contraste seguem manuais (DOC-17).
- A verificação de contrato é uma amostra do backend de demonstração em um dia; ela não substitui testes do backend nem cobre `429`, CORS ou desempenho. A regra de ordenação pela próxima ocorrência e a exclusão de atividades canceladas ou encerradas são do backend.
- A integração contínua (`.github/workflows/tests.yml`) foi escrita, mas só se confirma no primeiro pull request com o GitHub Actions habilitado; não foi executada fora desta máquina.
- Alguns testes esperam por tempo fixo (`waitForTimeout`) para as transições de 150 ms ou para provar que uma resposta atrasada **não** chega (`tests/e2e/explore-search.spec.js`); foram mantidos de propósito. `tests/e2e/home-search.spec.js` calcula a data esperada com a data real do dia, no fuso de São Paulo, e pode divergir em uma execução feita exatamente na virada do dia.
- A saída do Vitest mostra a mensagem "Not implemented: navigation" do jsdom em testes que ativam links; é ruído conhecido, não falha.
- A cobertura é medida pelos comportamentos do DOC-14 (matriz), não por percentual de linhas.

## 9. Referências

- DOC-14 — Estratégia de Testes do Frontend.
- DOC-17 — Registro de Acessibilidade (`docs/17-registro-de-acessibilidade.md`).
- Guia de testes (`docs/19-guia-de-testes.md`) e matriz de cobertura (`specs/010-testing-quality/contracts/coverage-matrix.md`).
