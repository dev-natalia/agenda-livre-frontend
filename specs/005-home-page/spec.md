# Feature Specification: Página inicial

**Feature Branch**: `005-home-page`

**Created**: 2026-10-11

**Status**: Draft

**Input**: User description: "Épico EP-FE-05 do docs/16-backlog-do-frontend.md (Features FE-F06 — Pesquisa rápida e FE-F07 — Filtros rápidos e próximas atividades), que reúne as histórias FE-014 (pesquisar atividades pela página inicial), FE-015 (selecionar filtros rápidos), FE-016 (ver as próximas atividades), FE-017 (entender o carregamento das próximas atividades) e FE-018 (recuperar uma falha ao carregar próximas atividades). Base: todos os documentos em docs/ do frontend (em especial DOC-12, DOC-13 e DOC-15) e docs/ e specs/ do backend (agenda-livre-backend), em especial o contrato da API pública de consulta."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Descobrir próximas atividades ao abrir o site (Priority: P1)

Uma pessoa visitante abre o Agenda Livre e, sem precisar pesquisar nada, vê as três próximas atividades que vão acontecer, cada uma em um card com categoria, nome, unidade e próxima data e horário. Ao clicar em um card, abre os detalhes da atividade em um endereço próprio que pode ser compartilhado. Abaixo ou ao lado do título da seção há um caminho claro "Ver todas" para a página Explorar atividades.

**Why this priority**: É o primeiro conteúdo real do produto e a única forma de uma pessoa que "não sabe o que procura" descobrir atividades. Entrega valor mesmo sem pesquisa e é a primeira integração visível com os dados reais da API.

**Independent Test**: Abrir a página inicial com a API em execução e dados de exemplo, e conferir que aparecem até três cards ordenados pela próxima ocorrência, que cada card leva aos detalhes e que "Ver todas" leva à página Explorar.

**Acceptance Scenarios**:

1. **Given** que existem atividades publicadas com ocorrências futuras, **When** a página inicial é aberta, **Then** são exibidas até três atividades, da que acontece primeiro para a que acontece depois, cada uma com categoria, nome, unidade e próxima data e horário.
2. **Given** uma atividade recorrente cuja próxima ocorrência é a mais próxima entre todas, **When** a lista é exibida, **Then** ela aparece na posição correspondente à sua próxima ocorrência futura, e o card mostra essa data e horário.
3. **Given** que existem menos de três atividades com ocorrência futura, **When** a página é exibida, **Then** aparecem apenas as existentes, sem cards vazios nem espaços reservados.
4. **Given** atividades canceladas ou encerradas, **When** a lista é exibida, **Then** nenhuma delas aparece.
5. **Given** um card exibido, **When** a pessoa o aciona (clique, toque ou teclado), **Then** abre os detalhes daquela atividade na mesma aba, em um endereço direto que funciona se aberto em uma nova janela.
6. **Given** que a seção está exibida, **When** a pessoa aciona "Ver todas", **Then** abre a página Explorar atividades sem critérios de pesquisa.
7. **Given** que a API responde com sucesso e nenhuma atividade tem ocorrência futura, **When** a página é exibida, **Then** a seção informa de forma clara que não há atividades próximas no momento e mantém o caminho para Explorar, sem tratar a situação como erro.
8. **Given** atividades sem imagem (caso normal nesta versão), **When** os cards são exibidos, **Then** usam o visual padrão de imagem ausente, sem ícone quebrado e sem alterar o layout.

---

### User Story 2 - Entender que as atividades estão carregando (Priority: P1)

Enquanto a página busca as próximas atividades, a pessoa vê três cards "esqueleto" no lugar dos cards reais e percebe que o conteúdo está a caminho. Quem usa leitor de tela é informado de forma breve de que as atividades estão carregando e, depois, de que o carregamento terminou, sem que os esqueletos sejam lidos como se fossem atividades e sem que o foco seja deslocado.

**Why this priority**: Sem esse estado, a seção aparece vazia ou "pula" quando os dados chegam, e pessoas que usam tecnologias assistivas não percebem que há conteúdo a caminho. É parte do critério de aceite do fluxo essencial.

**Independent Test**: Simular uma resposta lenta da API e conferir os três esqueletos visíveis, os anúncios de início e fim e a ausência de movimento do foco.

**Acceptance Scenarios**:

