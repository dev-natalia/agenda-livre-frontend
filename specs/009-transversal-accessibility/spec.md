# Feature Specification: Acessibilidade transversal

**Feature Branch**: `009-transversal-accessibility`

**Created**: 2026-10-12

**Status**: Draft

**Input**: User description: "Épico EP-FE-09 do docs/16-backlog-do-frontend.md (Acessibilidade transversal), que reúne as histórias FE-034 (estrutura semântica e títulos), FE-035 (pular ao conteúdo principal), FE-036 (teclado e foco visível), FE-037 (alternativas textuais), FE-038 (estados dinâmicos para tecnologias assistivas), FE-039 (contraste e estados visuais) e FE-040 (ampliação, reflow e movimento reduzido). Base: todos os documentos em docs/ do frontend (em especial DOC-14 seção 9 e DOC-15) e docs/ e specs/ do backend (agenda-livre-backend), em especial o DOC-05, que define o que a API informa sobre atividades e imagens."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Navegar e operar todo o site apenas com teclado (Priority: P1)

Uma pessoa que não usa mouse percorre as cinco páginas públicas (Início, Explorar, Detalhes, Sobre, Contato) com Tab, Shift+Tab, Enter e Espaço. Logo no primeiro Tab encontra o link "Pular para o conteúdo principal", que aparece na tela ao receber foco e leva ao conteúdo da página em que está. Consegue abrir e fechar o menu móvel, pesquisar e filtrar, paginar, abrir uma atividade, preencher o formulário de contato e usar os links externos, sempre vendo onde está o foco, sem que ele fique escondido atrás do cabeçalho ou de outro elemento, e sem ficar preso em nenhum componente. A ordem do foco acompanha a ordem visual, e links ocultos do menu fechado não entram nessa ordem.

**Why this priority**: Sem teclado funcional, o site fica inutilizável para parte das pessoas, e este é o requisito de base de todos os demais. Os componentes foram construídos nas features anteriores, mas nunca foram verificados em conjunto, de ponta a ponta, em todas as páginas.

**Independent Test**: Em cada uma das cinco páginas, em largura de desktop e de 320 px, concluir as tarefas principais sem tocar no mouse e registrar qualquer ponto em que o foco desapareça, fique encoberto, fique preso ou siga ordem ilógica.

**Acceptance Scenarios**:

1. **Given** qualquer uma das cinco páginas recém-aberta, **When** a pessoa aciona Tab uma vez, **Then** o foco vai para "Pular para o conteúdo principal", que fica visível enquanto focado.
2. **Given** o link de pular focado, **When** a pessoa o aciona, **Then** o foco passa para o conteúdo principal da página atual e o próximo Tab segue para o primeiro controle do conteúdo, sem repassar cabeçalho e menu.
3. **Given** qualquer controle interativo de qualquer página (links, botões, campos, filtros, paginação, cartões, menu), **When** recebe foco, **Then** exibe indicador de foco visível, distinguível do estado normal sem depender só de cor, e não fica totalmente encoberto por cabeçalho fixo, rodapé ou outro conteúdo.
4. **Given** o menu móvel fechado, **When** a pessoa percorre a página com Tab, **Then** os links do menu não recebem foco; **And** com o menu aberto, recebem na ordem visual, e ele pode ser fechado pelo teclado, devolvendo o foco ao botão de menu.
5. **Given** qualquer componente com estado ou conteúdo que muda (filtros, paginação, estados de carregamento, erro e vazio, painel de confirmação do contato), **When** a pessoa o opera só com teclado, **Then** consegue entrar e sair dele sem armadilha de foco e sem perder o ponto em que estava, salvo nos casos em que o foco é movido de propósito e de forma previsível.
6. **Given** os estados de um controle (normal, foco, passagem do mouse, selecionado, desabilitado, com erro), **When** observados, **Then** cada estado é identificável por mais de um indício (forma, texto, sublinhado, borda, ícone) e não apenas pela cor.
7. **Given** a página de Detalhes, **When** a pessoa chega por teclado ao link externo de inscrição ou informações, **Then** o nome do link avisa que abre em nova aba, e abrir o link não retira o foco da página de origem.

