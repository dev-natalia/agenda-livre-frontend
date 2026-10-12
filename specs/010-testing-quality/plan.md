# Implementation Plan: Testes e qualidade do frontend

**Branch**: `010-testing-quality` | **Date**: 2026-10-12 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/010-testing-quality/spec.md`

## Summary

Entregar o épico EP-FE-10 (FE-041 a FE-044) como **auditoria da suíte existente, fechamento de lacunas e documentação operacional**, sem funcionalidade nova de produto. As features 001 a 009 já trazem 42 arquivos de teste unitário e 39 de navegador, com axe em matriz. Escolhas: (1) uma **matriz de cobertura** (`contracts/coverage-matrix.md`) liga cada item do DOC-14 §6, §7, §8, §11 e §12 ao teste que o cumpre ou à lacuna declarada, e é a fonte do que falta testar; (2) as lacunas automatizáveis viram **testes parametrizados** em poucos arquivos novos (`security-*`, `no-secrets`, `error-messages-no-leak`, `image-field`, `stale-responses`), sem repetir casos por página; (3) **fixtures compartilhadas** passam a viver em `tests/fixtures/activities.js` (hoje espalhadas em `mock-api.js`), com os casos do DOC-14 §12 e o formato real do campo `image` (`{url, alt, decorative}` ou `null`), reexportadas por `mock-api.js` para não quebrar os testes atuais; (4) um **comando único** `npm run test:all` (unitária e depois navegador, falhando se qualquer uma falhar) e `test:a11y`, `test:contract`; (5) uma **verificação de contrato opcional** (`tests/contract/`, Vitest com `fetch` real, somente `GET`), ligada à variável `API_BASE_URL` e ignorada de forma explícita sem ela; (6) **dois documentos novos**: `docs/19-guia-de-testes.md` (fonte única de instruções) e `docs/20-registro-de-qualidade.md` (resultado datado, DOC-14 §14–15), mais um teste que impede o registro de citar testes inexistentes; (7) **CI opcional** em `.github/workflows/tests.yml` (o remoto é o GitHub), sem a verificação de contrato; (8) **uma correção de produto pequena e justificada**: a página de detalhes ainda ignora `image` (só mostra o fallback), enquanto a spec exige comportamento definido e testado nos dois lugares; ela passa a reutilizar a lógica de mídia do cartão (`image.url` http/https, `alt` ou `alt=""` se decorativa, fallback em erro de carga).

## Technical Context

**Language/Version**: HTML5, CSS3, JavaScript ES2022 (ES Modules); Node.js 20+ para testes (desenvolvido com 24); Python 3 apenas para o servidor estático de teste

**Primary Dependencies**: nenhuma em produção; dev: `vitest`, `jsdom`, `@playwright/test`, `@axe-core/playwright` (existentes). Nenhum pacote novo

**Storage**: nenhum; fixtures são módulos JavaScript

**Testing**: Vitest (unidade, estrutura, segredos, contrato opcional); Playwright (fluxos, respostas fora de ordem, imagem, vazamento de erro na tela); axe-core (matriz da feature 009, inalterada); verificações manuais descritas no guia e registradas como `nao-verificado`

**Target Platform**: navegadores modernos (Chromium obrigatório; outros só se o custo for pequeno); arquivos estáticos

**Project Type**: web, frontend estático separado do backend Django

**Performance Goals**: suíte unitária em menos de 1 minuto; suíte de navegador no ritmo atual (cerca de 4 minutos com 2 workers); CI total em até ~10 minutos

**Constraints**: sem framework; sem remover, desativar ou enfraquecer teste existente (linha de base: 692 unitários, 624 de navegador, 20 ignorados de propósito); sem `retries` no Playwright; testes sem rede externa, sem dados pessoais e com relógio controlado; contrato real só por `GET`; nenhuma mudança no backend; divergências de contrato vão para `docs/PENDENCIAS-BACKEND.md`

**Scale/Scope**: matriz com ~80 itens do DOC-14; ~6 arquivos de teste novos; ~1 módulo de fixtures; 1 arquivo de contrato; 2 documentos; 1 workflow; 1 ajuste em `js/details/render.js` e `js/components/activity-card.js`

## Constitution Check

A constituição (`.specify/memory/constitution.md`) segue como modelo não preenchido; os gates vêm do DOC-14, do DOC-15 §8 e das decisões das features 001 a 009:

- HTML/CSS/JS puros, ES Modules, sem framework (DOC-09): PASS
- Ferramentas mínimas do DOC-14 §4 (Vitest, Playwright, axe-core), sem trocar nem acrescentar pacotes: PASS (D1)
- Mocks não são única evidência de integração (DOC-14 §7, §12): PASS (D4)
- Resultado automático não é prova de conformidade WCAG (DOC-14 §9.7): PASS (D6)
- Nenhum teste desativado para obter verde; ignorados com motivo (DOC-14 §13): PASS (D2, D6)
- Dados sintéticos, sem dados pessoais reais (DOC-14 §12): PASS (D3)
- Texto da API como texto, URLs externas validadas, sem segredos (DOC-14 §11): PASS (D5)
- Backend inalterado; divergências em `PENDENCIAS-BACKEND.md` (002): PASS
- Escopo de acessibilidade mantido no EP-FE-09: PASS

Reavaliação pós-design: sem violações. Sem entradas em Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/010-testing-quality/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── coverage-matrix.md      # DOC-14 × teste ou lacuna; fonte do que testar
│   ├── api-image-contract.md   # formato esperado de `image` e tratamento no frontend
│   ├── contract-check.md       # verificação opcional contra a API real
│   └── quality-report.md       # formato do registro e regras de redação
├── checklists/requirements.md
└── tasks.md                    # gerado por /speckit-tasks

docs/
├── 19-guia-de-testes.md        # NOVO: como instalar, rodar, interpretar, ampliar
└── 20-registro-de-qualidade.md # NOVO: resultado datado (DOC-14 §14–15)
```

