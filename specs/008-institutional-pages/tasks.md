---

description: "Task list for feature 008 - Páginas institucionais e contato"
---

# Tasks: Páginas institucionais e contato

**Input**: Design documents from `/specs/008-institutional-pages/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/contact-form.md, contracts/no-network.md, quickstart.md

**Tests**: Incluídos (DOC-14, padrão das features 002–007): Vitest para a regra de validação e a orquestração com DOM (jsdom, com `// @vitest-environment jsdom` no topo do arquivo); Playwright para os fluxos, a ausência de rede e a acessibilidade (axe). Escreva cada teste antes da implementação correspondente e confirme que falha.

**Organization**: Tarefas agrupadas por user story. Caminhos relativos à raiz do repositório (o próprio frontend). Reutilize, sem alterar o comportamento: `js/components/site-nav.js`, `.button`, `.field-error`, `[aria-invalid="true"]`, `.visually-hidden`, o foco global e os tokens de `css/tokens.css`. Nenhum valor literal de cor, fonte, espaçamento ou duração fora de `css/tokens.css` (há teste que verifica). Valores digitados só via `.value`/`textContent`, nunca `innerHTML`. Sobre e Contato **não** importam `js/api/*` nem `js/config.js` e não chamam `showConfigNotice`. O HTML do formulário é escrito à mão (não gerado por JS). Nenhum `maxlength` nos campos (plan D3).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[Story]**: US1 = Sobre (P1), US2 = formulário de contato (P2), US3 = validação acessível (P2), US4 = confirmação demonstrativa (P2)

---

## Phase 1: Setup

**Purpose**: Utilitários de teste e ajuste dos testes existentes que assumiam o aviso de configuração nestas páginas

- [X] T001 [P] Estender `tests/unit/helpers/dom.js` com `mountContactDom()`, que monta em jsdom o trecho de `contato.html` definido em T014 (mesmos ids e atributos: `#contact-form`, `#contact-name`, `#contact-email`, `#contact-subject`, `#contact-message`, `#contact-summary`, `#contact-clear`, `#contact-confirmation` com `h2`, `#contact-back`, mais as `<p id="<campo>-hint">` de ajuda)
- [X] T002 [P] Ajustar `tests/e2e/structure-config.spec.js`: no teste "configuração … mostra aviso e não faz requisição à API", percorrer só as páginas que usam a API (`index.html`, `explorar.html`, `atividade.html`) e acrescentar, para `sobre.html` e `contato.html`, a verificação de que **não** há `[role=alert]` com a configuração inválida e de que o `h1` continua visível (FR-032, SC-009)

---

## Phase 2: Foundational (bloqueia todas as histórias)

**Purpose**: Desacoplar as duas páginas da API e preparar os estilos base compartilhados

- [X] T003 [P] Escrever `tests/unit/institutional-pages.test.js` (deve falhar): com `// @vitest-environment jsdom`, importar `init` de `js/pages/about.js` e de `js/pages/contact.js` com `config.js` mockado para estado **inválido** e verificar que nenhum `.config-notice`/`[role=alert]` é inserido em `<main>`; verificar por leitura do código-fonte que `about.js` e `contact.js` não importam `../api/`, `../config.js` nem `../components/config-notice.js` (contracts/no-network.md)
- [X] T004 Reescrever `js/pages/about.js` para passar T003: apenas `import { initSiteNav }` e `init()` chamando `initSiteNav()`; remover imports e uso de `getConfigStatus` e `showConfigNotice`
- [X] T005 Ajustar `js/pages/contact.js` para passar T003: remover imports e uso de `getConfigStatus`/`showConfigNotice`; manter `initSiteNav()` (a chamada de `initContactForm` entra em T016)
- [X] T006 [P] Acrescentar a `css/layout.css` os blocos base `.prose` (coluna de leitura com `max-width` em `ch` vinda de token, espaçamento entre blocos e títulos com tokens) e `.contact` (coluna centralizada para formulário e painel), usando só variáveis de `css/tokens.css`; confirmar com `tests/unit/design-tokens.test.js` que não há valor literal fora dos tokens (se faltar um token de largura de leitura, adicioná-lo em `css/tokens.css`)

**Checkpoint**: Sobre e Contato carregam sem tocar na API e sem aviso de configuração.

---

## Phase 3: User Story 1 — Entender o que é o Agenda Livre (Priority: P1) 🎯 MVP

**Goal**: A página Sobre explica o projeto em linguagem direta, com títulos coerentes, sem inventar parcerias, com chamada para Explorar.

