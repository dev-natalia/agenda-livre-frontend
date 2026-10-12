# Feature Specification: Refinamento visual do frontend

**Feature Branch**: `011-visual-refinement`

**Created**: 2026-10-12

**Status**: Draft

**Input**: User description: "Usar o documento docs/18-backlog-refinamento-visual-frontend.md (histórias VIS-001 a VIS-024, épicos EP-VIS-01 a EP-VIS-07) como base da feature. Ler todos os documentos dentro de docs/, incluindo a imagem docs/Guia de Marca Agenda Livre.png (guia da marca, logo e ícone, que serão usados no site). Informações do backend em ../agenda-livre-backend (docs/ e specs/)."

## Contexto

As features 001 a 010 entregaram um frontend completo e testado: cinco páginas (Início, Explorar, Detalhes, Sobre e Contato), identidade visual com tokens, responsividade, acessibilidade transversal e uma suíte de testes ampla. **Esta feature não reconstrói nada disso.** Ela melhora a apresentação visual: largura útil, hierarquia, composição das seções, acabamento de cabeçalho, rodapé, busca, cards, estados e formulários, e aplica a marca oficial (logo, ícone, paleta e tipografia) do guia de marca `docs/Guia de Marca Agenda Livre.png`.

Hoje a marca aparece no cabeçalho apenas como o texto "Agenda Livre", sem logo nem ícone de aba; o conteúdo é estreito em telas grandes; a busca da página inicial parece um conjunto de campos soltos; e há pouca diferenciação entre seções. O guia de marca mostra o resultado esperado: logo tipográfico azul com detalhe de raios laranja e amarelo, ícone quadrado "A" para favicon, variação do logo para fundo escuro, paleta (azul `#1E40AF`, azul vivo `#2563EB`, laranja `#F97316`, amarelo `#FACC15`, fundo `#F8FAFC`, texto `#1F2937`), Poppins nos títulos e Inter nos textos, botões primário, de destaque e contornado, ícones de localização, data e hora, público, categoria e duração, e protótipos de início e Explorar em desktop e celular.

O guia é **referência de direção**, não especificação pixel a pixel (DOC-10 §11). Elementos do guia que exigiriam funcionalidade nova (botão de favoritar nos cards, ordenação dos resultados, contador de atividades encontradas, menu de filtros em lista suspensa, carrossel indicador, ícone de busca no cabeçalho, foto real do prédio no hero) **não** fazem parte desta feature, e ficam registrados como fora do escopo.

Os atores são **a pessoa visitante** (que usa o site em celular, tablet e desktop, inclusive com teclado, ampliação ou leitor de tela) e **a pessoa responsável pelo projeto** (que avalia se o refinamento melhorou a apresentação sem regressões). O backend não é alterado: contratos, endpoints e o campo `image` (`{url, alt, decorative}` ou `null`, já tratado na feature 010) continuam como estão; a análise dos documentos e specs do backend não revelou nenhuma exigência nova para o frontend.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Reconhecer a marca e navegar com um cabeçalho e rodapé acabados (Priority: P1)

A pessoa visitante abre qualquer uma das cinco páginas e vê a marca oficial do Agenda Livre (logo no cabeçalho, ícone na aba do navegador), uma navegação bem alinhada com a página atual evidente, e um rodapé que parece parte do mesmo produto. Cabeçalho, conteúdo e rodapé compartilham o mesmo alinhamento horizontal, e o conteúdo aproveita melhor a largura em telas grandes, sem criar linhas de leitura longas demais.

**Why this priority**: A marca e a estrutura global aparecem em todas as páginas; é a base do refinamento (VIS-001, VIS-004, VIS-005) e o recorte que mais muda a percepção do site, mesmo sem tocar nas demais histórias.

**Independent Test**: Abrir as cinco páginas em 320, 768 e 1440 pixels CSS e conferir logo, ícone da aba, alinhamento de cabeçalho/conteúdo/rodapé, item ativo evidente, menu móvel funcionando e ausência de rolagem horizontal.

**Acceptance Scenarios**:

