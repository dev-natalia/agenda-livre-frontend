# Feature Specification: Páginas institucionais e contato

**Feature Branch**: `008-institutional-pages`

**Created**: 2026-10-12

**Status**: Draft

**Input**: User description: "Épico EP-FE-08 do docs/16-backlog-do-frontend.md (Páginas institucionais e contato), que reúne as histórias FE-030 (consultar a página Sobre), FE-031 (preencher o formulário de contato), FE-032 (receber feedback acessível de validação) e FE-033 (ver a confirmação demonstrativa). Base: todos os documentos em docs/ do frontend (em especial DOC-09, DOC-11, DOC-12, DOC-13, DOC-14 e DOC-15) e docs/ e specs/ do backend (agenda-livre-backend), em especial a seção 3.3 do DOC-05 e a feature 009, que registram que Sobre e Contato não têm endpoint."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Entender o que é o Agenda Livre (Priority: P1)

Uma pessoa visitante abre a página Sobre, pela navegação ou pelo rodapé, e entende em poucos parágrafos o que é o Agenda Livre, qual é seu objetivo e por que ele existe: reunir em um só lugar informações sobre cursos, eventos e atividades dos CEUs e facilitar que a comunidade as descubra. O texto é direto, sem linguagem técnica, organizado em seções com títulos claros, e deixa explícito que o site apenas informa: não faz inscrições, que ficam com o serviço responsável por cada atividade. A página não promete parcerias, serviços ou canais que não existem.

**Why this priority**: É a única página institucional e responde à dúvida mais básica de quem chega ao site. Entrega valor sozinha e hoje a página só mostra "em breve".

**Independent Test**: Abrir `sobre.html` por URL direta, em desktop e em largura de 320 px, e ler o conteúdo com teclado e leitor de tela.

**Acceptance Scenarios**:

1. **Given** a página Sobre aberta diretamente pela URL, **When** é exibida, **Then** apresenta um único título principal "Sobre o Agenda Livre" e seções com subtítulos que explicam o que é o projeto, qual é o objetivo e como ele aproxima a comunidade da cultura e da educação.
2. **Given** a página exibida, **When** a pessoa lê o conteúdo, **Then** o texto usa linguagem direta, parágrafos curtos e não depende de termos técnicos.
3. **Given** a página exibida, **When** o conteúdo é lido, **Then** informa que o Agenda Livre não processa inscrições e que a participação é tratada pelo serviço responsável por cada atividade, e não cita parcerias, serviços, contatos ou promessas institucionais que o projeto não tenha.
4. **Given** a página exibida, **When** a pessoa procura o caminho para continuar, **Then** encontra uma chamada para explorar as atividades.
5. **Given** a página exibida, **When** observada com a navegação compartilhada, **Then** cabeçalho, menu (com "Sobre" marcado como página atual), link de pular ao conteúdo e rodapé estão presentes e funcionam como nas demais páginas.
6. **Given** uma tela de 320 px de largura ou texto ampliado a 200%, **When** a página é exibida, **Then** todo o conteúdo continua legível, sem rolagem horizontal e sem perda de informação.
7. **Given** a página exibida, **When** carregada, **Then** não depende da API para mostrar o conteúdo e não faz nenhuma requisição a ela, e o título do documento do navegador é "Sobre — Agenda Livre".

---

### User Story 2 - Preencher o formulário de contato demonstrativo (Priority: P2)

Uma pessoa visitante abre a página Contato e encontra uma instrução curta, um aviso visível de que o formulário é demonstrativo (nenhuma mensagem será enviada) e os campos Nome, E-mail, Assunto e Mensagem, cada um com rótulo visível, indicação de obrigatório e, quando houver, o limite de caracteres. Pode preencher e acionar "Enviar mensagem". O formulário nunca envia dados a nenhum serviço, nem ao backend nem a terceiros.

**Why this priority**: Cumpre o fluxo de contato previsto no escopo acadêmico, mas depende da estrutura do formulário para existir e não bloqueia o uso do site. O aviso de transparência vem junto, pois sem ele o formulário enganaria quem o usa.

**Independent Test**: Abrir `contato.html`, conferir campos, rótulos, indicações de obrigatório, limites e aviso; preencher os quatro campos e verificar, nas requisições de rede, que nada é enviado.