---

### User Story 2 - Compreender a estrutura e o conteúdo com leitor de tela (Priority: P1)

Uma pessoa que usa leitor de tela abre qualquer página e entende onde está e como é organizada: o idioma é o português do Brasil, existe um único título principal, os subtítulos formam uma hierarquia lógica, as regiões (cabeçalho, navegação, conteúdo principal, rodapé) são identificadas, o link da página atual é indicado como tal e cada controle tem nome e função corretos. Imagens que informam algo têm alternativa textual equivalente; imagens decorativas e ícones decorativos passam em silêncio; atividades sem imagem mostram o fundo da identidade visual sem ícone quebrado e sem anúncio desnecessário.

**Why this priority**: É a base para qualquer uso com tecnologia assistiva, e o texto alternativo e a estrutura são critérios de nível A. Depende dos mesmos componentes verificados na Story 1, mas entrega valor independente.

**Independent Test**: Percorrer cada página com leitor de tela e pela lista de títulos e regiões, conferir idioma, título principal único, ordem dos subtítulos, nomes dos controles, página atual e anúncios de imagens e ícones; conferir cartões e Detalhes com e sem imagem.

**Acceptance Scenarios**:

1. **Given** qualquer uma das cinco páginas, **When** é aberta, **Then** declara o idioma português do Brasil, tem título de documento próprio e específico, e um único título principal.
2. **Given** qualquer página, **When** os títulos são listados, **Then** formam hierarquia lógica, sem níveis pulados e sem títulos usados só pela aparência; e textos que são só visuais não são títulos.
3. **Given** qualquer página, **When** as regiões são listadas, **Then** existem cabeçalho, navegação identificada, conteúdo principal único e rodapé, cada um usado de acordo com sua função, e nada que seja apenas decorativo ou repetitivo é exposto como região.
4. **Given** cada item da navegação principal e do rodapé, **When** é lido, **Then** tem nome claro, e o item da página atual é indicado de forma programática, não só visual.
5. **Given** controles interativos (botões, campos, filtros, paginação, menu), **When** lidos, **Then** têm nome, função e estado corretos (expandido/recolhido, página atual, desabilitado, inválido), expressos com os elementos nativos adequados, e com atributos complementares apenas quando o elemento nativo não basta.
6. **Given** uma imagem que traz informação, **When** lida, **Then** tem alternativa textual equivalente à sua finalidade, sem repetir automaticamente o título da atividade quando isso não informa nada.
7. **Given** uma imagem decorativa, um ícone decorativo ou o fundo de fallback de uma atividade sem imagem, **When** a página é lida, **Then** não é anunciado e não aparece ícone quebrado.
8. **Given** qualquer link ou botão, **When** é lido fora do contexto (por exemplo, na lista de links), **Then** seu nome identifica o destino ou a ação (por exemplo, inclui o título da atividade), sem textos vagos como "clique aqui" ou "saiba mais" isolados.

---

### User Story 3 - Ser informada sobre carregamento, resultados e erros sem perder o foco (Priority: P1)

Uma pessoa que usa leitor de tela filtra atividades, pagina, abre uma atividade ou perde a conexão. A página informa, em mensagens curtas e objetivas, que está carregando, quantas atividades foram encontradas (quando a API informa o total), que nada foi encontrado ou que ocorreu uma falha, e como tentar de novo. Cada mensagem é anunciada uma única vez, sem deslocar o foco da pessoa. Os placeholders de carregamento (esqueletos) nunca são lidos como se fossem resultados. "Nenhum resultado" e "erro técnico" são estados diferentes, com textos diferentes. O mesmo vale para o formulário de contato com erros e para o painel de confirmação.

**Why this priority**: É o critério de acessibilidade mais frequentemente quebrado em páginas que atualizam conteúdo sem recarregar, e o site depende disso em Início, Explorar, Detalhes e Contato. É P1 porque sem esse retorno a pessoa não sabe se a ação funcionou.

**Independent Test**: Com leitor de tela e com a inspeção de regiões de aviso, provocar cada estado (carregando, com resultados, vazio, erro com nova tentativa, formulário com erros, confirmação) em cada página que o tenha e conferir o que é anunciado, quantas vezes e para onde vai o foco.