**Independent Test**: Abrir `sobre.html` por URL direta em desktop e em 320 px; conferir título, seções, nota de que não há inscrições, chamada para Explorar, navegação e ausência de requisições.

### Tests for User Story 1 ⚠️ (escrever primeiro; devem falhar)

- [X] T007 [P] [US1] Acrescentar a `tests/unit/institutional-pages.test.js` verificações de conteúdo lendo `sobre.html` como texto: um único `<h1>` "Sobre o Agenda Livre"; três `<h2>` "O que é o projeto?", "Nosso objetivo" e "Acesso à cultura e à educação" mais "O que o Agenda Livre não faz", nesta ordem, sem pular nível; link "Explorar atividades" para `explorar.html`; `<title>` "Sobre — Agenda Livre"; texto que informa que o site não processa inscrições; ausência das palavras "parceria", "parceiros", "convênio" e de números de telefone/e-mail (FR-001, FR-002, FR-003, FR-031)
- [X] T008 [P] [US1] Escrever `tests/e2e/about.spec.js`: abre `/sobre.html`; `h1` e `h2` visíveis; link "Sobre" do menu com `aria-current="page"`; link de pular ao conteúdo leva a `#main-content`; "Explorar atividades" navega a `explorar.html`; nenhuma requisição à API (`/api/v1`) durante a carga; título do documento "Sobre — Agenda Livre"; em 320 px e com zoom de texto de 200% não há rolagem horizontal (`scrollWidth <= clientWidth`) e o `h1` e a chamada seguem visíveis; com JavaScript desativado o conteúdo continua legível (FR-004, FR-005, FR-006, SC-007)

### Implementation for User Story 1

- [X] T009 [US1] Reescrever o `<main>` de `sobre.html`: `<h1>Sobre o Agenda Livre</h1>` e, dentro de `<div class="prose">`, quatro `<section>` com `<h2>` e parágrafos curtos conforme plan D8 e wireframe DOC-12 §7 — "O que é o projeto?" (site público que reúne informações sobre cursos, eventos e atividades dos CEUs), "Nosso objetivo" (facilitar a descoberta dessas atividades), "Acesso à cultura e à educação" (aproximar a comunidade) e "O que o Agenda Livre não faz" (não processa inscrições; o link externo da atividade leva ao serviço responsável); terminar com `<a class="button" href="explorar.html">Explorar atividades</a>`; manter `<title>`, o script `js/pages/about.js`, cabeçalho e rodapé; sem parcerias, números ou promessas inventadas; para passar T007 e T008

**Checkpoint**: US1 funcional e testável sozinha (MVP).

---

## Phase 4: User Story 2 — Preencher o formulário de contato demonstrativo (Priority: P2)

**Goal**: A página Contato apresenta instrução, aviso demonstrativo e os quatro campos com rótulos, obrigatoriedade e limites, sem nunca enviar dados.

**Independent Test**: Abrir `contato.html`, conferir estrutura e aviso, preencher os campos pelo teclado e confirmar que nenhuma requisição é feita.

### Tests for User Story 2 ⚠️ (escrever primeiro; devem falhar)

