# DOC-19 — Guia de Testes do Frontend

**Projeto:** Agenda Livre  
**Status:** Em vigor (feature 010 — testes e qualidade do frontend)  
**Referências:** DOC-14 (estratégia), DOC-17 (acessibilidade), DOC-20 (registro de qualidade)

Este é o único lugar com as instruções de execução dos testes. O `README.md` só resume e aponta para cá. A estratégia (o que verificar e por quê) está no DOC-14; o resultado de cada execução fica no DOC-20.

## 1. O que é automatizado e o que continua manual

| Forma | Ferramenta | Pasta | Para quê |
|---|---|---|---|
| Unitária e de estrutura | Vitest + jsdom | `tests/unit/` | funções, componentes isolados, regras de CSS, estrutura das páginas, documentos |
| Navegador | Playwright (Chromium) | `tests/e2e/` | fluxos completos nas cinco páginas, com a API simulada |
| Acessibilidade automática | axe-core no Playwright | `tests/e2e/a11y-*.spec.js`, `tests/e2e/accessibility.spec.js` | problemas comuns de acessibilidade em páginas e estados |
| Contrato com a API real | Vitest (Node) | `tests/contract/` | formato real da API; **opcional**, ver §6 |
| Manual | pessoa | roteiro em `specs/009-transversal-accessibility/quickstart.md` | teclado de ponta a ponta, leitor de tela, zoom do navegador, avaliação visual |

**Passar na suíte não prova conformidade com a WCAG 2.2 AA nem ausência de defeitos.** As ferramentas automáticas só encontram certas classes de problema; teclado e leitor de tela continuam sendo verificados à mão. A validação do frontend (formulário de contato, filtros) nunca substitui a validação do backend.

## 2. Pré-requisitos

- Node.js 20 ou superior e npm.
- Python 3 no `PATH` (os testes de navegador sobem `tests/static-server.py`).
- Na primeira vez, dentro da pasta do projeto:

```sh
npm install
npx playwright install chromium
```

No Linux, se faltarem bibliotecas do sistema: `npx playwright install --with-deps chromium`.

- **Porta 5500 livre.** Se já houver um servidor nela (por exemplo, `python -m http.server 5500`), o Playwright o reaproveita e a recusa intermitente de conexões (`ERR_CONNECTION_REFUSED`) pode voltar. Encerre o servidor antes de rodar.

## 3. Comandos

| Comando | O que faz |
|---|---|
| `npm test` | testes unitários (Vitest), cerca de 6 segundos |
| `npm run test:watch` | Vitest em modo de observação, reexecuta ao salvar |
| `npm run test:e2e` | testes de navegador (Playwright), cerca de 4 minutos |
| `npm run test:a11y` | só os testes de acessibilidade de navegador |
| `npm run test:all` | **suíte completa**: unitária e depois navegador; para no primeiro erro |
| `npm run test:contract` | verificação opcional contra a API real (ver §6) |

`npm run test:all` termina com código diferente de zero se qualquer teste falhar, o que serve para scripts e para a integração contínua.

### Rodar uma parte

```sh
npx vitest run tests/unit/image-field.test.js          # um arquivo unitário
npx vitest run -t "imagem decorativa"                  # testes pelo nome
npx playwright test explore-search                     # um arquivo (ou parte do nome) de navegador
npx playwright test -g "limpar filtros"                # testes pelo nome
npx playwright test explore-search --headed            # vendo o navegador
npx playwright test explore-search --debug             # passo a passo
npx playwright show-report                             # relatório HTML da última execução
```

## 4. Como ler uma falha

- O nome de cada teste descreve o comportamento esperado, em português (por exemplo, "imagem decorativa: alt vazio e fora da árvore de acessibilidade").
- A mensagem mostra o valor esperado e o obtido. No Playwright, `test-results/` guarda capturas de tela e rastros das falhas.
- Falha de teste de arquivo que **não existe mais** (matriz de cobertura, registros): o teste aponta o caminho; atualize o documento ou restaure o arquivo.
- Falha só ao rodar tudo e não ao rodar sozinho: é sinal de teste instável ou de servidor já aberto na porta 5500. Corrija a causa; **não** adicione repetição automática.

## 5. Organização e convenções