1. **Given** qualquer página, **When** carregada, **Then** o cabeçalho exibe o logo oficial como link para o Início, com nome acessível "Agenda Livre", e a aba do navegador exibe o ícone oficial.
2. **Given** uma tela de desktop larga, **When** a página é exibida, **Then** cabeçalho, conteúdo principal e rodapé compartilham o mesmo eixo horizontal, e a largura útil de Início e Explorar acomoda seus elementos com equilíbrio.
3. **Given** as páginas de leitura (Sobre e Detalhes), **When** exibidas em desktop, **Then** o texto corrido mantém largura de leitura confortável, menor que a largura geral.
4. **Given** a página atual, **When** o cabeçalho é exibido, **Then** o item correspondente é evidente sem depender só da cor, e a separação entre cabeçalho e conteúdo é visualmente clara.
5. **Given** uma tela estreita, **When** a pessoa usa o botão Menu, **Then** `aria-expanded`, a ordem de foco e o link "Pular para o conteúdo principal" continuam funcionando como antes.
6. **Given** uma página curta, **When** exibida, **Then** o rodapé fica ao final da janela sem sobreposição, com links legíveis e fáceis de acionar também em tela estreita.

---

### User Story 2 - Pesquisar a partir de uma página inicial com identidade e hierarquia (Priority: P1)

A pessoa visitante chega ao Início e entende rapidamente a proposta do site: título e subtítulo formam um bloco coerente, a ilustração complementa o texto, a busca aparece como uma área única e organizada (campo, filtros e ação "Explorar" como botão principal) e a seção de próximas atividades tem título, introdução e "Ver todas" com hierarquia clara.

**Why this priority**: É a primeira impressão e a porta de entrada da tarefa principal (encontrar atividades). Cobre VIS-006 a VIS-009 e o ritmo/hierarquia de VIS-002 e VIS-003.

**Independent Test**: No Início, em 320, 375, 768, 1024 e 1440 pixels CSS, conferir a composição do hero, o agrupamento da busca, o destaque do botão principal e a seção de próximas atividades; enviar uma busca e confirmar que os parâmetros recebidos pela página Explorar são os mesmos de antes.

**Acceptance Scenarios**:

1. **Given** o Início em desktop, **When** exibido, **Then** o título é o elemento textual de maior destaque, o subtítulo o acompanha e a ilustração decorativa fica equilibrada ao lado do texto sem disputar atenção e sem anúncio por leitor de tela.
2. **Given** o Início em tela estreita, **When** exibido, **Then** texto e ilustração se reorganizam sem apertar o título nem criar rolagem horizontal.
3. **Given** a área de busca, **When** exibida, **Then** campo de texto, filtros e ação formam um grupo visual delimitado, com rótulos acima dos campos, sem excesso de caixas dentro de caixas, e "Explorar" se destaca como ação principal.
4. **Given** a busca em tela estreita, **When** exibida, **Then** os controles ocupam a largura disponível em ordem natural.
5. **Given** o botão principal, **When** em repouso, em hover, em foco, pressionado ou desabilitado, **Then** cada estado é distinguível sem depender só da cor, o texto tem contraste suficiente e a área de acionamento atende ao tamanho mínimo.
6. **Given** a seção de próximas atividades, **When** exibida com três cards, um card, esqueletos, estado vazio ou erro, **Then** título, introdução e "Ver todas" mantêm hierarquia clara e espaçamento consistente em relação à busca e ao rodapé.
7. **Given** uma busca enviada, **When** a página Explorar abre, **Then** os parâmetros da URL e o comportamento do formulário são idênticos aos anteriores ao refinamento.

---

### User Story 3 - Comparar atividades em cards consistentes e entender os estados (Priority: P1)

A pessoa visitante vê cards de atividade com hierarquia previsível (imagem ou fallback, categoria, título, unidade, data), etiquetas de categoria proporcionais, e estados vazio, de carregamento e de erro que parecem parte da interface e continuam distinguíveis entre si, inclusive em escala de cinza.

**Why this priority**: Os cards e os estados de conteúdo são o conteúdo central do site e aparecem em Início e Explorar (VIS-010 a VIS-013).

