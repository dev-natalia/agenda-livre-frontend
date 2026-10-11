# Contrato: endereço da página Explorar

Estende `specs/005-home-page/contracts/explore-url.md`. A Explorar **lê** esse endereço ao abrir e ao receber `popstate`, e **escreve** o mesmo formato ao aplicar, limpar ou trocar de página.

## Parâmetros

| Parâmetro | Leitura | Escrita |
|---|---|---|
| `q` | `trim`, cortado em 100 caracteres; vazio ignorado | só se não vazio |
| `unit` | aceito se UUID; senão ignorado | só se escolhido |
| `category` | idem | idem |
| `date` | aceito se `AAAA-MM-DD` real **e** coincide com o período `today` de hoje | só no período `today` |
| `date_from`, `date_to` | aceitos em par que coincida com `week` ou `month` de hoje; senão descartados | só nos períodos `week`/`month` |
| `period` | chave `any\|today\|week\|month` (fallback sem JavaScript); outras chaves ignoradas; traduzida para datas | nunca escrito |
| `page` | inteiro ≥ 1; inválido (0, negativo, texto, decimal) → 1 | só se > 1 |
| outros | ignorados e removidos na reescrita | — |

Regras:
- Ordem de escrita estável: `q`, `unit`, `category`, `date`, `date_from`, `date_to`, `page`.
- `date` presente com `date_from`/`date_to`: vence a combinação que coincide com um período de hoje; se nenhuma coincidir, todas as datas são descartadas. Nunca se envia a combinação recusada pela API.
- Valores padrão ("todas", "qualquer data") e vazios não entram.
- Se a leitura alterou algo (normalização, `period`, descarte), o endereço é reescrito com `replaceState` (sem nova entrada no histórico).
- Aplicar, limpar e trocar de página: `pushState` quando o endereço muda; `replaceState` quando é idêntico ao atual.
- Fuso: "hoje" é o dia do calendário em `America/Sao_Paulo`.

## Exemplos

```text
explorar.html                                              # listagem geral, página 1
explorar.html?q=dan%C3%A7a&page=2                          # termo e página 2
explorar.html?unit=…&category=…&date_from=2026-10-11&date_to=2026-10-17
explorar.html?period=week          →  explorar.html?date_from=2026-10-11&date_to=2026-10-17   (reescrito)
explorar.html?page=0&foo=bar       →  explorar.html                                           (reescrito)
explorar.html?date=2026-10-11&date_from=2026-10-11         →  conforme coincidência com o período de hoje
```

## Links de paginação

`explorar.html?<critérios>&page=N` (N ≥ 2); a página 1 usa o endereço sem `page`. São `<a href>` reais: abrir em nova aba carrega a mesma listagem; clique simples é interceptado para atualizar sem recarregar.
