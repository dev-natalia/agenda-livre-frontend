# Contrato: matriz de cobertura do DOC-14

Resultado da auditoria da feature 010 (2026-10-12): cada verificação do DOC-14 aponta para o teste que a cumpre ou para uma lacuna declarada com motivo. Cada linha foi conferida lendo os testes citados. Vocabulário e regras: `data-model.md`.

- **Situação**: `coberto`, `coberto-parcial` (a parte automática existe; o motivo diz o que falta) ou `lacuna-declarada` (não automatizável aqui; o motivo diz por quê).
- Uma linha `coberto` que antes era lacuna e foi fechada nesta feature traz o texto "fechada na 010" no motivo.
- `tests/unit/coverage-matrix.test.js` falha se um arquivo citado não existir, se uma linha `coberto-parcial` ou `lacuna-declarada` ficar sem motivo, ou se a situação sair do vocabulário.

## Unitários (DOC-14 §6)

| Item | Tipo | Evidência | Situação | Motivo |
|---|---|---|---|---|
| 6.1 Estado da URL: termo, filtros, página ausente/inválida, reinício da página | unitario | `tests/unit/explore-url-state.test.js`, `tests/unit/search-criteria.test.js` | coberto | |
| 6.2 Validação do formulário: obrigatórios, e-mail, limites, erros por campo | unitario | `tests/unit/contact-validation.test.js`, `tests/unit/contact-form.test.js` | coberto | |
| 6.3 Cliente HTTP: query string, sucesso, erros de HTTP, rede, tempo esgotado, JSON inválido, corpo vazio, cancelamento | unitario | `tests/unit/api-client.test.js`, `tests/unit/api-client-errors.test.js`, `tests/unit/api-errors.test.js`, `tests/unit/request-scope.test.js` | coberto | |
| 6.4 Apresentação: opcionais ausentes, datas sem deslocar o dia, sem imagem, total ≠ página atual | unitario | `tests/unit/format.test.js`, `tests/unit/activity-card.test.js`, `tests/unit/details-render.test.js`, `tests/unit/explore-listing.test.js`, `tests/unit/image-field.test.js` | coberto | imagem nos detalhes fechada na 010 |

## Integração (DOC-14 §7)

| Item | Tipo | Evidência | Situação | Motivo |
|---|---|---|---|---|
| Início consulta e mostra as próximas atividades | navegador | `tests/e2e/home-upcoming.spec.js`, `tests/unit/upcoming-activities.test.js` | coberto | |
| Explorar envia filtros, limpa filtros, paginação mantém filtros | navegador | `tests/e2e/explore-search.spec.js`, `tests/e2e/explore-pagination.spec.js` | coberto | |
| Detalhes solicita a atividade correta; opcionais ausentes não quebram | navegador | `tests/e2e/details-content.spec.js`, `tests/unit/details-id.test.js` | coberto | |
| Erros de HTTP e falhas de rede levam ao estado correto | navegador | `tests/e2e/api-error-retry.spec.js`, `tests/e2e/explore-states.spec.js`, `tests/e2e/details-states.spec.js` | coberto | |
| Respostas antigas não sobrescrevem as recentes | navegador | `tests/unit/request-scope.test.js`, `tests/unit/explore-listing.test.js`, `tests/e2e/explore-search.spec.js` | coberto | a Explorar tem prova no navegador com respostas fora de ordem; Início e Detalhes fazem uma consulta por carga e só repetem após falha |
| Quantidade exibida igual ao total da API | navegador | `tests/e2e/explore-pagination.spec.js`, `tests/e2e/explore-search.spec.js` | coberto | |
| Ordenação por próxima ocorrência segue a regra da API | contrato | `tests/e2e/explore-pagination.spec.js`, `tests/contract/api-contract.test.js` | coberto-parcial | o frontend preserva a ordem recebida (testado); a regra de ordenação é do backend e só se confirma com a API real, verificação opcional |

## Fluxos no navegador (DOC-14 §8)

