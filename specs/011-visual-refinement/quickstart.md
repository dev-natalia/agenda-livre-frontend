# Quickstart: validar o refinamento visual

Guia de validação ponta a ponta. Detalhes em `contracts/`.

## Pré-requisitos

- Node.js 20+ e Python 3 (servidor estático de teste); `npm install` e `npx playwright install chromium` já feitos (ver `docs/19-guia-de-testes.md`).
- Porta 5500 livre.

## 0. Linha de base (antes de qualquer alteração)

```text
npm run test:all
npm run capture -- before
```

Esperado: 962 unitários e 647 de navegador aprovados, 20 ignorados com motivo (registro da feature 010); capturas em `docs/visual-review/before/`.

## 1. Ver o resultado no navegador

```text
python -m http.server 5500
```

Abrir `http://localhost:5500/index.html`. Com o backend de demonstração em `http://localhost:8000` (ver `js/config.js`), as atividades aparecem; sem ele, o estado de erro também deve estar bem apresentado.

Conferir, em 320, 375, 768, 1024 e 1440 px (ferramentas do navegador):

| Verificação | Esperado |
|---|---|
| Logo e ícone | logo no cabeçalho das cinco páginas, ícone na aba |
| Alinhamento | cabeçalho, conteúdo e rodapé na mesma linha vertical |
| Hero e busca | título maior que o resto, busca como painel único, "Explorar" em destaque |
| Cards | etiqueta colorida por categoria com o nome escrito, ícones de local e data, alturas iguais |
| Estados | vazio, carregando e erro distintos entre si, inclusive em escala de cinza |
| Explorar | filtros em painel, "Filtrar" primário e "Limpar filtros" contornado |
| Sobre, Contato, Detalhes | blocos organizados, largura de leitura, aviso de demonstração evidente |
| Rolagem | nenhuma rolagem horizontal em 320 |

## 2. Automáticos

```text
npm test
npm run test:e2e
npm run test:a11y
```

Esperado: todos verdes, com os mesmos 20 ignorados justificados; novos testes de marca, cores de categoria e alinhamento aprovados.

## 3. Manual por teclado (registrar no DOC-21)

Em cada fluxo, Tab percorre na ordem lógica com foco visível: pular para o conteúdo, menu (celular), buscar no Início, filtrar e paginar em Explorar, abrir uma atividade, voltar, enviar o formulário de Contato vazio e preenchido.

## 4. Preferências do sistema

Ativar "reduzir movimento", aumentar o texto a 200% e o espaçamento de texto (WCAG 1.4.12): sem sobreposição, corte ou animação.

## 5. Antes e depois

```text
npm run capture -- after
```

Comparar `docs/visual-review/before` e `after`, e preencher `docs/21-registro-de-revisao-visual.md` conforme `contracts/visual-review-record.md`.

## Critério de conclusão

Todos os itens acima verificados; histórias P0 aprovadas; nenhuma regressão de navegação, busca, paginação, detalhes ou formulário.
