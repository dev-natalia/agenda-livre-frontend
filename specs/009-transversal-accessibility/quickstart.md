# Quickstart: validar a acessibilidade transversal

## Pré-requisitos

- Node.js 20+ e `npm install` feitos; `npx playwright install chromium` na primeira vez (e `firefox`, se for usado).
- A API não é necessária: os testes usam `tests/e2e/helpers/mock-api.js`. Para a passada manual com dados reais, subir o backend em `http://localhost:8000` e usar a configuração de `js/config.js`.
- Servir o site: `python tests/static-server.py 5500` e abrir `http://localhost:5500/`. Encerrar qualquer outro servidor na porta 5500 antes de rodar o Playwright.
- Leitor de tela: NVDA (Windows) com Chromium e/ou Firefox.

## Testes automáticos

```bash
npm test                                   # Vitest, inclui a11y-static-structure, a11y-css-rules e state-contrast
npx playwright test a11y                   # matriz de acessibilidade (axe, teclado, foco, nomes, estados, contraste, espaçamento)
npx playwright test                        # regressão completa
```

Esperado: tudo verde, sem violações do axe fora da lista de exceções de `contracts/audit-matrix.md`. Falha esperada ao quebrar de propósito (SC-011): remover o `alt` de uma imagem informativa, apagar o rótulo de um campo ou escurecer um fundo até o contraste cair; o teste correspondente deve falhar. Desfazer a quebra depois.

## Roteiro manual

Registrar cada resultado em `docs/17-registro-de-acessibilidade.md` (formato em `contracts/accessibility-report.md`).

1. **Preparação** — anotar navegador, versão, sistema e leitor de tela.
2. **Teclado (FE-035, FE-036)** — em cada página, 1280 e 320 px: Tab no carregamento leva ao link de pular, que fica visível; acioná-lo leva ao conteúdo; percorrer tudo com Tab/Shift+Tab/Enter/Espaço; abrir e fechar o menu (o foco volta ao botão); usar pesquisa, filtros ("Filtrar" e "Limpar filtros"), paginação, cartões, link externo e formulário sem mouse; conferir que o foco é sempre visível, não fica atrás de nada e não fica preso.
3. **Estados dinâmicos (FE-038)** — com o leitor de tela: filtrar e paginar (carregando, N atividades encontradas, vazio); derrubar a API e conferir o erro e "Tentar novamente"; abrir Detalhes inexistente; enviar Contato vazio e válido. Conferir que cada aviso é lido uma vez e que o foco só se move nos casos previstos.
4. **Estrutura e controles (FE-034)** — listas de títulos e de regiões do leitor de tela: um `h1`, hierarquia sem saltos, cabeçalho/navegação/principal/rodapé; nome, função e estado de menu, filtros, paginação (página atual) e campos.
5. **Imagens e links (FE-037)** — cartões e Detalhes sem imagem: fundo de fallback sem anúncio e sem ícone quebrado; link externo anuncia "abre em nova aba".
6. **Contraste (FE-039)** — com ferramenta de contraste, medir texto e componentes nos estados: normal, hover, foco, selecionado, desabilitado, erro, link no texto, texto sobre o fallback; anotar razões. Verificar que erro, seleção e página atual não dependem só de cor.
7. **Ampliação, reflow e espaçamento (FE-040)** — zoom do navegador a 200% e 400%; janela de 320 px; aplicar o marcador de espaçamento de texto (WCAG 1.4.12) e percorrer as cinco páginas com resultados longos e formulário com erros.
8. **Movimento reduzido (FE-040)** — ativar "reduzir movimento" no sistema e percorrer menu, filtros, carregamento e painel de confirmação.
9. **Alto contraste** (opcional) — modo de cores forçadas: texto, bordas e foco continuam visíveis.
10. **Fechamento** — registrar problemas, correções e limitações; reexecutar os testes automáticos após cada correção.

## Resultado da validação

_A preencher na implementação: data, ambiente, resumo, problemas encontrados e limitações._
