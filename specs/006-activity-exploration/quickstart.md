# Quickstart: validar a Exploração de atividades

## Pré-requisitos

- Node.js 20+ e dependências instaladas (`npm install`).
- Backend em execução em `http://localhost:8000` com dados de exemplo: pelo menos 13 atividades publicadas (para ter 2 páginas), 2+ unidades, 2+ categorias, uma atividade recorrente e uma sem ocorrência futura. Origem do frontend autorizada no CORS (`http://localhost:5500`).
- Servir os arquivos estáticos na porta 5500 (`python -m http.server 5500`, o mesmo usado em `playwright.config.js`).

## Automatizado

```text
npm test                      # unitários: url-state, paginação, snapshot, listagem, API
npm run test:e2e              # Playwright com API simulada: fluxos, histórico, estados, axe
```

Resultado esperado: todos os testes passam; os e2e não dependem do backend real.

## Manual com a API real

1. **Listagem (US1)**: abrir `http://localhost:5500/explorar.html`. Aparecem até 12 cards ordenados por próxima ocorrência, resumo "N atividades encontradas" e paginação com "Próxima". Ir à página 2: filtros mantidos, endereço com `page=2`, foco no título "Resultados".
2. **Pesquisa e filtros (US2)**: digitar um termo e escolher unidade/categoria/período; abrir a aba de rede do navegador e confirmar **nenhuma** requisição até "Filtrar". Acionar "Filtrar": esqueletos, página 1, endereço com os critérios. Copiar o endereço, abrir em nova janela e conferir campos e resultados iguais.
3. **Limpar (US3)**: acionar "Limpar filtros": campos padrão, endereço `explorar.html`, listagem geral sem novo clique.
4. **Total (US4)**: pesquisar algo com 1 resultado ("1 atividade encontrada") e algo com vários; na página 2 o total continua o geral.
5. **Vazio e erro (US5)**: pesquisar um termo sem correspondência ("Nenhuma atividade encontrada" + orientação). Parar o backend e acionar "Filtrar": mensagem de erro e "Tentar novamente"; reiniciar o backend e tentar novamente.
6. **Página fora do intervalo**: abrir `explorar.html?page=999`: retorna à página 1 sem erro técnico (hoje a API responde `400`; ver `docs/PENDENCIAS-BACKEND.md`).
7. **Retorno (US6)**: aplicar critérios, ir à página 2, rolar, abrir um card e voltar pelo navegador: mesmos campos, página, resultados e rolagem. Repetir após mais de 5 minutos: a listagem é consultada de novo.
8. **Sem JavaScript**: desativar o JavaScript, abrir `explorar.html?period=week`: aparece a mensagem de dependência; o formulário e os links de página continuam funcionando como navegação normal.

## Acessibilidade (manual)

- Percorrer toda a página só com teclado (Tab/Shift+Tab/Enter); foco sempre visível; ordem coerente com a visual.
- Leitor de tela (NVDA ou VoiceOver): carregamento, total, vazio e erro anunciados uma vez, sem mover o foco; esqueletos ignorados; página atual anunciada; anterior/próxima indisponíveis anunciadas como tal.
- 320 px de largura e texto a 200 %: sem rolagem horizontal, filtros em coluna, paginação sem corte.
- `prefers-reduced-motion: reduce`: esqueletos sem animação.
- Registrar data, leitor de tela, navegador e resultado nesta seção ao concluir:

| Data | Ferramenta | Resultado |
|---|---|---|
| — | — | pendente |

## Critérios de saída

Todos os cenários acima conferem com SC-001 a SC-011 da spec e com `contracts/explore-url.md` e `contracts/api-usage.md`.