1. **Given** que a consulta ainda não terminou, **When** a seção é exibida, **Then** aparecem três esqueletos de card na mesma grade dos cards reais.
2. **Given** os esqueletos exibidos, **When** uma pessoa navega com leitor de tela, **Then** eles são ignorados (não são anunciados como atividades) e há uma única mensagem objetiva de carregamento.
3. **Given** que a consulta termina com sucesso, **When** os cards substituem os esqueletos, **Then** é anunciada de forma objetiva a conclusão (por exemplo, quantas atividades foram carregadas) uma única vez.
4. **Given** que o foco do teclado está em qualquer elemento da página, **When** o carregamento começa ou termina, **Then** o foco permanece onde estava.
5. **Given** uma resposta muito rápida, **When** a seção é atualizada, **Then** não há piscadas de esqueleto nem anúncios repetidos ou redundantes.
6. **Given** a preferência de movimento reduzido, **When** os esqueletos são exibidos, **Then** não há animação de brilho ou pulso.

---

### User Story 3 - Pesquisar por nome e seguir para a listagem (Priority: P1)

Uma pessoa que já sabe o que procura digita parte do nome de uma atividade no campo "O que você procura?" e aciona "Explorar". A página Explorar atividades abre com o termo digitado já representado no endereço, para que a busca possa ser compartilhada e retomada. Digitar não dispara nenhuma consulta. Se a pessoa aciona "Explorar" sem preencher nada, abre a listagem geral.

**Why this priority**: É o caminho principal de quem sabe o que quer e é o ponto de entrada da jornada de pesquisa do produto.

**Independent Test**: Digitar um termo, acionar "Explorar" por clique e por tecla Enter, e conferir o endereço de destino; repetir sem termo; observar que nenhuma consulta é feita durante a digitação.

**Acceptance Scenarios**:

1. **Given** a página inicial, **When** exibida, **Then** há um campo de pesquisa com rótulo visível e acessível, e um botão "Explorar".
2. **Given** um termo digitado, **When** a pessoa aciona "Explorar" (clique, toque ou Enter no campo), **Then** abre a página Explorar atividades com o termo no endereço.
3. **Given** que a pessoa está digitando, **When** altera o texto, **Then** nenhuma consulta à API é feita a cada alteração.
4. **Given** nenhum critério preenchido ou selecionado, **When** a pessoa aciona "Explorar", **Then** abre a listagem geral, sem parâmetros de pesquisa no endereço.
5. **Given** um termo só com espaços, **When** a pessoa aciona "Explorar", **Then** o termo é tratado como vazio e não vai para o endereço.
6. **Given** um termo com caracteres especiais (acentos, "&", "#", espaços, aspas), **When** a pessoa aciona "Explorar", **Then** o termo chega à página de destino exatamente como foi digitado, sem quebrar o endereço.
7. **Given** um termo maior que o limite aceito pela API (100 caracteres), **When** a pessoa digita, **Then** o campo impede ultrapassar o limite, para que a listagem nunca receba um termo que a API recusaria.

---

### User Story 4 - Restringir a pesquisa por unidade, categoria e período (Priority: P2)

Uma pessoa que quer ver atividades de uma unidade, de uma categoria ou de um período escolhe esses critérios nos filtros rápidos da página inicial (um valor por filtro) e aciona "Explorar". A listagem abre já com os critérios aplicados, combinados com o termo de pesquisa se houver. Escolher uma opção não faz nada além de guardar a escolha. Os filtros começam em "todas as unidades", "todas as categorias" e "qualquer data".

**Why this priority**: Complementa a pesquisa por nome com um caminho de exploração por critérios; a página é útil sem ele (as histórias 1 a 3 já entregam descoberta e pesquisa), por isso fica depois.

**Independent Test**: Escolher uma unidade, uma categoria e um período, acionar "Explorar" e conferir que o endereço de destino traz os três critérios; repetir com apenas um deles e com nenhum.

**Acceptance Scenarios**:

1. **Given** a página inicial, **When** exibida, **Then** há três filtros (unidade, categoria e período), cada um com rótulo visível e acessível e com uma única opção selecionável.
2. **Given** os filtros recém-exibidos, **When** ninguém os alterou, **Then** estão em "todas as unidades", "todas as categorias" e "qualquer data", e nenhum desses valores padrão vai para o endereço de destino.
3. **Given** que a pessoa escolhe opções, **When** altera qualquer filtro, **Then** nenhuma consulta à API é feita e os resultados da seção de próximas atividades não mudam.
4. **Given** as opções de unidade e categoria, **When** exibidas, **Then** correspondem às unidades e categorias ativas cadastradas, ordenadas por nome, e nenhuma opção inexistente na API é oferecida.
5. **Given** as opções de período, **When** exibidas, **Then** são apenas períodos que a API consegue aplicar (por exemplo, "Qualquer data", "Hoje", "Próximos 7 dias" e "Este mês"), e cada um é traduzido para os critérios de data aceitos pela API.
6. **Given** um termo, uma unidade, uma categoria e um período selecionados, **When** a pessoa aciona "Explorar", **Then** a página Explorar abre com todos esses critérios combinados no endereço.
7. **Given** que a lista de unidades ou de categorias não pôde ser carregada, **When** a página é exibida, **Then** o filtro afetado oferece apenas a opção "todas", o restante da página e a pesquisa por nome continuam funcionando, e a pessoa é informada de que as opções não puderam ser carregadas.
8. **Given** uma pessoa que usa apenas o teclado, **When** navega pelos filtros, **Then** consegue percorrer, escolher uma opção e acionar "Explorar" sem uso do mouse, com foco visível em cada controle.

---

### User Story 5 - Tentar novamente quando as próximas atividades falham (Priority: P1)

Se a consulta das próximas atividades falhar (API fora do ar, sem conexão, resposta inesperada), a seção mostra uma mensagem amigável, sem detalhes técnicos, e um botão "Tentar novamente". Acionar o botão volta aos esqueletos; se falhar de novo, a mensagem volta. O resto da página (apresentação, pesquisa e filtros) continua utilizável, e a falha é anunciada às tecnologias assistivas sem tirar o foco de onde a pessoa estava.

**Why this priority**: A API é um serviço externo e a falha é um cenário esperado; sem recuperação, a página inicial pareceria quebrada e a seção principal ficaria inutilizável até recarregar a página.

**Independent Test**: Simular falha de rede e erro de servidor, conferir mensagem e botão; acionar o botão com a API ainda fora (nova falha) e depois com a API de volta (sucesso).

**Acceptance Scenarios**:

1. **Given** que a consulta falha, **When** a seção é atualizada, **Then** os esqueletos dão lugar a uma mensagem amigável e a um botão "Tentar novamente", sem mostrar dados de consultas anteriores como se fossem atuais.
2. **Given** a mensagem de erro exibida, **When** inspecionada, **Then** não mostra códigos, endereços, rastros nem textos técnicos.
3. **Given** a mensagem de erro exibida, **When** a pessoa aciona "Tentar novamente", **Then** a mensagem dá lugar a esqueletos e uma nova consulta é feita.
4. **Given** uma nova tentativa que falha, **When** a consulta termina, **Then** a mensagem de erro e o botão voltam a ser exibidos.
5. **Given** uma nova tentativa que tem sucesso, **When** a consulta termina, **Then** os cards aparecem normalmente e a conclusão é anunciada.
6. **Given** a falha na seção de próximas atividades, **When** a página é usada, **Then** a pesquisa, os filtros e a navegação continuam funcionando normalmente.
7. **Given** que a falha é causada por configuração inválida ou ausente do endereço da API, **When** a página é exibida, **Then** o aviso de configuração já existente continua sendo apresentado e a seção não fica em esqueleto indefinidamente.
8. **Given** que o foco do teclado está em qualquer elemento, **When** o erro aparece, **Then** o foco não é deslocado automaticamente e o erro é anunciado de forma objetiva; **And** se a pessoa acionou "Tentar novamente", o foco continua em um elemento visível e operável.
9. **Given** cliques repetidos e rápidos em "Tentar novamente", **When** a consulta está em andamento, **Then** não são iniciadas consultas redundantes.
10. **Given** que a pessoa sai da página enquanto a consulta está em andamento, **When** a resposta chega depois, **Then** nada é exibido incorretamente nem gera erro visível.

---

### User Story 6 - Entender o propósito do site ao chegar (Priority: P2)

Quem chega pela primeira vez vê, no topo da página, uma apresentação curta e convidativa ("Descubra novas maneiras de aprender, se divertir e participar!"), com uma frase de apoio e uma ilustração cultural, antes de qualquer pesquisa. Há exatamente um título principal na página, seguido por títulos de seção coerentes.

**Why this priority**: Dá contexto e identidade à página, mas não é necessária para descobrir ou pesquisar atividades; por isso vem depois do núcleo funcional.

**Independent Test**: Abrir a página e conferir título, frase de apoio, ilustração, hierarquia de títulos e o comportamento da composição em telas estreitas e largas.