**Acceptance Scenarios**:

1. **Given** a página Contato aberta, **When** é exibida, **Then** apresenta um único título principal "Contato", uma instrução curta e o aviso de que o formulário é demonstrativo e nenhuma mensagem será enviada, antes do formulário.
2. **Given** o formulário, **When** exibido, **Then** contém os campos Nome, E-mail, Assunto e Mensagem, cada um com rótulo visível e associado ao campo, e um botão "Enviar mensagem".
3. **Given** o formulário, **When** exibido, **Then** a obrigatoriedade de todos os campos é indicada em texto (e não só por símbolo ou cor) e reconhecida programaticamente, e uma nota explica o significado da indicação.
4. **Given** o formulário, **When** exibido, **Then** os limites e instruções de cada campo (por exemplo, tamanho mínimo e máximo, formato de e-mail) aparecem junto ao campo, antes de qualquer erro, e o campo de e-mail usa o tipo de entrada apropriado para facilitar o preenchimento em dispositivos móveis.
5. **Given** o campo Mensagem, **When** a pessoa digita, **Then** o limite máximo é respeitado sem apagar o que ela escreveu e sem descartar texto silenciosamente.
6. **Given** qualquer interação com o formulário (digitar, sair do campo, enviar), **When** ocorre, **Then** nenhum dado é transmitido a nenhum serviço, inclusive à API do Agenda Livre.
7. **Given** o formulário preenchido, **When** a pessoa o preenche somente com o teclado e aciona "Enviar mensagem" com Enter ou Espaço, **Then** funciona sem uso do mouse, e a ordem de foco segue a ordem visual dos campos.
8. **Given** uma tela de 320 px de largura ou texto ampliado a 200%, **When** o formulário é exibido, **Then** todos os campos, instruções e o botão continuam utilizáveis, sem perda de informação.

---

### User Story 3 - Corrigir erros de preenchimento com clareza (Priority: P2)

Quando a pessoa tenta enviar o formulário com dados inválidos (campos vazios, e-mail mal formado, texto curto ou longo demais), a página mostra todos os problemas de uma só vez, cada um em texto específico junto ao campo correspondente, diz como corrigir e leva o foco ao primeiro campo com problema. O que a pessoa já digitou de correto é mantido. Ao corrigir um campo, o erro dele deixa de ser exibido; quando todos estiverem válidos, o envio pode ser refeito.

**Why this priority**: Garante que o formulário seja usável por quem navega por teclado e leitor de tela e cumpre os critérios de acessibilidade para formulários (instruções, identificação e sugestão de correção de erros).

**Independent Test**: Enviar o formulário vazio, depois com vários campos inválidos ao mesmo tempo, e conferir mensagens, associação aos campos, foco, anúncio e preservação dos valores válidos, com teclado e leitor de tela.

**Acceptance Scenarios**:

1. **Given** o formulário vazio, **When** a pessoa aciona "Enviar mensagem", **Then** são exibidos erros para os quatro campos ao mesmo tempo, cada um dizendo qual é o problema e o que fazer (por exemplo, "Informe seu nome.").
2. **Given** vários campos inválidos de naturezas diferentes (e-mail sem formato válido, assunto curto demais, mensagem acima do limite), **When** a pessoa envia, **Then** cada campo mostra a mensagem específica do seu problema, e não uma mensagem genérica.
3. **Given** um envio inválido, **When** os erros são exibidos, **Then** cada mensagem fica associada ao seu campo de modo reconhecível por tecnologia assistiva, e cada campo inválido é identificado como tal programaticamente e por indício visual que não dependa apenas de cor.
4. **Given** um envio inválido, **When** os erros são exibidos, **Then** o foco vai para o primeiro campo inválido na ordem da página, e a pessoa pode percorrer os demais campos inválidos com a navegação normal de teclado.
5. **Given** um envio inválido, **When** os erros são exibidos, **Then** o conjunto é comunicado às tecnologias assistivas de forma objetiva, uma única vez (por exemplo, quantos campos precisam de correção), sem anúncios duplicados.
6. **Given** campos válidos já preenchidos junto a campos inválidos, **When** o envio é recusado, **Then** os valores válidos permanecem como estavam, e os inválidos também não são apagados, para que a pessoa possa ajustá-los.
7. **Given** campos com erro exibido, **When** a pessoa corrige o valor, **Then** o erro desse campo é removido assim que o valor passa a ser válido ou no próximo envio, sem aparecer erro novo em campos ainda não tocados antes da primeira tentativa de envio.
8. **Given** valores com apenas espaços, **When** a pessoa envia, **Then** são tratados como vazios, e espaços nas extremidades de valores válidos não geram erro.
9. **Given** um e-mail digitado de forma inválida, **When** a pessoa envia, **Then** a validação própria da página apresenta a mensagem em português, e não a mensagem padrão do navegador.