### Source Code (repository root)

```text
package.json                    # scripts: test:all, test:a11y, test:contract
.github/workflows/tests.yml     # NOVO, opcional (História 5)

js/
├── components/activity-card.js # image.decorative -> alt="" (se faltar)
└── details/render.js           # passa a exibir `image` (hoje só o fallback)

tests/
├── fixtures/
│   └── activities.js           # NOVO: casos do DOC-14 §12 (completa, sem imagem, imagem informativa/decorativa, recorrente, cancelada, vazia, páginas)
├── unit/
│   ├── security-text-as-text.test.js     # marcação e caracteres especiais em cartão, detalhes e erros (jsdom)
│   ├── security-external-url.test.js     # esquemas permitidos/rejeitados, rel, indicação
│   ├── no-secrets.test.js                # varre HTML/CSS/JS publicados; config só com URL base
│   ├── error-messages-no-leak.test.js    # mensagens de ApiError sem pilha, host interno, token, corpo bruto
│   ├── image-field.test.js               # object | null | ausente | url inválida | decorativa
│   ├── coverage-matrix.test.js           # arquivos citados na matriz existem
│   └── quality-report.test.js            # arquivos citados no registro existem
├── e2e/
│   ├── image-display.spec.js             # cartão e detalhes com imagem informativa, decorativa, ausente, quebrada
│   ├── stale-responses.spec.js           # respostas fora de ordem não sobrescrevem a mais recente
│   ├── error-no-leak.spec.js             # falhas reais na tela sem detalhes internos
│   └── helpers/mock-api.js               # passa a reexportar de tests/fixtures
└── contract/
    └── api-contract.test.js              # opcional, GET only, ignorado sem API_BASE_URL

vitest.config.js                # projeto separado para tests/contract (fora do `npm test`)
README.md                       # resumo e link para o guia
docs/PENDENCIAS-BACKEND.md      # divergências achadas pela verificação de contrato
```

**Structure Decision**: o repositório já é o frontend (sem pasta `frontend/`). Esta feature acrescenta `tests/fixtures/` e `tests/contract/`, dois documentos e um workflow; não reorganiza `tests/unit` nem `tests/e2e`. Arquivos de teste só existem quando há comportamento a verificar (convenção do README).

## Complexity Tracking

Sem violações a justificar.
