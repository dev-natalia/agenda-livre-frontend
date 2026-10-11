# Feature Specification: Navegação e componentes compartilhados

**Feature Branch**: `003-navigation-shared-components`

**Created**: 2026-10-11

**Status**: Draft

**Input**: User description: "Épico EP-FE-03 do docs/16-backlog-do-frontend.md (Features FE-F03 — Navegação entre páginas e FE-F04 — Componentes compartilhados), que reúne as histórias FE-006 (navegar entre as páginas públicas), FE-007 (usar o menu móvel), FE-008 (reutilizar cards de atividades), FE-009 (fallback quando a atividade não tiver imagem) e FE-010 (mensagens de status compartilhadas). Base: todos os documentos em docs/ do frontend e docs/ e specs/ do backend (agenda-livre-backend), em especial o contrato público em specs/006-public-consultation/contracts/public-api.md."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Navegar entre as páginas públicas (Priority: P1)

Uma pessoa visitante abre qualquer página do Agenda Livre — diretamente por endereço, por um link compartilhado ou por um favorito — e vê, no topo, o nome do site e os links para Início, Explorar atividades, Sobre e Contato. O link da página em que ela está aparece destacado e é identificado como página atual também para tecnologias assistivas. Ao ativar um link, a página correspondente abre; o rodapé repete o acesso a Sobre e Contato. Todas as cinco páginas (Início, Explorar, Detalhes, Sobre e Contato) compartilham o mesmo cabeçalho, a mesma navegação, o mesmo rodapé e o link "Pular para o conteúdo principal", sem que cada página mantenha uma cópia diferente.

**Why this priority**: Sem navegação comum o site não é utilizável como um conjunto; todas as demais histórias dependem de haver caminho entre as páginas e de uma estrutura compartilhada onde os componentes aparecem.

**Independent Test**: Abrir cada uma das cinco páginas diretamente pelo endereço, com JavaScript habilitado e desabilitado, e percorrer os links apenas com o teclado, verificando destino, página atual indicada e ordem de foco.

**Acceptance Scenarios**:

1. **Given** qualquer uma das cinco páginas abertas diretamente por endereço, **When** ela termina de carregar, **Then** o cabeçalho com o nome Agenda Livre e os links Início, Explorar atividades, Sobre e Contato estão presentes e cada link leva a um destino válido.
2. **Given** uma página que corresponde a um item do menu (Início, Explorar, Sobre ou Contato), **When** ela é exibida, **Then** exatamente o link correspondente é identificado como página atual, de forma visual e programática, e os demais não.
3. **Given** a página de Detalhes da atividade, que não é item fixo do menu, **When** ela é exibida, **Then** nenhum link do menu é marcado como atual por engano, e o item Explorar atividades continua acessível como caminho de retorno.
4. **Given** que o JavaScript está desabilitado ou falhou ao carregar, **When** a pessoa usa a navegação, **Then** os links do cabeçalho e do rodapé continuam presentes e levam às páginas correspondentes.
5. **Given** o foco do teclado no início da página, **When** a pessoa pressiona Tab repetidamente, **Then** a ordem é: link "Pular para o conteúdo principal", marca do site, links de navegação na ordem visual, conteúdo principal, rodapé.
6. **Given** o link "Pular para o conteúdo principal" com foco, **When** a pessoa o ativa, **Then** o foco segue para o início do conteúdo principal da página atual, e o link só fica visível enquanto tem foco.
7. **Given** o rodapé de qualquer página, **When** exibido, **Then** traz uma identificação breve do Agenda Livre e links para Sobre e Contato, sem informações institucionais não confirmadas e sem links externos.
8. **Given** a navegação, **When** inspecionada por tecnologia assistiva, **Then** o cabeçalho e a navegação têm identificação própria (por exemplo, "Navegação principal"), e a de rodapé, se houver, tem identificação distinta.

---

### User Story 2 - Usar o menu móvel (Priority: P1)

