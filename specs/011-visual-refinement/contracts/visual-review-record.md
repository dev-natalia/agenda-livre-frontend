# Contrato: registro de revisão visual e capturas

Destino: `docs/21-registro-de-revisao-visual.md`. Capturas em `docs/visual-review/before/` e `docs/visual-review/after/`.

## Capturas

- Script: `tests/capture/capture-screens.mjs` (`npm run capture -- before` e `-- after`), Playwright + servidor estático de teste + respostas simuladas (fixtures da feature 010). Sem rede externa.
- Nome do arquivo: `<pagina>-<estado>-<largura>.png` (por exemplo `inicio-resultados-1440.png`).
- Páginas: `inicio`, `explorar`, `detalhes`, `sobre`, `contato`.
- Larguras: 320, 768 e 1440 sempre; 375 e 1024 nas páginas com layout que muda ali (Início, Explorar).
- Estados: `resultados` (3 a 6 atividades, com e sem imagem), `vazio`, `erro` (Início e Explorar); `nao-encontrada` (Detalhes); `confirmacao` (Contato).
- **O conjunto `before` é capturado antes de qualquer alteração de código e commitado separadamente.** O `after` usa os mesmos estados e larguras.
- Imagens de capturas são evidência; testes não comparam pixels.

## Estrutura do registro

1. **Identificação**: data, commit da linha de base, commit final, quem executou.
2. **Ambiente**: sistema, Node, Chromium (Playwright), ferramentas e versões; o que não foi usado.
3. **Resultados**: tabela por suíte (comando, aprovados, falhos, ignorados, duração), comparada com a linha de base da feature 010 (962 unitários; 647 de navegador; 20 ignorados com motivo).
4. **Testes atualizados**: lista com o motivo de cada um (ver `structure-changes.md`).
5. **Revisão entre páginas** (VIS-021): componentes equivalentes, achados, decisões.
6. **Responsividade** (VIS-022): matriz página × largura com situação (rolagem horizontal, sobreposição, quebra de texto).
7. **Acessibilidade** (VIS-023): contrastes novos, foco, teclado manual nos fluxos principais, movimento reduzido, ampliação 200% e espaçamento de texto. Marca explicitamente o que é automático e o que é manual. Não declara conformidade integral.
8. **Antes e depois** (VIS-024): para cada página, links das capturas, diferenças aprovadas, problemas restantes.
9. **Problemas**: identificador (VR-001…), onde, passos, impacto, situação (corrigido, aceito com justificativa, aberto).
10. **Decisões**: largura 80rem, cores de categoria por slug, sem variação escura do logo, quatro colunas não adotadas (ou adotadas), etc.
11. **Limites**: sem leitor de tela, sem aparelhos reais, só Chromium, API real só se executada.

## Regras de redação

- Só afirmar o que foi executado e observado; quantidades vêm da saída dos comandos.
- Cada afirmação "passou" cita o comando ou o arquivo de teste.
- Nenhum teste desativado para ficar verde; ignorados têm motivo.
- A aprovação considera legibilidade, consistência e acessibilidade, não apenas preferência estética.