**Independent Test**: Exibir listas com muitos cards, cards com título longo, sem imagem, com imagem informativa e decorativa, e forçar os estados vazio, carregamento e erro; conferir alinhamento, quebra de texto, foco e diferenciação dos estados.

**Acceptance Scenarios**:

1. **Given** cards em uma mesma linha com textos de comprimentos diferentes, **When** exibidos, **Then** mantêm alinhamento consistente e títulos longos quebram sem transbordar.
2. **Given** um card, **When** a pessoa navega por teclado, **Then** há uma única parada de foco no link esticado, com foco claramente visível, também em tela estreita.
3. **Given** um card com imagem, sem imagem (fallback) ou com imagem decorativa, **When** exibido, **Then** o layout não quebra e a imagem decorativa continua sem texto alternativo.
4. **Given** a etiqueta de categoria, **When** exibida em Início, Explorar e Detalhes, **Then** tem o mesmo tratamento, o nome da categoria continua escrito e o contraste é suficiente. A etiqueta tem cor própria por categoria, como no guia de marca (por exemplo Dança roxa, Esporte verde, Artes vermelha, Música azul); categorias sem cor definida usam a cor neutra padrão, e cada cor atinge o contraste mínimo entre texto e fundo.
5. **Given** uma consulta sem resultados, **When** exibida, **Then** o estado vazio tem mensagem principal em destaque, orientação complementar legível e forma de painel consistente com os demais estados.
6. **Given** os estados vazio, de carregamento e de erro, **When** vistos em escala de cinza, **Then** continuam distinguíveis entre si; o erro mantém a ação "Tentar novamente" com aparência de botão primário e as mensagens acessíveis existentes são preservadas.
7. **Given** os esqueletos de carregamento, **When** exibidos, **Then** têm dimensões coerentes com os cards que substituem e nenhuma animação quando a pessoa prefere movimento reduzido.

---

### User Story 4 - Usar botões, campos e superfícies consistentes em todas as páginas (Priority: P2)

A pessoa visitante reconhece ações principais, secundárias e contornadas da mesma forma em qualquer página, preenche campos com altura, borda e foco consistentes, e vê sombras e bordas usadas com moderação, com a paleta e a tipografia do guia de marca aplicadas de forma uniforme.

**Why this priority**: Harmoniza os componentes que as histórias anteriores apenas tocam (VIS-014 a VIS-016) e garante que o resultado não pareça estilizado página a página.

**Independent Test**: Percorrer as cinco páginas e comparar botões, campos, links em texto, foco e sombras de componentes equivalentes; verificar contraste dos pares de cor e a presença de valores visuais avulsos.

**Acceptance Scenarios**:

1. **Given** botões com o mesmo papel em páginas diferentes, **When** comparados, **Then** têm a mesma aparência e os estados hover, foco, ativo e desabilitado são distinguíveis sem depender só da cor.
2. **Given** links em texto e botões, **When** comparados, **Then** os links continuam reconhecíveis como links e não são confundidos com botões.
3. **Given** campos de texto, seletores e área de texto, **When** exibidos, **Then** têm altura, borda, raio e espaçamento consistentes, rótulos associados visualmente, foco e erro visíveis sem depender só da cor, comportamento nativo e zoom preservados.
4. **Given** qualquer superfície, **When** exibida, **Then** não acumula sombra, borda forte e fundo contrastante sem justificativa, e a borda continua identificando controles quando necessário.
5. **Given** o conjunto de estilos, **When** auditado, **Then** cores, sombras, raios, bordas e durações vêm de valores centralizados e não há valores visuais avulsos sem justificativa.

---

### User Story 5 - Filtrar, ler detalhes e entrar em contato em páginas internas refinadas (Priority: P2)

A pessoa visitante encontra em Explorar uma área de filtros reconhecível como ferramenta de pesquisa e separada dos resultados; em Detalhes, título e metadados em ordem visual clara; em Sobre, blocos bem organizados; e em Contato, um formulário demonstrativo agrupado, com o aviso de demonstração evidente.

