# Feature Specification: Detalhes das atividades

**Feature Branch**: `007-activity-details`

**Created**: 2026-10-12

**Status**: Draft

**Input**: User description: "Épico EP-FE-07 do docs/16-backlog-do-frontend.md (Feature FE-F10 — Consulta de detalhes), que reúne as histórias FE-027 (consultar detalhes de uma atividade), FE-028 (abrir inscrição ou informação externa) e FE-029 (consultar atividade indisponível ou inexistente). Base: todos os documentos em docs/ do frontend (em especial DOC-09, DOC-12, DOC-13 e DOC-15) e docs/ e specs/ do backend (agenda-livre-backend), em especial o contrato do detalhe da API pública de consulta."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consultar os detalhes de uma atividade (Priority: P1)

Uma pessoa visitante abre uma atividade, a partir de um card da Início ou da Explorar ou por um link direto recebido de outra pessoa, e vê as informações para decidir se ela é relevante: categoria, título, unidade, quando acontece (datas e horários), público-alvo, descrição completa, local e observações. Campos que a API não informa simplesmente não aparecem, sem rótulos vazios nem espaços sobrando. A página carrega sozinha a partir do endereço, mostra esqueleto enquanto carrega e tem um link "Voltar para atividades".

**Why this priority**: É o destino de todos os cards já entregues (features 005 e 006); sem ela o fluxo "encontrar → decidir" fica incompleto. Entrega valor sozinha.

**Independent Test**: Abrir `atividade.html?id=<uuid>` de uma atividade publicada com a API em execução (uma pontual e uma recorrente, uma com todos os campos e outra com poucos) e conferir o conteúdo, a ausência de campos vazios e o carregamento.

**Acceptance Scenarios**:

1. **Given** um identificador válido de atividade publicada, **When** a página é aberta diretamente pelo endereço, **Then** são exibidos categoria, título, unidade (nome, bairro e endereço, quando houver), descrição e as informações de data e horário disponíveis, sob um único título principal.
2. **Given** a API informando público-alvo e observações sobre o público, **When** a página é exibida, **Then** o público-alvo (lista de nomes) e as observações aparecem identificados; **And** quando não informados, a seção inteira (rótulo incluído) não aparece.
3. **Given** uma atividade pontual, **When** exibida, **Then** mostra a data e o horário de início e fim, sem dias da semana.
4. **Given** uma atividade recorrente, **When** exibida, **Then** mostra o período (início e fim), os dias da semana por extenso, o horário e as próximas datas (até 5) na ordem devolvida pela API.
5. **Given** uma atividade com mais de uma programação, **When** exibida, **Then** cada programação é apresentada separadamente, na ordem devolvida pela API.
6. **Given** uma atividade sem ocorrência futura, **When** exibida, **Then** a página informa "Sem data prevista" em vez de lista vazia ou texto técnico, e continua íntegra.
7. **Given** campos opcionais ausentes (resumo, observações, público-alvo, bairro, endereço, link externo), **When** a página é exibida, **Then** nenhum texto "undefined"/"null", rótulo sem valor ou espaço vazio aparece.
8. **Given** a consulta em andamento, **When** a página é aberta, **Then** esqueletos ocupam o lugar do conteúdo, ocultos das tecnologias assistivas, e o carregamento é comunicado de forma breve por região de status.
9. **Given** a atividade sem imagem (caso normal nesta versão), **When** exibida, **Then** o espaço da imagem usa o visual de imagem ausente, decorativo e sem anúncio para leitores de tela.
10. **Given** a página carregada, **When** a pessoa aciona "Voltar para atividades", **Then** vai à Explorar; **And** se veio de uma listagem, volta aos mesmos termo, filtros, página e rolagem (conforme a feature 006), e se abriu o endereço diretamente, vai à Explorar sem critérios.
11. **Given** o título da atividade, **When** a página é exibida, **Then** o título do documento do navegador passa a identificar a atividade (por exemplo, "Oficina de dança — Agenda Livre").

---

### User Story 2 - Entender quando a atividade não está disponível ou não existe (Priority: P1)