- [X] T010 [P] [US2] Escrever `tests/unit/contact-structure.test.js` (jsdom, lendo `contato.html` com `JSDOM` ou `document.write`): um único `<h1>` "Contato"; aviso "formulário demonstrativo" **antes** do `<form>` no DOM; `<form id="contact-form" novalidate>` sem atributo `action`; quatro controles `#contact-name` (`type=text`, `autocomplete=name`), `#contact-email` (`type=email`, `autocomplete=email`, `inputmode=email`), `#contact-subject` (`type=text`), `#contact-message` (`textarea`), todos `required`, cada um com `<label for>` visível e `aria-describedby` apontando para a ajuda `<campo>-hint`; **nenhum** `maxlength`; texto "Todos os campos são obrigatórios." antes dos campos; botões "Enviar mensagem" (`type=submit`) e "Limpar campos" (`type=button`); `<p id="contact-summary" role="status">` vazio; `#contact-confirmation` com `hidden`, `<h2 tabindex="-1">` e botão "Voltar ao formulário"; `<noscript>` com aviso demonstrativo; textos de ajuda citam exatamente os limites de `CONTACT_LIMITS` (importar de `js/contact/validation.js` — este teste só passa após T018) (FR-007 a FR-011, contracts/contact-form.md)
- [X] T011 [P] [US2] Escrever `tests/unit/contact-no-network.test.js` (deve falhar): ler como texto `js/contact/validation.js`, `js/contact/form.js`, `js/pages/contact.js` e `js/pages/about.js` e verificar que não contêm `fetch(`, `XMLHttpRequest`, `sendBeacon`, `localStorage`, `sessionStorage`, `document.cookie`, `innerHTML`, nem importam de `../api/` ou `../config.js` (contracts/no-network.md, FR-012, FR-027)
- [X] T012 [P] [US2] Escrever `tests/e2e/contact-no-network.spec.js`: abre `/contato.html` observando `page.on("request")`; interage (digita, sai dos campos, envia vazio, envia inválido, envia válido, volta, limpa) e verifica que nenhuma requisição além dos recursos estáticos da própria página (`.html`, `.css`, `.js`, fontes) é feita, em particular nenhuma para `/api/v1`, nenhuma com método diferente de GET e nenhuma cujo corpo/URL contenha o texto digitado; recarregar mostra o formulário vazio; a página funciona com `config.js` inválido e com a API fora do ar (FR-012, SC-005, SC-009)
- [X] T013 [P] [US2] Escrever `tests/e2e/contact-keyboard.spec.js`: percorrer o formulário só com Tab na ordem Nome → E-mail → Assunto → Mensagem → Enviar mensagem → Limpar campos, com indicador de foco visível (`:focus-visible` com outline não nulo), preencher e acionar "Enviar mensagem" com Enter e com Espaço; Enter em campo de uma linha submete o formulário; Enter em Mensagem quebra a linha e não submete; sem armadilha de foco (FR-013, SC-006)

### Implementation for User Story 2

- [X] T014 [US2] Reescrever o `<main>` de `contato.html` conforme `contracts/contact-form.md`: `<h1>Contato</h1>`; instrução breve; `<p class="notice">` (ou classe equivalente existente) com "Este formulário é demonstrativo. Nenhuma mensagem será enviada." antes do formulário; `<noscript>` repetindo o aviso e informando que, sem JavaScript, nada é enviado; `<form id="contact-form" class="contact" novalidate>` **sem `action`** com a nota "Todos os campos são obrigatórios." e, para cada campo, `<div class="form-field">` com `<label for>`, controle `required` com os atributos do T010, `<p class="form-hint" id="<campo>-hint">` com a instrução e os limites (Nome: "Entre 2 e 100 caracteres."; E-mail: "Exemplo: nome@exemplo.com. Até 254 caracteres."; Assunto: "Entre 3 e 100 caracteres."; Mensagem: "Entre 10 e 1000 caracteres."), e `aria-describedby="<campo>-hint"`; `<p id="contact-summary" class="form-summary" role="status"></p>`; botões "Enviar mensagem" (`class="button"`, `type=submit`) e "Limpar campos" (`class="button button--secondary"`, `type=button`, `id="contact-clear"`); depois do formulário, `<section id="contact-confirmation" class="confirmation" hidden>` com `<h2 tabindex="-1">Formulário demonstrativo</h2>`, `<p>Este formulário é demonstrativo. Nenhuma mensagem foi enviada.</p>` e `<button type="button" id="contact-back" class="button">Voltar ao formulário</button>`; para passar T010 (exceto a coerência com os limites)
- [X] T015 [P] [US2] Acrescentar a `css/components.css` `.form-field` (rótulo acima do controle, espaçamento entre campos), `.form-hint` (texto auxiliar, tamanho pequeno, contraste adequado), `.form-summary` (vazio não ocupa espaço; com texto, destaque não cromático), `.confirmation` (caixa com borda e título) e o estilo de `textarea` (largura total, altura mínima, redimensionamento vertical), só com variáveis de `css/tokens.css`; sem animação de entrada; reutilizar `.button` e o foco global
- [X] T016 [US2] Criar `js/contact/form.js` com `export function initContactForm(root = document)` mínima — localiza `#contact-form`, retorna sem erro se ausente, intercepta `submit` com `preventDefault()` (sem fazer mais nada ainda) — e chamar `initContactForm()` em `js/pages/contact.js`; para passar T011 e o trecho de T012/T013 que depende do formulário carregado

**Checkpoint**: US2 funcional: formulário completo, acessível por teclado e sem nenhuma rede.

---

## Phase 5: User Story 3 — Corrigir erros de preenchimento com clareza (Priority: P2)

**Goal**: Envio inválido mostra todos os erros específicos, associados aos campos, com foco no primeiro inválido e um único resumo anunciado.

