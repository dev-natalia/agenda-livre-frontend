# Contrato: registro de qualidade (`docs/20-registro-de-qualidade.md`)

## Estrutura obrigatória

1. **Identificação**: data, commit, ramo, quem executou.
2. **Ambiente**: sistema, Node.js, Python, navegador (build), versões de Vitest, Playwright, axe-core. Dizer o que **não** foi usado (Firefox, WebKit, leitor de tela, aparelhos reais, API real).
3. **Resultados**: tabela por suíte (unitária, navegador, acessibilidade, contrato) com aprovados, falhos, ignorados e duração. Os números vêm de uma execução real no commit citado.
4. **Ignorados**: um grupo por linha, com quantidade e motivo.
5. **Defeitos**: id (`QA-001`…), passos de reprodução, páginas e estados, impacto, gravidade, situação, teste de regressão. Defeitos que bloqueiam teclado, leitor de tela ou tarefa central vêm primeiro.
6. **Exceções**: escopo, motivo, mitigação.
7. **Critérios de aceite do DOC-14 §14**: os 11 critérios, um por linha, com situação (`atendido`, `atendido-com-ressalva`, `nao-verificado`) e evidência.
8. **Limitações conhecidas** e **próximas verificações manuais**.
9. **Referências**: DOC-14, DOC-17 (acessibilidade, sem copiar números), guia de testes, matriz de cobertura.

## Regras de redação

- `atendido` só aparece ligado a evidência executada (teste, comando e resultado) ou a documento conferido.
- Não afirmar conformidade WCAG nem "sem defeitos"; usar "nenhum defeito encontrado nas verificações descritas".
- Não repetir números do DOC-17; apontar para ele.
- Verificações manuais não executadas ficam `nao-verificado`, nunca `atendido`.
- Contagens e nomes de arquivos citados são conferidos por `tests/unit/quality-report.test.js` (arquivos existem; situações pertencem ao vocabulário acima).
