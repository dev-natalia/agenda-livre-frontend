# Contrato: formulário de contato

Página: `contato.html`. Contrato de interface com a pessoa usuária (não há contrato de API).

## Estrutura

| Elemento | Regra |
|---|---|
| `h1` | "Contato" (único) |
| Aviso | parágrafo visível antes do formulário: formulário demonstrativo, nenhuma mensagem será enviada |
| Nota de obrigatoriedade | "Todos os campos são obrigatórios." antes dos campos |
| Campos | Nome (`text`, `autocomplete=name`), E-mail (`email`, `autocomplete=email`, `inputmode=email`), Assunto (`text`), Mensagem (`textarea`); todos `required`, `<label for>` visível, ajuda com limites ligada por `aria-describedby`; sem `maxlength` |
| Ações | "Enviar mensagem" (`submit`), "Limpar campos" (`button`) |
| `form` | `novalidate`, sem `action` |
| Resumo | `<p role="status" class="form-summary">` vazio até um envio inválido |
| Painel | `<section hidden>` com `<h2 tabindex="-1">`, texto demonstrativo e "Voltar ao formulário" |
| `<noscript>` | repete que o formulário é demonstrativo e que, sem JavaScript, nada é enviado |

## Comportamento

| Evento | Resultado |
|---|---|
| Envio com algum campo inválido | todos os erros aparecem; `aria-invalid` + `aria-describedby`; resumo "N campo(s) precisa(m) de correção."; foco no 1º inválido |
| `input` em campo com erro | se passou a ser válido, remove erro e `aria-invalid`; o resumo só muda no próximo envio |
| Envio válido | formulário oculto, painel exibido, foco no `h2` do painel, nenhum dado transmitido |
| Voltar ao formulário | formulário exibido com valores, sem erros/resumo, foco no 1º campo |
| Limpar campos | campos vazios, erros e resumo removidos, foco no 1º campo |

## Texto do painel

Título: "Formulário demonstrativo". Corpo: "Este formulário é demonstrativo. Nenhuma mensagem foi enviada." O texto não usa "recebida", "enviada com sucesso", "entregue", "retornaremos" ou equivalentes (teste de regressão).
