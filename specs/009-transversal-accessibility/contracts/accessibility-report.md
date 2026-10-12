# Contrato: registro de acessibilidade

Arquivo entregue: `docs/17-registro-de-acessibilidade.md`. Escrito em português, para a equipe e para a banca.

## Estrutura obrigatória

1. **Escopo e data** — páginas, estados, larguras, versão do repositório (commit) e data da avaliação.
2. **Ambiente** — navegador e versão, sistema, leitor de tela e versão, ferramentas automáticas e versões (axe-core, Playwright).
3. **Resumo** — contagem de verificações por resultado (`conforme`, `nao-conforme`, `nao-aplicavel`, `nao-verificado`) e de problemas por situação.
4. **Verificações** — tabela com critério, página, estado, largura, resultado e evidência (formato do `data-model.md`).
5. **Problemas** — um bloco por problema (campos do `data-model.md`), incluindo a razão de contraste antes e depois quando houver ajuste de cor.
6. **Exceções** — escopo, razão e mitigação.
7. **Limitações conhecidas** — o que não foi verificado e por quê (por exemplo, leitores de tela não testados, sem teste com pessoas usuárias), e as dependências da API do DOC-15 §8.
8. **Aviso** — texto fixo abaixo.

## Aviso obrigatório

> Este registro documenta as verificações feitas na data indicada. Resultados de ferramentas automáticas e de testes manuais contribuem para a avaliação, mas não equivalem a certificação nem a declaração de conformidade integral com a WCAG 2.2 AA, que depende do conteúdo real, dos estados dinâmicos e de avaliação continuada.

## Regras de redação

- Nenhuma frase pode afirmar mais do que a evidência listada comporta; "conforme" só aparece ligado a uma evidência.
- Resultado de ferramenta automática sempre vem acompanhado de revisão manual ou do registro de que não houve.
- Nenhum dado pessoal real; dados de teste são sintéticos.
- Cada problema `pendente` tem uma justificativa e uma mitigação.