**Independent Test**: Enviar o formulário vazio e com vários campos inválidos; conferir mensagens, `aria-invalid`, foco, resumo e preservação dos valores, com teclado.

### Tests for User Story 3 ⚠️ (escrever primeiro; devem falhar)

- [X] T017 [P] [US3] Escrever `tests/unit/contact-validation.test.js` (deve falhar) cobrindo `data-model.md`: `CONTACT_LIMITS` exportado como `{ name: {min: 2, max: 100}, email: {max: 254}, subject: {min: 3, max: 100}, message: {min: 10, max: 1000} }`; `validateContact(values)` devolve `{ valid, errors, order }`; todos vazios → 4 erros com as mensagens de "Vazio" da tabela e `order` = `["name","email","subject","message"]`; valores só com espaços tratados como vazios; espaços nas extremidades de valores válidos não geram erro; bordas exatas (Nome 1/2/100/101, Assunto 2/3/100/101, Mensagem 9/10/1000/1001 caracteres, E-mail com 254 e 255 caracteres) com as mensagens "Curto"/"Longo" da tabela; e-mails válidos (`a@b.co`, `nome.sobrenome+tag@exemplo.com.br`) e inválidos (`abc`, `a@b`, `a@@b.com`, `a b@c.com`, `@c.com`, `a@.com`) com a mensagem "Informe um e-mail válido, como nome@exemplo.com."; entrada com `<b>x</b>` é aceita como texto comum quando dentro dos limites; valores `undefined`/`null` tratados como vazios; erros de vários campos retornados juntos (FR-014, FR-015, FR-021)
- [X] T018 [P] [US3] Escrever `tests/unit/contact-form.test.js` (jsdom, com `mountContactDom()`; deve falhar) cobrindo `contracts/contact-form.md`: antes do primeiro envio não há `.field-error` nem `aria-invalid`; envio vazio → 4 `.field-error` (`<p id="<campo>-error">`) com as mensagens, cada campo com `aria-invalid="true"` e `aria-describedby` = `"<campo>-hint <campo>-error"`, `document.activeElement` = `#contact-name`, `#contact-summary` com "4 campos precisam de correção."; um só campo inválido → "1 campo precisa de correção."; e-mail e mensagem inválidos com nome e assunto válidos → foco em `#contact-email`, os valores de nome e assunto preservados, e os valores inválidos também preservados; digitar um valor válido no campo com erro (evento `input`) remove seu `.field-error`, o `aria-invalid` e volta o `aria-describedby` a só a ajuda, sem alterar o resumo nem criar erros nos outros campos; digitar um valor ainda inválido mantém o erro; `fetch` espiado nunca chamado; segundo envio inválido não duplica `.field-error` nem acumula texto no resumo; sem `<form>` na página `initContactForm` não lança (FR-015 a FR-019, FR-021)
- [X] T019 [P] [US3] Escrever `tests/e2e/contact-validation.spec.js`: enviar o formulário vazio → quatro mensagens visíveis, uma por campo, foco no Nome, resumo visível; preencher e-mail `abc`, assunto `ab` e mensagem com 1001 caracteres (colada por `fill`) → mensagens específicas e o texto da mensagem inteiro mantido no campo; o erro de um campo some ao corrigi-lo; Tab percorre os campos inválidos restantes e cada um mostra seu `aria-describedby` com a mensagem de erro; campo inválido tem `aria-invalid="true"` e borda diferente (indício não cromático: `border-style: dashed` ou prefixo "Erro:" no texto); e-mail inválido não exibe balão nativo do navegador (`novalidate`); mensagem em português (FR-015 a FR-020, SC-002, SC-003)

### Implementation for User Story 3

- [X] T020 [US3] Implementar `js/contact/validation.js` para passar T017: exportar `CONTACT_LIMITS` e `validateContact(values)` puros (sem DOM), aparando cada valor com `String(value ?? "").trim()`, contando caracteres do valor aparado, e-mail validado por `^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$` (sem pontos consecutivos nem espaços) e comprimento ≤ 254, mensagens exatamente as de `data-model.md`, `order` na ordem name, email, subject, message
- [X] T021 [US3] Implementar em `js/contact/form.js` o ramo de envio inválido para passar T018: no `submit`, ler os valores dos quatro controles, chamar `validateContact`; se inválido, para cada campo inválido criar/atualizar `<p class="field-error" id="<campo>-error">` logo após a ajuda (via `textContent`), definir `aria-invalid="true"` e `aria-describedby="<campo>-hint <campo>-error"`; limpar erros de campos agora válidos; escrever em `#contact-summary` "N campo(s) precisa(m) de correção." (singular/plural) apagando antes o texto anterior; focar o primeiro campo de `order`; ouvir `input` em cada controle e, se houver erro nele e o valor passou a ser válido, removê-lo e restaurar `aria-describedby` só com a ajuda; nenhum erro antes do primeiro envio; nenhum `innerHTML`