**Why this priority**: Leva às páginas internas o mesmo acabamento (VIS-017 a VIS-020). Depende das histórias 1 a 4, que definem os padrões.

**Independent Test**: Em cada página interna, conferir hierarquia e composição em 320 e 1440 pixels CSS; filtrar com todos os critérios, paginar e usar voltar do navegador; abrir uma atividade inexistente; enviar o formulário de contato vazio e preenchido.

**Acceptance Scenarios**:

1. **Given** a página Explorar, **When** exibida, **Then** título, descrição, filtros e ações têm hierarquia clara, a área de filtros fica separada dos resultados, "Filtrar" é a ação principal e "Limpar filtros" a secundária, e o estado de carregamento e o resumo dos resultados continuam claros.
2. **Given** todos os filtros preenchidos em tela estreita, **When** exibidos, **Then** filtros e botões cabem sem sobreposição, e parâmetros, paginação, histórico e estado da URL funcionam como antes.
3. **Given** a página de detalhes, **When** exibida, **Then** título e metadados essenciais vêm antes das informações complementares, data, horário, unidade e local são distinguíveis, a descrição longa mantém largura de leitura confortável, links externos são reconhecíveis e indicam que abrem um site externo, e nenhum dado ausente da API é inventado.
4. **Given** uma atividade não encontrada ou indisponível, **When** a página é exibida, **Then** há um caminho visual claro para voltar à exploração.
5. **Given** a página Sobre, **When** exibida, **Then** seções e subtítulos ficam claramente separados, a largura de leitura é confortável e o convite para explorar atividades é a ação principal; o texto institucional não é reescrito.
6. **Given** a página Contato, **When** exibida, **Then** formulário, aviso de demonstração e campos são agrupados com clareza, o aviso de que nenhuma mensagem será enviada continua evidente, envio e limpeza se distinguem, erros, resumo de validação e confirmação mantêm hierarquia e acessibilidade, e o formulário continua sem enviar nem armazenar dados.

---

### User Story 6 - Validar o resultado: consistência, responsividade, acessibilidade e antes/depois (Priority: P1)

A pessoa responsável pelo projeto compara as cinco páginas antes e depois, verifica as larguras de referência e confirma que contraste, foco, teclado, ampliação e movimento reduzido não regrediram. O resultado fica registrado, com problemas encontrados, decisões adotadas e limites do que foi verificado.

**Why this priority**: Sem validação, o refinamento pode mascarar regressões de acessibilidade e responsividade, que já são requisitos aplicáveis (VIS-021 a VIS-024). É P1 porque nenhum requisito de acessibilidade existente pode ser adiado.

**Independent Test**: Executar a suíte existente (unitária, de navegador e de acessibilidade) e as verificações manuais por teclado; abrir as capturas antes e depois lado a lado e o registro de revisão.

**Acceptance Scenarios**:

1. **Given** as cinco páginas refinadas, **When** revisadas lado a lado, **Then** componentes equivalentes usam os mesmos padrões e as diferenças entre páginas se explicam por suas funções; problemas e decisões ficam registrados.
2. **Given** as larguras de 320, 375, 768, 1024 e 1440 pixels CSS, **When** cada página é verificada, **Then** não há rolagem horizontal da página em 320 (exceto conteúdo bidimensional com contêiner próprio), nada se sobrepõe, títulos e mensagens longos quebram, o zoom não é bloqueado e os pontos de quebra seguem sincronizados com o menu móvel.
3. **Given** a nova apresentação, **When** os contrastes são avaliados, **Then** texto comum atinge 4,5:1, texto grande 3:1 e os componentes necessários para identificar controles e estados atingem o contraste não textual aplicável, em todos os fundos usados, incluindo logo e ícones.
4. **Given** a navegação por teclado nos fluxos principais (navegar, buscar, filtrar, paginar, abrir detalhes, enviar o contato), **When** executada, **Then** o foco permanece visível e a ordem é lógica, e nenhum estado depende só da cor.
5. **Given** a preferência por movimento reduzido, **When** ativa, **Then** continua sem animações ou transições relevantes.
6. **Given** a suíte automatizada existente, **When** executada, **Then** passa, ou qualquer exceção está documentada e justificada; e o registro não declara conformidade integral com base apenas em testes automáticos.
7. **Given** capturas de Início, Explorar, Detalhes, Sobre e Contato antes e depois, **When** comparadas em larguras equivalentes, com resultados e com estado vazio ou de erro quando aplicável, **Then** as diferenças aprovadas e os problemas restantes ficam registrados, avaliando legibilidade, consistência e acessibilidade, não só preferência estética.