**Acceptance Scenarios**:

1. **Given** uma busca ou mudança de página em Início, Explorar ou Detalhes, **When** a carga começa, **Then** uma mensagem curta de carregamento é anunciada, os esqueletos visuais são ocultados das tecnologias assistivas e o foco não se move.
2. **Given** uma carga concluída com resultados, **When** termina, **Then** é anunciada uma única mensagem de conclusão, com a quantidade de atividades apenas quando a API a informar de forma confiável, e o foco continua onde estava.
3. **Given** uma busca sem resultados, **When** a resposta chega, **Then** a mensagem explica que nenhuma atividade foi encontrada e sugere ajustar ou limpar filtros, em texto diferente do de erro técnico.
4. **Given** uma falha de comunicação com a API, **When** ocorre, **Then** a mensagem de erro é anunciada, diferente da de ausência de resultados, a ação de tentar de novo está disponível e operável por teclado, e o foco permanece onde estava.
5. **Given** a mesma mensagem mantida na tela por mais de uma atualização (por exemplo, a mesma busca repetida), **When** o conteúdo é atualizado, **Then** a mensagem não é anunciada em duplicidade nem acumulada.
6. **Given** o formulário de contato enviado com erros, **When** os erros aparecem, **Then** o resumo é anunciado uma vez e o foco vai para o primeiro campo inválido; **And** ao enviar com sucesso, o painel de confirmação é anunciado e o foco vai para ele de modo previsível.
7. **Given** a página de Detalhes de uma atividade inexistente ou indisponível, **When** a resposta chega, **Then** a página comunica o estado em texto claro, anunciado sem mover o foco, com um caminho de volta à listagem.

---

### User Story 4 - Ler textos e identificar controles com baixa visão (Priority: P2)

Uma pessoa com baixa visão lê os textos de todas as páginas sem esforço indevido e identifica claramente links, botões, campos, filtros, o item da página atual, mensagens de erro, estados de foco, seleção e desabilitado. Quando a verificação mostra que uma combinação de cores da identidade visual não é suficiente em algum estado real, a cor é ajustada o mínimo possível, preservando o caráter da marca.

**Why this priority**: Contraste é um critério de nível AA e a identidade visual definiu a paleta antes de conhecer todos os estados reais, então é provável que algumas combinações precisem de ajuste. É P2 porque a navegação e a leitura por tecnologia assistiva têm precedência, mas é P0 no backlog do projeto e entra na entrega.

**Independent Test**: Medir, com ferramenta de contraste, todas as combinações reais de texto e fundo e de componente e entorno, em todos os estados de cada controle, nas cinco páginas e nos fundos de fallback; registrar a razão obtida e a mínima exigida, e corrigir o que ficar abaixo.

**Acceptance Scenarios**:

1. **Given** todo texto exibido em qualquer página, **When** o contraste com o fundo real é medido, **Then** é de pelo menos 4,5:1 para texto comum e 3:1 para texto grande, incluindo textos sobre imagens, selos, mensagens de erro e texto desabilitado quando este precisa ser lido.
2. **Given** bordas de campos, indicadores de foco, ícones informativos e demais componentes necessários para identificar uma interface, **When** medidos contra o entorno, **Then** atingem pelo menos 3:1.
3. **Given** cada estado dos controles (normal, foco, passagem do mouse, selecionado, desabilitado, erro), **When** verificado individualmente, **Then** cada combinação real atende ao critério aplicável, e não apenas as cores-base dos tokens.
4. **Given** um link no meio de um texto, **When** observado, **Then** é distinguível do texto ao redor por mais de uma característica, e não apenas pela cor.
5. **Given** que uma combinação falhe, **When** a cor é corrigida, **Then** o ajuste é feito de forma centralizada e coerente nas cinco páginas, mantém a identidade visual tanto quanto possível, e a medição é refeita.

---

### User Story 5 - Ampliar o texto, reorganizar o layout e reduzir movimento (Priority: P2)