Uma pessoa visitante em celular ou com a janela estreita vê no cabeçalho apenas o nome do site e um botão "Menu". Ao acionar o botão, a lista de links aparece; ao acionar de novo, desaparece. O botão informa se o menu está aberto ou fechado. Enquanto o menu está fechado, seus links não podem ser alcançados pelo teclado nem lidos por leitores de tela. Quem usa teclado abre o menu com Enter ou Espaço, percorre os links com Tab e fecha com Esc, sem ficar preso.

**Why this priority**: Metade do uso esperado é em telas pequenas; sem um menu utilizável a navegação (Story 1) fica quebrada ou ocupa a tela inteira. Os dois fluxos juntos formam o mínimo de navegação.

**Independent Test**: Reduzir a janela a 320 px de largura e, só com teclado, abrir o menu, percorrer os links, fechá-lo com Esc e verificar o estado anunciado do botão e a focalizabilidade dos links em cada estado.

**Acceptance Scenarios**:

1. **Given** uma tela estreita, **When** a página é exibida, **Then** o menu começa fechado, o botão tem nome acessível ("Menu") e informa o estado "recolhido".
2. **Given** o menu fechado, **When** a pessoa percorre a página com Tab, **Then** os links do menu não recebem foco e não são lidos por leitores de tela.
3. **Given** o botão com foco, **When** a pessoa aciona por clique, toque, Enter ou Espaço, **Then** o menu abre, o estado do botão passa a "expandido" e os links entram na ordem de foco logo após o botão.
4. **Given** o menu aberto, **When** a pessoa aciona o botão novamente, **Then** o menu fecha, o estado volta a "recolhido" e o foco permanece no botão.
5. **Given** o menu aberto e o foco dentro dele, **When** a pessoa pressiona Esc, **Then** o menu fecha e o foco retorna ao botão.
6. **Given** o menu aberto, **When** a pessoa ativa um link, **Then** a página de destino abre com o menu fechado.
7. **Given** o menu aberto, **When** a janela é ampliada até a largura de desktop, **Then** a navegação passa a ser exibida em linha, com todos os links acessíveis, o botão desaparece e nenhum estado fica inconsistente (links nunca ocultos no desktop).
8. **Given** a preferência do sistema por movimento reduzido, **When** o menu abre ou fecha, **Then** não há animação de deslocamento ou deslizamento, apenas a troca de estado.
9. **Given** o JavaScript indisponível em tela estreita, **When** a página é exibida, **Then** os links de navegação permanecem acessíveis (o menu não fica escondido sem forma de abri-lo).
10. **Given** a ampliação do texto a 200% ou largura de 320 px, **When** o cabeçalho é exibido, **Then** não há perda de conteúdo, sobreposição nem rolagem horizontal da página.

---

### User Story 3 - Ver atividades em cards consistentes, mesmo sem imagem (Priority: P1)

Uma pessoa visitante vê atividades — na página inicial e na exploração — apresentadas sempre no mesmo formato de card: etiqueta da categoria, título, unidade e próxima data e horário, com um único link principal para os detalhes. Cada card tem uma área de imagem; como as atividades hoje não trazem imagem, essa área mostra um fundo da identidade visual do Agenda Livre, com um ícone decorativo da categoria quando houver. Nunca aparece imagem quebrada nem um vazio inesperado, e leitores de tela não leem a área decorativa. Se uma atividade não tiver próxima ocorrência, bairro ou outro dado opcional, o card continua inteiro e legível, sem textos como "undefined" ou "null".

**Why this priority**: O card é o elemento mais repetido do site (Início e Explorar dependem dele) e define como a pessoa compara opções. Como o contrato atual da API não fornece imagem, o fallback é o estado normal, não a exceção; por isso FE-008 e FE-009 formam uma única entrega.

**Independent Test**: Renderizar o card com atividades sintéticas (completa, sem próxima ocorrência, sem bairro, com título muito longo, com categoria sem ícone definido) e verificar estrutura, textos, link, ausência de imagem quebrada e leitura por tecnologia assistiva.

