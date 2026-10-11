# Quickstart: validar navegação e componentes compartilhados

## Pré-requisitos
- Node.js 20+, `npm install` (inclui o novo `@axe-core/playwright`).
- Servidor estático na porta 5500 (o Playwright sobe `python -m http.server 5500` sozinho).

## Testes automatizados
```sh
npm test            # unitários: site-shell, site-nav, activity-card, format, region-state, error-state
npm run test:e2e    # navegação, menu 320 px, componentes, axe-core
```
Esperado: tudo verde; `site-shell` falha se qualquer página divergir no cabeçalho/rodapé.

## Cenários manuais (registrar resultado no PR)

### 1. Navegação (US1)
1. Abra cada uma das cinco páginas pela URL (`/index.html`, `/explorar.html`, `/atividade.html`, `/sobre.html`, `/contato.html`).
2. Confirme o link atual destacado (sublinhado, não só cor); em `atividade.html` nenhum.
3. Com Tab a partir do topo: link de pular → marca → 4 links → conteúdo → rodapé. Ative o link de pular: foco em `main`.
4. Desative o JavaScript: todos os links continuam presentes e funcionam, inclusive a 320 px.

### 2. Menu móvel (US2)
1. Janela de 320 px: só marca e botão "Menu"; Tab não alcança os links.
2. Enter/Espaço abre; leitor de tela anuncia "Menu, botão, recolhido/expandido". Tab percorre os links; Esc fecha e devolve o foco ao botão.
3. Amplie até 768 px: navegação em linha, botão some. Reduza de novo: menu recolhido.
4. Zoom 200% em desktop: menu móvel em uso, sem rolagem horizontal.
5. Ative "reduzir movimento" no sistema: sem animação (não há nenhuma).

### 3. Cards e fallback (US3)
Em uma página existente, com o console:
```js
const { createActivityCard } = await import("/js/components/activity-card.js");
document.querySelector("main").append(createActivityCard({ id: "550e8400-e29b-41d4-a716-446655440001",
  title: "Oficina de dança", category: { name: "Cultura e Artes" },
  unit: { name: "CEU Navegantes", neighborhood: "Grajaú" },
  next_occurrence: { date: "2026-11-20", start_time: "14:00", end_time: "15:00" } }));
```
Verifique: fallback sem imagem quebrada; um único foco por card; leitor lê categoria, título (link), unidade e data, e ignora o fallback; repita sem `next_occurrence`, sem `unit` e com título de 200 caracteres a 320 px.

### 4. Estados da região (US4)
Monte `createRegionState` num `main` (ver o contrato) e alterne `showLoading` → `showError(new ApiError("server"), …)` → botão "Tentar novamente" → `showEmpty` → `showSuccess`. Verifique: uma anúncio por troca, foco inalterado, esqueletos ignorados pelo leitor, vazio ≠ erro.

## Contraste
Conferir com ferramenta de contraste: texto do card, etiqueta de categoria, estados de foco, erro, vazio e esqueleto (≥ 4,5:1 texto; ≥ 3:1 componentes). Registrar os valores no PR.

## Referências
[contracts/site-shell.md](contracts/site-shell.md) · [contracts/activity-card.md](contracts/activity-card.md) · [contracts/region-state.md](contracts/region-state.md) · [data-model.md](data-model.md)

## Resultados (2026-10-11)

**Automatizados** (Windows 11, Chromium do Playwright, Node 20+): `npm test` 199 testes unitários passando; `npm run test:e2e` 58 testes passando (inclusive axe-core nas cinco páginas a 1280 px e a 320 px com menu fechado e aberto, e nos estados carregando, erro, vazio e com cards). Suíte e2e repetida 3 vezes (`--repeat-each=3`): 174 de 174.

**Contrastes** (WCAG, razão calculada): marca/botão/link `#0b4f9c` sobre branco 8,04:1; link de pular branco sobre `#0b4f9c` 8,04:1; etiqueta e ícone do fallback `#0b3a75` sobre `#e6eefa` 9,58:1; borda do card `#767676` sobre branco 4,54:1; borda tracejada do vazio `#595959` sobre branco 7,00:1; borda do esqueleto `#767676` sobre `#e4e4e4` 3,57:1; texto `#1a1a1a` sobre branco 17,40:1; erro `#3d2e00` sobre `#fff4ce` 12,01:1.

**Limitação conhecida:** a suíte e2e roda com 2 workers porque o `python -m http.server` recusa conexões com mais paralelismo (`ERR_CONNECTION_REFUSED` intermitente observado com 6 workers).

**Pendente (manual):** cenários 1 a 4 acima com leitor de tela (NVDA/VoiceOver), zoom 200%, texto com espaçamento aumentado e movimento reduzido no sistema. O axe-core não prova conformidade integral.