| Item | Tipo | Evidência | Situação | Motivo |
|---|---|---|---|---|
| 8.1 Navegação compartilhada: cinco páginas, página atual, pular, menu móvel, links externos | navegador | `tests/e2e/navigation.spec.js`, `tests/e2e/mobile-menu.spec.js`, `tests/e2e/shared-components.spec.js`, `tests/e2e/details-external-link.spec.js` | coberto | |
| 8.2 Início: três atividades, skeleton, erro com repetir, falha isolada, pesquisa só após "Explorar" | navegador | `tests/e2e/home-upcoming.spec.js`, `tests/e2e/home-search.spec.js` | coberto | |
| 8.2 Início: atividades canceladas ou encerradas não aparecem | navegador | `tests/e2e/home-upcoming.spec.js` | lacuna-declarada | a exclusão é feita pela API (a resposta pública só traz atividades publicadas); o frontend exibe o que recebe e isso só se confirma contra o backend real |
| 8.3 Explorar: busca, filtros, skeleton, página 1, limpar, quantidade, vazio ≠ erro, paginação, retorno | navegador | `tests/e2e/explore-search.spec.js`, `tests/e2e/explore-states.spec.js`, `tests/e2e/explore-pagination.spec.js`, `tests/e2e/explore-return.spec.js` | coberto | |
| 8.4 Detalhes: URL direta, campos, fallback, link externo, indisponível, 404, retorno | navegador | `tests/e2e/details-content.spec.js`, `tests/e2e/details-external-link.spec.js`, `tests/e2e/details-states.spec.js`, `tests/e2e/details-return.spec.js`, `tests/e2e/image-display.spec.js` | coberto | |
| 8.5 Sobre: conteúdo, estrutura, links | navegador | `tests/e2e/about.spec.js`, `tests/unit/institutional-pages.test.js` | coberto | |
| 8.6 Contato: vazio, vários erros, associação, foco, painel demonstrativo, voltar | navegador | `tests/e2e/contact-validation.spec.js`, `tests/e2e/contact-confirmation.spec.js`, `tests/e2e/contact-no-network.spec.js` | coberto | |

## Acessibilidade e responsividade (DOC-14 §9 e §10)

| Item | Tipo | Evidência | Situação | Motivo |
|---|---|---|---|---|
| 9.1 axe-core nas cinco páginas e sete estados, duas larguras | navegador | `tests/e2e/a11y-axe-matrix.spec.js`, `tests/e2e/accessibility.spec.js` | coberto | resultado detalhado no DOC-17 |
| 9.2 Teclado | navegador | `tests/e2e/a11y-keyboard.spec.js`, `tests/e2e/a11y-focus-visible.spec.js` | coberto-parcial | a passada manual de ponta a ponta com teclado não foi feita por uma pessoa (DOC-17) |
| 9.3 Leitor de tela | manual | `docs/17-registro-de-acessibilidade.md` | lacuna-declarada | nenhum leitor de tela disponível no ambiente de testes |
| 9.4 Contraste e cor | navegador | `tests/e2e/a11y-contrast-states.spec.js`, `tests/e2e/a11y-state-cues.spec.js`, `tests/unit/state-contrast.test.js` | coberto | |
| 9.5 Ampliação, reflow e espaçamento | navegador | `tests/e2e/a11y-text-spacing.spec.js`, `tests/e2e/responsive-reflow.spec.js` | coberto-parcial | o zoom do navegador a 200% e 400% é manual; a suíte simula o texto ampliado |
| 9.6 Movimento reduzido | navegador | `tests/e2e/a11y-reduced-motion.spec.js`, `tests/e2e/reduced-motion.spec.js`, `tests/unit/motion-rule.test.js` | coberto | |
| 10 Responsivo: desktop, tablet, estreito, sem depender de hover | navegador | `tests/e2e/responsive-reflow.spec.js`, `tests/e2e/visual-consistency.spec.js`, `tests/e2e/mobile-menu.spec.js` | coberto | |
| 10 Navegador adicional (Firefox, WebKit) | manual | `playwright.config.js` | lacuna-declarada | só o Chromium está configurado; os demais exigem instalação e tempo de execução que não se justificam nesta entrega |

