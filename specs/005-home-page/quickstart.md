# Quickstart: validar a Página inicial

Guia de execução e verificação. Os detalhes de endereço e consultas estão em [contracts/](contracts/); os estados, em [data-model.md](data-model.md).

## Pré-requisitos

- Node.js 20+ e `npm install` (dependências já no `package.json`).
- Para a verificação manual com dados reais: backend em `../agenda-livre-backend` rodando em `http://localhost:8000` com atividades, unidades e categorias de exemplo, e CORS liberado para `http://localhost:5500`.
- Frontend servido em `http://localhost:5500` (`python -m http.server 5500`, também usado pelo Playwright).

## 1. Testes automáticos

```text
npm test            # unitários (Vitest)
npm run test:e2e    # navegador (Playwright, API simulada)
```

Esperado: tudo verde, incluindo os specs novos `search-criteria`, `filter-options`, `public-api`, `upcoming-activities`, `home-search`, `home-upcoming` e `home-accessibility`.

## 2. Cenários manuais (API real)

| # | Cenário | Resultado esperado |
|---|---|---|
| 1 | Abrir `index.html` | 3 esqueletos e depois até 3 cards em ordem cronológica; categoria, nome, unidade, data/horário; fallback de imagem |
| 2 | Acionar um card (mouse e teclado) | Abre `atividade.html?id=…` na mesma aba |
| 3 | "Ver todas" | `explorar.html` sem parâmetros |
| 4 | Digitar, mudar filtros | Aba Rede do navegador sem novas requisições |
| 5 | Digitar `dança`, Enter | `explorar.html?q=dan%C3%A7a`; repetir clicando em "Explorar" |
| 6 | Nada preenchido, "Explorar" | `explorar.html` sem query string |
| 7 | Unidade + categoria + "Próximos 7 dias" + termo | Endereço com `q`, `unit`, `category`, `date_from`, `date_to` (conferir contra [explore-url.md](contracts/explore-url.md)) |
| 8 | "Hoje" | `?date=AAAA-MM-DD` apenas |
| 9 | Parar o backend e recarregar | Mensagem amigável + "Tentar novamente"; pesquisa e filtros seguem utilizáveis; opções com só "todas" e aviso |
| 10 | Religar o backend e acionar "Tentar novamente" | Esqueletos e depois os cards, sem recarregar |
| 11 | Base sem atividades futuras | Mensagem de vazio (sem botão de erro) e "Ver todas" |
| 12 | Limitar a rede (lenta) | Esqueletos visíveis, anúncio único "Carregando…" e conclusão |

## 3. Acessibilidade e responsividade

- Só teclado: percorrer skip link → menu → campo → filtros → "Explorar" → cards → "Ver todas", com foco sempre visível; nenhum movimento de foco ao carregar, concluir ou falhar.
- Leitor de tela (NVDA ou VoiceOver): rótulos dos controles, anúncio único de carregando/concluído/erro, esqueletos ignorados, ilustração ignorada, hierarquia `h1` → `h2`.
- 320 px, zoom 400 % e texto 200 %: sem rolagem horizontal nem perda de função.
- `prefers-reduced-motion: reduce`: esqueletos sem brilho/pulso.
- axe (via Playwright) sem violações em carregando, sucesso, vazio e erro.

Registrar resultados e desvios abaixo ao concluir a implementação.

## Registro de verificação

| Data | Verificação | Resultado | Observações |
|---|---|---|---|
| 2026-10-11 | `npm test` (Vitest) | 275 testes passando | Inclui `public-api`, `search-criteria`, `filter-options`, `upcoming-activities` e `design-tokens` |
| 2026-10-11 | `npm run test:e2e` (Playwright, API simulada) | 154 testes passando | Cenários 1–12 automatizados em `home-upcoming`, `home-search` e `home-accessibility`; axe sem violações nos 4 estados; 320–1440 px sem rolagem horizontal; texto a 200 % |
| 2026-10-11 | Captura visual 1280 px e 375 px | Conforme | Hero, pesquisa e 3 cards; formulário em linha (desktop) e em coluna (celular) |
| pendente | Cenários 1–12 com a API real do backend | Não executado | Backend não estava em execução nesta sessão; contrato de `date_from` conferido no código (`build_listing`) |
| pendente | Leitor de tela (NVDA/VoiceOver) | Não executado | Verificação manual (T041) |