---

### Edge Cases

- Título de atividade ou categoria muito longo, ou palavra sem pontos de quebra: deve quebrar sem transbordar nem cortar em cards, cabeçalho, filtros e detalhes.
- Ampliação do texto a 200% e espaçamento de texto ampliado: sem sobreposição, corte ou perda de funcionalidade.
- Largura de 320 pixels CSS e telas ultralargas: sem rolagem horizontal no primeiro caso; no segundo, o conteúdo permanece centralizado e legível, não esticado.
- Categoria nova vinda da API sem cor definida: usa a cor neutra padrão e o layout não muda.
- Logo, ícone ou imagem que não carrega: o nome "Agenda Livre" continua disponível como texto acessível e o cabeçalho não colapsa.
- Atividade sem imagem, com imagem informativa, com imagem decorativa ou campo `image` ausente: o card e os detalhes mantêm layout e alternativa corretos.
- Estados vazio, erro e carregamento nos mesmos locais dos cards: continuam distinguíveis entre si, sem depender só de cor ou ícone.
- Modo de alto contraste do sistema e impressão: informação e bordas essenciais não desaparecem.
- Páginas muito curtas (Contato, estado vazio): o rodapé permanece ao final, sem sobreposição.
- Fontes que falham ao carregar: a reserva tipográfica mantém o layout legível.

## Requirements *(mandatory)*

### Functional Requirements

**Marca e estrutura global (EP-VIS-01, EP-VIS-02)**

- **FR-001**: O site MUST exibir o logo oficial do guia de marca no cabeçalho de todas as páginas, como link para o Início, com nome acessível "Agenda Livre", e MUST usar o ícone oficial como ícone da aba do navegador.
- **FR-002**: O site MUST disponibilizar o logo e o ícone em arquivos próprios do projeto, derivados do guia de marca, em versão para fundo claro; a variação para fundo escuro MUST ser incluída se houver uso dela no site.
- **FR-003**: Cabeçalho, conteúdo e rodapé MUST compartilhar o mesmo alinhamento horizontal, com largura útil global reavaliada para telas grandes e valor global centralizado em um único ponto de configuração de design.
- **FR-004**: Textos corridos das páginas de leitura (Sobre, Detalhes) MUST manter largura de leitura confortável, menor que a largura geral, sem linhas longas demais.
- **FR-005**: As seções principais MUST ter espaçamento vertical consistente e conteúdo relacionado MUST ficar visualmente agrupado, sem vazios sem função, usando a escala de espaçamento existente ou novos valores documentados.
- **FR-006**: A hierarquia tipográfica (título da página, seção, card, texto auxiliar) MUST ser consistente nas cinco páginas, com Poppins nos títulos e Inter em textos e controles, texto auxiliar no tamanho mínimo do design system e sem sobreposição ou corte com ampliação do texto.
- **FR-007**: O cabeçalho MUST ter alinhamento vertical consistente entre marca e links, espaçamento interno suficiente, separação clara do conteúdo e indicação da página atual que não dependa só da cor, aplicados igualmente às cinco páginas.
- **FR-008**: O rodapé MUST seguir o mesmo sistema visual do cabeçalho, com separação discreta do conteúdo, permanecer ao final em páginas curtas e manter links legíveis e acionáveis em telas estreitas.
- **FR-009**: A navegação móvel (botão Menu, estado expandido, ordem de foco, fechamento) e o link "Pular para o conteúdo principal" MUST continuar funcionando como antes.

**Página inicial e pesquisa (EP-VIS-03)**

