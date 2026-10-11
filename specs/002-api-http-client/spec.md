# Feature Specification: Cliente e integração com a API

**Feature Branch**: `002-api-http-client`

**Created**: 2026-10-11

**Status**: Draft

**Input**: User description: "Épico EP-FE-02 do docs/16-backlog-do-frontend.md (Feature FE-F02 — Cliente HTTP comum), que reúne as histórias FE-003 (centralizar requisições HTTP), FE-004 (tratar falhas e respostas inesperadas da API) e FE-005 (evitar que respostas antigas sobrescrevam pesquisas recentes). Contrato da API em agenda-livre-backend (docs/05 e specs/006-public-consultation/contracts/public-api.md)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consultar a API por um único ponto de acesso (Priority: P1)

Uma pessoa desenvolvedora que precisa obter dados (atividades, unidades, categorias) usa um único módulo compartilhado para consultar a API. Ela informa apenas o caminho do recurso e os filtros desejados; o módulo monta o endereço completo a partir da configuração única da URL base, codifica corretamente os parâmetros e devolve os dados já interpretados. Nenhuma página precisa montar endereços ou interpretar respostas por conta própria.

**Why this priority**: Todas as páginas que mostram atividades dependem desse módulo. Sem ele, cada página reimplementaria a comunicação de forma diferente, gerando inconsistências em erros e carregamento.

**Independent Test**: Chamar o módulo com um recurso e filtros (inclusive texto com acentos, espaços e caracteres especiais) contra respostas simuladas e verificar o endereço solicitado, os parâmetros codificados e os dados devolvidos.

**Acceptance Scenarios**:

1. **Given** a configuração válida da URL base, **When** um módulo solicita um recurso com filtros, **Then** a requisição é feita ao endereço formado pela URL base, pelo caminho do recurso e pelos filtros corretamente codificados.
2. **Given** filtros com valores vazios, nulos ou indefinidos, **When** a requisição é montada, **Then** esses filtros são omitidos do endereço.
3. **Given** filtros com texto contendo acentos, espaços, `&`, `=` ou `#`, **When** a requisição é montada, **Then** o valor chega à API íntegro, sem alterar outros parâmetros.
4. **Given** uma resposta de sucesso com conteúdo JSON válido, **When** a requisição conclui, **Then** os dados interpretados são devolvidos a quem chamou.
5. **Given** uma resposta de sucesso sem corpo, **When** o endpoint não prevê conteúdo, **Then** a chamada conclui com sucesso e sem dados, sem erro.
6. **Given** uma resposta de sucesso cujo conteúdo não é JSON válido (por exemplo, uma página HTML de proxy), **When** a requisição conclui, **Then** o resultado é tratado como resposta inválida, nunca como dados válidos.
7. **Given** a configuração da URL base ausente, inválida ou insegura, **When** uma consulta é solicitada, **Then** nenhuma requisição de rede é feita e quem chamou recebe um erro de configuração compreensível.
8. **Given** qualquer chamada, **When** a requisição é enviada, **Then** ela é somente de leitura, sem credenciais, sem cookies e sem envio de dados pessoais.

---

### User Story 2 - Receber erros classificados de forma consistente (Priority: P1)

Uma pessoa visitante abre uma página e, por algum motivo, os dados não carregam. Em vez de uma tela quebrada, de um texto técnico ou de um "nenhum resultado" enganoso, ela vê uma mensagem clara em português dizendo que não foi possível carregar as informações e, quando fizer sentido, o que fazer. Para isso, todas as páginas recebem do módulo compartilhado o mesmo tipo de erro, já classificado pela causa: sem conexão, tempo esgotado, API indisponível, recurso não encontrado, parâmetros recusados, excesso de requisições, resposta inválida ou configuração inválida.

**Why this priority**: A comunicação honesta de falhas é requisito de todas as histórias de consulta e de acessibilidade; sem classificação consistente, cada página trataria erros de um jeito.

**Independent Test**: Simular cada situação de falha (rede fora do ar, tempo esgotado, cada família de status HTTP, corpo ilegível) e verificar que o módulo devolve a categoria de erro correta, uma mensagem amigável em português sem detalhes técnicos e a indicação de se vale a pena tentar de novo.

**Acceptance Scenarios**:

1. **Given** que a rede está indisponível ou a API não responde, **When** a consulta é feita, **Then** o erro é classificado como falha de conexão, distinto de um erro HTTP.
2. **Given** que a API não responde dentro do tempo limite, **When** o tempo se esgota, **Then** o erro é classificado como tempo esgotado e a requisição é encerrada.
3. **Given** uma resposta `404` da API, **When** a consulta conclui, **Then** o erro é classificado como "não encontrado", distinguível das demais falhas, para que a página decida entre a página 404 e uma mensagem genérica.
4. **Given** uma resposta `400`, **When** a consulta conclui, **Then** o erro é classificado como parâmetros recusados e os detalhes por campo enviados pela API ficam disponíveis a quem chamou, sem serem exibidos automaticamente à pessoa visitante.
5. **Given** uma resposta `429`, **When** a consulta conclui, **Then** o erro é classificado como excesso de requisições, com mensagem pedindo para aguardar e tentar novamente.
6. **Given** uma resposta `5xx`, **When** a consulta conclui, **Then** o erro é classificado como indisponibilidade da API, com mensagem amigável e possibilidade de nova tentativa.
7. **Given** qualquer erro, **When** a mensagem é preparada para a interface, **Then** ela não contém códigos de status, nomes de exceção, endereços internos, rastros nem o texto bruto retornado pelo servidor.
8. **Given** uma resposta de erro cujo corpo não segue o formato esperado (vazio, HTML ou texto), **When** o erro é montado, **Then** a classificação é feita apenas pelo status e nenhum conteúdo do corpo é exposto.
9. **Given** os dados técnicos de um erro (endereço, status, corpo), **When** são registrados para diagnóstico, **Then** vão apenas ao console de desenvolvimento, sem tokens, segredos ou dados pessoais.

---

### User Story 3 - Distinguir falha de resposta válida sem resultados e recuperar-se dela (Priority: P1)

Uma pessoa visitante procura atividades. Quando a API responde com sucesso e zero atividades, ela vê "nenhuma atividade encontrada", orientação para ajustar filtros. Quando a consulta falha, ela vê uma mensagem de erro com a ação "Tentar novamente". Os dois casos nunca se confundem, e acionar a nova tentativa repete exatamente a mesma consulta. O erro é anunciado a tecnologias assistivas sem arrancar o foco de onde a pessoa estava.

**Why this priority**: Confundir erro com lista vazia leva a pessoa a concluir que não existem atividades quando, na verdade, o sistema falhou. É o comportamento central de FE-004.

**Independent Test**: Simular uma resposta de sucesso com lista vazia e, separadamente, uma falha de rede; verificar que o módulo entrega resultados diferentes e que a apresentação do erro oferece "Tentar novamente", que repete a mesma consulta e, ao ter sucesso, substitui o erro pelos dados.

**Acceptance Scenarios**:

1. **Given** uma resposta de sucesso com `count` igual a 0, **When** a consulta conclui, **Then** o resultado é entregue como sucesso com lista vazia, nunca como erro.
2. **Given** uma falha classificada como passível de nova tentativa (conexão, tempo esgotado, `5xx`, `429`), **When** o erro é apresentado, **Then** a interface oferece a ação "Tentar novamente".
3. **Given** uma falha não passível de nova tentativa (configuração inválida, parâmetros recusados), **When** o erro é apresentado, **Then** a interface não oferece "Tentar novamente", pois repetir não resolveria.
4. **Given** um erro exibido com "Tentar novamente", **When** a pessoa aciona a ação, **Then** a mesma consulta é repetida, o erro é substituído por um estado de carregamento e, em caso de sucesso, pelos dados; em nova falha, o erro volta a ser exibido.
5. **Given** que um erro aparece ou desaparece, **When** a interface é atualizada, **Then** a mudança é anunciada a tecnologias assistivas por região de status e o foco do teclado permanece onde estava, a menos que a pessoa tenha acionado "Tentar novamente" (caso em que o foco permanece no botão, que continua existindo ou cede o lugar a um destino previsível).
6. **Given** uma falha em uma seção de uma página, **When** o erro é exibido, **Then** as demais partes da página continuam utilizáveis.
7. **Given** a mensagem de erro exibida, **When** lida por qualquer pessoa, **Then** não há detalhes técnicos, tokens, segredos nem informações internas.

