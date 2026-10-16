# DOC-13 — Especificação de Interfaces e Comportamentos

**Projeto:** Agenda Livre  
**Status:** Especificação consolidada para implementação  
**Escopo:** Comportamentos das cinco páginas públicas e estados compartilhados da interface.

## 1. Objetivo

Este documento especifica o comportamento das interfaces públicas do Agenda Livre: interações, navegação, filtros, carregamento, erros, formulários e requisitos de acessibilidade que devem ser considerados durante a implementação.

A acessibilidade é um requisito transversal. Os componentes devem funcionar com teclado, leitores de tela, ampliação de conteúdo e diferentes tamanhos de tela. A referência de conformidade definida para o projeto é **WCAG 2.2 nível AA**.

## 2. Páginas públicas

1. **Início:** apresentação do projeto, pesquisa rápida e próximas atividades.
2. **Explorar atividades:** listagem, filtros e paginação.
3. **Detalhes da atividade:** informações completas de uma atividade.
4. **Sobre o Agenda Livre:** apresentação institucional do projeto.
5. **Contato:** formulário demonstrativo, sem envio real de mensagens.

A administração permanece no Django Admin e não faz parte da interface pública descrita aqui.

## 3. Princípios gerais de interface

- Utilizar HTML semântico, hierarquia coerente de títulos e controles nativos sempre que possível.
- Diferenciar visualmente links e botões: links navegam; botões executam ações.
- Todos os elementos interativos devem ser operáveis por teclado e ter indicador de foco visível.
- O foco não deve saltar inesperadamente durante atualizações assíncronas.
- Não comunicar estados somente por cor.
- Usar textos claros, mensagens objetivas e nomes acessíveis compreensíveis.
- Respeitar `prefers-reduced-motion: reduce`, removendo ou reduzindo movimentos não essenciais.
- Permitir ampliação de texto até 200% sem perda de conteúdo ou funcionalidade e testar reorganização do layout em larguras reduzidas.
- Não impedir o zoom do navegador.
- Imagens informativas devem ter texto alternativo útil; imagens decorativas devem usar `alt=""`.
- Ícones que não acrescentem informação devem ser ocultados das tecnologias assistivas.
- Usar ARIA apenas quando necessário para complementar a semântica nativa, sem substituir controles HTML adequados.

## 4. Estrutura semântica compartilhada

Todas as páginas devem possuir:
- Um link “Pular para o conteúdo principal”, primeiro na ordem de foco, visível quando recebe foco.
- Cabeçalho (`header`) e navegação (`nav`) com identificação acessível.
- Um conteúdo principal (`main`) com identificador estável, por exemplo `main-content`.
- Rodapé (`footer`) quando aplicável.
- Idioma principal declarado no documento HTML (`lang="pt-BR"`).
- Hierarquia de títulos lógica, sem escolher níveis de título apenas pela aparência.

O link para pular ao conteúdo deve direcionar ao conteúdo principal da página atual. A implementação precisa verificar que o destino seja alcançável e que o foco continue de forma previsível.

## 5. Cabeçalho e navegação

### Desktop
- Apresentar o logotipo textual Agenda Livre e links para Início, Explorar atividades, Sobre e Contato.
- Identificar a página atual de forma programática, por exemplo com `aria-current="page"` no link correspondente.
- Manter ordem de foco coerente com a ordem visual.

### Dispositivos móveis
- Usar botão expansível para abrir e fechar a navegação.
- O botão deve ter nome acessível, estado atualizado por `aria-expanded="true|false"` e, se útil, referência ao conteúdo controlado por `aria-controls`.
- Os links só devem ser focáveis quando estiverem visíveis.
- Não usar o papel ARIA `menu` para uma navegação de site convencional; preferir botão de divulgação e links nativos.
- O menu deve ser operável por teclado e leitor de tela, sem armadilhas de foco.
- Respeitar a preferência de movimento reduzido.

## 6. Página Início

### 6.1 Pesquisa rápida
- Campo de pesquisa por nome da atividade.
- Filtros rápidos de unidade, categoria e período.
- Cada filtro permite uma única seleção; as opções padrão representam “todas” as unidades, “todas” as categorias e todas as datas futuras, conforme o que a API suportar.
- Selecionar ou alterar campos **não** dispara uma consulta.
- O botão “Explorar” envia a pesquisa e os filtros selecionados para a página Explorar.
- Se nenhum critério tiver sido selecionado, “Explorar” abre a listagem geral.
- A navegação deve representar os critérios na URL sempre que possível, para permitir compartilhamento e retorno.