**Acceptance Scenarios**:

1. **Given** a página inicial, **When** exibida, **Then** o topo traz o título de apresentação, uma frase breve de apoio e uma imagem cultural, seguidos da pesquisa e das próximas atividades, nessa ordem.
2. **Given** a página inicial, **When** a hierarquia de títulos é percorrida, **Then** há um único título principal e as seções (pesquisa e próximas atividades) têm títulos de nível seguinte, sem saltos.
3. **Given** que a imagem de apresentação é decorativa, **When** lida por tecnologias assistivas, **Then** não é anunciada; **And** se não carregar, nenhum ícone quebrado aparece e o layout se mantém.
4. **Given** telas estreitas (até 320 px de largura) e largas, **When** a página é exibida, **Then** a apresentação, a pesquisa e os cards se reorganizam em uma coluna ou grade conforme o espaço, sem rolagem horizontal e com texto ampliado a 200%.

---

### Edge Cases

- A API demora além do limite de tempo: tratar como falha (mensagem e "Tentar novamente").
- A API responde `429` (muitas requisições): tratar como falha com mensagem amigável.
- A API responde com um campo ausente em uma atividade (por exemplo, sem próxima ocorrência, sem categoria): o card se mantém íntegro, sem textos "undefined"/"null" e com texto padrão para a data ("Sem data prevista").
- Título de atividade muito longo ou sem espaços: quebra dentro do card sem estourar o layout.
- Atividade com ocorrência ainda hoje, mas já encerrada: não deve ser considerada próxima (regra da API; a interface confia no que a API devolve).
- Pessoa aciona "Explorar" duas vezes seguidas: apenas uma navegação resulta.
- Voltar do histórico a partir da Explorar para a Início: a página inicial volta utilizável; o campo e os filtros podem estar restaurados pelo navegador ou vazios, mas nunca inconsistentes com o que é enviado.
- JavaScript indisponível ou falha ao carregar: a seção mostra uma mensagem estática de que o conteúdo depende de JavaScript, e a navegação principal continua funcionando.
- Termo ou filtros que, juntos, a API recusaria (por exemplo, termo acima de 100 caracteres): a interface nunca envia um valor que a API recusaria.
- Unidade ou categoria removida entre o carregamento da página e o acionamento de "Explorar": a página de destino é quem trata esse caso.
- Fuso horário diferente do de São Paulo no dispositivo: "Hoje", "Próximos 7 dias" e "Este mês" são sempre calculados no fuso de São Paulo, o mesmo usado pela API.

## Requirements *(mandatory)*

### Functional Requirements

**Apresentação**

- **FR-001**: A página inicial MUST apresentar, nesta ordem: título e frase de apresentação com imagem cultural decorativa, pesquisa rápida (campo, filtros e botão "Explorar") e a seção "Próximas atividades".
- **FR-002**: A página MUST ter um único título principal e títulos de seção em hierarquia sem saltos.

**Pesquisa rápida (FE-014)**

- **FR-003**: A página MUST oferecer um campo de pesquisa por nome com rótulo visível e associado programaticamente.
- **FR-004**: A pesquisa e os filtros MUST ser aplicados somente quando a pessoa aciona "Explorar" (clique, toque ou Enter no campo); alterar o texto ou os filtros MUST NOT disparar nenhuma consulta à API.
- **FR-005**: Ao acionar "Explorar", o sistema MUST abrir a página Explorar atividades na mesma aba, com o termo e os filtros escolhidos representados no endereço, de modo que possam ser compartilhados e retomados.
- **FR-006**: Sem termo e sem filtros diferentes do padrão, "Explorar" MUST abrir a listagem geral, sem parâmetros de pesquisa no endereço.
- **FR-007**: O termo MUST ser normalizado antes de seguir (espaços nas pontas removidos; só espaços vira vazio) e MUST ser transportado sem alteração do conteúdo, inclusive com acentos e caracteres especiais.
- **FR-008**: O campo MUST limitar o termo a 100 caracteres, o máximo aceito pela API.

**Filtros rápidos (FE-015)**