Se o endereço aponta para uma atividade que não existe, que o identificador é inválido ou que não está mais pública (rascunho, cancelada ou encerrada), a pessoa vê uma página clara de "atividade não encontrada ou não disponível", com caminhos para "Explorar outras atividades" e para o Início. Se a falha for de comunicação com a API (e não "não encontrada"), a pessoa vê uma mensagem de erro diferente, com "Tentar novamente". Os dois casos nunca se confundem.

**Why this priority**: Links compartilhados envelhecem; atividades são canceladas e encerradas. Sem esse tratamento a página parece quebrada. É requisito P0 do backlog (FE-029).

**Independent Test**: Abrir a página com um UUID inexistente, com identificador malformado, sem `id` e com a API fora do ar; conferir a mensagem de "não encontrada" nos três primeiros e a de erro com "Tentar novamente" no último.

**Acceptance Scenarios**:

1. **Given** um identificador inexistente ou de atividade não pública, **When** a página é aberta, **Then** aparece uma mensagem de "atividade não encontrada ou não disponível", com os links "Explorar outras atividades" e "Voltar ao Início".
2. **Given** a resposta uniforme de "não encontrada" da API para os casos inexistente, malformado, rascunho, cancelada e encerrada, **When** a página é exibida, **Then** a interface usa um único estado e texto para todos eles, sem afirmar qual deles ocorreu e sem expor dados privados.
3. **Given** um endereço sem `id` ou com `id` claramente inválido (vazio, não UUID), **When** a página é aberta, **Then** o mesmo estado de "não encontrada" é exibido sem chamar a API.
4. **Given** falha de rede, tempo esgotado, erro de servidor, limite de requisições ou resposta inesperada, **When** a consulta termina, **Then** os esqueletos dão lugar a uma mensagem amigável, sem detalhes técnicos, com o botão "Tentar novamente", distinta do estado de "não encontrada".
5. **Given** a mensagem de erro, **When** a pessoa aciona "Tentar novamente", **Then** a consulta é refeita com esqueletos; nova falha restaura a mensagem; cliques repetidos não geram consultas redundantes.
6. **Given** que o endereço da API não está configurado ou é inválido, **When** a página é exibida, **Then** o aviso de configuração existente aparece e a página não fica em esqueleto indefinidamente.
7. **Given** o estado de "não encontrada" ou de erro, **When** exibido, **Then** o título do documento e o título principal refletem o estado, a mudança é comunicada por região de status sem mover o foco para fora de um elemento visível e operável, e os links de saída são operáveis por teclado.
8. **Given** JavaScript indisponível, **When** a página é aberta, **Then** uma mensagem estática informa que os detalhes dependem de JavaScript, mantendo a navegação principal funcional.

---

### User Story 3 - Abrir a inscrição ou informação externa (Priority: P2)

Quando a atividade tem um link externo de inscrição ou de informações, a pessoa vê um botão em destaque que a leva ao site responsável, em nova aba, com indicação clara (visual e para leitores de tela) de que sai do Agenda Livre. Sem link, o botão não existe. O Agenda Livre não coleta nem processa inscrições.

**Why this priority**: Fecha o caminho "decidir → agir", mas a página já é útil sem ele (a descrição e a data permitem decidir); por isso vem depois do núcleo.

**Independent Test**: Abrir uma atividade com link externo e outra sem; conferir botão, nova aba, indicação acessível, atributos de segurança e ausência do botão na segunda; testar com valores de URL inseguros.

**Acceptance Scenarios**:

1. **Given** uma atividade com URL externa `http`/`https` válida, **When** a página é exibida, **Then** aparece o botão/link com texto que informa que se trata de inscrição ou informações e que abre site externo em nova aba.
2. **Given** o link, **When** acionado, **Then** abre em nova aba sem dar à página aberta acesso à página do Agenda Livre, e a página do Agenda Livre permanece como estava.
3. **Given** uma atividade sem URL externa (nula, vazia), **When** a página é exibida, **Then** o botão não aparece, sem espaço vazio.
4. **Given** uma URL com esquema perigoso ou inválido (por exemplo `javascript:`, `data:`, relativa, malformada), **When** a página é exibida, **Then** o botão não aparece e nada é executado; a validação é feita no frontend mesmo que a API já a faça.
5. **Given** leitor de tela, **When** o link recebe foco, **Then** o nome acessível informa que abre em nova aba e é externo ao Agenda Livre; **And** a indicação não depende apenas de ícone ou cor.
6. **Given** o texto do botão, **When** exibido, **Then** não afirma que a inscrição é feita no Agenda Livre nem promete confirmação.

---

### Edge Cases

- Título muito longo ou sem espaços, descrição longa com várias linhas: quebra dentro do layout sem rolagem horizontal; quebras de linha da descrição são preservadas.
- Descrição contendo marcas de HTML ou scripts: aparece como texto literal, nunca interpretada.
- Descrição ausente ou vazia: a seção "Sobre a atividade" não aparece.
- Programação pontual com início e fim no mesmo dia e horário final ausente: mostra apenas o horário de início.
- Atividade recorrente cuja lista `next_occurrences` está vazia: mostra o período e "Sem data prevista", sem lista vazia.
- Atividade sem categoria ou unidade na resposta: o bloco correspondente é omitido sem quebrar a página.
- Atividade que deixou de ser pública entre a listagem e a abertura: tratada como "não encontrada".
- Resposta atrasada de uma consulta anterior (saída da página, nova tentativa): nunca sobrescreve a mais recente.
- Identificador com espaços, maiúsculas ou parâmetros extras no endereço: normalizado ou ignorado; parâmetros desconhecidos não geram erro.
- Voltar pelo histórico do navegador a partir dos detalhes: a Explorar restaura o estado conforme a feature 006.
- Abrir os detalhes sem histórico (nova aba ou link externo): "Voltar para atividades" leva à Explorar sem critérios.
- Texto ampliado a 200%, 320 px de largura e movimento reduzido: sem perda de conteúdo ou função, esqueletos sem animação.
- A API devolve imagem no futuro: fora do escopo; hoje todo o espaço usa o visual de imagem ausente.

## Requirements *(mandatory)*

### Functional Requirements

**Estrutura e carregamento (FE-027)**

- **FR-001**: A página de detalhes MUST funcionar quando aberta diretamente por `atividade.html?id=<identificador>`, o mesmo padrão de endereço usado pelos cards, sem depender de estado de navegação anterior.
- **FR-002**: A página MUST ter um único título principal (o título da atividade), títulos de seção sem saltos de nível e a estrutura semântica compartilhada (link de pular conteúdo, cabeçalho, navegação, conteúdo principal, rodapé).
- **FR-003**: Durante a consulta, a página MUST exibir esqueletos no lugar do conteúdo, ocultos das tecnologias assistivas, e comunicar o carregamento por região de status breve e acessível; esqueletos MUST NOT ser apresentados como conteúdo real.
- **FR-004**: Após o carregamento, o título do documento MUST identificar a atividade; nos estados de "não encontrada" e de erro MUST refletir o estado.
- **FR-005**: A página MUST oferecer "Voltar para atividades" que leve à Explorar, restaurando o estado da listagem quando houver (feature 006) e levando à Explorar sem critérios quando não houver.

**Conteúdo exibido (FE-027)**