---

### User Story 4 - Ver a confirmação demonstrativa e voltar ao formulário (Priority: P2)

Quando todos os campos são válidos e a pessoa aciona "Enviar mensagem", o formulário é substituído por um painel de confirmação que diz de forma explícita que este é um formulário demonstrativo e que nenhuma mensagem foi enviada nem recebida por ninguém. A mudança é comunicada às tecnologias assistivas e o foco vai para o painel. Um botão "Voltar ao formulário" devolve a pessoa ao formulário com os valores que ela havia digitado, e há uma forma de limpar os campos.

**Why this priority**: Fecha o fluxo demonstrativo e, principalmente, garante a transparência: o resultado nunca deve sugerir que houve envio real.

**Independent Test**: Preencher o formulário com dados válidos, enviar, conferir o texto do painel, o foco e o anúncio; acionar "Voltar ao formulário" e conferir valores e foco; limpar os campos e repetir.

**Acceptance Scenarios**:

1. **Given** todos os campos válidos, **When** a pessoa envia, **Then** o formulário deixa de ser exibido e dá lugar a um painel de confirmação com título próprio, sem recarregar a página nem mudar a URL.
2. **Given** o painel exibido, **When** lido, **Then** afirma explicitamente que o formulário é demonstrativo e que nenhuma mensagem foi enviada, e nunca afirma ou sugere que a mensagem foi recebida, encaminhada, entregue ou que haverá resposta.
3. **Given** o painel exibido, **When** a troca ocorre, **Then** a mudança é anunciada às tecnologias assistivas e o foco é movido para o painel de forma previsível, sem que a pessoa precise procurar o que mudou.
4. **Given** o painel exibido, **When** a pessoa aciona "Voltar ao formulário", **Then** o formulário reaparece com os valores que ela havia digitado, sem erros pendentes, e o foco vai para um ponto previsível do formulário (por exemplo, o primeiro campo).
5. **Given** o formulário de volta com valores preservados, **When** a pessoa aciona a ação de limpar, **Then** todos os campos ficam vazios e os erros são removidos; **And** a pessoa pode enviar novamente depois de preencher.
6. **Given** a pessoa ter enviado e voltado ao formulário, **When** ela atualiza ou reabre a página, **Then** o formulário aparece vazio, pois nada fica guardado entre visitas.
7. **Given** qualquer parte desse fluxo, **When** observada nas requisições de rede, **Then** não há nenhuma requisição com dados do formulário.
8. **Given** a preferência por movimento reduzido ativa, **When** o painel aparece, **Then** não há animação de entrada que dependa de movimento.

---

### Edge Cases

- Mensagem no limite exato (mínimo e máximo) é aceita; um caractere abaixo do mínimo ou acima do máximo é recusado com mensagem específica.
- E-mail com espaços nas extremidades é aceito depois de aparado; e-mail sem arroba, sem domínio ou com espaços internos é recusado.
- Pessoa cola texto longo no campo Mensagem: a página não trunca silenciosamente; informa que o limite foi excedido.
- Pessoa aciona "Enviar mensagem" várias vezes seguidas com dados válidos: continua exibindo um único painel, sem anúncios repetidos.
- Pessoa aciona Enter dentro de um campo de uma linha: tenta enviar o formulário, com a mesma validação; dentro de Mensagem, Enter quebra a linha.
- Conteúdo digitado com caracteres especiais ou marcação (por exemplo, `<b>`): é tratado como texto e nunca interpretado como código nem exibido no painel de forma que o execute.
- JavaScript indisponível ou falho: a página Sobre continua legível, e a página Contato continua mostrando o título, o aviso de que é demonstrativa e os campos, sem afirmar que algo será enviado; o envio simplesmente não ocorre.
- Configuração da API ausente ou inválida: Sobre e Contato não dependem da API e funcionam normalmente (a nota de configuração das outras páginas não impede o uso destas).
- Navegação por histórico (voltar/avançar): o estado do formulário não é restaurado entre visitas; a navegação do navegador não deve exibir o painel de confirmação como se fosse uma página nova.
- Leitor de tela com erros em vários campos: a pessoa consegue percorrer e corrigir cada um sem perder o contexto, e o botão de enviar continua acessível.
- Zoom a 200% e largura de 320 px com erros exibidos: mensagens quebram linha e ficam visíveis, sem sobrepor campos.
- Nenhum endpoint de Sobre ou Contato existe no backend: qualquer tentativa de consulta responderia "não encontrado"; por isso a página não faz nenhuma chamada.