Uma pessoa que amplia o texto até 200%, usa uma tela estreita de 320 px de largura equivalente, aplica espaçamento de texto aumentado ou prefere menos movimento continua usando todas as páginas sem perder conteúdo nem função: nada se sobrepõe, nada é cortado, não há rolagem horizontal desnecessária e animações e transições não essenciais são removidas ou reduzidas.

**Why this priority**: Critérios AA importantes para pessoas com baixa visão e sensibilidade a movimento. O site já foi desenhado de forma responsiva, e esta story confirma isso em todos os estados reais, incluindo erros e resultados longos.

**Independent Test**: Para cada página e estado relevante, ampliar o texto a 200%, abrir em largura de 320 px, aplicar as configurações de espaçamento da WCAG 2.2 e ativar a preferência por movimento reduzido; registrar qualquer perda ou sobreposição.

**Acceptance Scenarios**:

1. **Given** qualquer página, **When** o texto é ampliado a 200%, **Then** todo o conteúdo e as funções permanecem disponíveis, sem sobreposição nem corte.
2. **Given** qualquer página em largura equivalente a 320 pixels CSS, **When** exibida, **Then** o conteúdo se reorganiza em uma coluna sem rolagem em duas dimensões, salvo exceções previstas pela WCAG (por exemplo, conteúdo que exige disposição bidimensional).
3. **Given** as configurações de espaçamento de texto da WCAG 2.2 aplicadas (linhas, parágrafos, letras e palavras), **When** a página é exibida, **Then** nada é cortado, sobreposto ou escondido, em especial em botões, cartões, filtros, menu e formulário.
4. **Given** o formulário de contato com todos os erros exibidos, os filtros com opções de nome longo e resultados com títulos longos, **When** vistos a 200% e em 320 px, **Then** mensagens e rótulos quebram linha e permanecem visíveis.
5. **Given** a preferência do sistema por movimento reduzido ativa, **When** a pessoa usa o site, **Then** transições, rolagens animadas e animações não essenciais são removidas ou reduzidas, sem perder nenhuma informação nem função.
6. **Given** o navegador, **When** a página é aberta, **Then** a ampliação pelo navegador não é impedida em nenhum caso.

---

### User Story 6 - Ter um registro verificável da acessibilidade e das limitações (Priority: P2)

Quem mantém o projeto e quem o avalia (equipe e banca acadêmica) consegue consultar, em um só lugar, o que foi verificado, onde, como, com que resultado, o que foi corrigido e o que permanece como limitação conhecida. O registro segue o DOC-14 (seção 9) e o DOC-15 (seção 7.3) e não declara conformidade integral: informa o que foi verificado e o que não foi.

**Why this priority**: Acessibilidade sem evidência não pode ser avaliada nem mantida; o DOC-14 e o DOC-15 exigem esse registro. É P2 porque depende de as correções das stories anteriores já estarem feitas, mas é parte obrigatória da entrega do épico.

**Independent Test**: Ler apenas o registro e conseguir responder: quais páginas e estados foram avaliados, em que navegador e com qual tecnologia assistiva, quais critérios foram testados, quais problemas foram achados, quais foram corrigidos e quais ficaram pendentes e por quê.

**Acceptance Scenarios**:

1. **Given** o registro, **When** consultado, **Then** lista as cinco páginas e os estados dinâmicos avaliados (carregada, menu móvel aberto, resultados, nenhum resultado, erro da API, formulário com erros, painel de confirmação).
2. **Given** o registro, **When** consultado, **Then** informa o navegador e a tecnologia assistiva usados em cada verificação manual e indica, para cada critério (lista dos documentos), se foi testado, o resultado e quem testou.
3. **Given** um problema encontrado, **When** consta no registro, **Then** descreve o problema, o critério afetado, a correção feita ou, se não corrigido, a justificativa e a mitigação.
4. **Given** uma exceção a uma regra (por exemplo, um alerta automático aceito), **When** registrada, **Then** consta o escopo, a razão e a alternativa de mitigação; nenhum alerta é ignorado só para obter uma execução limpa.
5. **Given** o registro, **When** lido, **Then** deixa claro que as verificações automáticas e manuais contribuem para a avaliação mas não equivalem a certificação, e registra as dependências conhecidas da API (por exemplo, atividades sem imagem, total de resultados, distinção entre atividade inexistente e indisponível).
6. **Given** as verificações automáticas, **When** executadas, **Then** cobrem as cinco páginas e os estados dinâmicos listados e falham se uma violação nova aparecer, de modo que uma regressão seja percebida antes da entrega.