- **FR-009**: A página MUST oferecer três filtros — unidade, categoria e período —, cada um com rótulo visível e acessível, controle nativo de seleção única e valor padrão que representa "todas" (unidades), "todas" (categorias) e "qualquer data".
- **FR-010**: As opções de unidade e de categoria MUST vir das unidades e categorias ativas da API, ordenadas por nome, e MUST NOT incluir opções que a API não reconheça.
- **FR-011**: As opções de período MUST ser limitadas às que a API consegue aplicar: "Qualquer data", "Hoje", "Próximos 7 dias" e "Este mês"; cada uma MUST ser convertida para os critérios de data da API, calculados no fuso de São Paulo.
- **FR-012**: Os valores padrão MUST NOT ser incluídos no endereço de destino; somente os critérios efetivamente escolhidos.
- **FR-013**: Se as unidades ou as categorias não puderem ser carregadas, o filtro correspondente MUST oferecer apenas a opção "todas", MUST informar a pessoa de que as opções não puderam ser carregadas e MUST NOT impedir a pesquisa por nome, os demais filtros nem a seção de próximas atividades.
- **FR-014**: Carregar as opções dos filtros MUST ocorrer sem mover o foco e sem bloquear o uso do campo de pesquisa.

**Próximas atividades (FE-016)**

- **FR-015**: Ao abrir a página, o sistema MUST consultar a API e exibir até três atividades publicadas com ocorrência futura, na ordem da próxima ocorrência (da mais próxima à mais distante), considerando também atividades recorrentes.
- **FR-016**: O sistema MUST NOT exibir atividades canceladas ou encerradas, e MUST confiar nas regras de publicação e de ordenação da API, sem duplicá-las ou recalculá-las no navegador.
- **FR-017**: Cada card MUST exibir categoria, nome, unidade e próxima data e horário (ou "Sem data prevista" quando não houver), reutilizando o componente de card compartilhado, e MUST abrir os detalhes da atividade em um endereço direto na mesma aba.
- **FR-018**: A seção MUST oferecer um caminho "Ver todas" para a página Explorar atividades sem critérios.
- **FR-019**: Quando a consulta tiver sucesso, mas não houver atividade com ocorrência futura, a seção MUST informar isso de forma clara, sem tratá-la como erro, mantendo o caminho para Explorar.
- **FR-020**: Os cards MUST usar o visual padrão de imagem ausente, pois a API não fornece imagens nesta versão, e MUST estar prontos para exibir uma imagem caso a API passe a oferecê-la.

**Carregamento (FE-017)**

- **FR-021**: Enquanto a consulta de próximas atividades estiver em andamento, a seção MUST exibir três esqueletos de card, ocultos das tecnologias assistivas.
- **FR-022**: O início do carregamento e sua conclusão MUST ser comunicados por uma única região de status acessível, em mensagens breves e objetivas, sem anúncios repetidos.
- **FR-023**: O carregamento, a conclusão e o erro MUST NOT deslocar o foco do teclado.

**Falha e nova tentativa (FE-018)**

- **FR-024**: Quando a consulta falhar, a seção MUST exibir uma mensagem amigável, sem detalhes técnicos, e o botão "Tentar novamente", e MUST NOT mostrar dados de consultas anteriores como se fossem atuais.
- **FR-025**: Acionar "Tentar novamente" MUST substituir a mensagem por esqueletos e refazer a consulta; uma nova falha MUST restaurar a mensagem e o botão.
- **FR-026**: A falha da seção MUST NOT impedir o uso da apresentação, da pesquisa, dos filtros, da navegação nem do rodapé.
- **FR-027**: O erro MUST ser anunciado às tecnologias assistivas sem mover o foco.
- **FR-028**: Enquanto uma consulta estiver em andamento, novos acionamentos de "Tentar novamente" MUST NOT iniciar consultas redundantes, e uma resposta atrasada MUST NOT sobrescrever uma mais recente.

**Transversais**

- **FR-029**: Toda a página MUST ser operável por teclado, com foco visível e ordem de foco coerente com a ordem visual, e MUST cumprir os requisitos de acessibilidade do DOC-15 (estrutura semântica, rótulos, contraste, reflow até 320 px, ampliação até 200%, movimento reduzido).
- **FR-030**: A página MUST reutilizar o cliente da API, o card de atividade, o estado de região (esqueleto, erro e anúncio) e o estilo compartilhado já existentes, sem criar variações paralelas.
- **FR-031**: A página MUST conviver com o aviso de configuração existente: quando o endereço da API for ausente, inválido ou inseguro, o aviso aparece e a seção de próximas atividades e as opções dos filtros se comportam como na falha, sem ficar em carregamento indefinido.
- **FR-032**: A página MUST continuar utilizável quando a Explorar atividades ainda não interpretar todos os parâmetros do endereço: o endereço de destino segue o contrato da API, e a interpretação na Explorar é de responsabilidade do épico EP-FE-06.

