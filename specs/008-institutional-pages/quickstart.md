# Quickstart: validar Sobre e Contato

## Pré-requisitos

- Node.js 20+ e `npm install` feito. A API não é necessária.

## Testes automáticos

```bash
npm test                                          # Vitest
npx playwright test about contact institutional   # fluxos, rede e axe
npx playwright test                               # regressão completa
```

Esperado: tudo verde, sem violações graves de acessibilidade.

## Validação manual

1. Servir (`python tests/static-server.py`) e abrir `sobre.html`: um `h1`, seções com `h2`, chamada "Explorar atividades"; nenhum aviso de configuração; texto sem parcerias ou promessas.
2. **Contato (US2)**: aviso demonstrativo antes do formulário; rótulos visíveis; ajuda com limites; Tab na ordem visual; com a aba Rede aberta, interagir: nenhuma requisição.
3. **Validação (US3)**: enviar vazio → 4 erros, foco no Nome, resumo "4 campos precisam de correção."; e-mail `abc`, assunto `ab`, mensagem de 1001 caracteres → mensagens específicas; corrigir um campo → seu erro some; colar 1500 caracteres em Mensagem → texto mantido e erro de excesso.
4. **Confirmação (US4)**: dados válidos → painel com "Este formulário é demonstrativo. Nenhuma mensagem foi enviada."; foco no título; "Voltar ao formulário" → valores mantidos, foco no Nome; "Limpar campos" → vazio; recarregar → vazio.
5. **Leitor de tela (NVDA/VoiceOver)**: rótulos e ajuda lidos por campo; erro lido junto ao campo ao receber foco; resumo anunciado uma vez; painel lido ao aparecer.
6. **Zoom/reflow**: 320 px e 200 %, sem rolagem horizontal; `prefers-reduced-motion` ativo, sem movimento.
7. Derrubar a API ou remover a configuração: as duas páginas continuam funcionando.

## Resultado da validação

**Automática (2026-10-12, Chromium, Windows):** `npm test` e `npx playwright test` verdes, incluindo axe em Sobre e em Contato nos estados inicial, com erros, confirmado e de volta ao formulário; nenhuma requisição com dados do formulário; 320 px e texto a 200% sem rolagem horizontal.

**Achados durante a implementação:** (1) `sobre.html` e `contato.html` não carregavam `css/components.css` e passaram a carregá-lo; (2) sem JavaScript, o envio nativo poria os dados na URL, então o botão de envio nasce `disabled` e só o script o habilita; (3) o botão do painel de confirmação estourava a largura a 320 px com texto a 200% e agora quebra linha.

**Pendente (manual, não executada):** passos 5 (leitor de tela NVDA/VoiceOver) e 6 (inspeção visual de zoom/reflow e movimento reduzido) e a leitura do texto base de Sobre por quem responde pelo projeto. T030 permanece aberta até isso ser registrado.