```text
tests/
  unit/        um arquivo por módulo ou assunto; jsdom quando precisa de DOM (// @vitest-environment jsdom)
  unit/helpers dom.js (HTML das páginas em jsdom), fake-fetch.js (respostas simuladas), css.js (leitura de CSS)
  e2e/         um arquivo por fluxo ou assunto
  e2e/helpers  mock-api.js (API simulada), a11y-matrix.js e a11y-checks.js (matriz de acessibilidade)
  fixtures/    activities.js: respostas sintéticas da API, compartilhadas por unidade e navegador
  contract/    verificação opcional contra a API real
  static-server.py  servidor estático dos testes de navegador
```

### Dados de teste

- Use `tests/fixtures/activities.js`: `makeActivity`, `makeListing`, `makeEmptyListing`, `makeDetails`, `makeDetailsMinimal`, `makeDetailsNoUrl`, `makeRecurring`, `withImage`, `withNullImage`, `makeUnavailableResponse`, `HOSTILE_TEXT`.
- Os dados são sintéticos: e-mails só em `example.com` ou `example.org`, nenhum nome ou telefone reais (há teste que confere).
- O campo `image` segue o backend: `{ url, alt, decorative }` ou `null`.
- Nos testes de navegador, `mockApi(page, {...})` aponta o frontend para a API simulada e aceita `activitiesResponder`, `detailsResponder`, `failActivities` (status ou `"network"`) e `delayMs`.
- Datas: use datas fixas nas fixtures. Teste que depende do dia atual deve calcular o esperado a partir da mesma fonte da página.

### Como adicionar um teste

1. Escolha o nível mais baixo que prova o comportamento: função pura → unitário; componente com DOM → unitário com jsdom; fluxo entre elementos → navegador.
2. Escreva o teste e veja-o falhar antes de corrigir (ou prove que ele reprova ao reintroduzir a falha).
3. Dê um nome que diga o comportamento esperado.
4. Se o comportamento corresponde a um item do DOC-14, acrescente ou atualize a linha em `specs/010-testing-quality/contracts/coverage-matrix.md`.

### O que não fazer

- Não use `retries`, `.only` nem `.skip` sem um motivo escrito como segundo argumento (`tests/unit/coverage-matrix.test.js` falha).
- Não desative nem enfraqueça um teste para liberar uma entrega.
- Não use dados pessoais reais nem rede externa.

## 6. Verificação de contrato com a API real (opcional)

Os testes de navegador usam respostas simuladas: um mock pode divergir da API real. Para conferir o formato real, com o backend em execução:

```sh
# Linux, macOS, Git Bash
API_BASE_URL=http://localhost:8000/api/v1 npm run test:contract
```

```powershell
# PowerShell
$env:API_BASE_URL = "http://localhost:8000/api/v1"; npm run test:contract
```

- Só faz `GET`; nada é gravado; não usa dados pessoais.
- Sem `API_BASE_URL`, a verificação é ignorada e mostrada como pendente; a suíte padrão não depende do backend.
- Cada divergência encontrada vai para `docs/PENDENCIAS-BACKEND.md` (observado, esperado, impacto). O frontend não é alterado para acomodá-la sem esse registro.
- Fluxos: lista paginada, busca, lista vazia, filtro inválido (`400`), página fora do intervalo (`400` com `errors.page`), detalhe, detalhe inexistente (`404`) e o formato do campo `image`.

## 7. Matriz de cobertura e registros

- **Matriz de cobertura:** `specs/010-testing-quality/contracts/coverage-matrix.md` liga cada verificação do DOC-14 ao teste que a cumpre ou a uma lacuna declarada com motivo.
- **Registro de qualidade (DOC-20):** `docs/20-registro-de-qualidade.md` traz data, commit, ambiente, versões, contagens, ignorados, defeitos, exceções, limitações e os critérios do DOC-14 §14.
- **Registro de acessibilidade (DOC-17):** `docs/17-registro-de-acessibilidade.md` guarda as evidências e o que falta verificar à mão.

Ao concluir uma entrega, rode `npm run test:all`, copie as contagens reais para o DOC-20 e registre cada defeito com passos de reprodução, impacto e o teste que o protege.

## 8. Integração contínua

O arquivo `.github/workflows/tests.yml` roda `npm run test:all` a cada `push` e `pull_request`, em Ubuntu com Node 20 e Chromium do Playwright. Em caso de falha, publica `playwright-report/` e `test-results/` como artefato da execução. A verificação de contrato **não** roda lá, porque o backend não está disponível. Uma falha se resolve corrigindo a causa, nunca desativando o teste.