- **FR-006**: A página MUST exibir, quando fornecidos pela API: categoria, título, unidade (nome, bairro e endereço), resumo, descrição, observações sobre o público, público-alvo (lista de nomes), programações e próximas ocorrências.
- **FR-007**: Campos opcionais ausentes ou vazios MUST NOT gerar rótulos sem valor, textos "undefined"/"null" nem espaços vazios; seções sem conteúdo MUST ser omitidas inteiras.
- **FR-008**: Programações pontuais MUST mostrar data e horário; recorrentes MUST mostrar período, dias da semana por extenso, horário e as próximas datas informadas pela API; cada programação MUST ser apresentada separadamente, na ordem devolvida pela API.
- **FR-009**: Datas e horários MUST ser formatados em português do Brasil, no mesmo padrão do card compartilhado, usando elementos temporais semânticos quando aplicável; a atividade sem ocorrência futura MUST exibir "Sem data prevista".
- **FR-010**: O frontend MUST NOT calcular, recalcular ou reordenar ocorrências, nem inferir situação da atividade; usa o que a API devolve.
- **FR-011**: O espaço da imagem MUST usar o visual de imagem ausente da identidade visual, decorativo, sem texto alternativo repetindo o título e sem anúncio por leitores de tela, preparado para receber uma imagem real quando a API a fornecer.
- **FR-012**: Todo texto vindo da API MUST ser inserido de forma segura (como texto, nunca como HTML); quebras de linha da descrição MUST ser preservadas; a página MUST NOT conter credenciais nem segredos.

**Link externo (FE-028)**

- **FR-013**: O botão/link externo MUST aparecer somente quando a API informar uma URL com esquema `http` ou `https` válido; qualquer outro valor (nulo, vazio, relativo, malformado, `javascript:`, `data:` etc.) MUST resultar em ausência do botão, sem erro.
- **FR-014**: O link MUST abrir em nova aba, de modo seguro (sem dar à página aberta acesso à do Agenda Livre nem repassar a origem), e a página do Agenda Livre MUST permanecer utilizável.
- **FR-015**: O link MUST informar, em texto e no nome acessível, que leva a um site externo e abre em nova aba, sem depender apenas de ícone ou cor; o texto MUST NOT sugerir que a inscrição ocorre no Agenda Livre.

**Indisponível, inexistente e erro (FE-029)**

- **FR-016**: Resposta de "não encontrada" da API (`404`), identificador ausente ou claramente inválido MUST exibir um único estado de "atividade não encontrada ou não disponível", com os links "Explorar outras atividades" e "Voltar ao Início"; o frontend MUST NOT afirmar se a atividade nunca existiu, foi cancelada ou encerrou, nem expor dados privados.
- **FR-017**: Falha de rede, tempo esgotado, erro de servidor, limite de requisições ou resposta inesperada MUST exibir mensagem amigável, sem detalhes técnicos, e o botão "Tentar novamente", distinta do estado de "não encontrada"; acionar o botão MUST refazer a consulta, com esqueletos, sem gerar consultas redundantes por cliques repetidos.
- **FR-018**: Uma resposta atrasada MUST NOT sobrescrever uma mais recente, e a saída da página MUST cancelar a consulta em andamento sem erro visível.
- **FR-019**: Se o endereço da API não estiver configurado, o aviso de configuração existente MUST ser exibido e a página MUST NOT ficar em esqueleto indefinidamente.
- **FR-020**: Mudanças de estado (carregando, concluído, não encontrada, erro) MUST ser comunicadas por região de status e MUST NOT deslocar o foco do teclado para fora de elemento visível e operável.
- **FR-021**: Sem JavaScript, a página MUST exibir mensagem estática informando que os detalhes dependem de JavaScript, mantendo a navegação principal funcional.

**Transversais**

- **FR-022**: A página MUST cumprir os requisitos de acessibilidade do DOC-15 (WCAG 2.2 AA): teclado sem armadilhas, foco visível e não obscurecido, contraste, reflow até 320 px, ampliação de texto a 200%, movimento reduzido, estados não comunicados só por cor, erros em texto.
- **FR-023**: A página MUST seguir a identidade visual e usar os componentes compartilhados existentes (esqueleto, mensagens de estado e erro, navegação, aviso de configuração), sem criar variantes paralelas.

### Key Entities *(include if feature involves data)*

