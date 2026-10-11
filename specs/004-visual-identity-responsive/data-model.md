# Data Model: Identidade visual e responsividade

Esta feature não toca dados da API nem estado em tempo de execução. As "entidades" são os valores de design e as regras que os componentes consomem. Os nomes finais estão em [contracts/design-tokens.md](contracts/design-tokens.md).

## Token de design

| Campo | Descrição |
|---|---|
| `name` | Propriedade CSS personalizada (`--color-…`, `--font-…`, `--space-…`, `--radius-…`, `--shadow-…`, `--motion-…`, `--target-…`). |
| `value` | Valor literal; só existe em `css/tokens.css`. |
| `group` | cor, tipografia, espaço, forma, foco, movimento, alvo. |
| `usage` | Para que serve; componentes só referenciam por `var(--…)`. |
| `contrast` | Para cores de texto/componente: lista de pares `(fundo, razão)` verificados. |

Regras: todo valor de cor, família, tamanho de fonte, espaçamento, raio, sombra e duração aparece apenas em `tokens.css` (exceção: pontos de quebra, que `@media` não aceita como variável); cores de texto têm razão ≥ 4,5 (≥ 3 se grande); cores de componente/estado ≥ 3.

## Tom ajustado

| Campo | Descrição |
|---|---|
| `original` | Cor do DOC-10. |
| `adopted` | Cor ou combinação adotada. |
| `use` | Onde se aplica. |
| `ratio` | Razão de contraste obtida. |
| `reason` | Motivo (ex.: texto branco sobre `#F97316` = 2,80 → texto `#1F2937` = 5,24). |

Os registros ficam em `contracts/design-tokens.md` §Ajustes.

## Estado de componente

`repouso → hover → foco → pressionado → (selecionado/ativo) → erro → desabilitado`. Cada estado precisa de ao menos uma pista não cromática (contorno, sublinhado, peso, borda tracejada, ícone ou texto) e de contraste ≥ 3:1 quando necessário para reconhecê-lo. Estados podem se combinar (foco + erro).

## Estilo de botão

`primário` (fundo `--color-action`, texto branco), `secundário` (fundo `--color-accent`, texto escuro), `contornado` (fundo transparente/branco, borda e texto azul). Regra: uma ação primária por tela; mesmos estados em todos.

## Etiqueta de categoria

Texto = nome da categoria vindo da API (nunca omitido); tratamento visual = neutro padrão (`--color-tag-*`) ou, no futuro, variação por categoria que respeite contraste. Chave: o nome/slug da categoria; sem lista paralela no frontend.

## Ponto de quebra

| Nome | Valor | Efeito |
|---|---|---|
| base | < 40 rem | uma coluna; navegação recolhida |
| `sm` | ≥ 40 rem | cards em 2 colunas; formulários em 2 colunas quando couber |
| `md` | ≥ 48 rem | navegação em linha (coincide com `site-nav.js`) |
| `lg` | ≥ 64 rem | cards em 3+ colunas |

## Preferência de movimento

Entrada: `prefers-reduced-motion` do navegador. `reduce` → `--motion-duration: 0s`, animações/transições/rolagem suave desligadas; `no-preference` → transições curtas e rolagem suave opcional. Sem estado persistido.