---

### Edge Cases

- Página aberta diretamente por URL (sem passar pela anterior) ou recarregada: o link de pular, os títulos e as regiões estão corretos desde o primeiro carregamento, sem depender de script para existir.
- JavaScript lento ou com falha: o conteúdo estático das páginas (estrutura, títulos, link de pular, rodapé) permanece utilizável e não exibe controles que prometem algo que não funciona.
- Menu móvel aberto e a pessoa redimensiona a janela até a largura de desktop (ou o contrário): o estado de expandido e a ordem de foco permanecem coerentes e nenhum link fica inacessível.
- Cabeçalho que ocupa espaço da tela ao rolar: o foco por teclado em itens perto da borda não fica encoberto, e o salto para âncoras não esconde o título de destino.
- Atividade sem nenhuma imagem (caso normal hoje, pois a API não fornece imagem): o fundo de fallback é usado em todos os cartões e na página de Detalhes, sem ícone quebrado, sem anúncio e com contraste suficiente nos textos sobre ele.
- Título de atividade muito longo, sem espaços ou com muitos caracteres: não estoura o contêiner, não sobrepõe elementos e continua legível a 200% e em 320 px.
- Muitos resultados ou muitas páginas: a paginação continua operável por teclado, informa a página atual e não obriga a percorrer dezenas de links desnecessários.
- Total de resultados indisponível na API: a mensagem de quantidade não é anunciada; o restante da comunicação de estado continua funcionando.
- Mesma mensagem de estado repetida em sequência (nova busca idêntica): não é anunciada em duplicidade nem fica oculta de quem não a ouviu.
- Alto contraste do sistema operacional ou cores forçadas: texto, bordas e indicadores de foco continuam visíveis e os estados não dependem de cor de fundo para existir.
- Zoom do navegador a 400% (reflow) ou texto ampliado só pela configuração do navegador: o comportamento é o mesmo de 200%, sem perda de função.
- Preferência por movimento reduzido ativada durante o uso: o site passa a respeitá-la sem recarregar, quando o navegador o permitir.
- Navegação por histórico do navegador: o foco inicial é previsível e a página restaurada mantém título, idioma e regiões corretos.
- Verificação automática limpa mas com problema manual (por exemplo, nome de link vago, foco ilógico): o problema é registrado e corrigido mesmo assim, pois a ferramenta automática não é critério suficiente.

## Requirements *(mandatory)*

### Functional Requirements

**Estrutura semântica e títulos (FE-034)**

- **FR-001**: Todas as cinco páginas públicas MUST declarar o idioma português do Brasil, ter título de documento próprio e específico, e exatamente um título principal.
- **FR-002**: A hierarquia de títulos de cada página MUST seguir a estrutura do conteúdo, sem níveis pulados nem títulos usados apenas pelo efeito visual, e o mesmo vale para o conteúdo gerado dinamicamente (cartões, estados, painéis).
- **FR-003**: Cada página MUST usar os elementos semânticos de acordo com a função (cabeçalho, navegação identificada, conteúdo principal único, rodapé, listas para listas, tabelas só para dados tabulares), e controles interativos MUST ser implementados com elementos nativos adequados.
- **FR-004**: Atributos de acessibilidade complementar MUST ser usados apenas quando o elemento nativo não expressa nome, função ou estado, e MUST nunca contradizer a semântica nativa.
- **FR-005**: Todo link e todo botão MUST ter nome acessível claro que identifique destino ou ação mesmo fora de contexto, e a página atual MUST ser indicada programaticamente na navegação.
- **FR-006**: Campos de formulário MUST ter rótulo visível associado e as instruções necessárias associadas ao campo; estados como expandido, selecionado, desabilitado e inválido MUST ser expostos às tecnologias assistivas.

**Pular ao conteúdo principal (FE-035)**

