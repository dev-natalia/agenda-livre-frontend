# Implementation Plan: Páginas institucionais e contato

**Branch**: `008-institutional-pages` | **Date**: 2026-10-12 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/008-institutional-pages/spec.md`

## Summary

Entregar o épico EP-FE-08 (FE-030 a FE-033) em `sobre.html` e `contato.html`, hoje esqueletos com texto provisório. As duas páginas são **estáticas e independentes da API** (DOC-05 §3.3; feature 009 do backend). Escolhas: (1) **Sobre** é HTML estático com seções `<section>` e subtítulos, texto base só com fatos documentados e chamada para Explorar; `about.js` mantém só a navegação (sem aviso de configuração, pois a página não usa a API); (2) **Contato** é um `<form novalidate>` escrito em HTML, com rótulos, texto de ajuda e limites visíveis, `required`, `type`/`autocomplete` adequados e `aria-describedby`; o `<noscript>` e o aviso "formulário demonstrativo" ficam no HTML, de modo que, sem JavaScript, nada sugere envio; (3) regras de validação numa **função pura** `validateContact(values)` e limites num único `CONTACT_LIMITS` (`js/contact/validation.js`), usados por validação, textos de ajuda e testes; (4) `js/contact/form.js` liga o DOM: envio inválido renderiza todos os erros via `.field-error` já existente, marca `aria-invalid`, move o foco ao primeiro campo inválido e anuncia o resumo numa única região de status; envio válido troca o formulário pelo painel de confirmação (`hidden`), foca o título do painel (`tabindex="-1"`) e anuncia; "Voltar ao formulário" reexibe o formulário com valores preservados e foca o primeiro campo; "Limpar campos" esvazia e remove erros; (5) **nada de rede nem de armazenamento**: os módulos não importam o cliente da API, não usam `fetch`, `XMLHttpRequest`, `sendBeacon` nem `localStorage`/`sessionStorage`, e o `<form>` não tem `action`; o envio é interceptado com `preventDefault`; (6) dados digitados só tocam o DOM por `value`/`textContent` e o painel de confirmação não repete os valores; (7) o aviso de configuração da API deixa de ser exibido nestas duas páginas.

## Technical Context

**Language/Version**: HTML5, CSS3, JavaScript ES2022 (ES Modules); Node.js 20+ apenas para testes

**Primary Dependencies**: nenhuma em produção; dev: `vitest`, `jsdom`, `@playwright/test`, `@axe-core/playwright` (existentes)

**Storage**: nenhum (nem `localStorage`, `sessionStorage` nem cookies); os valores vivem só no DOM da página aberta

**Testing**: Vitest (`validateContact` com todos os limites nas bordas, espaços, e-mail válido/inválido, mensagens específicas; `CONTACT_LIMITS` coerente com o texto de ajuda do HTML; `form.js` em jsdom: envio vazio, múltiplos erros, foco no primeiro inválido, resumo anunciado uma vez, remoção do erro ao corrigir, painel, voltar com valores, limpar, nenhum `fetch` chamado, entrada com `<b>` tratada como texto; `about.js`/`contact.js` sem aviso de configuração); Playwright (fluxos das 4 histórias, Enter em campo de linha e em Mensagem, teclado puro, 320 px/200 %, `reducedMotion`, nenhuma requisição com dados do formulário, páginas funcionais com API fora do ar e sem configuração, axe em Sobre e nos estados inicial/erro/confirmado de Contato); revisão manual com leitor de tela registrada em `quickstart.md`

**Target Platform**: navegadores modernos, arquivos estáticos

**Project Type**: web, frontend estático separado do backend Django

**Performance Goals**: 0 requisições à API nas duas páginas; resposta do formulário imediata (< 100 ms) à ação de enviar

**Constraints**: sem framework nem roteador; sem `innerHTML` com dado digitado; nenhum valor de cor/tamanho fora dos tokens; reaproveitar `.field-error`, `[aria-invalid]`, `.button`, tokens e foco existentes; contrato da API inalterado; URLs `sobre.html`/`contato.html` inalteradas

**Scale/Scope**: 2 páginas HTML alteradas, 2 módulos novos em `js/contact/`, `js/pages/contact.js` e `about.js` ajustados, bloco de CSS (texto institucional, formulário de contato, painel de confirmação), ~9 specs de teste novas

## Constitution Check

A constituição (`.specify/memory/constitution.md`) segue como modelo não preenchido; os gates vêm do DOC-09 §14, DOC-11 §5.4–5.5, DOC-12 §7–8, DOC-13 §10–11, DOC-15 §5.4 e das decisões das features 001–007:

- HTML/CSS/JS puros, ES Modules, sem framework nem roteador (DOC-09): PASS
- Sobre e Contato não consultam a API (DOC-05 §3.3): PASS (D1)
- Formulário demonstrativo nunca envia nem guarda dados; não alega envio/recebimento (DOC-09 §14, DOC-15): PASS (D2, D5)
- Todos os erros de uma vez, específicos, associados ao campo, foco no primeiro inválido, sem depender de cor (DOC-13 §11, DOC-15 §5.4): PASS (D3, D4)
- Rótulos visíveis, obrigatoriedade em texto e programática, limites junto ao campo (DOC-15 §5.4): PASS (D3)
- Painel de confirmação anunciado, foco previsível, "Voltar ao formulário" preserva valores (DOC-13 §11): PASS (D5)
- Valores digitados tratados como texto (003): PASS (D6)
- Tokens e estilos compartilhados, WCAG 2.2 AA, reflow 320 px, movimento reduzido (004, DOC-15): PASS (D7)
- Limites numéricos definidos na implementação e coerentes com os testes (DOC-09 §14, DOC-13 §11): PASS (D3)

Reavaliação pós-design: sem violações. Sem entradas em Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/008-institutional-pages/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── contact-form.md       # campos, limites, mensagens, foco e anúncios
│   └── no-network.md         # garantia de ausência de rede/armazenamento
├── checklists/requirements.md
└── tasks.md                  # gerado por /speckit-tasks
```

### Source Code (repository root)

```text
sobre.html                       # conteúdo institucional estático
contato.html                     # formulário, aviso, painel de confirmação, noscript
js/
├── contact/
│   ├── validation.js            # NOVO: CONTACT_LIMITS, validateContact(values) (pura)
│   └── form.js                  # NOVO: initContactForm(root): erros, foco, painel, voltar, limpar
└── pages/
    ├── about.js                 # só initSiteNav() (sem aviso de configuração)
    └── contact.js               # initSiteNav() + initContactForm()
css/
├── layout.css                   # + .prose (texto institucional), .contact (coluna centralizada)
└── components.css               # + .form-field, .form-hint, .form-summary, .confirmation

tests/
├── unit/
│   ├── contact-validation.test.js
│   ├── contact-form.test.js
│   ├── contact-no-network.test.js
│   └── institutional-pages.test.js
└── e2e/
    ├── about.spec.js
    ├── contact-validation.spec.js
    ├── contact-confirmation.spec.js
    ├── contact-no-network.spec.js
    └── institutional-accessibility.spec.js
```

**Structure Decision**: Mantém o frontend estático por página. Regra sem DOM em `validation.js` (testável em Node); efeitos de DOM em `form.js`; as páginas só orquestram, no padrão `init()` das demais. O HTML contém a estrutura completa do formulário (não gerada por JS), para que rótulos, ajuda e aviso existam mesmo sem JavaScript.

## Complexity Tracking

Sem violações a justificar.