**Checkpoint**: US3 funcional e testável sozinha sobre a estrutura da US2.

---

## Phase 6: User Story 4 — Ver a confirmação demonstrativa e voltar ao formulário (Priority: P2)

**Goal**: Envio válido troca o formulário por um painel que afirma que é demonstrativo e que nada foi enviado; é possível voltar com os valores preservados ou limpar.

**Independent Test**: Preencher com dados válidos, enviar, conferir texto, foco e anúncio do painel; voltar e conferir valores; limpar e recarregar.

### Tests for User Story 4 ⚠️ (escrever primeiro; devem falhar)

- [X] T022 [P] [US4] Acrescentar a `tests/unit/contact-form.test.js` (deve falhar): envio válido → `#contact-form` com `hidden`, `#contact-confirmation` sem `hidden`, `document.activeElement` = o `h2` do painel, `#contact-summary` vazio e fora do painel (a mudança é anunciada pela região `role="status"` do painel ou por texto próprio, sem duplicar), nenhum `fetch` chamado, nenhum `.field-error`; o painel não contém os valores digitados (digitar `<img src=x onerror=alert(1)>` no assunto não cria nó `img` em lugar algum); o texto do painel contém "demonstrativo" e "Nenhuma mensagem foi enviada" e **não** contém "recebida", "recebemos", "enviada com sucesso", "entregue" nem "retornaremos"; `#contact-back` → formulário visível, painel `hidden`, valores nos quatro campos iguais aos digitados, sem `.field-error`/`aria-invalid`, resumo vazio, foco em `#contact-name`; `#contact-clear` → quatro campos vazios, erros e resumo removidos, foco em `#contact-name`; envios válidos repetidos mantêm um único painel (FR-022 a FR-027)
- [X] T023 [P] [US4] Escrever `tests/e2e/contact-confirmation.spec.js`: preencher dados válidos e enviar → painel visível com o `h2` "Formulário demonstrativo" focado (`toBeFocused`), texto "Nenhuma mensagem foi enviada" visível, formulário oculto, URL inalterada e sem recarregar a página; "Voltar ao formulário" → valores mantidos e foco no Nome; "Limpar campos" → vazio; recarregar → vazio; com `reducedMotion: "reduce"` o painel aparece sem transição (`transition-duration`/`animation-duration` computados em 0 ou desprezíveis); em 320 px e com zoom 200% painel e formulário continuam utilizáveis sem rolagem horizontal; nenhum texto da página contém "recebida" ou "enviada com sucesso" (FR-022 a FR-028, SC-004, SC-007)

### Implementation for User Story 4

- [X] T024 [US4] Completar `js/contact/form.js` para passar T022: envio válido → remover erros, definir `hidden` no formulário e removê-lo do painel, focar o `h2` do painel (`tabindex="-1"` já no HTML), sem escrever valores digitados em nenhum lugar; `#contact-back` → remover `hidden` do formulário e recolocá-lo no painel, limpar erros e resumo, manter os valores, focar `#contact-name`; `#contact-clear` → `form.reset()`, remover erros/`aria-invalid`/resumo e focar `#contact-name`; impedir painel duplicado em envios repetidos; nenhum `innerHTML`, nenhum armazenamento
- [X] T025 [US4] Garantir que a troca de estado não depende de animação (FR-028): conferir em `css/components.css` que `.confirmation` não define `transition`/`animation`, ou que qualquer uma usa `var(--motion-duration)` e é zerada pelo bloco `prefers-reduced-motion` existente; ajustar se necessário para passar T023

**Checkpoint**: Fluxo demonstrativo completo (US2 + US3 + US4).

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Acessibilidade, regressão e documentação

