# Contrato: tokens de design (`css/tokens.css`)

Fonte única de valores visuais. Componentes só usam `var(--nome)`. Os nomes já existentes das features 001–003 são mantidos (`--color-text`, `--color-background`, `--color-surface`, `--color-border`, `--color-link`, `--color-brand`, `--color-brand-contrast`, `--color-tag-*`, `--color-skeleton`, `--color-empty-border`, `--color-notice-*`, `--space-1…5`, `--focus-*`, `--content-max-width`, `--radius-card`, `--card-media-ratio`, `--font-family`, `--font-size-base`, `--line-height-base`); os valores podem ser revisados conforme abaixo.

## Cor

| Token | Valor | Uso |
|---|---|---|
| `--color-primary` / `--color-link` / `--color-brand` | `#1E40AF` | marca, links, títulos de destaque, texto/borda do botão contornado |
| `--color-action` | `#2563EB` | fundo do botão primário (texto `--color-brand-contrast`) |
| `--color-action-hover` | `#1D4ED8` | hover/pressionado do primário |
| `--color-accent` | `#F97316` | fundo do botão secundário e destaques; **sempre com texto `--color-text`** |
| `--color-accent-strong` | `#C2410C` | laranja quando precisa ser linha/texto (≥ 3:1) |
| `--color-highlight` | `#FACC15` | só detalhe decorativo; nunca texto ou único contorno |
| `--color-background` | `#F8FAFC` | fundo da página |
| `--color-surface` | `#FFFFFF` | cards, formulários, menus |
| `--color-text` | `#1F2937` | texto principal |
| `--color-text-muted` | `#475569` | texto auxiliar, desabilitado |
| `--color-border` | `#64748B` | bordas de controles |
| `--color-brand-contrast` | `#FFFFFF` | texto sobre azuis |
| `--color-tag-background` / `--color-tag-text` | `#E6EEFA` / `#1E3A8A` | etiqueta de categoria (neutra padrão) |
| `--color-notice-background` / `--color-notice-text` | `#FFF4CE` / `#1F2937` | avisos e erros |
| `--color-skeleton` | `#E2E8F0` | esqueleto de carregamento (estático) |
| `--color-empty-border` | `#475569` | borda do estado vazio |

Os valores acima substituem os provisórios de `tokens.css` onde houver conflito; qualquer outra alteração exige reexecutar o teste de contraste.

## Pares verificados (teste `design-tokens.test.js`)

| Texto/elemento | Fundo | Mínimo | Razão |
|---|---|---|---|
| `--color-text` | `--color-background` | 4,5 | 14,03 |
| `--color-text` | `--color-surface` | 4,5 | ≥ 14 |
| `--color-link` | `--color-surface` / `--color-background` | 4,5 | 8,72 / 8,34 |
| `--color-brand-contrast` | `--color-action` | 4,5 | 5,17 |
| `--color-brand-contrast` | `--color-primary` | 4,5 | 8,72 |
| `--color-text` | `--color-accent` | 4,5 | 5,24 |
| `--color-text` | `--color-highlight` | 4,5 | 9,59 |
| `--color-brand-contrast` | `--color-accent-strong` | 4,5 | 5,18 |
| `--color-tag-text` | `--color-tag-background` | 4,5 | ≥ 7 |
| `--color-text` | `--color-notice-background` | 4,5 | 13,34 |
| `--color-text-muted` | `--color-surface` | 4,5 | 7,58 |
| `--color-border` | `--color-surface` / `--color-background` | 3 | 4,76 / ≥ 4,4 |
| `--focus-color` | `--color-surface` / `--color-background` / `--color-action` (com halo) | 3 | ≥ 8 / ≥ 8 / garantido pelo halo |

## Ajustes em relação ao DOC-10

| Cor | Original | Adotado | Razão |
|---|---|---|---|
| Texto sobre laranja | branco | `#1F2937` | branco/`#F97316` = 2,80 ✗; escuro = 5,24 ✓ |
| Laranja como linha ou texto | `#F97316` | `#C2410C` | `#F97316`/branco = 2,80 < 3 ✗; `#C2410C` = 5,18 ✓ |
| Amarelo | texto/ícone | só decorativo, texto escuro por cima | `#FACC15`/branco = 1,53 ✗ |
| Borda de controle | `#767676` | `#64748B` | folga de contraste sobre `#F8FAFC` e branco |
| Link | `#2563EB` (sugerido) | `#1E40AF` | maior contraste para texto pequeno |

## Tipografia

| Token | Valor |
|---|---|
| `--font-heading` | `Poppins, <reserva>` |
| `--font-body` | `Inter, <reserva>` (`--font-family` mantido como alias de `--font-body`) |
| `--font-size-base` | `1rem` |
| `--font-size-small` | `0.875rem` (mínimo permitido, FR-008) |
| `--font-size-h1` | `clamp(2rem, 1.6rem + 2vw, 2.5rem)` |
| `--font-size-h2` | `clamp(1.5rem, 1.35rem + 0.75vw, 1.75rem)` |
| `--font-size-card-title` | `1.125rem` |
| `--line-height-base` / `--line-height-heading` | `1.6` / `1.25` |

Peso: Poppins 600/700 (títulos), Inter 400/600 (texto/botões). Todas as medidas em `rem` ou `clamp()` em `rem`.

## Espaço, forma, foco, movimento, alvo

| Token | Valor |
|---|---|
| `--space-1…5`, `--space-2-5`, `--space-6`, `--space-7` | `0.25, 0.5, 1, 1.5, 2` rem (existentes, inalterados); `0.75` (`--space-2-5`), `3` e `4` rem (todos múltiplos de 4 px) |
| `--radius-sm` / `--radius-card` | `4px` / `8px` |
| `--border-width-control` | `2px` |
| `--border-width` | `1px` (controles: `2px`) |
| `--shadow-card` / `--shadow-focus-halo` | `0 1px 3px rgb(31 41 55 / 0.12)` / `0 0 0 5px #FFFFFF` |
| `--focus-color` / `--focus-width` / `--focus-offset` | `#1E40AF` / `3px` / `2px` |
| `--motion-duration` / `--motion-ease` | `150ms` / `ease-out` (zerado sob movimento reduzido) |
| `--target-min` | `2.75rem` |
| `--content-max-width` / `--reading-max-width` | `72rem` / `65ch` |

## Estilos de botão

| Classe | Fundo | Texto | Borda | Estados |
|---|---|---|---|---|
| `.button--primary` | `--color-action` | `--color-brand-contrast` | mesma cor do fundo | hover: `--color-action-hover` + sublinhado; foco: contorno + halo; pressionado: `translate`-livre (sem movimento), borda mais grossa; desabilitado: fundo `--color-surface`, texto `--color-text-muted`, borda tracejada |
| `.button--secondary` | `--color-accent` | `--color-text` | `--color-accent-strong` | idem |
| `.button--outline` | transparente/`--color-surface` | `--color-primary` | `2px --color-primary` | hover: fundo `--color-tag-background` |

`.error-state__retry` da feature 003 passa a usar `.button--primary` via estilos (sem mudar o HTML gerado, apenas o seletor CSS).
