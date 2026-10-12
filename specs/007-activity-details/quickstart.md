# Quickstart: validar os detalhes das atividades

## Pré-requisitos

- Node.js 20+ e `npm install` feito.
- API do backend em execução com dados de exemplo (atividades pontual e recorrente, com e sem link externo; uma cancelada ou encerrada) e CORS liberado para a origem do frontend; endereço configurado em `PUBLIC_CONFIG.apiBaseUrl`.

## Testes automáticos

```bash
npm test                      # Vitest
npx playwright test details   # fluxos e axe dos detalhes (API simulada por page.route)
npx playwright test           # regressão completa (Início e Explorar)
```

Esperado: tudo verde, sem violações graves de acessibilidade.

## Validação manual

1. Servir o frontend (`python tests/static-server.py`) e abrir um card da Início ou da Explorar.
2. **Conteúdo (US1)**: conferir categoria, título, unidade, descrição, público-alvo, programações e próximas datas; uma atividade com poucos campos não mostra rótulos vazios; uma sem datas futuras mostra "Sem data prevista".
3. **Endereço direto**: copiar `atividade.html?id=<uuid>` para uma nova aba; conteúdo idêntico, título do documento com o nome da atividade.
4. **Voltar**: vindo da Explorar com filtros, página 2 e rolagem, acionar "Voltar para atividades": mesmos campos, página e posição. Em nova aba, o link leva à Explorar sem critérios.
5. **Não encontrada (US2)**: abrir com UUID inexistente, id inválido, sem `id` e com atividade cancelada/encerrada: mesmo estado, com "Explorar outras atividades" e "Voltar ao Início"; id inválido ou ausente não gera requisição (aba Rede).
6. **Erro**: derrubar a API e recarregar: mensagem amigável e "Tentar novamente"; religar e acionar: conteúdo aparece; cliques repetidos não geram consultas extras.
7. **Link externo (US3)**: atividade com URL: botão, nova aba, texto informando site externo; sem URL: sem botão; URL `javascript:` simulada: sem botão.
8. **Acessibilidade**: só teclado; leitor de tela (NVDA ou VoiceOver) anunciando carregamento e mudança de estado sem mover o foco; 320 px e zoom 200 % sem rolagem horizontal; `prefers-reduced-motion` sem animação nos esqueletos; JavaScript desativado mostra a mensagem estática.

## Registro da revisão com leitor de tela

| Data | Leitor / navegador | Resultado | Observações |
|---|---|---|---|
| _a preencher_ | | | |

## Referências

[spec.md](spec.md) · [research.md](research.md) · [data-model.md](data-model.md) · [contracts/details-url.md](contracts/details-url.md) · [contracts/api-usage.md](contracts/api-usage.md)
