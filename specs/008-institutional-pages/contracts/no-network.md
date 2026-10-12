# Contrato: sem rede e sem armazenamento

| Garantia | Verificação |
|---|---|
| `js/contact/*`, `js/pages/about.js` e `js/pages/contact.js` não importam `js/api/*` nem `config.js` | teste unitário de leitura do código-fonte |
| Nenhuma ocorrência de `fetch(`, `XMLHttpRequest`, `sendBeacon`, `localStorage`, `sessionStorage`, `document.cookie`, `innerHTML` nesses módulos | idem |
| Nenhuma requisição com dados do formulário em erro, sucesso, retorno e limpeza | teste Playwright observando `page.on("request")` |
| Sobre e Contato funcionam com API fora do ar e sem configuração válida | teste Playwright |
| Recarregar a página mostra o formulário vazio | teste Playwright |