- **FR-007**: Cada página MUST ter, como primeiro item na ordem de foco, o link "Pular para o conteúdo principal", que MUST ficar visível ao receber foco.
- **FR-008**: O link MUST levar ao conteúdo principal da página atual e, após acioná-lo, o foco MUST continuar a partir do conteúdo principal, não do início da página.

**Teclado e foco visível (FE-036)**

- **FR-009**: Todas as funções essenciais das cinco páginas (menu, pesquisa, filtros, paginação, abertura de atividade, links externos, formulário de contato e ação de tentar de novo) MUST ser operáveis apenas com teclado e sem armadilha de foco.
- **FR-010**: A ordem do foco MUST preservar sentido e operabilidade e seguir a ordem visual; elementos fora da tela, ocultos ou de menu fechado MUST NOT receber foco.
- **FR-011**: O indicador de foco MUST ser visível em todos os controles, em todos os fundos e tamanhos de tela, e MUST NOT ficar totalmente encoberto por outro conteúdo.
- **FR-012**: Estados de interação (foco, seleção, erro, desabilitado, página atual) MUST ser identificáveis por mais de um indício e MUST NOT depender exclusivamente de cor.
- **FR-013**: Quando o foco é movido pelo site (painel de confirmação, primeiro campo inválido, retorno ao formulário, fechamento do menu), o destino MUST ser previsível, documentado e consistente nas páginas em que o padrão se repete.

**Alternativas textuais (FE-037)**

- **FR-014**: Imagens informativas MUST ter alternativa textual equivalente à sua finalidade; imagens e ícones decorativos MUST ser ignorados pelas tecnologias assistivas; o texto alternativo MUST NOT repetir mecanicamente o título da atividade sem avaliar a finalidade da imagem.
- **FR-015**: Atividades sem imagem (caso normal enquanto a API não fornecer imagem) MUST exibir o fundo de fallback da identidade visual, sem ícone quebrado e sem anúncio desnecessário, e o componente MUST continuar apto a exibir uma imagem informativa quando houver, sem exigir mudança na acessibilidade.
- **FR-016**: Links externos MUST informar de forma acessível, no próprio nome do link, que abrem em nova aba, e MUST NOT prender nem desorientar a pessoa.

**Estados dinâmicos (FE-038)**

- **FR-017**: Carregamento, conclusão, quantidade de resultados (apenas quando o total vier de forma confiável da API), ausência de resultados, erro e nova tentativa MUST ser comunicados às tecnologias assistivas por mensagens objetivas, sem repetição desnecessária.
- **FR-018**: Atualizações de conteúdo MUST NOT deslocar o foco apenas por terem ocorrido; o foco só é movido nos casos previstos no FR-013.
- **FR-019**: Esqueletos de carregamento MUST NOT ser expostos como conteúdo real.
- **FR-020**: Ausência de resultados e erro técnico MUST ser apresentados e comunicados como estados distintos, com textos diferentes.
- **FR-021**: A ação de nova tentativa MUST permanecer disponível e operável por teclado depois de um erro, e a comunicação de erro MUST ser mantida sem mover o foco.
- **FR-022**: As regras de comunicação de estado MUST ser as mesmas em Início, Explorar, Detalhes e Contato, para que o comportamento seja previsível entre páginas.

**Contraste e estados visuais (FE-039)**

- **FR-023**: Todas as combinações reais de texto e fundo MUST atender aos contrastes de texto aplicáveis da WCAG 2.2 AA (4,5:1 para texto comum, 3:1 para texto grande), incluindo textos sobre o fundo de fallback e mensagens de erro.
- **FR-024**: Bordas de controles, indicadores de foco, ícones informativos e demais elementos necessários para identificar componentes e estados MUST atender ao contraste não textual aplicável (3:1).
- **FR-025**: Links, foco, erro, seleção e desabilitado MUST ser identificáveis nos estados reais de cada componente, e não apenas nas cores-base da paleta; links dentro de texto MUST ser distinguíveis do texto por mais de uma característica.
- **FR-026**: Cores que não atenderem MUST ser ajustadas de modo centralizado, preservando a identidade visual tanto quanto possível, e a medição MUST ser refeita depois do ajuste.