### 6.2 Próximas atividades
- Buscar dinamicamente os dados na API ao abrir a página inicial.
- Mostrar três atividades publicadas com ocorrências futuras, ordenadas cronologicamente pela próxima ocorrência.
- Considerar a próxima ocorrência de atividades recorrentes.
- Não exibir atividades com status `CANCELLED` ou `FINISHED`.
- Se a API permitir, cada card deve apresentar nome, categoria, unidade, público-alvo (`target_audiences`, omitido quando vazio), próxima data/horário e imagem.
- Cards usam grade em desktop e uma coluna em telas estreitas.

### 6.3 Carregamento
- Durante a consulta, mostrar três skeleton cards.
- O skeleton é visual e não deve ser anunciado como se fossem atividades reais.
- Comunicar de forma breve e acessível que as atividades estão carregando e, ao concluir, comunicar a conclusão.
- Evitar anúncios repetidos e não mover o foco apenas porque o conteúdo foi atualizado.

### 6.4 Falha e nova tentativa
- Se a consulta falhar, substituir os skeletons por uma mensagem amigável e um botão “Tentar novamente”.
- Não mostrar dados antigos em cache como se fossem a resposta atual.
- A falha nessa seção não deve bloquear as demais partes da página.
- Ao tentar novamente, substituir a mensagem por skeleton loading; comunicar o novo estado às tecnologias assistivas.
- Em caso de nova falha, mostrar novamente a mensagem e a opção de tentar.

### 6.5 Quantidade de cards
- Mostrar três próximas atividades.
- Incluir um caminho claro para “Ver todas” na página Explorar.

## 7. Página Explorar atividades

### 7.1 Pesquisa e filtros
- Disponibilizar pesquisa por texto e filtros de unidade, categoria, público-alvo e período, conforme os recursos efetivamente suportados pela API.
- O filtro de público-alvo (opção padrão “Todos os públicos”) é montado a partir de `GET /audiences/`; se a lista não carregar, oferece só a opção padrão e avisa, sem afetar os outros filtros. A regra de “Todas as idades” é aplicada pela API.
- Os filtros são combináveis e cada campo permite uma única seleção.
- Usar controles HTML nativos, como `<select>`, com rótulos visíveis associados por `label`.
- A seleção dos filtros não dispara requisição.
- O botão “Filtrar” aplica os critérios selecionados.
- Enquanto a pessoa modifica campos antes de aplicar, os resultados existentes permanecem visíveis.
- Ao aplicar uma nova pesquisa, voltar à página 1.
- O botão “Limpar filtros” restaura os valores padrão e atualiza automaticamente a listagem sem filtros.
- O estado dos filtros e da página deve ser representado na URL sempre que possível.
- Os parâmetros concretos devem corresponder ao contrato real da API; não inventar filtros não suportados pelo backend.

### 7.2 Atualização de resultados
- Atualizar resultados dinamicamente sem recarregar a página inteira.
- Ao aplicar filtros ou mudar de página, mostrar skeleton loading no lugar dos resultados.
- Não misturar resultados anteriores com novos resultados durante a atualização.
- Comunicar o carregamento por uma região de status acessível, sem mover o foco.
- Ao terminar, anunciar a quantidade de resultados de forma objetiva.
- Usar singular/plural corretamente: “1 atividade encontrada” ou “12 atividades encontradas”.
- Se não houver resultados, apresentar “Nenhuma atividade encontrada” e orientar a pessoa a ajustar os filtros.
- Diferenciar lista vazia de erro da API.
- Se ocorrer erro, mostrar mensagem amigável e botão “Tentar novamente”. Ao tentar novamente, mostrar skeleton loading.

### 7.3 Paginação
- Usar paginação tradicional com números de página e controles para anterior/próxima, desde que suportada pela API.
- Ao navegar entre páginas, preservar os filtros.
- Ao aplicar novos filtros, voltar à página 1.
- Indicar programaticamente a página atual.
- Os controles devem ter nomes acessíveis e estados indisponíveis comunicados corretamente.
- Se a API não suportar paginação, documentar e implementar uma alternativa compatível com o contrato real; não simular paginação que produza resultados incorretos.

### 7.4 Ordenação
- Ordenar pela próxima ocorrência futura, da mais próxima para a mais distante.
- Para atividades recorrentes, considerar a próxima ocorrência futura.
- Confirmar se a API já entrega essa ordenação. Se não entregar, definir de forma explícita se o cálculo será feito no backend ou frontend, sem duplicar regras de negócio divergentes.