**Acceptance Scenarios**:

1. **Given** uma atividade com título, categoria, unidade e próxima ocorrência, **When** o card é exibido, **Then** mostra etiqueta da categoria, título, nome da unidade, data e horário em português e um único link principal para os detalhes dessa atividade.
2. **Given** a mesma atividade em Início e em Explorar, **When** os cards são comparados, **Then** têm estrutura, ordem de informações e hierarquia visual idênticas.
3. **Given** o link principal do card, **When** lido por tecnologia assistiva, **Then** tem nome acessível claro que inclui o título da atividade (por exemplo, "Ver detalhes: Oficina de dança") e não é repetido genericamente como "Saiba mais" idêntico em todos os cards.
4. **Given** um card, **When** a pessoa navega por teclado, **Then** o link principal recebe foco visível, é ativado com Enter e há uma única parada de foco por card.
5. **Given** o link principal, **When** ativado, **Then** abre os detalhes da atividade na mesma aba, em um endereço direto e compartilhável que identifica a atividade.
6. **Given** uma atividade sem imagem, **When** o card é exibido, **Then** a área de imagem mostra fundo da identidade visual com as mesmas proporções de um card com imagem, sem imagem quebrada nem espaço vazio.
7. **Given** a categoria da atividade, **When** existe ícone associado a ela, **Then** o ícone aparece sobre o fundo; **When** não existe, **Then** aparece um ícone padrão ou apenas o fundo, nunca um espaço quebrado.
8. **Given** a área de imagem e o ícone decorativos, **When** lidos por leitor de tela, **Then** são ignorados e não geram anúncios.
9. **Given** uma atividade sem `next_occurrence`, **When** o card é exibido, **Then** mostra um texto neutro como "Sem data prevista" no lugar da data, sem quebrar o card.
10. **Given** uma atividade sem unidade, bairro ou categoria utilizáveis, **When** o card é exibido, **Then** omite apenas essa informação, mantém o restante e nunca exibe "undefined", "null" ou campos vazios com rótulo.
11. **Given** um título muito longo ou uma palavra sem quebra, **When** o card é exibido em 320 px de largura, **Then** o texto quebra dentro do card sem estourar nem sobrepor outros elementos.
12. **Given** textos vindos da API que contenham `<`, `&` ou aspas, **When** o card é exibido, **Then** são mostrados como texto literal, nunca interpretados como marcação.
13. **Given** que a atividade futura passe a trazer uma imagem válida, **When** o card é exibido, **Then** a imagem tem texto alternativo definido conforme sua função (não a repetição automática do título), e, se ela falhar ao carregar, o fallback aparece no lugar.

---

### User Story 4 - Entender se a área está carregando, falhou ou está vazia (Priority: P1)

Uma pessoa visitante abre uma área que busca dados e sempre sabe em que situação está: um indicador de carregamento enquanto aguarda, uma mensagem de erro com "Tentar novamente" quando a busca falha, ou uma mensagem de "nenhuma atividade encontrada" quando a busca funcionou, mas não retornou nada. As três mensagens são visualmente e textualmente diferentes, escritas em português simples, sem códigos nem termos técnicos. Quem usa leitor de tela é informada de cada mudança de situação uma única vez, sem que o foco salte para outro lugar.

**Why this priority**: Confundir carregando, erro e vazio é a falha de comunicação mais danosa do site; todas as páginas com dados (Início, Explorar, Detalhes) usam esses três estados, então precisam existir como componente único antes delas.

**Independent Test**: Para uma região de conteúdo de teste, alternar entre carregando, erro (com e sem nova tentativa), vazio e sucesso e verificar o conteúdo exibido, o que é anunciado, quantas vezes e a posição do foco após cada troca.

**Acceptance Scenarios**:

1. **Given** uma área que inicia uma busca, **When** o carregamento começa, **Then** mostra indicação visual de carregamento (cartões de esqueleto na forma do conteúdo esperado) e uma mensagem de status breve, como "Carregando atividades…".
2. **Given** os cartões de esqueleto, **When** lidos por tecnologia assistiva, **Then** são ignorados e não se apresentam como atividades reais.
3. **Given** uma busca bem-sucedida com dados, **When** conclui, **Then** os esqueletos são substituídos pelo conteúdo e o indicador de carregamento desaparece; não permanecem mensagens de carregamento antigas.
4. **Given** uma busca bem-sucedida sem resultados, **When** conclui, **Then** aparece uma mensagem própria de ausência de resultados ("Nenhuma atividade encontrada"), com orientação para ajustar ou limpar filtros quando houver filtros, e **sem** aparência nem texto de erro.
5. **Given** uma busca que falhou, **When** o erro é classificado pelo cliente da API (feature 002), **Then** aparece a mensagem amigável do erro, sem códigos, nomes técnicos nem texto bruto, e, se o erro permitir nova tentativa, o botão "Tentar novamente".
6. **Given** o erro com "Tentar novamente", **When** a pessoa ativa o botão, **Then** a área volta ao estado de carregamento, a busca é repetida e o resultado substitui o erro; em nova falha, o erro volta a aparecer.
7. **Given** qualquer troca de estado (carregando → sucesso, erro ou vazio), **When** ocorre, **Then** a mudança é anunciada a leitores de tela por uma região de status, uma única vez por troca, sem repetir a mesma mensagem.
8. **Given** uma troca de estado causada pela chegada de dados, **When** ocorre, **Then** o foco do teclado permanece onde estava; só é movido se o elemento focado deixar de existir (por exemplo, o botão "Tentar novamente"), e então vai a um destino previsível.
9. **Given** os três estados, **When** vistos sem distinção de cor, **Then** continuam distinguíveis por texto e/ou ícone, e os contrastes atendem ao mínimo exigido.
10. **Given** a preferência por movimento reduzido, **When** o esqueleto é exibido, **Then** não há animação de pulsar ou brilho, apenas o bloco estático.
11. **Given** uma mensagem de estado com conteúdo vindo de fora (por exemplo, a mensagem do erro), **When** exibida, **Then** é tratada como texto, nunca como marcação.
12. **Given** o estado de erro já existente na feature 002, **When** esta feature é concluída, **Then** ele passa a ser apresentado por este mesmo mecanismo comum, sem duplicar uma segunda forma de exibir erros.

---

### Edge Cases

- Página aberta por endereço com ou sem barra final, com `index.html` explícito ou com parâmetros e âncora: a página atual continua sendo identificada corretamente.
- Página de Detalhes aberta sem identificador ou com identificador inválido: o cabeçalho e o rodapé continuam funcionando; o tratamento do conteúdo pertence à feature de detalhes.
- Largura exatamente no ponto de troca entre menu móvel e navegação em linha: nunca há as duas formas ao mesmo tempo nem nenhuma.
- Rotação do dispositivo ou redimensionamento com o menu aberto: o estado permanece coerente e o foco não se perde.
- Zoom do navegador ou texto ampliado a 200%: os rótulos de navegação não são cortados e o menu continua operável.
- Pessoa que alterna rapidamente o botão do menu: o estado exibido e o estado anunciado nunca divergem.
- Card com data de ocorrência em formato inesperado (dado inválido): o card mostra o texto neutro em vez de uma data inválida.
- Lista com muitos cards: cada link tem nome distinto; nenhum nome acessível é duplicado entre atividades diferentes.
- Duas regiões de status na mesma página (por exemplo, "Próximas atividades" e resultados): o anúncio de uma não repete nem substitui o da outra.
- Estado de carregamento muito curto (resposta quase imediata): não deve gerar anúncio confuso ("Carregando" seguido de resultado em sequência inaudível); apenas o resultado final precisa ser comunicado.
- Mensagem de erro recebida após o cancelamento de uma consulta substituída por outra mais recente: nenhum erro é exibido (herda a regra da feature 002).
- Imagem futura que não carrega: o fallback assume o lugar sem layout quebrado.