## Requirements *(mandatory)*

### Functional Requirements

**Página Sobre (FE-030)**

- **FR-001**: A página Sobre MUST apresentar o objetivo do Agenda Livre em linguagem direta, com um único título principal e seções com subtítulos em hierarquia coerente (o que é o projeto, qual é o objetivo, acesso à cultura e à educação), seguindo a estrutura do wireframe.
- **FR-002**: O conteúdo MUST se limitar ao que o projeto realmente é: um site público que reúne informações sobre atividades dos CEUs, sem processar inscrições; MUST NOT citar parcerias, serviços, canais de atendimento ou compromissos institucionais inexistentes.
- **FR-003**: A página MUST oferecer uma chamada para explorar as atividades.
- **FR-004**: A página MUST usar a navegação, o link de pular ao conteúdo e o rodapé compartilhados, com "Sobre" identificada como página atual de forma programática.
- **FR-005**: O conteúdo MUST ficar legível em largura equivalente a 320 pixels CSS e com texto ampliado a 200%, sem rolagem horizontal nem perda de informação.
- **FR-006**: A página MUST ser estática: não consulta a API, não depende de configuração e funciona mesmo com a API indisponível.

**Formulário de contato (FE-031)**

- **FR-007**: A página Contato MUST apresentar título, instrução breve e, antes do formulário, um aviso visível e permanente de que o formulário é demonstrativo e nenhuma mensagem será enviada.
- **FR-008**: O formulário MUST conter os campos Nome, E-mail, Assunto e Mensagem, cada um com rótulo visível associado ao campo e botão de ação "Enviar mensagem".
- **FR-009**: Todos os campos MUST ser obrigatórios, e isso MUST ser indicado em texto e reconhecido programaticamente; o significado da indicação MUST ser explicado no início do formulário.
- **FR-010**: O formulário MUST apresentar, junto a cada campo, as instruções e os limites de tamanho aplicáveis, visíveis antes de qualquer erro e associados ao campo programaticamente.
- **FR-011**: Os campos MUST usar o tipo de entrada e a dica de preenchimento adequados à sua finalidade (nome, e-mail), para facilitar o preenchimento assistido.
- **FR-012**: O formulário MUST NOT enviar, gravar ou transmitir dados a nenhum serviço (nem à API do Agenda Livre nem a terceiros), nem guardar os valores digitados entre visitas ou carregamentos da página.
- **FR-013**: O formulário MUST ser operável apenas com teclado, com ordem de foco igual à ordem visual e indicador de foco visível.

**Validação acessível (FE-032)**

