# Data Model: Páginas institucionais e contato

Nenhuma entidade persistida; tudo existe na memória/DOM da página aberta.

## ContactValues (rascunho de contato)

| Campo | Tipo | Regra |
|---|---|---|
| `name` | texto | obrigatório, 2–100 após aparar |
| `email` | texto | obrigatório, formato `parte@domínio.sufixo` sem espaços, até 254 |
| `subject` | texto | obrigatório, 3–100 após aparar |
| `message` | texto multilinha | obrigatório, 10–1000 após aparar |

Limites em `CONTACT_LIMITS` (`js/contact/validation.js`). Nunca enviado, gravado ou registrado.

## ValidationResult

| Campo | Descrição |
|---|---|
| `valid` | `true` se não há erros |
| `errors` | mapa `campo → mensagem em português` (só campos inválidos) |
| `order` | campos inválidos na ordem da página (Nome, E-mail, Assunto, Mensagem); o primeiro recebe o foco |

### Mensagens (por causa)

| Campo | Vazio | Curto | Longo | Formato |
|---|---|---|---|---|
| Nome | Informe seu nome. | Use pelo menos 2 caracteres. | Use no máximo 100 caracteres. | — |
| E-mail | Informe seu e-mail. | — | Use no máximo 254 caracteres. | Informe um e-mail válido, como nome@exemplo.com. |
| Assunto | Informe o assunto. | Use pelo menos 3 caracteres. | Use no máximo 100 caracteres. | — |
| Mensagem | Escreva sua mensagem. | Use pelo menos 10 caracteres. | Use no máximo 1000 caracteres. | — |

## FormState (transições)

```text
filling   --envio inválido-->        filling (com erros, foco no 1º inválido, resumo anunciado)
filling   --corrigir campo-->        filling (erro do campo removido)
filling   --envio válido-->          confirmed (painel; foco no título)
confirmed --Voltar ao formulário-->  filling (valores preservados, sem erros, foco no 1º campo)
filling   --Limpar campos-->         filling (campos vazios, sem erros)
```

Recarregar a página sempre volta a `filling` com campos vazios.

## AboutContent

Seções fixas no HTML (`h2` + parágrafos). Sem modelo de dados.
