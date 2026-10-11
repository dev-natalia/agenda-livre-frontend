# Contrato: layout e pontos de quebra

## Pontos de quebra (únicos permitidos em `@media`)

| Nome | `min-width` | Efeito |
|---|---|---|
| base | — (< 40rem) | uma coluna; navegação recolhida; campos e botões em largura total |
| `sm` | `40rem` | cards em 2 colunas; pares de campos lado a lado |
| `md` | `48rem` | navegação em linha, botão de menu oculto (**igual a `NARROW_QUERY` em `js/components/site-nav.js`: `max-width: 47.99rem`**) |
| `lg` | `64rem` | cards em 3+ colunas (`repeat(3, minmax(0, 1fr))`) |

Teste: `design-tokens.test.js` varre `css/*.css` e falha se houver `min-width`/`max-width` fora de {40rem, 47.99rem, 48rem, 64rem}.

## Regras de layout

1. Mobile-first: estilos base valem de 320 px para cima; `@media (min-width)` só acrescenta.
2. Contêineres (`header`, `main`, `footer`): largura 100%, `max-width: var(--content-max-width)`, centralizados, `padding-inline` mínimo `var(--space-3)`.
3. Texto corrido em `main`: `max-width: var(--reading-max-width)` (65ch) onde for parágrafo; cards e grades usam a largura total do contêiner.
4. `.card-grid`: `gap: var(--space-4)`; `align-items: stretch`; cards com `min-width: 0`; título e conteúdo com `overflow-wrap: anywhere` (já presentes).
5. Rodapé colado ao fim da janela em páginas curtas: `body { min-height: 100vh; min-height: 100dvh; display: flex; flex-direction: column; }` e `main { flex: 1 0 auto; }`.
6. Nenhum `width`/`height` fixos em px que impeçam a ampliação; alturas apenas por `min-height` ou `aspect-ratio`.
7. Imagens e mídias: `max-width: 100%; height: auto`; a área de imagem do card mantém `aspect-ratio: var(--card-media-ratio)`.
8. Campos e botões: `min-height: var(--target-min)`, `width: 100%` na base; rótulos acima do campo; grupos de filtros em `display: grid; gap` com recolhimento para uma coluna.
9. Nenhum bloqueio de orientação; `meta viewport` permanece `width=device-width, initial-scale=1` (sem `maximum-scale` nem `user-scalable=no`).
10. Conteúdo que exigir layout bidimensional (tabela larga) rola dentro do próprio contêiner (`overflow-x: auto`), nunca a página.

## Verificação (Playwright)

Larguras: 320, 375, 768, 1024 e 1440; cinco páginas; `scrollWidth ≤ innerWidth`; texto a 200%; sem sobreposição entre `header`, menu aberto e `main`; grade com 1/2/3 colunas em 375/768/1280 (sonda com 6 cards sintéticos); rolagem horizontal ausente em 1 px antes e depois de cada ponto de quebra (SC-007).