### 7.5 Retorno dos detalhes
Ao abrir um card e retornar à listagem, preservar, quando possível:
- filtros e termo de pesquisa;
- página atual;
- resultados da pesquisa anterior, evitando uma nova consulta desnecessária;
- posição de rolagem.

A preservação deve funcionar com o histórico do navegador e com os parâmetros da URL. Se a página de detalhes for aberta diretamente, oferecer um caminho claro para explorar atividades.

## 8. Cards e imagens de atividades

- Clicar no card ou em seu link principal abre os detalhes na mesma aba.
- Cada atividade deve ter URL direta e compartilhável.
- O retorno deve preservar o estado da listagem quando possível.
- Links externos de inscrição ou informações abrem em nova aba.
- A interface deve indicar de forma acessível que o link abre uma nova aba; o link deve ser implementado de forma segura.
- Exibir o botão externo apenas quando houver uma URL válida.
- Quando não houver imagem, manter a dimensão visual do espaço e usar um fundo da identidade visual, com ícone de categoria opcional.
- O fundo e o ícone decorativo não devem produzir anúncios desnecessários para leitores de tela.
- O texto alternativo das imagens reais depende da função da imagem; não repetir automaticamente o título da atividade como `alt`.

## 9. Página Detalhes da atividade

Exibir, conforme os dados disponíveis:
- imagem principal;
- categoria;
- título;
- unidade;
- próxima data e horário ou informações de ocorrência;
- público-alvo, se a API fornecer essa informação;
- descrição;
- local e informações adicionais;
- botão/link externo de inscrição ou informações, somente se houver URL.

### Atividade indisponível
- Se a API permitir identificar que a atividade existe, mas está cancelada ou encerrada, mostrar uma página informando que ela não está mais disponível.
- Oferecer botão “Explorar outras atividades”.
- Atividades `CANCELLED` e `FINISHED` não devem aparecer nas listagens públicas.
- Se a atividade não existir, mostrar página 404 com caminhos para Início e Explorar.
- Essa distinção depende do contrato e das permissões da API. A interface não deve expor dados privados para distinguir os casos.

## 10. Página Sobre

- Conteúdo institucional direto e compreensível.
- Explicar o objetivo do Agenda Livre e sua proposta de facilitar a descoberta de atividades culturais e educacionais.
- Manter hierarquia de títulos e parágrafos curtos.
- Evitar linguagem técnica desnecessária.

## 11. Página Contato

O formulário é demonstrativo e **não envia mensagens de verdade**.

### Campos
- Nome — obrigatório, com limite de caracteres.
- E-mail — obrigatório, formato validado e limite de caracteres.
- Assunto — obrigatório, com limite de caracteres.
- Mensagem — obrigatória, com limites mínimo e máximo.

Os limites numéricos finais devem ser definidos durante a implementação e mantidos consistentes com os testes.

### Validação
- Validar todos os campos em conjunto.
- Ao tentar enviar um formulário inválido, exibir todos os erros de uma vez.
- Associar cada mensagem de erro ao campo correspondente programaticamente.
- Identificar campos inválidos de maneira que não dependa apenas de cor.
- Levar o foco ao primeiro campo inválido após a tentativa de envio, sem impedir que a pessoa navegue pelos demais erros.
- Os erros devem ser específicos e compreensíveis.
- Usar `required`, tipos de input apropriados e validação nativa quando isso for útil, complementando-a com mensagens acessíveis.
- Evitar apagar os valores válidos digitados.

### Confirmação demonstrativa
Após a validação bem-sucedida:
- Substituir o formulário por um painel de confirmação.
- Informar explicitamente que o formulário é demonstrativo e que nenhuma mensagem foi enviada.
- Não afirmar que a mensagem foi recebida ou encaminhada.
- Oferecer botão “Voltar ao formulário”.
- Ao exibir o painel, anunciar a mudança às tecnologias assistivas e gerenciar o foco de forma previsível.
- Ao retornar ao formulário, definir explicitamente se os valores serão preservados; preferência recomendada: preservar os valores até que a pessoa escolha limpá-los.

## 12. Estados comuns

### Carregando
- Skeleton visual para áreas de cards.
- Estado acessível de carregamento anunciado sem excesso de mensagens.
- Conteúdo provisório não deve ser interpretado como resultado real.