## Segurança no frontend (DOC-14 §11)

| Item | Tipo | Evidência | Situação | Motivo |
|---|---|---|---|---|
| Dados da API inseridos como texto, não como HTML | unitario | `tests/unit/activity-card.test.js`, `tests/unit/details-render.test.js`, `tests/unit/error-state.test.js`, `tests/unit/image-field.test.js` | coberto | |
| Texto com marcação e caracteres especiais, de ponta a ponta | navegador | `tests/e2e/error-no-leak.spec.js`, `tests/e2e/image-display.spec.js`, `tests/e2e/details-content.spec.js`, `tests/e2e/home-search.spec.js` | coberto | cartão com título hostil e imagem com `alt` hostil, fechados na 010 |
| URL externa: rejeitar `javascript:`, `data:`, `file:`, `//host`, credenciais embutidas | unitario | `tests/unit/details-external-link.test.js`, `tests/e2e/details-external-link.spec.js` | coberto | |
| URL da imagem: só `http` e `https` | unitario | `tests/unit/image-field.test.js`, `tests/unit/activity-card.test.js` | coberto | fechada na 010 |
| Links externos em nova aba com `rel` e indicação no texto | navegador | `tests/e2e/details-external-link.spec.js`, `tests/unit/details-render.test.js` | coberto | |
| Nenhum segredo embutido nos arquivos publicados | unitario | `tests/unit/no-secrets.test.js`, `tests/unit/config.test.js` | coberto | fechada na 010 |
| Falhas sem pilha, endereços internos, tokens ou corpo bruto | unitario | `tests/unit/error-messages-no-leak.test.js`, `tests/unit/api-errors.test.js`, `tests/e2e/error-no-leak.spec.js` | coberto | fechada na 010 |
| Validação do frontend não substitui a do backend | documental | `docs/19-guia-de-testes.md`, `README.md` | lacuna-declarada | é uma regra de arquitetura, não um comportamento testável no navegador; está escrita no guia |

## Dados de teste (DOC-14 §12)

| Item | Tipo | Evidência | Situação | Motivo |
|---|---|---|---|---|
| Fixtures: atividade completa, sem imagem, imagem informativa e decorativa, sem URL, opcionais ausentes, recorrente, lista vazia, várias páginas | unitario | `tests/fixtures/activities.js`, `tests/e2e/helpers/mock-api.js` | coberto | centralizadas na 010 |
| Fixtures: atividade cancelada ou encerrada | unitario | `tests/fixtures/activities.js` | coberto | a API responde o mesmo `404` do inexistente (`makeUnavailableResponse`) |
| Fixtures: erro HTTP, falha de rede, JSON inválido | navegador | `tests/e2e/error-no-leak.spec.js`, `tests/e2e/api-error-retry.spec.js` | coberto | |
| Sem dados pessoais reais | unitario | `tests/unit/no-secrets.test.js` | coberto | fechada na 010 |
| Contrato real não presumido pelo mock | contrato | `tests/contract/api-contract.test.js`, `tests/unit/contract-check-guard.test.js` | coberto-parcial | a verificação existe, é opcional e só roda com a API em execução |

## Execução e processo (DOC-14 §13)

| Item | Tipo | Evidência | Situação | Motivo |
|---|---|---|---|---|
| Comandos separados e conjunto | documental | `package.json`, `docs/19-guia-de-testes.md` | coberto | fechada na 010 |
| Sem `retries`, `.only` nem `.skip` sem motivo | unitario | `tests/unit/coverage-matrix.test.js` | coberto | fechada na 010 |
| CI executa a suíte | documental | `.github/workflows/tests.yml` | coberto-parcial | só se confirma depois do primeiro pull request com Actions habilitado |