- **FR-010**: O hero do Início MUST formar um bloco coerente de título e subtítulo, com ilustração decorativa equilibrada em desktop, reorganizada sem aperto nem rolagem horizontal em telas estreitas, e sem anúncio redundante por leitor de tela.
- **FR-011**: A busca do Início MUST ser apresentada como uma área única (campo, filtros e ação), com rótulos acima dos campos, "Explorar" como ação principal, larguras proporcionais em desktop e ordem natural em telas estreitas, sem alterar o comportamento do formulário nem os parâmetros enviados à página Explorar.
- **FR-012**: O botão primário MUST ter hierarquia maior que os secundários e estados de repouso, hover, foco visível, pressionado e desabilitado distinguíveis, contraste suficiente e área de acionamento no tamanho mínimo.
- **FR-013**: A seção de próximas atividades MUST ter título, introdução e "Ver todas" com hierarquia clara e funcionar visualmente com três cards, um card, esqueletos, estado vazio e erro, sem alterar a lógica de carregamento.

**Cards e estados (EP-VIS-04)**

- **FR-014**: Os cards MUST apresentar imagem ou fallback, categoria, título, unidade e data em hierarquia previsível, com cantos, bordas, sombra e espaçamento vindos de valores centralizados, alinhamento consistente na mesma linha, quebra de títulos longos e uma única parada de foco com foco visível.
- **FR-015**: A etiqueta de categoria MUST ter tamanho proporcional, o nome escrito, contraste suficiente e o mesmo tratamento em Início, Explorar e Detalhes, com cor própria por categoria conforme o guia de marca (cor neutra padrão para categorias sem cor definida), a mesma categoria com a mesma cor em toda a interface e cada combinação validada quanto ao contraste.
- **FR-016**: O estado vazio MUST ter aparência integrada à interface, com mensagem principal em destaque, orientação complementar legível e orientação para ver ou pesquisar outras atividades quando aplicável.
- **FR-017**: Os estados vazio, de carregamento e de erro MUST ser distinguíveis entre si, inclusive em escala de cinza; os esqueletos MUST ter dimensões coerentes com os cards e não animar sob preferência por movimento reduzido; o erro MUST manter a ação de nova tentativa como botão primário; mensagens acessíveis existentes MUST ser preservadas.

**Componentes e controles (EP-VIS-05)**

- **FR-018**: Botões primário, secundário/de destaque e contornado MUST ter aparência e hierarquia consistentes em todas as páginas, com os estados hover, foco, ativo e desabilitado distinguíveis sem depender só da cor, e links em texto MUST continuar reconhecíveis como links.
- **FR-019**: Campos de texto, seletores e área de texto MUST ter altura, borda, raio e espaçamento consistentes, rótulos e textos auxiliares visualmente associados, foco e erro visíveis sem depender só da cor, e MUST preservar comportamento nativo, zoom, mensagens de validação e associações programáticas existentes.
- **FR-020**: Sombras, bordas e raios MUST ser usados com moderação, vir de valores centralizados e permanecer claros em alto contraste; nenhum componente MUST acumular sombra, borda forte e fundo contrastante sem justificativa.
- **FR-021**: As cores, a tipografia e os estilos de botão aplicados MUST seguir o guia de marca (paleta, Poppins e Inter, botões primário, de destaque e contornado), respeitando os ajustes de contraste já documentados em `specs/004-visual-identity-responsive/contracts/design-tokens.md` quando divergirem do guia.
- **FR-022**: Os ícones de apoio mostrados no guia (localização, data e hora, categoria, duração) MAY ser usados nos metadados de cards e detalhes, desde que sejam decorativos para tecnologias assistivas e o texto continue presente; o ícone de público MAY ser usado apenas se a API fornecer essa informação.

**Páginas internas (EP-VIS-06)**