## Requirements *(mandatory)*

### Functional Requirements

**Navegação (FE-006)**

- **FR-001**: Todas as cinco páginas públicas (Início, Explorar, Detalhes, Sobre, Contato) MUST apresentar o mesmo cabeçalho, com o nome Agenda Livre e a navegação para Início, Explorar atividades, Sobre e Contato, e o mesmo rodapé.
- **FR-002**: A estrutura compartilhada (cabeçalho, navegação, rodapé, link de pular) MUST ser idêntica nas cinco páginas, e qualquer divergência entre elas MUST ser detectada por verificação automática. Como a navegação precisa funcionar sem JavaScript (FR-003), a estrutura é repetida em cada página e mantida consistente por essa verificação, e não gerada por script.
- **FR-003**: Os links de navegação MUST ser links nativos com destinos válidos para as páginas correspondentes, utilizáveis sem JavaScript.
- **FR-004**: Cada uma das cinco páginas MUST ser acessível diretamente por seu endereço, sem depender de ter passado por outra página.
- **FR-005**: A página atual MUST ser identificada visualmente e programaticamente no link correspondente; apenas um link pode ser marcado como atual e a marcação não pode depender somente de cor.
- **FR-006**: A página de Detalhes MUST NOT marcar nenhum item de menu como página atual e MUST oferecer o caminho de volta para Explorar atividades por meio do menu.
- **FR-007**: A ordem de foco MUST seguir a ordem visual e lógica: link de pular, marca, navegação, conteúdo principal, rodapé.
- **FR-008**: Cada página MUST ter o link "Pular para o conteúdo principal" como primeiro elemento focável, visível apenas ao receber foco, com destino no conteúdo principal da própria página.
- **FR-009**: O cabeçalho, a navegação e o rodapé MUST usar elementos semânticos com identificação acessível distinta quando houver mais de uma navegação; cada página MUST ter um único conteúdo principal com identificador estável.
- **FR-010**: O rodapé MUST conter identificação breve do Agenda Livre e links para Sobre e Contato, sem informações institucionais não confirmadas e sem links externos.

**Menu móvel (FE-007)**

- **FR-011**: Em telas estreitas, a navegação MUST ser recolhida atrás de um botão com nome acessível visível ("Menu"), que MUST informar programaticamente se o menu está expandido ou recolhido e identificar o conteúdo que controla.
- **FR-012**: O menu MUST iniciar recolhido em telas estreitas.
- **FR-013**: Enquanto recolhido, os links do menu MUST NOT ser focáveis nem expostos a tecnologias assistivas; quando expandido, MUST ser alcançáveis logo após o botão.
- **FR-014**: O botão MUST abrir e fechar o menu por clique/toque, Enter e Espaço; a tecla Esc MUST fechar o menu aberto e devolver o foco ao botão.
- **FR-015**: O menu MUST NOT usar o papel de menu de aplicação (menu/menuitem); MUST ser um botão de divulgação com links nativos, sem armadilha de foco e sem exigir teclas de seta.
- **FR-016**: Ao ativar um link do menu, a página de destino MUST abrir com o menu recolhido.
- **FR-017**: Em telas largas, a navegação MUST ser exibida em linha com todos os links acessíveis e o botão do menu MUST NOT aparecer; ao redimensionar entre as duas formas, o estado MUST permanecer consistente.
- **FR-018**: Sem JavaScript, os links de navegação MUST permanecer alcançáveis em qualquer largura.
- **FR-019**: Com preferência por movimento reduzido, o menu MUST abrir e fechar sem animações de deslocamento.
- **FR-020**: O cabeçalho MUST permanecer utilizável a 320 px de largura e com texto ampliado a 200%, sem perda de conteúdo, sobreposição ou rolagem horizontal.

**Cards de atividades (FE-008)**

