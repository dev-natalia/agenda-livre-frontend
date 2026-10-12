# Contrato: endereço dos detalhes

Página: `atividade.html`. Produzido pelo card compartilhado (`activityDetailsUrl`) e consumido por esta página; **não muda** nesta feature.

## Leitura

| Parâmetro | Regra | Resultado |
|---|---|---|
| `id` | aparado, minúsculas, deve ser UUID | consulta `GET /activities/{id}/` |
| `id` ausente, vazio, repetido com valor inválido ou não UUID | — | estado "não encontrada", **sem** requisição |
| `id` repetido | vale o primeiro | — |
| demais parâmetros | ignorados | sem erro |

Hash (`#…`) é ignorado.

## Escrita

A página não altera o endereço (sem `pushState`/`replaceState`).

## Voltar para atividades

| Situação | Comportamento |
|---|---|
| `document.referrer` da mesma origem em `explorar.html` e clique simples | `history.back()`; a Explorar restaura estado (feature 006) |
| sem referência da Explorar, ou Ctrl/Cmd/botão do meio | link normal para `explorar.html` (sem critérios) |

O link tem sempre `href="explorar.html"` válido, funcionando sem o comportamento acima.

## Título do documento

| Estado | `document.title` |
|---|---|
| sucesso | `<título da atividade> — Agenda Livre` |
| não encontrada | `Atividade não encontrada — Agenda Livre` |
| erro | `Erro ao carregar a atividade — Agenda Livre` |
| carregando | `Detalhes da atividade — Agenda Livre` (valor estático) |