- **FR-023**: A página Explorar MUST apresentar título, descrição, filtros e ações em hierarquia clara, com a área de filtros separada dos resultados, "Filtrar" como ação principal, "Limpar filtros" como secundária, carregamento e resumo de resultados claros, e funcionamento em telas estreitas, sem alterar parâmetros, paginação, histórico nem estado da URL.
- **FR-024**: A página de detalhes MUST ordenar título e metadados essenciais antes das informações complementares, distinguir data, horário, unidade e local, manter descrição com largura de leitura confortável, manter links externos reconhecíveis com indicação de site externo, manter um caminho visual claro para voltar à exploração no estado "não encontrada ou indisponível" e MUST NOT inventar dados ausentes da API.
- **FR-025**: A página Sobre MUST ter seções e subtítulos claramente separados, largura de leitura confortável e convite para explorar atividades como ação principal, sem reescrita do conteúdo institucional.
- **FR-026**: A página Contato MUST agrupar formulário, aviso de demonstração e campos com clareza, manter evidente o aviso de que nada será enviado, distinguir envio e limpeza e preservar a hierarquia e a acessibilidade de erros, resumo de validação e confirmação; o formulário MUST continuar demonstrativo.

**Validação (EP-VIS-07)**

- **FR-027**: O refinamento MUST ser verificado nas larguras de 320, 375, 768, 1024 e 1440 pixels CSS, sem rolagem horizontal da página em 320 (exceto conteúdo bidimensional com contêiner próprio), sem sobreposição e sem bloqueio de zoom; os pontos de quebra existentes MUST ser mantidos ou alterados de forma documentada e sincronizada com o menu móvel.
- **FR-028**: Contraste de texto (4,5:1 comum, 3:1 grande), contraste não textual de controles e estados, foco visível em todos os fundos, independência de cor e comportamento sob movimento reduzido MUST permanecer atendidos, incluindo logo e ícones novos.
- **FR-029**: A suíte automatizada existente (unitária, de navegador e de acessibilidade) MUST passar após o refinamento, ou cada exceção MUST ser documentada e justificada; testes que verificam valores visuais ou estrutura afetados pelo refinamento MUST ser atualizados com a justificativa, sem serem removidos ou enfraquecidos para obter resultado verde.
- **FR-030**: MUST existir um registro de revisão visual com: comparação entre as cinco páginas, verificações por teclado nos fluxos principais, capturas antes e depois em larguras equivalentes (com resultados e com estado vazio ou de erro quando aplicável), problemas encontrados, decisões adotadas, diferenças aprovadas e problemas restantes; o registro MUST NOT declarar conformidade integral com base apenas em testes automáticos.
- **FR-031**: Mudanças em estrutura de página ou em comportamento, se necessárias para um resultado visual ou acessível, MUST ser registradas como dependências e justificadas, não presumidas como parte automática do trabalho visual.

**Preservação**

- **FR-032**: O refinamento MUST preservar rotas, parâmetros de URL, histórico, integração com a API, mensagens acessíveis, atributos de acessibilidade existentes e a separação de estilos em base, layout e componentes, sem adicionar bibliotecas visuais, fontes remotas ou framework, salvo justificativa documentada.

### Key Entities *(include if feature involves data)*