**Ampliação, reflow e movimento (FE-040)**

- **FR-027**: O texto MUST poder ser ampliado até 200% em todas as páginas e estados sem perda de conteúdo nem função, e o site MUST NOT impedir a ampliação pelo navegador.
- **FR-028**: Em largura equivalente a 320 pixels CSS, cada página MUST se reorganizar sem rolagem em duas dimensões, respeitadas as exceções da WCAG.
- **FR-029**: As configurações de espaçamento de texto previstas na WCAG 2.2 MUST NOT causar perda de conteúdo ou função, em especial em botões, cartões, filtros, menu, paginação e formulário.
- **FR-030**: Com a preferência por movimento reduzido ativa, transições, animações e rolagens animadas não essenciais MUST ser removidas ou reduzidas, sem perda de informação nem de função.

**Verificação, evidência e prevenção de regressão**

- **FR-031**: As verificações automáticas de acessibilidade MUST cobrir as cinco páginas e os estados dinâmicos do DOC-14 §9.1 (página carregada, menu móvel aberto, resultados, nenhum resultado, erro da API, formulário com erros, painel de confirmação), em largura de desktop e de 320 px, e MUST falhar diante de violação nova.
- **FR-032**: Cada violação encontrada MUST ser corrigida ou registrada como exceção justificada, com escopo, razão e mitigação; MUST NOT haver alerta desativado só para obter execução verde.
- **FR-033**: As verificações manuais (teclado, leitor de tela, contraste, ampliação, reflow, espaçamento, movimento reduzido) do DOC-14 §9 e do checklist do DOC-15 MUST ser executadas e registradas nas cinco páginas e estados relevantes.
- **FR-034**: Um registro de acessibilidade MUST consolidar: páginas e estados avaliados, navegadores e tecnologias assistivas usados, critérios testados, problemas encontrados, correções feitas e limitações conhecidas, incluindo as dependências da API apontadas no DOC-15 §8.
- **FR-035**: O registro MUST NOT declarar conformidade integral nem usar o resultado de ferramentas automáticas como prova de conformidade; MUST indicar o que não foi verificado.
- **FR-036**: As correções MUST NOT alterar o comportamento funcional já entregue nas features 001 a 008 nem exigir mudança no backend; qualquer limitação que dependa da API MUST ser registrada como dependência e, quando for uma divergência de contrato, em `docs/PENDENCIAS-BACKEND.md`.

### Key Entities *(include if feature involves data)*