---

### User Story 4 - Ver sempre o resultado da última pesquisa (Priority: P2)

Uma pessoa visitante pesquisa por um termo e, antes da resposta chegar, muda o filtro ou a página e pesquisa de novo. Mesmo que a resposta da primeira pesquisa chegue por último, ela não aparece: a pessoa vê apenas o resultado da pesquisa mais recente, e o indicador de carregamento corresponde à consulta em andamento.

**Why this priority**: Evita exibir dados desatualizados como se fossem a resposta atual, mas só se manifesta com pesquisas sucessivas e conexões lentas; por isso vem depois do núcleo do cliente e da apresentação de erros.

**Independent Test**: Simular duas consultas consecutivas em que a primeira responde mais devagar que a segunda; verificar que somente o resultado da segunda é entregue, que a primeira é cancelada ou descartada e que nenhum erro é apresentado por causa do cancelamento.

**Acceptance Scenarios**:

1. **Given** uma consulta em andamento, **When** uma nova consulta do mesmo contexto (mesma área da página) é iniciada, **Then** a anterior é cancelada ou invalidada.
2. **Given** que a resposta da consulta antiga chega depois da resposta da mais recente, **When** a interface seria atualizada, **Then** a resposta antiga é descartada e os resultados continuam sendo os da consulta mais recente.
3. **Given** que uma consulta antiga falha depois de ser substituída, **When** o erro chega, **Then** ele não é exibido nem substitui o resultado da consulta vigente.
4. **Given** que uma consulta foi cancelada por substituição, **When** o cancelamento ocorre, **Then** ele não é tratado nem exibido como erro à pessoa visitante.
5. **Given** consultas em áreas independentes da mesma página (por exemplo, próximas atividades e opções de filtro), **When** cada uma é iniciada, **Then** uma não cancela a outra.
6. **Given** que a pessoa sai da página ou a seção deixa de existir, **When** havia consulta em andamento, **Then** é possível cancelá-la sem gerar erro visível.
7. **Given** uma consulta vigente, **When** o indicador de carregamento é exibido ou removido, **Then** ele reflete apenas a consulta vigente: o carregamento não termina porque uma consulta antiga terminou.

---

### Edge Cases