- **Ativo de marca**: logo (fundo claro, e fundo escuro se usado) e ícone da aba derivados do guia de marca; têm nome acessível "Agenda Livre" e proporções preservadas.
- **Valor de design**: cor, fonte, espaçamento, raio, borda, sombra, largura e duração centralizados, de onde todos os componentes retiram seus valores.
- **Componente visual**: cabeçalho, rodapé, hero, área de busca, card de atividade, etiqueta de categoria, painel de estado (vazio, carregamento, erro), botão, campo e formulário; cada um com o mesmo tratamento em todas as páginas.
- **Registro de revisão visual**: documento com capturas antes e depois, resultados das verificações, problemas, decisões e limites.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% das cinco páginas, o logo oficial aparece no cabeçalho e o ícone oficial na aba, e cabeçalho, conteúdo e rodapé compartilham o mesmo alinhamento horizontal nas cinco larguras de referência.
- **SC-002**: Em uma avaliação com 5 pessoas que não conhecem o projeto, ao menos 4 identificam em até 5 segundos, no Início, qual é o título da página, onde pesquisar e qual é a ação principal da busca.
- **SC-003**: Em 320 pixels CSS, 0 das cinco páginas apresenta rolagem horizontal (exceto conteúdo bidimensional com contêiner próprio), e em 320, 375, 768, 1024 e 1440 não há sobreposição de elementos em nenhum dos estados verificados (com resultados, vazio, erro, carregamento).
- **SC-004**: 100% dos pares de cor de texto e de componentes de controle atendem aos mínimos de contraste (4,5:1, 3:1 e não textual aplicável), e a verificação automática de acessibilidade existente termina sem novas violações em relação à linha de base da feature 010.
- **SC-005**: As verificações manuais por teclado dos fluxos principais (navegar, buscar, filtrar, paginar, abrir detalhes, enviar o contato) são concluídas sem perda de foco visível ou de funcionalidade, e as suítes unitária, de navegador e de acessibilidade passam, ou as exceções estão justificadas no registro.
- **SC-006**: Em 100% dos pares de componentes equivalentes entre páginas (botões, campos, links, cards, estados), a revisão lado a lado não encontra diferença visual sem justificativa registrada.
- **SC-007**: O registro de revisão contém capturas antes e depois das cinco páginas em larguras equivalentes e o resultado aprovado de cada história P0, e a pessoa responsável aprova a legibilidade, a consistência e a acessibilidade do conjunto.
- **SC-008**: Nenhuma regressão: navegação, busca, paginação, detalhes e formulário demonstrativo se comportam como antes do refinamento, comprovado pela suíte existente e pela conferência dos parâmetros da URL.

## Assumptions

- O guia de marca `docs/Guia de Marca Agenda Livre.png` é uma imagem única de referência; o logo, as variações e o ícone serão extraídos ou recriados dele como arquivos próprios do projeto. Não existem hoje arquivos de logo separados no repositório.
- A paleta e a tipografia do guia coincidem com o DOC-10 e com os valores atuais do projeto; onde houver conflito de contraste, valem os ajustes já documentados em `specs/004-visual-identity-responsive/contracts/design-tokens.md` (por exemplo, texto escuro sobre o laranja e `#C2410C` quando o laranja funciona como linha ou texto).
- Como o guia, o laranja `#F97316` com texto escuro é usado no botão de destaque "Ver detalhes"; o azul `#2563EB` é o botão primário e o contornado azul é o botão secundário.
- A ilustração atual do hero é mantida; a foto do prédio mostrada no guia é apenas ilustração do protótipo, e não há imagem equivalente autorizada disponível.
- Decisão (2026-10-12): cor própria por categoria, como no guia; a regra de mapeamento entre nome da categoria e cor, e a cor padrão para categorias desconhecidas, são definidas no planejamento, partindo das quatro categorias do guia.
- Ficam fora do escopo, por exigirem funcionalidade nova e por constarem como protótipo no guia: favoritar atividades, ordenação dos resultados, contador de atividades encontradas, lista suspensa de filtros no formato do protótipo, carrossel com indicadores, busca no cabeçalho, o ícone de público quando a API não fornece o dado, e qualquer troca de framework, contrato de API ou conteúdo institucional.
- As cinco páginas e seus comportamentos atuais estão corretos; o trabalho é visual. Alterações de HTML ou de comportamento só entram quando indispensáveis e registradas conforme FR-031.
- A feature parte da linha de base da feature 010 (suíte e registros DOC-17, DOC-19 e DOC-20); as capturas "antes" são tiradas antes de qualquer alteração.
- O backend de demonstração com a feature de imagens aplicada (`image` como `{url, alt, decorative}` ou `null`) está disponível para verificar os cards com imagem; sem ele, os estados com imagem são verificados com respostas simuladas, como na suíte existente.
- A ordem recomendada do backlog (VIS-001 a VIS-024) é uma sugestão e pode ser ajustada se surgir dependência técnica, sem mudar os critérios de aceite.
- O título interno do documento `docs/18-backlog-refinamento-visual-frontend.md` ainda diz "DOC-16"; a numeração do arquivo (18) é a usada nas referências desta feature.