- **Critério de acessibilidade**: um requisito verificável derivado do DOC-15 (por exemplo, contraste de texto, foco visível, mensagens de status), com nível (A ou AA), classificação (critério, recomendação ou decisão de projeto) e forma de verificação (automática, manual ou ambas).
- **Verificação**: a execução de um critério sobre uma página e um estado, com o ambiente usado (navegador, tecnologia assistiva, largura), o resultado (conforme, não conforme, não aplicável, não verificado) e a evidência.
- **Problema de acessibilidade**: uma não conformidade encontrada, ligada a um critério e a uma página/estado, com gravidade, correção aplicada ou justificativa e mitigação quando não corrigida.
- **Registro de acessibilidade**: o conjunto consolidado de verificações, problemas, exceções e limitações da entrega, consultável por quem mantém e por quem avalia o projeto.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% das cinco páginas, uma pessoa consegue concluir a tarefa principal (início: abrir uma atividade; Explorar: filtrar e abrir uma atividade; Detalhes: ler e abrir o link externo; Sobre: ler e chegar a Explorar; Contato: preencher, corrigir erros e concluir) usando apenas o teclado, sem armadilha e sem perder de vista o foco.
- **SC-002**: Em 100% das páginas, o primeiro Tab leva ao link de pular, e acioná-lo leva ao conteúdo principal em um passo.
- **SC-003**: Em 100% dos estados dinâmicos avaliados (carregando, resultados, vazio, erro, formulário com erros, confirmação), a informação chega à pessoa que usa leitor de tela, uma única vez e sem mover o foco; ausência de resultados e erro técnico são sempre distintos.
- **SC-004**: 0 violações automáticas não justificadas nas cinco páginas e em todos os estados do DOC-14 §9.1, em largura de desktop e de 320 px; toda exceção registrada tem escopo, razão e mitigação.
- **SC-005**: 100% das combinações de texto e fundo e de componente e entorno medidas, em todos os estados, atingem o contraste exigido (4,5:1 texto comum, 3:1 texto grande e componentes), ou têm correção aplicada e nova medição registrada.
- **SC-006**: Em 100% das páginas e estados avaliados, a 200% de ampliação, a 320 px de largura e com espaçamento de texto aumentado, não há perda de conteúdo, sobreposição, corte nem rolagem horizontal desnecessária.
- **SC-007**: Com movimento reduzido ativo, 0 transições ou animações não essenciais permanecem em qualquer das cinco páginas.
- **SC-008**: Toda imagem informativa tem alternativa equivalente, e 0 imagens decorativas, ícones decorativos ou fundos de fallback são anunciados por leitor de tela nas amostras avaliadas.
- **SC-009**: Pelo menos 90% das pessoas usuárias de tecnologia assistiva ou teclado convidadas para um teste breve concluem a tarefa principal da página que lhes for atribuída sem ajuda e dizem ter entendido o que mudou na tela após cada ação.
- **SC-010**: O registro de acessibilidade permite a uma pessoa que não participou das verificações responder, em até 10 minutos, o que foi avaliado, como, com que resultado e o que ficou pendente; nenhuma afirmação do registro excede o que foi realmente verificado.
- **SC-011**: As verificações automáticas rodam por completo a cada execução da suíte de testes e uma regressão introduzida de propósito (por exemplo, remover um rótulo ou reduzir um contraste) é detectada antes da entrega.

## Assumptions

- A feature cobre as histórias FE-034 a FE-040 do épico EP-FE-09. Os requisitos de acessibilidade das histórias funcionais já foram atendidos nas features 003 a 008 e continuam valendo; esta feature os revisa em conjunto, fecha lacunas encontradas e produz a evidência, sem reabrir o escopo funcional dessas features.
- Esta feature é principalmente de verificação e correção: o esperado é encontrar e corrigir problemas pontuais, mais do que construir funcionalidades novas. O conteúdo exato das correções depende do que a auditoria revelar e será detalhado no planejamento.
- O épico EP-FE-10 (testes e qualidade) permanece separado. Aqui entram apenas as verificações de acessibilidade (automáticas e manuais) e seu registro, e as ferramentas já em uso no projeto (testes unitários, testes de navegador com verificação automática de acessibilidade) são reaproveitadas.
- As verificações manuais com leitor de tela serão feitas com pelo menos uma combinação disponível no ambiente da equipe (navegador e leitor de tela), registrada no relatório; combinações adicionais ampliam a cobertura, mas não são requisito de aceite. Testes com pessoas usuárias de tecnologia assistiva (SC-009) são desejáveis e, se não houver participantes, o registro informa a limitação, sem preencher o critério por inferência.
- A meta é WCAG 2.2 nível AA, conforme o DOC-15. O resultado não constitui certificação nem parecer jurídico, e o registro diz isso.
- A API não fornece imagem para atividades, de modo que o fallback visual é o caso normal; a acessibilidade das imagens informativas é garantida no componente para quando o dado existir (pendência já registrada em `docs/PENDENCIAS-BACKEND.md`).
- A quantidade total de resultados só é comunicada quando a API a informa de forma confiável (DOC-15 §8); a distinção entre atividade inexistente e indisponível depende do que a API informa com segurança, e o frontend usa apenas essa informação.
- Contraste é avaliado nas combinações reais usadas nas páginas, em todos os estados; se for necessário ajustar uma cor da paleta (DOC-10), o ajuste é aplicado de forma centralizada e registrado, sem redesenhar a identidade visual.
- Não há mudanças no backend; qualquer divergência de contrato achada durante a auditoria é registrada em `docs/PENDENCIAS-BACKEND.md`.
- Os dados usados nas verificações são sintéticos; nenhum dado pessoal real é usado nem registrado no relatório.
