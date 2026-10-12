# Quickstart: validar a feature 010

Guia de verificação ponta a ponta. Detalhes de formato estão em `contracts/` e `data-model.md`.

## Pré-requisitos

- Node.js 20 ou superior e Python 3 no `PATH`.
- Cópia do repositório; `npm install`; `npx playwright install chromium` (na primeira vez).
- Porta 5500 livre (encerre qualquer `python -m http.server` aberto nela).
- Opcional, só para a verificação de contrato: backend de demonstração em execução (por exemplo `http://localhost:8000/api/v1`).

## 1. Linha de base (antes de mexer)

```sh
npm test               # esperado: 692 aprovados (ou mais, nunca menos)
npx playwright test    # esperado: 624 aprovados e 20 ignorados com motivo
```

Anote as contagens: SC-009 exige que continuem aprovadas.

## 2. Matriz e lacunas (História 1)

1. Abrir `specs/010-testing-quality/contracts/coverage-matrix.md`; nenhum item `a-confirmar` pode restar.
2. `npx vitest run tests/unit/coverage-matrix.test.js tests/unit/security-text-as-text.test.js tests/unit/security-external-url.test.js tests/unit/no-secrets.test.js tests/unit/error-messages-no-leak.test.js tests/unit/image-field.test.js` → verde.
3. `npx playwright test image-display stale-responses error-no-leak` → verde.
4. Prova de regressão (reverter depois): aceitar `javascript:` em `js/details/external-link.js`, trocar `textContent` por `innerHTML` no cartão, e responder erro com `stack` na mensagem; cada alteração deve reprovar pelo menos um teste.

## 3. Comando único e guia (História 2)

```sh
npm run test:all       # unitária e depois navegador; falha se qualquer uma falhar
npm run test:a11y      # só acessibilidade
```

- Em uma cópia limpa (sem `node_modules`), seguir só `docs/19-guia-de-testes.md` até o resultado final (SC-002, meta de 15 minutos sem contar download).
- Quebrar um teste de propósito: o nome deve descrever o comportamento e a falha mostrar esperado e obtido.
- Rodar `npm run test:all` duas vezes sem mudar nada: resultados idênticos (SC-004).

## 4. Registro (História 3)

1. Executar `npm run test:all` no commit a registrar e copiar as contagens reais para `docs/20-registro-de-qualidade.md`.
2. `npx vitest run tests/unit/quality-report.test.js` → verde (arquivos citados existem; vocabulário válido).
3. Conferir que os 11 critérios do DOC-14 §14 têm situação e evidência e que nada manual foi marcado como `atendido`.

## 5. Contrato real (História 4)

```sh
npm test                                   # sem API_BASE_URL: contrato aparece como ignorado, suíte verde
API_BASE_URL=http://localhost:8000/api/v1 npm run test:contract
```

Divergências vão para `docs/PENDENCIAS-BACKEND.md`. Confirmar que nada foi gravado no backend (somente `GET`).

## 6. CI (História 5, opcional)

Abrir um pull request de teste: o fluxo roda `npm run test:all` em ambiente limpo; quebrar um teste de propósito reprova e publica o relatório; reverter volta ao verde. A verificação de contrato não roda no CI.

## Resultado esperado

Todos os passos acima concluídos, matriz sem `a-confirmar`, contagens do registro iguais às de uma execução nova no mesmo commit, e nenhum teste da linha de base removido ou enfraquecido.