- **FR-021**: Os cards MUST ser produzidos por um único componente reutilizável usado em Início e em Explorar, de modo que a estrutura e a hierarquia sejam idênticas.
- **FR-022**: Cada card MUST apresentar, conforme os dados disponíveis: etiqueta da categoria, título, unidade (e bairro quando existir), próxima data e horário e um link para os detalhes.
- **FR-023**: O card MUST ser montado com os campos que a API pública realmente entrega para itens de listagem (identificador, título, resumo, unidade, categoria, próxima ocorrência) e MUST NOT exigir ou inventar campos que a API não fornece.
- **FR-024**: O card MUST ter um único link principal, com nome acessível que identifica a atividade, destino na mesma aba e endereço direto, compartilhável, baseado no identificador da atividade.
- **FR-025**: O card MUST usar estrutura semântica de conteúdo (título em nível adequado à página e informações em elementos apropriados, como data/hora legível por máquina) e MUST NOT indicar que a inscrição é feita dentro do Agenda Livre.
- **FR-026**: Data e horário MUST ser exibidos em português do Brasil, em fuso e formato coerentes com a API (data `AAAA-MM-DD`, horário `HH:MM`, fuso America/Sao_Paulo), sem deslocamento de dia por conversão de fuso.
- **FR-027**: Quando não houver próxima ocorrência, o card MUST exibir um texto neutro de ausência de data; quando faltar qualquer outro campo opcional, MUST omitir somente esse campo, sem texto como "undefined" ou "null" e sem rótulos vazios.
- **FR-028**: Todo texto vindo da API MUST ser exibido como texto literal, nunca interpretado como marcação.
- **FR-029**: Textos longos MUST quebrar dentro do card, sem estourar o contêiner, a 320 px de largura.
- **FR-030**: O link principal MUST ser operável por teclado, com indicador de foco visível, e o card MUST ter uma única parada de foco.
- **FR-031**: O componente MUST ser independente de página, recebendo os dados de uma atividade e devolvendo o elemento do card, de forma que possa ser testado isoladamente.

**Fallback de imagem (FE-009)**

- **FR-032**: Cada card MUST reservar a área de imagem com proporção constante; quando a atividade não tiver imagem utilizável, a área MUST exibir fundo da identidade visual, com ícone decorativo da categoria quando houver, ou um ícone padrão.
- **FR-033**: O fundo e o ícone de fallback MUST ser ocultados das tecnologias assistivas e MUST NOT ter nome, texto alternativo ou anúncio próprio.
- **FR-034**: O card MUST NOT exibir imagem quebrada, ícone de imagem quebrada, nem área vazia inesperada em nenhuma combinação de dados ausentes.
- **FR-035**: Se uma imagem for fornecida no futuro, o componente MUST exibi-la com texto alternativo definido pela função da imagem (decorativa com texto alternativo vazio, informativa com descrição própria, nunca a repetição automática do título), e MUST voltar ao fallback se ela falhar ao carregar.
- **FR-036**: A categoria MUST ser comunicada por texto (etiqueta), nunca apenas pelo ícone ou pela cor do fallback.

**Mensagens de status compartilhadas (FE-010)**