- **Atividade (detalhe)**: identificador, título, resumo, descrição, observações sobre o público, unidade (nome, bairro, endereço), categoria (nome), públicos-alvo (nomes), link externo opcional, programações e próximas ocorrências. Não traz imagem nem dados administrativos nesta versão.
- **Programação**: período de uma atividade, pontual ou recorrente, com data de início e fim, horário de início e fim e, quando recorrente, dias da semana.
- **Ocorrência**: data com horário de início e fim; a API informa até as 5 próximas.
- **Link externo**: endereço opcional, validado como `http`/`https`, que leva a site responsável pela inscrição ou informação.
- **Estado da página**: carregando, exibindo, não encontrada/indisponível ou erro de comunicação (mutuamente exclusivos).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Uma pessoa visitante, a partir de um card, identifica em até 30 segundos quando e onde a atividade acontece e quem é o público, em pelo menos 90% das tentativas de teste de usabilidade.
- **SC-002**: Em 100% dos casos verificados, abrir o endereço direto de uma atividade publicada exibe o conteúdo correto sem exigir navegação prévia.
- **SC-003**: Em 100% dos casos de teste com campos opcionais ausentes, nenhum rótulo sem valor, espaço vazio ou texto "undefined"/"null" é exibido.
- **SC-004**: Em até 2 segundos após a resposta da API chegar, o conteúdo da página está completo na tela.
- **SC-005**: Em 100% dos casos com URL externa inválida ou de esquema não permitido, o botão não aparece e nenhum código é executado; em 100% dos casos com URL válida, o link abre em nova aba com indicação visual e acessível.
- **SC-006**: Nos testes de "não encontrada" e de erro de comunicação, 100% das pessoas avaliadas distinguem os dois estados e sabem qual ação tomar (explorar outras atividades ou tentar novamente).
- **SC-007**: Nenhuma combinação de endereço (sem `id`, `id` inválido, inexistente, parâmetros extras) deixa a página em branco, em esqueleto indefinido ou com erro técnico visível.
- **SC-008**: A página é operável apenas com teclado e os anúncios de carregamento e de mudança de estado são percebidos por leitor de tela sem mover o foco, em testes manuais com pelo menos um leitor de tela.
- **SC-009**: A página permanece utilizável, sem perda de conteúdo ou função e sem rolagem horizontal, em 320 px de largura e com texto a 200%, e passa nas verificações automáticas de acessibilidade sem violações graves.

## Assumptions

- A API pública segue o contrato em `agenda-livre-backend/specs/006-public-consultation/contracts/public-api.md`: `GET /activities/{id}/` devolve os campos descritos nas Entidades e responde `404` uniforme para inexistente, identificador malformado e atividade que não esteja publicada.
- Como a API não distingue "cancelada/encerrada" de "inexistente" (por desenho, para não revelar registros), a história FE-029 é atendida com **um único estado** de "não encontrada ou não disponível"; a distinção entre os dois casos prevista no backlog ("quando a API permite") não é possível no contrato atual e só será reavaliada se o contrato mudar.
- O endereço dos detalhes é `atividade.html?id=<uuid>`, já produzido pelo card compartilhado; a página `atividade.html` existe hoje como esqueleto e será substituída pelo conteúdo real.
- O caminho de volta (FE-025/FR-035 da feature 006) usa o histórico do navegador quando a pessoa veio da Explorar e um link para a Explorar sem critérios no restante dos casos; a restauração do estado da listagem já pertence à feature 006.
- A API não fornece imagem de atividade nesta versão (pendência já registrada em `docs/PENDENCIAS-BACKEND.md`); a página usa o visual de imagem ausente, preparado para uma imagem futura.
- Local é exibido a partir dos dados da unidade (nome, endereço, bairro); não há campo de local próprio da atividade nem mapa nesta versão.
- O botão externo informa "inscrição ou informações" de forma genérica, pois a API oferece um único campo de URL sem indicar a finalidade.
- Componentes compartilhados (esqueleto, mensagens de estado e erro, cliente HTTP com cancelamento, aviso de configuração, formatação de data e horário, navegação) e a identidade visual das features 002 a 004 são reutilizados.
- Fora do escopo: edição ou inscrição dentro do Agenda Livre, compartilhamento em redes sociais, adicionar ao calendário, mapa, atividades relacionadas, imagem real e páginas institucionais (EP-FE-08).