- **FR-014**: O formulário MUST validar nome, e-mail, assunto e mensagem em conjunto: obrigatoriedade, formato do e-mail e limites mínimo e máximo de tamanho, tratando valores só com espaços como vazios e desconsiderando espaços nas extremidades.
- **FR-015**: Ao tentar enviar com dados inválidos, a página MUST exibir, na mesma tentativa, a mensagem de todos os campos inválidos, cada uma em texto, específica ao problema (campo vazio, formato incorreto, curto demais, longo demais) e indicando como corrigir.
- **FR-016**: Cada mensagem MUST ficar associada ao seu campo de modo reconhecível por tecnologias assistivas, e cada campo inválido MUST ser identificado programaticamente como inválido e por indício visual que não dependa apenas de cor.
- **FR-017**: Após um envio inválido, o foco MUST ir para o primeiro campo inválido, sem impedir a navegação normal pelos demais.
- **FR-018**: Um envio inválido MUST ser comunicado às tecnologias assistivas de modo objetivo e sem repetição, resumindo quantos campos precisam de correção.
- **FR-019**: Valores já digitados MUST ser preservados após um envio recusado; o erro de um campo MUST sair quando seu valor passar a ser válido.
- **FR-020**: A validação MUST ser feita pela própria página, com mensagens em português, sem exibir os balões de validação padrão do navegador, mantendo os atributos nativos de obrigatoriedade e tipo úteis a tecnologias assistivas.
- **FR-021**: Antes da primeira tentativa de envio, a página MUST NOT exibir erros em campos que a pessoa ainda não preencheu.

**Confirmação demonstrativa (FE-033)**

- **FR-022**: Quando todos os campos forem válidos, o formulário MUST ser substituído, na mesma página e sem mudar a URL, por um painel de confirmação com título próprio.
- **FR-023**: O painel MUST afirmar explicitamente que o formulário é demonstrativo e que nenhuma mensagem foi enviada, e MUST NOT afirmar ou sugerir que a mensagem foi recebida, encaminhada, entregue, registrada ou que haverá resposta.
- **FR-024**: A exibição do painel MUST ser comunicada às tecnologias assistivas e o foco MUST ser movido de modo previsível para o painel.
- **FR-025**: O painel MUST oferecer o botão "Voltar ao formulário", que restaura o formulário com os valores digitados, sem erros pendentes, e leva o foco a um ponto previsível do formulário.
- **FR-026**: O formulário MUST oferecer uma ação para limpar os campos, que os esvazia e remove os erros.
- **FR-027**: Valores digitados MUST NOT ser reinseridos no painel de confirmação como marcação executável; qualquer texto digitado é tratado sempre como texto simples.
- **FR-028**: A troca para o painel e o retorno MUST NOT depender de animação; com `prefers-reduced-motion` ativa, nenhum movimento não essencial é aplicado.

**Transversais**

- **FR-029**: Sobre e Contato MUST usar apenas elementos, tokens e componentes da identidade visual já existentes (cores, tipografia, espaçamentos, botões, foco), preservando consistência com as demais páginas.
- **FR-030**: Os estados de foco, erro, desabilitado e selecionado dos controles MUST ser identificáveis sem depender somente de cor e atender aos contrastes aplicáveis da WCAG 2.2 AA.
- **FR-031**: As duas páginas MUST ter título de documento próprio ("Sobre — Agenda Livre" e "Contato — Agenda Livre"), idioma português do Brasil e hierarquia de títulos coerente.
- **FR-032**: A nota de configuração da API exibida nas outras páginas MUST NOT bloquear nem poluir Sobre e Contato, que não dependem da API.
- **FR-033**: O comportamento principal das duas páginas MUST ser coberto por testes automatizados (unitários para as regras de validação e o modelo do formulário; de navegador para os fluxos de Sobre e de Contato, incluindo verificações automáticas de acessibilidade), sem usar dados pessoais reais.

### Key Entities *(include if feature involves data)*