- **FR-037**: MUST existir um mecanismo comum, reutilizável por qualquer região de conteúdo, para apresentar os estados: carregando, erro, sem resultados e sucesso; apenas um deles visível por região em cada momento.
- **FR-038**: O estado "carregando" MUST mostrar esqueletos com a forma do conteúdo esperado (para listas de cards, um conjunto de cartões de esqueleto na quantidade informada pela página) e uma mensagem breve de status.
- **FR-039**: Os esqueletos MUST ser ocultados das tecnologias assistivas e MUST NOT se apresentar como atividades reais, links ou botões.
- **FR-040**: O estado "sem resultados" MUST ter texto próprio, distinto do de erro; MUST orientar a pessoa a ajustar ou limpar filtros apenas quando houver filtros aplicados; e MUST ser acionado somente por uma resposta de sucesso com lista vazia.
- **FR-041**: O estado "erro" MUST usar a mensagem amigável e a indicação de nova tentativa vindas do cliente da API (feature 002), sem expor códigos, nomes técnicos nem o texto bruto do servidor, e MUST oferecer o botão "Tentar novamente" somente quando a nova tentativa fizer sentido.
- **FR-042**: Ao acionar "Tentar novamente", a região MUST voltar ao estado de carregamento e repetir a mesma operação; o resultado MUST substituir o erro, e uma nova falha MUST restaurar o erro.
- **FR-043**: Cada troca de estado MUST ser comunicada a tecnologias assistivas por região de status adequada, uma única vez por troca, evitando anúncios duplicados ou repetidos; a região MUST existir no documento antes da primeira mudança.
- **FR-044**: Uma troca de estado causada por atualização de dados MUST NOT mover o foco; somente quando o elemento focado deixar de existir, o foco MUST ir a um destino previsível dentro da própria região.
- **FR-045**: Os estados MUST ser distinguíveis sem depender de cor (texto e/ou ícone) e atender aos contrastes mínimos do projeto; o esqueleto MUST NOT animar com preferência por movimento reduzido.
- **FR-046**: Um erro resultante de consulta cancelada ou substituída por outra mais recente MUST NOT ser exibido, preservando o comportamento da feature 002.
- **FR-047**: O mecanismo de exibição de erro já existente da feature 002 MUST ser integrado a este mecanismo comum, sem manter duas formas concorrentes de apresentar erro.

**Transversais**

- **FR-048**: Todos os componentes MUST seguir os tokens visuais do projeto (cores, tipografia, espaçamento, foco) e MUST ser utilizáveis com teclado, leitor de tela, zoom de 200% e largura de 320 px.
- **FR-049**: Os componentes MUST NOT dispor de consulta à API por conta própria: recebem dados, estados e ações pelas páginas que os usam.
- **FR-050**: As páginas existentes (hoje com cabeçalho e rodapé provisórios) MUST passar a usar a estrutura compartilhada, sem remover o conteúdo provisório das páginas além do necessário.
- **FR-051**: O comportamento de cada componente MUST ser coberto por testes automatizados, incluindo verificações de acessibilidade automáticas nas cinco páginas; verificações automáticas não substituem a revisão manual com teclado e leitor de tela, que MUST ser registrada.

### Key Entities