### Sucesso
- Conteúdo exibido com hierarquia semântica.
- Quantidade de resultados comunicada quando disponível.

### Nenhum resultado
- Mensagem explícita e orientação para ajustar filtros.
- Não usar a mesma mensagem de um erro técnico.

### Erro de API
- Mensagem amigável, sem detalhes internos.
- Região de status acessível; não deslocar o foco automaticamente.
- Botão “Tentar novamente”.
- Ao tentar novamente, mostrar skeleton loading.

### Página não encontrada
- Mensagem de página inexistente.
- Links para Início e Explorar atividades.
- Estrutura semântica, foco visível e linguagem clara.

### Imagem ausente
- Fundo de identidade visual e ícone opcional, sem ícone quebrado.

## 13. Requisitos de acessibilidade que afetam toda a interface

1. Conformidade-alvo WCAG 2.2 nível AA.
2. Navegação integral por teclado e ausência de armadilhas.
3. Indicador de foco visível e não ocultado por outros elementos.
4. Contraste mínimo de 4,5:1 para texto comum e 3:1 para texto grande, conforme aplicabilidade do critério.
5. Contraste de 3:1 para componentes visuais e estados necessários à identificação, conforme aplicabilidade.
6. Texto redimensionável até 200% sem perda de conteúdo ou funcionalidade.
7. Reflow em largura equivalente a 320 pixels CSS, exceto conteúdo que exija layout bidimensional.
8. HTML semântico e hierarquia lógica de títulos.
9. Rótulos e instruções associados aos campos.
10. Erros identificados em texto e associados aos campos.
11. Mensagens de status acessíveis sem exigir foco.
12. Texto alternativo apropriado para imagens informativas e `alt=""` para imagens decorativas.
13. Link “Pular para o conteúdo principal”.
14. Menu móvel com botão de divulgação e estado acessível.
15. Respeito a `prefers-reduced-motion`.
16. Não depender exclusivamente de cor, som, posição ou forma para comunicar informação.
17. Testes com teclado, ampliação, leitor de tela e ferramentas automáticas; ferramentas automáticas não substituem avaliação manual.

Os requisitos específicos e suas fontes estão detalhados no documento de acessibilidade do projeto.

## 14. Dependências e pontos a confirmar com a API

- Disponibilidade de filtros por unidade, categoria e período.
- Nomes reais dos parâmetros de pesquisa.
- Suporte a paginação e formato dos metadados de página.
- Disponibilidade do total de resultados.
- Ordenação por próxima ocorrência futura, incluindo atividades recorrentes.
- Campos disponíveis para imagem, público-alvo, localização e URL externa.
- Capacidade de distinguir atividade cancelada/encerrada de atividade inexistente sem expor dados inadequados.
- Regra de publicação e visibilidade pública das atividades.

A interface deve refletir o contrato real da API; comportamentos dependentes de dados não disponíveis não devem ser simulados como se fossem garantidos.

## 15. Critérios de aceite

- As cinco páginas podem ser usadas com teclado.
- O foco é sempre visível e sua ordem é lógica.
- O link para pular ao conteúdo funciona em todas as páginas.
- O menu móvel comunica estado e funciona com teclado e leitor de tela.
- Filtros só são aplicados ao acionar “Filtrar”; “Limpar filtros” atualiza a listagem sem filtros.
- Novas pesquisas retornam à página 1.
- Paginação e filtros são preservados na URL quando suportado.
- Carregamentos, resultados vazios e erros são estados distintos e acessíveis.
- Mensagens de status não deslocam o foco.
- Formulário mostra todos os erros, associados aos campos, e direciona o foco ao primeiro inválido.
- A confirmação do formulário deixa claro que nada foi enviado.
- Links externos abrem em nova aba com indicação acessível.
- Conteúdo permanece utilizável com texto ampliado e layout estreito.
- A preferência de movimento reduzido é respeitada.
- Combinações de cores usadas na interface passam por verificação de contraste.
- Os requisitos dependentes da API foram verificados contra o contrato real.

## 16. Referências

- WCAG 2.2: https://www.w3.org/TR/WCAG22/
- WAI-ARIA Authoring Practices Guide — Disclosure: https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
- eMAG 3.1: https://emag.governoeletronico.gov.br/
- Lei Brasileira de Inclusão, Lei nº 13.146/2015, art. 63: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13146.htm
- Especificação da API REST do Agenda Livre (DOC-05).
- Wireframes do Agenda Livre (DOC-12).
- Identidade visual e design system do Agenda Livre (DOC-10).