- **Conteúdo da página Sobre**: textos institucionais fixos organizados em seções (título, texto), mantidos no próprio site; não vêm da API e não são editados por administradores.
- **Rascunho de contato**: os quatro valores que a pessoa digita (nome, e-mail, assunto, mensagem). Existe apenas na memória da página enquanto ela está aberta, nunca é enviado nem guardado entre visitas.
- **Resultado da validação**: para cada campo, o veredito (válido ou inválido) e a mensagem de correção quando inválido; determina a exibição dos erros, o campo que recebe o foco e o resumo anunciado.
- **Estado do formulário**: preenchendo (com ou sem erros exibidos) ou confirmado (painel demonstrativo exibido); alterna entre eles dentro da mesma página.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em teste com pessoas que nunca viram o site, pelo menos 90% explicam corretamente, após ler a página Sobre, o que é o Agenda Livre e que ele não faz inscrições.
- **SC-002**: 100% das tentativas de envio inválido mostram, de uma só vez, o erro específico de cada campo inválido, sem que seja preciso reenviar para descobrir o próximo problema.
- **SC-003**: Em 100% dos envios inválidos, o foco chega ao primeiro campo inválido e cada erro é reconhecível pelo leitor de tela junto do seu campo; nenhum erro depende só de cor.
- **SC-004**: Em 100% dos envios válidos, o painel de confirmação afirma que o formulário é demonstrativo e que nada foi enviado, e nenhum texto das duas páginas sugere envio, recebimento ou resposta.
- **SC-005**: Em 100% dos fluxos exercitados na página Contato (incluindo erro, sucesso, retorno e limpeza), nenhuma requisição de rede contém dados do formulário.
- **SC-006**: Uma pessoa consegue ler a página Sobre, ou preencher, corrigir um erro e concluir o formulário, usando apenas o teclado, sem armadilhas de foco.
- **SC-007**: As duas páginas permanecem utilizáveis e legíveis em largura equivalente a 320 pixels CSS e com texto ampliado a 200%, sem rolagem horizontal e sem perda de conteúdo ou funcionalidade.
- **SC-008**: A verificação automática de acessibilidade não aponta violações não justificadas nas duas páginas, nos estados do formulário (inicial, com erros, confirmado).
- **SC-009**: A página Sobre e o formulário continuam utilizáveis com a API fora do ar ou sem configuração.
- **SC-010**: Pelo menos 90% das pessoas testadas concluem o envio demonstrativo na primeira tentativa em até 2 minutos, sem ajuda.

## Assumptions

- A feature cobre as histórias FE-030 a FE-033 do épico EP-FE-08; a acessibilidade entra nos critérios de aceite, e a auditoria transversal e a documentação dos testes pertencem aos épicos EP-FE-09 e EP-FE-10.
- As páginas `sobre.html` e `contato.html`, com cabeçalho, menu, rodapé e link de pular ao conteúdo, já existem desde a feature 003 como esqueleto com texto provisório; esta feature preenche seu conteúdo e comportamento.
- Sobre e Contato existem somente no frontend e não têm endpoint no backend (DOC-05, seção 3.3, e feature 009 do backend). O frontend não consulta a API para estas páginas, e o backend responderia "não encontrado" a qualquer tentativa.
- O texto da página Sobre será redigido a partir dos fatos documentados do projeto (site público que reúne informações sobre atividades dos CEUs, facilita a descoberta de cursos, eventos e atividades, aproxima a comunidade da cultura e da educação, não processa inscrições, contato demonstrativo). O DOC-11 e o DOC-12 dizem que o texto definitivo é validado à parte; este será um texto base, de fácil substituição, que não inventa parcerias, serviços nem informações institucionais.
- Limites numéricos (os docs delegam à implementação e exigem consistência com os testes): Nome de 2 a 100 caracteres; E-mail de até 254 caracteres com formato válido; Assunto de 3 a 100 caracteres; Mensagem de 10 a 1000 caracteres. Contagens consideram o texto já aparado. Os valores ficam num único lugar, usado tanto pela validação quanto pelas instruções exibidas e pelos testes.
- O retorno ao formulário preserva os valores, conforme a preferência do DOC-13; a ação de limpar é oferecida no formulário. Nada é guardado entre carregamentos da página (sem armazenamento local), por privacidade, já que os dados são pessoais.
- Os campos usam as instruções de preenchimento assistido adequadas, mas sem coleta nem armazenamento pelo site.
- O foco após o envio válido vai para o título do painel de confirmação e, após "Voltar ao formulário", para o primeiro campo; após envio inválido, para o primeiro campo inválido. O resumo do envio inválido é anunciado por região de status, sem tirar o foco do campo.
- O estado "enviando" mencionado no DOC-11 não se aplica: como não há envio real, a confirmação é imediata, sem indicador de progresso que sugira transmissão.
- A feature reutiliza os módulos compartilhados existentes (navegação, rodapé, tokens visuais, região de estado) e a estrutura de módulos por página já adotada nas features anteriores; não exige mudanças no backend nem novas pendências para ele.
- Os testes automatizados seguem a estratégia do DOC-14 e usam dados sintéticos; a conformidade integral de acessibilidade ainda depende de verificação manual (teclado e leitor de tela) no épico transversal.