- **Página pública**: uma das cinco páginas (Início, Explorar, Detalhes, Sobre, Contato); tem rótulo, endereço e, exceto Detalhes, um item de menu; uma delas é a "página atual" por vez.
- **Item de navegação**: rótulo e destino de um link do cabeçalho ou do rodapé; pode estar marcado como página atual.
- **Estado do menu**: expandido ou recolhido; existe apenas em telas estreitas.
- **Atividade (item de listagem)**: identificador, título, resumo, unidade (nome, bairro), categoria (nome, identificador) e próxima ocorrência (data, horário de início e fim) opcional; não traz imagem.
- **Card de atividade**: apresentação resumida de uma atividade com área de imagem (ou fallback), categoria, título, unidade, próxima ocorrência e link para os detalhes.
- **Fallback de imagem**: fundo da identidade visual com ícone decorativo opcional da categoria.
- **Estado de região**: carregando, erro, sem resultados ou sucesso; acompanha uma mensagem, uma indicação de nova tentativa e a região de status que o anuncia.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% das cinco páginas, cada link do cabeçalho e do rodapé leva à página correta, e exatamente um item é identificado como página atual nas páginas que têm item de menu.
- **SC-002**: Uma pessoa que usa apenas o teclado alcança qualquer um dos quatro destinos principais, a partir do carregamento de qualquer página, em até 8 acionamentos da tecla Tab, ou em 1 acionamento do link de pular até o conteúdo principal.
- **SC-003**: Em largura de 320 px e com texto a 200%, 100% das páginas mostram o cabeçalho e o menu sem perda de conteúdo, sobreposição ou rolagem horizontal, e o menu abre e fecha usando só o teclado.
- **SC-004**: Com o menu fechado, 0 links do menu recebem foco por teclado ou são lidos por leitor de tela; com o menu aberto, 100% dos links são alcançáveis.
- **SC-005**: Em todos os conjuntos de dados de teste (completos e com cada campo opcional ausente, isoladamente e em conjunto), 100% dos cards são exibidos sem texto "undefined"/"null", sem imagem quebrada e sem estouro de layout a 320 px.
- **SC-006**: Em todas as listas de teste, 100% dos links principais dos cards têm nome acessível distinto entre si e identificam a atividade.
- **SC-007**: Em 100% das trocas de estado testadas (carregando, sucesso, vazio, erro, nova tentativa), o foco do teclado permanece onde estava, exceto quando o elemento focado é removido, e cada troca gera exatamente um anúncio.
- **SC-008**: Em 100% dos testes de simulação, uma resposta de sucesso sem resultados e uma falha de consulta produzem mensagens diferentes, com e sem "Tentar novamente" conforme o caso, e nunca se confundem.
- **SC-009**: A verificação automática de acessibilidade das cinco páginas, nos estados carregando, erro, vazio e com cards, não aponta violações sem justificativa registrada.
- **SC-010**: Pessoas visitantes conseguem, na primeira tentativa, ir da página inicial à de Sobre e à de Contato e voltar, em tela de celular e de computador, sem ajuda; e qualquer divergência de cabeçalho ou rodapé entre as páginas é detectada automaticamente antes da entrega.

## Assumptions

- O escopo inclui as histórias FE-006 a FE-010 do épico EP-FE-03; o conteúdo próprio de cada página (pesquisa, próximas atividades, filtros, paginação, detalhes, Sobre, Contato) pertence aos épicos EP-FE-05 a EP-FE-08, que usarão estes componentes.
- A estrutura compartilhada aproveita as cinco páginas e módulos já criados nas features 001 e 002 (incluindo o cliente da API e a apresentação de erro), que serão integrados sem reescrita do contrato existente.
- A API pública atual não fornece imagem nos itens de listagem; portanto o fallback de imagem é o caso normal hoje, e o componente deve estar preparado para receber imagem se o contrato mudar. A listagem traz um resumo da atividade, mas o resumo não é obrigatório no card; sua exibição pode ser decidida no planejamento.
- Os links dos cards levam à página de Detalhes identificando a atividade pelo seu identificador (UUID) na própria URL; o formato exato do endereço será definido no planejamento e deve ser compatível com os épicos de detalhes e exploração.
- O ponto de troca entre menu móvel e navegação em linha será definido no planejamento, com base nos wireframes e nas medições de largura; o requisito é o comportamento, não o valor.
- O rótulo "Explorar atividades" é usado como nome completo do item no menu; as demais variações de rótulo ficam a cargo do conteúdo final, desde que consistentes em todas as páginas.
- Os ícones de categoria dependem de uma lista de categorias que ainda não está validada (DOC-11); o componente usa ícone padrão para qualquer categoria sem ícone definido e não mantém uma lista paralela de categorias divergente da API.
- O rodapé não leva links externos nem informações institucionais até que sejam confirmados (DOC-11, DOC-12).
- Datas e horários seguem o contrato da API (fuso America/Sao_Paulo); o frontend não recalcula ocorrências nem regras de negócio.
- O público-alvo é o de visitantes anônimos do site público; não há autenticação, e a administração permanece no Django Admin.
- A meta de acessibilidade é WCAG 2.2 nível AA; verificações automáticas complementam, mas não substituem, a revisão manual com teclado e leitor de tela.
- Dependências do backend: este épico não depende de novos recursos do backend; usa apenas o formato de item de listagem já documentado em `agenda-livre-backend/specs/006-public-consultation/contracts/public-api.md`.
