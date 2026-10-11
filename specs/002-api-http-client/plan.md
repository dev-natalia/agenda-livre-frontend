# Implementation Plan: Cliente e integração com a API

**Branch**: `002-api-http-client` | **Date**: 2026-10-11 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/002-api-http-client/spec.md`

## Summary

Criar o cliente HTTP compartilhado do frontend (`js/api/client.js`) sobre a Fetch API, com: montagem segura de endereços (`URL`/`URLSearchParams`) a partir da configuração única da feature 001; interpretação de JSON, resposta sem corpo e resposta inválida; erros tipados e classificados por categoria (configuração, conexão, tempo esgotado, `400`, `404`, `429`, `5xx`, outro HTTP, resposta inválida) com mensagem amigável em pt-BR e indicação de nova tentativa; e cancelamento de consultas substituídas por contexto (`AbortController`), de modo que respostas e erros antigos nunca alterem a interface. Uma apresentação de erro reutilizável (`js/components/error-state.js`) mostra a mensagem em região de status acessível com o botão "Tentar novamente" quando cabível. Nenhuma tela de listagem/detalhe é criada; o consumo real ocorre nas features seguintes.

## Technical Context

**Language/Version**: HTML5, CSS3, JavaScript ES2022 (ES Modules); Node.js 20+ apenas para testes

**Primary Dependencies**: nenhuma em produção; dev: as já existentes (`vitest`, `jsdom`, `@playwright/test`)

**Storage**: N/A (sem cache de respostas)

**Testing**: Vitest + jsdom (cliente com `fetch` simulado; componente de erro); Playwright com `page.route` para falha seguida de nova tentativa (DOC-14, FE-042). axe-core fica para FE-043

**Target Platform**: navegadores modernos, arquivos estáticos

**Project Type**: web, frontend estático separado do backend Django

**Performance Goals**: tempo limite de 15 s por consulta (SC-008)

**Constraints**: sem framework; sem biblioteca de HTTP; somente `GET`, sem credenciais; mensagens sem detalhes técnicos; texto inserido via `textContent`; foco nunca movido por atualização

**Scale/Scope**: 1 módulo de cliente, 1 módulo de erros, 1 componente, 1 pequena página de verificação E2E reaproveitando as páginas existentes (sem nova página pública)

## Constitution Check

A constituição (`.specify/memory/constitution.md`) segue como modelo não preenchido; os gates vêm dos DOC-09 §8, DOC-13 §12 e DOC-15:

- Fetch API em módulo central, `URL`/`URLSearchParams`, `response.ok` (DOC-09 §8.2): PASS
- Erro HTTP ≠ erro de rede ≠ resposta inválida (DOC-09 §8.2): PASS
- Respostas antigas não sobrescrevem recentes (DOC-09 §8.4): PASS
- Mensagens sem detalhes internos; foco não deslocado (DOC-13 §12): PASS
- Sem framework/dependência de runtime (DOC-09): PASS
- URL base só de `config.js`: PASS

Reavaliação pós-design: sem violações; Complexity Tracking não se aplica.

## Project Structure

### Documentation (this feature)

```text
specs/002-api-http-client/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api-client.md
│   └── error-state.md
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
js/
├── config.js                 # existente (feature 001); recebe requestTimeoutMs
├── api/
│   ├── client.js             # request(), createRequestScope()
│   └── errors.js             # ApiError, categorias, mensagens, retryable
└── components/
    ├── config-notice.js      # existente
    └── error-state.js        # renderErrorState(): mensagem + "Tentar novamente"
css/
└── components.css            # criado agora: estilos de .error-state (ligado nas páginas que usam)
tests/
├── unit/
│   ├── api-client.test.js
│   ├── api-errors.test.js
│   ├── request-scope.test.js
│   └── error-state.test.js
└── e2e/
    └── api-error-retry.spec.js
```

**Structure Decision**: segue o DOC-09 §6 (`js/api/client.js`). `errors.js` é separado para que mensagens e classificação sejam testáveis sem rede. O componente de erro mora em `components/` por ser compartilhado pelas telas futuras. O teste E2E monta o componente numa página existente via módulo de teste servido pelo próprio fixture do Playwright (sem criar página pública); ver [research.md](research.md) D7.

## Complexity Tracking

Sem violações a justificar.
