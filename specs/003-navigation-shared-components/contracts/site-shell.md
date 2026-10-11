# Contract: invólucro compartilhado e `js/components/site-nav.js`

## Marcação obrigatória em cada página

```html
<body>
  <a class="skip-link" href="#main-content">Pular para o conteúdo principal</a>
  <header class="site-header">
    <a class="site-header__brand" href="index.html">Agenda Livre</a>
    <button type="button" class="site-header__toggle" aria-expanded="false"
            aria-controls="site-nav-list" hidden>Menu</button>
    <nav class="site-nav" aria-label="Navegação principal">
      <ul id="site-nav-list">
        <li><a href="index.html" aria-current="page">Início</a></li>
        <li><a href="explorar.html">Explorar atividades</a></li>
        <li><a href="sobre.html">Sobre</a></li>
        <li><a href="contato.html">Contato</a></li>
      </ul>
    </nav>
  </header>
  <main id="main-content" tabindex="-1"> … </main>
  <footer class="site-footer">
    <p>Agenda Livre</p>
    <nav aria-label="Rodapé"><ul>
      <li><a href="sobre.html">Sobre</a></li>
      <li><a href="contato.html">Contato</a></li>
    </ul></nav>
  </footer>
</body>
```

Regras:
- `aria-current="page"` somente no link da própria página; `atividade.html` não marca nenhum.
- A marca (`site-header__brand`) é link para a página inicial e não recebe `aria-current`.
- O botão nasce com `hidden`; apenas `initSiteNav()` o revela.
- Todos os arquivos contêm exatamente este bloco (exceto `aria-current` e o conteúdo de `main`); `site-shell.test.js` valida.
- Cada página mantém seu `<h1>` dentro de `main` (um por página).

## `initSiteNav(root = document) -> { destroy() } | null`
- Retorna `null` se não encontrar botão e lista (página sem invólucro).
- Mostra o botão, define `aria-expanded="false"` e aplica estado conforme largura (D2/D3 do research).
- Eventos: clique no botão alterna; `keydown` `Escape` com menu aberto fecha e foca o botão; mudança do `matchMedia` reconcilia o estado.
- Não usa `role="menu"`, `aria-haspopup`, nem gerencia setas.
- Idempotente: chamar duas vezes não duplica listeners (a segunda chamada retorna o mesmo controle ou `null`).
- `destroy()` remove listeners (usado em testes).

## Visual / CSS
- `.skip-link`: fora da tela até `:focus`; ao focar, fixo no topo com contraste ≥ 4,5:1.
- `.site-nav [aria-current="page"]`: sublinhado e peso 600 (não só cor).
- Largura ≥ 48 rem: lista em linha; botão `display: none`.
- Largura < 48 rem sem JS: lista visível em coluna, botão oculto.
- Sem `transition`/`animation` no menu.
