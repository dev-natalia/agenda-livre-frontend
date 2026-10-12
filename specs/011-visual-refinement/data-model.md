# Modelo de dados: Refinamento visual do frontend

Não há dados persistidos nem novos campos da API. As entidades abaixo são artefatos de design e de verificação.

## Ativo de marca

| Campo | Descrição | Regra |
|---|---|---|
| `logo` | `images/brand/logo.svg` | uso no cabeçalho; fundo claro; texto em curvas; proporção preservada (nunca esticar) |
| `icon` | `images/brand/icon.svg` | ícone da aba (`rel="icon"`, `type="image/svg+xml"`) |
| `appleTouchIcon` | `images/brand/apple-touch-icon.png` | 180×180, para iOS |
| `nomeAcessivel` | "Agenda Livre" | `alt` do logo no link da marca |

## Valor de design (token)

Nome, valor, papel e, quando cor, os pares verificados. Fonte única: `css/tokens.css`. Os novos estão em `contracts/design-tokens-delta.md`. Regra: componente só usa `var(--nome)`.

## Cor de categoria

| Campo | Descrição |
|---|---|
| `slug` | identificador da categoria vindo da API (`category.slug`) |
| `fundo` / `texto` | par de tokens; texto sempre `--color-brand-contrast` sobre o fundo sólido |
| `contraste` | razão calculada pelo teste; mínimo 4,5 |
| `padrão` | categorias sem entrada usam o par neutro (`--color-tag-background` / `--color-tag-text`) |

Estados: `definida` (slug mapeado) ou `neutra` (slug ausente, vazio, desconhecido ou com caracteres fora de `[a-z0-9-]`). Não há transição: a cor é função do slug.

## Componente visual

Lista de componentes com tratamento único entre páginas: cabeçalho, rodapé, hero, painel de busca, card, etiqueta, painel de estado (vazio, carregamento, erro), botão (primário, de destaque, contornado), campo, formulário. Descrito em `contracts/component-visuals.md`.

## Registro de revisão visual

| Campo | Descrição |
|---|---|
| `data`, `commit` | identificação da execução |
| `capturas` | caminhos em `docs/visual-review/before` e `after`, por página, largura e estado |
| `resultados` | suítes executadas, aprovados, falhos, ignorados |
| `problemas` | achado, onde, passos, impacto, situação |
| `decisoes` | decisão e motivo (por exemplo, largura 80rem, cores de categoria) |
| `limites` | o que não foi verificado (leitor de tela, aparelhos reais, outros navegadores) |

Formato em `contracts/visual-review-record.md`.