- [X] T026 [P] Escrever `tests/e2e/institutional-accessibility.spec.js` seguindo `tests/e2e/accessibility.spec.js` (mesmas tags WCAG e `AxeBuilder`): `sobre.html`; `contato.html` nos estados inicial, com erros (após enviar vazio), confirmado (após enviar válido) e de volta ao formulário; asserir zero violações; verificar também que cada `<input>`/`<textarea>` tem nome acessível não vazio e que, no estado com erros, cada campo inválido tem `aria-describedby` apontando para um elemento existente (FR-016, FR-030, SC-008). Registrar no cabeçalho do arquivo que a verificação automática não prova conformidade integral
- [X] T027 [P] (já coberto: `PAGES` desses specs já inclui `sobre.html` e `contato.html`; sem alterações necessárias) Estender `tests/e2e/responsive-reflow.spec.js` e `tests/e2e/reduced-motion.spec.js` (e `tests/e2e/visual-consistency.spec.js`, se aplicável) para incluir `sobre.html` e `contato.html` (320 px sem rolagem horizontal, movimento reduzido, consistência de cabeçalho/rodapé), sem alterar as asserções das demais páginas
- [X] T028 Rodar `npm test` e `npx playwright test` e corrigir regressões (em especial `tests/e2e/structure-config.spec.js`, `navigation.spec.js`, `accessibility.spec.js`, `tests/unit/site-shell.test.js` e `design-tokens.test.js`); confirmar que o teste de coerência de T010 com `CONTACT_LIMITS` passa
- [X] T029 [P] Atualizar o `README.md` com a organização de `js/contact/`, o fato de Sobre e Contato não usarem a API, os limites do formulário e os novos comandos de teste; atualizar `docs/PENDENCIAS-BACKEND.md` apenas se surgir divergência (não prevista: Sobre e Contato não têm endpoint)
- [ ] T030 Executar a validação manual de `specs/008-institutional-pages/quickstart.md` (teclado, leitor de tela, zoom 200%, 320 px, movimento reduzido, API fora do ar) e registrar o resultado, versão testada e problemas encontrados em uma seção "Resultado da validação" ao final de `quickstart.md`; só então marcar a feature como concluída

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências; T001 e T002 em paralelo.
- **Foundational (Phase 2)**: depende apenas de T002 estar planejado (T002 ajusta um teste existente que passará a refletir T004/T005); bloqueia todas as histórias. Ordem: T003 → T004, T005; T006 em paralelo.
- **US1 (Phase 3)**: depende da Phase 2. Independente das demais.
- **US2 (Phase 4)**: depende da Phase 2 e de T001. Independente de US1.
- **US3 (Phase 5)**: depende de US2 (estrutura e `form.js`).
- **US4 (Phase 6)**: depende de US3 (mesmo `form.js` e a validação que decide entre erro e confirmação).
- **Polish (Phase 7)**: depende das histórias desejadas.

### User Story Dependencies

- **US1**: nenhuma além da Foundational → MVP.
- **US2**: nenhuma além da Foundational.
- **US3**: US2.
- **US4**: US3.

### Within Each User Story

- Testes escritos e falhando antes da implementação.
- Regra pura (`validation.js`) antes do DOM (`form.js`); HTML antes do JavaScript que o liga.
- `js/contact/form.js` é tocado por T016, T021 e T024: executar em sequência.

### Parallel Opportunities

- Phase 1: T001, T002.
- Phase 2: T003 e T006 juntas.
- US1: T007 e T008 juntas, em paralelo com o início da US2.
- US2: T010, T011, T012, T013 e T015 juntas.
- US3: T017, T018 e T019 juntas.
- US4: T022 e T023 juntas.
- Polish: T026, T027 e T029 juntas.

### Parallel Example: User Story 3

```text
T017 tests/unit/contact-validation.test.js
T018 tests/unit/contact-form.test.js
T019 tests/e2e/contact-validation.spec.js
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Phases 1 e 2.
2. Phase 3 (Sobre).
3. Validar com `npx playwright test about` e a revisão manual do item 1 do quickstart.

### Incremental Delivery

1. Setup + Foundational → páginas desacopladas da API.
2. US1 → Sobre pronta (MVP).
3. US2 → formulário estrutural, sem envio.
4. US3 → validação acessível.
5. US4 → confirmação demonstrativa; fluxo completo.
6. Polish → axe, reflow, regressão e documentação.

---

## Notes

- [P] = arquivos diferentes, sem dependência.
- [Story] liga a tarefa à história para rastreabilidade.
- O texto de Sobre é um texto base de fácil substituição; o definitivo será validado à parte (DOC-12 §7).
- Confirme que cada teste falha antes de implementar.
- Faça commit após cada tarefa ou grupo lógico (apenas quando solicitado).
