# Quickstart: validar identidade visual e responsividade

## Pré-requisitos

```bash
npm install
npx playwright install chromium
```

O servidor estático (`python -m http.server 5500`) é iniciado pelo Playwright. A API não é necessária para esta feature; os testes usam dados sintéticos e a configuração já substituída nos testes de acessibilidade.

## Verificações automáticas

```bash
npm test                      # unitários: contraste, tokens, breakpoints, regra de movimento
npm run test:e2e              # Playwright: reflow, 200%, grade, movimento reduzido, axe
npx playwright test responsive-reflow reduced-motion accessibility
```

Resultados esperados:

| Verificação | Esperado | Spec |
|---|---|---|
| Razões de contraste dos pares declarados | todas ≥ mínimo | SC-001 |
| Literais de cor/fonte/duração fora de `tokens.css` | nenhum | FR-001 |
| Pontos de quebra em CSS | só 40/48/64 rem; 48 rem = `site-nav.js` | FR-018 |
| `scrollWidth ≤ innerWidth` em 320/375/768/1024/1440 × 5 páginas | verdadeiro | SC-002 |
| Texto 200% e equivalente a 400% de zoom | sem corte nem sobreposição | SC-003 |
| Grade de cards | 1 / 2 / 3+ colunas em 375 / 768 / 1280 | FR-020 |
| Alvos de toque | ≥ 44 px (≥ 24 px mínimo) | FR-026 |
| Movimento reduzido | duração ≈ 0, rolagem imediata | SC-005 |
| Axe (cinco páginas, estados carregando/erro/vazio/cards) | sem violações | SC-006 |
| Fontes bloqueadas (rota abortada para `fonts/*`) | texto visível, sem sobreposição | SC-009 |

## Revisão manual (registrar o resultado aqui ao concluir)

Verificações automáticas concluídas em 2026-10-11: 210 testes unitários e 115 de navegador passando. Os itens abaixo exigem pessoa e continuam pendentes.

| Verificação | Como | Resultado | Data |
|---|---|---|---|
| Zoom 200% e 400% no navegador | Ctrl + `+` nas cinco páginas | _pendente_ | |
| Tamanho de fonte do navegador "muito grande" | Configurações → Aparência | _pendente_ | |
| 320 px (DevTools) retrato e paisagem | DevTools → dispositivo | _pendente_ | |
| Escala de cinza | filtro `grayscale(1)` nas cinco páginas | _pendente_ | |
| Alto contraste/cores forçadas do SO | Windows: Temas de contraste | _pendente_ | |
| Movimento reduzido do SO | Windows: "Mostrar animações" desligado | _pendente_ | |
| Teclado e leitor de tela nos estados de componente | Tab, Enter, Espaço, Esc + NVDA | _pendente_ | |
| Links × botões distinguíveis sem clicar | avaliação visual | _pendente_ | |

## Critério de conclusão

`npm test` e `npm run test:e2e` verdes; tabela manual preenchida; razões de contraste e ajustes documentados em [contracts/design-tokens.md](contracts/design-tokens.md); `docs/PENDENCIAS-BACKEND.md` inalterado (sem novas pendências).