### Key Entities

- **Critérios de pesquisa**: o que a pessoa escolhe na página inicial — termo, unidade, categoria e período. Todos opcionais; combinados entre si; transportados para a página Explorar.
- **Atividade próxima (resumo)**: atividade publicada, com categoria, nome, unidade e próxima ocorrência (data e horário de início e fim, ou ausência), usada para compor os cards.
- **Opção de filtro**: item selecionável de unidade ou categoria (identificador interno, nome) ou de período (rótulo e janela de datas).
- **Estado da seção de próximas atividades**: carregando, com resultados, sem atividades próximas ou com falha; apenas um ativo por vez.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Uma pessoa visitante vê as próximas atividades, ou a mensagem apropriada (vazio ou erro), em até 3 segundos após abrir a página em uma conexão comum, e vê um indicador de carregamento em menos de 1 segundo.
- **SC-002**: Uma pessoa consegue ir da página inicial à listagem com seu termo e filtros em até 3 interações (digitar ou escolher, e acionar "Explorar").
- **SC-003**: 100% das alterações de texto e de filtros na página inicial resultam em zero consultas à API; a consulta de próximas atividades e as de opções dos filtros ocorrem somente na abertura (ou na nova tentativa).
- **SC-004**: Em 100% dos casos de falha simulados (rede, tempo esgotado, erro de servidor, limite de requisições), a pessoa vê mensagem amigável e consegue recuperar a seção com "Tentar novamente" sem recarregar a página.
- **SC-005**: Em 100% dos estados da seção (carregando, sucesso, vazio e erro), o foco do teclado permanece onde estava e há exatamente uma mensagem de status anunciada por mudança de estado.
- **SC-006**: A página inteira (apresentação, pesquisa, filtros e cards) é utilizável apenas com o teclado e sem perda de conteúdo ou função em 320 px de largura e com texto ampliado a 200%.
- **SC-007**: A verificação automática de acessibilidade não encontra violações na página nos estados carregando, com resultados, vazio e erro; e a revisão manual com teclado e leitor de tela confirma a ordem, os nomes e os anúncios descritos.
- **SC-008**: Em 100% dos casos de teste de combinações (termo, unidade, categoria, período, com e sem valores), o endereço de destino traz exatamente os critérios escolhidos e nenhum valor padrão ou vazio.

## Assumptions

- A API pública de consulta é a do backend (contrato em `agenda-livre-backend/specs/006-public-consultation/contracts/public-api.md`): listagem de atividades com `q`, `unit`, `category`, `date`, `date_from`, `date_to` e paginação; listagens de unidades e categorias ativas. Ela já devolve somente atividades publicadas, ordenadas pela próxima ocorrência, e exclui as encerradas e canceladas.
- Para as próximas atividades, a consulta restringe a janela a "de hoje em diante" e pede três itens; a ordem e a exclusão de atividades sem ocorrência futura são as da API.
- As unidades e categorias ativas cabem em uma única página da API (até 50 de cada); se houver mais, apenas as primeiras 50, por nome, são oferecidas, e isso será tratado em uma melhoria futura.
- Os períodos oferecidos são "Qualquer data" (padrão), "Hoje", "Próximos 7 dias" e "Este mês" (do dia atual ao último dia do mês), e correspondem aos filtros de data existentes na API. São uma decisão de produto desta versão, revisável, pois o DOC-12 deixa os períodos "a confirmar".
- O bairro, apesar de aceito pela API, não faz parte dos filtros rápidos da página inicial.
- A API não fornece imagem nas atividades (pendência registrada em `docs/PENDENCIAS-BACKEND.md`): os cards usam o visual de imagem ausente como caso normal. A imagem cultural da apresentação é uma ilustração decorativa própria do site, não vinda da API.
- A página Explorar atividades (EP-FE-06) é construída em outro épico; esta feature entrega apenas o endereço de destino correto. Os nomes dos parâmetros do endereço seguem os da API para que a Explorar possa reutilizá-los.
- O cliente HTTP, o componente de card, o estado de região, o menu, o rodapé, o aviso de configuração e os estilos compartilhados já existem (features 002 a 004) e são reutilizados; esta feature não os redefine.
- O texto exato da apresentação e dos rótulos segue o DOC-12; textos finais podem ser ajustados sem mudar os requisitos.
- Fora do escopo: pesquisa e resultados na própria página inicial, paginação, quantidade de resultados, página de detalhes, Sobre, Contato, administração e imagens vindas da API.