- A URL base tem barra final ou o caminho do recurso começa com barra: o endereço final não deve ter barras duplicadas nem faltantes.
- O valor de um filtro é uma lista, um número ou um booleano: a conversão para texto deve ser previsível e documentada; valores não suportados são recusados em vez de enviados como `[object Object]`.
- A API responde `200` com um envelope diferente do esperado (sem `results`/`count`): tratado como resposta inválida pelo consumidor do endpoint, não como lista vazia.
- A API responde `404` por página fora do intervalo na paginação: o erro é "não encontrado", e quem pagina decide como se recuperar; o cliente não presume que seja atividade inexistente.
- Resposta de erro `400` traz `errors` com campos desconhecidos pela interface: os campos ficam disponíveis a quem chamou e nunca são exibidos diretamente.
- A pessoa aciona "Tentar novamente" várias vezes rapidamente: apenas uma consulta fica vigente.
- O navegador bloqueia a requisição por política de origem (CORS): aparece como falha de conexão genérica, sem expor a causa técnica à pessoa visitante, e é registrada no console de desenvolvimento.
- A aba fica em segundo plano e a resposta chega depois: aplica-se a mesma regra de consulta vigente.
- A resposta é muito demorada: o tempo limite encerra a requisição e o erro segue o fluxo de "tentar novamente".
- Duas chamadas idênticas e simultâneas de áreas diferentes: ambas funcionam de forma independente.
- JavaScript desabilitado ou módulo indisponível: as páginas continuam com navegação básica, conforme já definido na feature 001; este cliente não é exigido para a navegação entre páginas.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST oferecer um único módulo compartilhado por onde passam todas as consultas à API; nenhuma página ou componente pode montar endereços da API ou chamar a rede diretamente.
- **FR-002**: O sistema MUST obter a URL base exclusivamente da configuração única definida na feature 001, sem repetir endereços de ambiente em outros módulos.
- **FR-003**: O sistema MUST montar o endereço final a partir da URL base, do caminho do recurso e dos filtros, codificando corretamente os valores e evitando barras duplicadas ou ausentes.
- **FR-004**: O sistema MUST omitir do endereço os filtros de valor vazio, nulo ou indefinido e MUST recusar valores de tipo não suportado, em vez de enviá-los de forma imprevisível.
- **FR-005**: O sistema MUST realizar apenas consultas de leitura, sem credenciais, cookies ou dados pessoais, em conformidade com a API pública somente leitura.
- **FR-006**: O sistema MUST verificar o sucesso de cada resposta pelo status HTTP; respostas de erro nunca são tratadas como dados.
- **FR-007**: O sistema MUST interpretar corpo JSON de respostas de sucesso, aceitar resposta sem corpo quando o endpoint não prevê conteúdo e classificar corpo ilegível ou não-JSON como resposta inválida.
- **FR-008**: O sistema MUST diferenciar, de forma que quem chama consiga distinguir sem inspecionar texto de mensagem, no mínimo as categorias: configuração inválida, falha de conexão, tempo esgotado, não encontrado (`404`), parâmetros recusados (`400`), excesso de requisições (`429`), indisponibilidade da API (`5xx`), outro erro HTTP e resposta inválida.
- **FR-009**: O sistema MUST aplicar um tempo limite às consultas e encerrar a requisição quando ele se esgotar.
- **FR-010**: O sistema MUST fornecer, para cada categoria de erro, uma mensagem amigável em português do Brasil, sem códigos de status, nomes de exceção, endereços, rastros ou texto bruto do servidor.
- **FR-011**: O sistema MUST indicar, para cada erro, se uma nova tentativa tem chance razoável de resolver (conexão, tempo esgotado, `5xx`, `429`) ou não (configuração inválida, parâmetros recusados, não encontrado).
- **FR-012**: O sistema MUST disponibilizar a quem chama, para erros `400`, os detalhes por campo enviados pela API, sem exibi-los automaticamente.
- **FR-013**: O sistema MUST entregar uma resposta de sucesso com lista vazia como sucesso, distinguível de qualquer erro.
- **FR-014**: O sistema MUST oferecer uma apresentação compartilhada de erro com mensagem amigável e, quando o erro for passível de nova tentativa, a ação "Tentar novamente", que repete a consulta idêntica, exibe estado de carregamento e restaura o erro em caso de nova falha.
- **FR-015**: O sistema MUST anunciar o aparecimento e a remoção do erro a tecnologias assistivas por região de status, sem mover o foco do teclado apenas por causa da atualização.
- **FR-016**: O sistema MUST permitir que a falha em uma seção não impeça o uso das demais partes da página.
- **FR-017**: O sistema MUST permitir cancelar ou invalidar uma consulta em andamento quando outra consulta do mesmo contexto for iniciada, e MUST impedir que respostas ou erros de consultas substituídas alterem a interface.
- **FR-018**: O sistema MUST NOT tratar o cancelamento de uma consulta substituída ou abandonada como erro visível à pessoa visitante.
- **FR-019**: O sistema MUST manter consultas de contextos independentes sem interferência mútua.
- **FR-020**: O sistema MUST fazer o indicador de carregamento refletir apenas a consulta vigente.
- **FR-021**: O sistema MUST registrar detalhes técnicos de falhas somente no console de desenvolvimento, sem tokens, segredos ou dados pessoais, e MUST NOT exibi-los na interface.
- **FR-022**: O sistema MUST ser coberto por testes automatizados, com respostas simuladas, para: montagem de endereço, interpretação de corpo, cada categoria de erro, tempo esgotado, nova tentativa e descarte de respostas antigas; e por ao menos um teste de navegador que simule falha seguida de nova tentativa bem-sucedida.
- **FR-023**: O sistema MUST NOT depender de bibliotecas de terceiros em tempo de execução para a comunicação com a API, mantendo a stack sem framework definida para o projeto.
- **FR-024**: O sistema MUST NOT implementar neste momento as telas de listagem, detalhes ou página inicial; o escopo é o cliente, a classificação de erros, a apresentação reutilizável de erro com nova tentativa e a proteção contra respostas antigas.

### Key Entities *(include if feature involves data)*

