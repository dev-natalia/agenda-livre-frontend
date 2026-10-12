# Contrato: ativos de marca

Origem: `docs/Guia de Marca Agenda Livre.png` (logo principal, ícone/favicon, paleta). Os arquivos são redesenhados; o PNG do guia continua só como referência.

## Arquivos

| Arquivo | Uso | Requisitos |
|---|---|---|
| `images/brand/logo.svg` | cabeçalho de todas as páginas | fundo transparente; "Agenda Livre" em curvas, azul `#1E40AF`; raios `#F97316` e `#FACC15`; `viewBox` com proporção do guia; `width` e `height` explícitos no `<img>`; menos de 10 KB |
| `images/brand/icon.svg` | `<link rel="icon" type="image/svg+xml">` | quadrado arredondado azul (`#1E40AF` a `#2563EB`), "A" branco, raios laranja e amarelo; legível em 16 px |
| `images/brand/apple-touch-icon.png` | `<link rel="apple-touch-icon">` | 180×180, derivado do ícone, sem transparência |

Sem variação para fundo escuro (não há uso). Se for adicionada, vira `logo-dark.svg` e entra neste contrato.

## Uso no HTML (igual nas cinco páginas)

```html
<link rel="icon" href="images/brand/icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="images/brand/apple-touch-icon.png">
...
<a class="site-header__brand" href="index.html">
  <img src="images/brand/logo.svg" alt="Agenda Livre" width="…" height="…">
</a>
```

## Regras

- O nome acessível do link da marca é "Agenda Livre" (o `alt` do logo); o logo não é decorativo.
- Proporção preservada (`height: 2.5rem; width: auto` no máximo); espaço livre ao redor de pelo menos a altura do "A" do logo.
- Cores do logo e do ícone vêm do guia; não são tokens de interface (são arte), mas coincidem com `--color-primary`, `--color-accent` e `--color-highlight`.
- O logo fica sobre `--color-surface` (branco); contraste do azul sobre branco é 8,72:1.
- Em falha de carga, o `alt` aparece como texto e o cabeçalho não colapsa (altura mínima do alvo de toque).
- O ícone usa só caminhos e formas (sem texto), então não depende de fonte.

## Verificação

- `tests/unit/brand-assets.test.js`: os três arquivos existem; SVGs são XML válido, sem `<script>`, sem `<text>` no logo, sem referência externa e abaixo de 10 KB; PNG tem 180×180.
- O mesmo teste confere, nas cinco páginas, o `<link rel="icon">`, o `apple-touch-icon` e o `<img>` do logo com `alt="Agenda Livre"` dentro do link para `index.html`.
- Playwright: o logo carrega (`naturalWidth > 0`), a altura é a mesma nas cinco páginas, e há uma única marca por página.
