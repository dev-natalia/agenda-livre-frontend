# Contrato: tokens novos e alterados (`css/tokens.css`)

Estende `specs/004-visual-identity-responsive/contracts/design-tokens.md`, que continua valendo para tudo que não aparece aqui. Nomes existentes não mudam.

## Alterados

| Token | De | Para | Motivo |
|---|---|---|---|
| `--content-max-width` | `72rem` | `80rem` | VIS-001 (D3 da pesquisa) |
| `--shadow-card` | `0 1px 3px rgb(31 41 55 / 0.12)` | `0 1px 2px rgb(31 41 55 / 0.08), 0 2px 8px rgb(31 41 55 / 0.06)` | sombra discreta (VIS-016); a borda do card continua |
| `--radius-card` | `8px` | `12px` | cantos do guia |

## Novos

| Token | Valor | Uso |
|---|---|---|
| `--color-surface-tint` | `#EAF1FD` | fundo do hero e de áreas de destaque suave; texto `--color-text` (12,9:1) e link `--color-link` (7,7:1) |
| `--shadow-header` | `0 1px 0 rgb(31 41 55 / 0.06), 0 2px 8px rgb(31 41 55 / 0.05)` | separação do cabeçalho (além da borda) |
| `--shadow-panel` | `0 2px 4px rgb(31 41 55 / 0.06), 0 6px 16px rgb(31 41 55 / 0.06)` | painel de busca e filtros |
| `--radius-panel` | `16px` | hero, busca, filtros, painéis de estado |
| `--space-8` | `5rem` | espaço entre seções principais em desktop |
| `--logo-height` | `2.5rem` | altura do logo no cabeçalho (`2rem` em tela estreita, via `@media`) |
| `--color-category-culture` | `#B91C1C` | `cultura-e-artes` |
| `--color-category-sport` | `#15803D` | `esporte-e-atividade-fisica` |
| `--color-category-courses` | `#1D4ED8` | `cursos-e-formacao` |
| `--color-category-events` | `#7E22CE` | `eventos-e-encontros` |
| `--color-category-health` | `#0F766E` | `saude-e-bem-estar` |
| `--color-category-leisure` | `#C2410C` | `lazer-e-recreacao` |
| `--color-category-education` | `#BE185D` | `educacao-e-meio-ambiente` |

Texto de todas as etiquetas coloridas: `--color-brand-contrast` (`#FFFFFF`). Categoria sem entrada usa o par neutro existente (`--color-tag-background` / `--color-tag-text`).

## Pares a verificar (teste `design-tokens.test.js` e `category-colors.test.js`)

| Texto/elemento | Fundo | Mínimo | Razão esperada |
|---|---|---|---|
| `--color-brand-contrast` | cada `--color-category-*` | 4,5 | 6,47 / 5,02 / 6,70 / 6,98 / 5,47 / 5,18 / 6,04 |
| `--color-text` | `--color-surface-tint` | 4,5 | 12,9 |
| `--color-link` | `--color-surface-tint` | 4,5 | 7,7 |
| `--color-text-muted` | `--color-surface-tint` | 4,5 | ≥ 4,5 (verificar; se falhar, usar `--color-text` no hero) |
| `--color-border` | `--color-surface-tint` | 3 | 4,2 (verificar; controle sobre o tint mantém fundo branco próprio) |
| `--focus-color` | `--color-surface-tint` | 3 | ≥ 7 |

Se algum par falhar, o valor é ajustado (não o limite). Valor literal de cor fora de `tokens.css` continua proibido; o teste existente que varre `css/` segue valendo, e também varre `sombra`/`rgb(` literais em componentes.

## Regras de uso

- Laranja e amarelo continuam pontuais (decorativos ou botão de destaque com texto escuro); a cor de categoria `lazer` usa `#C2410C` (o laranja escuro já aprovado), não `#F97316`.
- Cor de categoria só em etiquetas; nunca em texto sobre fundo branco nem como único sinal (o nome da categoria é sempre escrito).
- Pontos de quebra e regra de movimento reduzido inalterados.