- **Consulta à API**: um pedido de leitura identificado por recurso, filtros e contexto (área da página), com ciclo de vida: em andamento, concluída com sucesso, falha, cancelada ou substituída.
- **Resultado de sucesso**: dados interpretados de uma resposta bem-sucedida, incluindo o caso legítimo de lista vazia.
- **Erro da API**: falha classificada por categoria, com mensagem amigável, indicação de nova tentativa permitida e, quando aplicável, detalhes por campo vindos da API; os detalhes técnicos ficam fora da interface.
- **Contexto de consulta**: agrupamento de consultas que se substituem entre si (por exemplo, a listagem de resultados), independente de outros contextos da mesma página.
- **Apresentação de erro**: bloco visual reutilizável com mensagem amigável, região de status acessível e ação opcional "Tentar novamente".

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das consultas à API do frontend passam pelo módulo compartilhado; uma busca no código fora dele não encontra chamadas diretas de rede nem endereços da API.
- **SC-002**: Cada uma das categorias de falha definidas (conexão, tempo esgotado, `400`, `404`, `429`, `5xx`, resposta inválida, configuração) é reproduzida em teste automatizado e resulta na categoria e na mensagem esperadas em 100% dos casos.
- **SC-003**: Nenhuma mensagem exibida à pessoa visitante contém código de status, nome de exceção, endereço interno ou texto bruto do servidor, verificado em teste para todas as categorias.
- **SC-004**: Em testes com resposta antiga chegando depois da recente, 100% das vezes a interface mostra apenas os dados da consulta mais recente.
- **SC-005**: Diante de falha seguida de sucesso na nova tentativa, a pessoa visitante recupera os dados com uma única ação ("Tentar novamente") e sem recarregar a página.
- **SC-006**: Uma lista vazia com sucesso nunca é apresentada como erro, e uma falha nunca é apresentada como lista vazia, em 100% dos cenários de teste.
- **SC-007**: A verificação automatizada de acessibilidade não reporta violações na apresentação de erro, e em teste manual com teclado e leitor de tela o erro é anunciado sem mover o foco, exceto na ação de nova tentativa descrita.
- **SC-008**: Uma consulta que não obtém resposta encerra-se com mensagem ao usuário em até 15 segundos.

## Assumptions

- Esta feature corresponde ao épico EP-FE-02 do backlog (histórias FE-003, FE-004 e FE-005, features FE-F02) e depende da feature 001, que já entrega a configuração única da URL base e a mensagem de configuração inválida.
- O contrato real da API é o descrito em `agenda-livre-backend` (DOC-05 e `specs/006-public-consultation/contracts/public-api.md`): somente `GET`, sem autenticação, JSON, envelope paginado `{count, next, previous, results}` e erros como `{detail}` ou `{detail, errors}` com `errors` apenas em `400`; `404` uniforme, `405` e `429` podem ocorrer.
- A API pública não exige credenciais; por isso o cliente não envia cookies nem cabeçalhos de autenticação.
- Os parâmetros desconhecidos são ignorados pela API; o cliente envia apenas filtros documentados pelo consumidor.
- O tempo limite padrão proposto é de 15 segundos e pode ser ajustado na configuração pública; o valor é uma suposição a revisar na etapa de planejamento.
- A estratégia exata para identificar contextos independentes (por exemplo, um nome de contexto por chamada) e o formato interno dos erros são decisões de planejamento, não desta especificação.
- A política de nova tentativa é sempre manual (ação "Tentar novamente"); não há repetição automática de requisições, para respeitar eventual limite de requisições da API.
- Não há cache de respostas nesta feature; dados antigos não são exibidos como se fossem a resposta atual (DOC-13, seção 6.4). A restauração de listagem ao voltar dos detalhes (FE-025) é outra feature.
- A integração real contra a API do backend em execução é verificada quando o ambiente estiver disponível; os testes automatizados desta feature usam respostas simuladas e isso não substitui o teste integrado (DOC-16, seção 15).
- A apresentação de erro e a mensagem de status seguem as diretrizes do DOC-13 (seções 6.4 e 12) e do DOC-15; os estados de carregamento e "sem resultados" completos (FE-010) pertencem ao épico de componentes compartilhados, e aqui só se define o necessário para a nova tentativa.
- O público desta feature é composto por pessoas desenvolvedoras (que usam o módulo) e pessoas visitantes (que veem as mensagens e a ação de nova tentativa).
