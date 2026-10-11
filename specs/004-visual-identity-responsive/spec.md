# Feature Specification: Identidade visual e responsividade

**Feature Branch**: `004-visual-identity-responsive`

**Created**: 2026-10-11

**Status**: Draft

**Input**: User description: "Épico EP-FE-04 do docs/16-backlog-do-frontend.md (Feature FE-F05 — Aplicar o design system), que reúne as histórias FE-011 (aplicar tokens visuais compartilhados), FE-012 (adaptar o layout a diferentes telas) e FE-013 (respeitar a preferência por movimento reduzido). Base: todos os documentos em docs/ do frontend (em especial DOC-10, DOC-13 e DOC-15) e docs/ e specs/ do backend (agenda-livre-backend)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Reconhecer uma interface visualmente consistente (Priority: P1)

Uma pessoa visitante percorre Início, Explorar, Detalhes, Sobre e Contato e vê sempre a mesma identidade: a mesma paleta (azul como cor principal, laranja e amarelo apenas como destaque), a mesma tipografia (títulos com um estilo, textos com outro), os mesmos espaçamentos, bordas e cantos, e o mesmo tratamento de links, botões, campos, cards, etiquetas de categoria e mensagens de estado. Links parecem links e botões parecem botões, e a pessoa sabe distinguir uns dos outros sem precisar clicar. Cada controle deixa claro quando está com foco, sob o cursor, selecionado, em erro ou desabilitado, e essa informação nunca depende apenas da cor: sempre há também um sinal de forma, texto ou ícone. O visual segue o DOC-10, com os tons ajustados onde necessário para que todo texto e todo componente atinja o contraste exigido.

**Why this priority**: A consistência visual e os estados dos controles são a base de todas as páginas dos próximos épicos (Início, Explorar, Detalhes, Sobre e Contato); sem uma única fonte de valores visuais, cada página criaria sua própria variação, e os requisitos de contraste e de foco ficariam sem verificação possível.

**Independent Test**: Abrir as cinco páginas e uma página de demonstração/verificação visual dos componentes existentes (links, botões primário, secundário e contornado, campos, cards, etiquetas, mensagens de carregamento/erro/vazio, menu) em todos os estados, e conferir cores, fontes, espaçamentos, contrastes calculados e distinguibilidade em escala de cinza.

**Acceptance Scenarios**:

1. **Given** qualquer uma das cinco páginas, **When** exibida, **Then** cores, famílias tipográficas, tamanhos de texto, espaçamentos, raios de borda, bordas, sombras e o estilo do indicador de foco vêm de um único conjunto central de valores, e nenhum componente define esses valores por conta própria de forma divergente.
2. **Given** a paleta do DOC-10 (azul profundo, azul vivo, laranja, amarelo, fundo, texto e superfície), **When** aplicada à interface, **Then** o azul é a cor dominante de marca, ações e links; o laranja e o amarelo aparecem somente como destaque pontual; e o amarelo nunca é usado como cor de texto sobre fundo claro.
3. **Given** cada combinação de texto e fundo realmente usada na interface (incluindo texto sobre botões, etiquetas, avisos e fundos de destaque), **When** o contraste é calculado, **Then** é de pelo menos 4,5:1 para texto comum e 3:1 para texto grande; **And** quando a cor original do DOC-10 não atinge esse valor, é usado um tom ajustado e a diferença fica registrada.
4. **Given** bordas de campos, ícones informativos, indicadores de foco e demais elementos necessários para reconhecer um controle ou seu estado, **When** o contraste é calculado contra o fundo adjacente, **Then** é de pelo menos 3:1.
5. **Given** os títulos e o texto da interface, **When** exibidos, **Then** títulos usam Poppins e textos, botões, navegação, formulários e filtros usam Inter, com hierarquia tipográfica coerente (título da página > título de seção > título de card > texto principal > texto auxiliar), em tamanhos relativos que acompanham a ampliação do texto.
6. **Given** que as fontes Poppins ou Inter não carregam (rede lenta, bloqueio ou falha), **When** a página é exibida, **Then** o texto aparece em uma fonte de reserva legível, sem ficar invisível, sem quebrar o layout e sem impedir o uso da página.
7. **Given** um link e um botão, **When** exibidos lado a lado, **Then** links em texto corrido são reconhecíveis como links sem depender somente da cor (por exemplo, sublinhado), e os botões têm formato próprio de ação (preenchimento ou contorno, área de toque), de modo que os dois sejam distinguíveis.
8. **Given** os estilos de botão do DOC-10 (primário em azul, secundário em laranja e contornado), **When** exibidos, **Then** cada um mantém o contraste do texto com seu fundo e cada um tem a mesma hierarquia em todas as páginas (a ação principal da tela usa o primário).
9. **Given** qualquer controle interativo (link, botão, campo, seletor, card clicável, botão de menu), **When** em foco por teclado, **Then** exibe um indicador de foco visível e com contraste suficiente, em todos os fundos usados (claro, azul, destaque), e esse indicador nunca é removido sem substituto.
10. **Given** um controle em hover, selecionado/ativo, em erro e desabilitado, **When** exibido, **Then** cada estado é identificável por mais de uma pista visual (por exemplo, forma, borda, ícone ou texto, além da cor) e é distinguível dos demais.
11. **Given** a interface vista em escala de cinza, **When** comparada à versão colorida, **Then** nenhum estado, categoria ou mensagem (sucesso, aviso, erro, carregando, vazio) perde sua identificação.
12. **Given** as etiquetas de categoria, **When** exibidas, **Then** têm o mesmo tratamento visual para a mesma categoria em todos os lugares, o nome da categoria sempre aparece escrito, e a cor nunca é o único identificador.
13. **Given** os componentes das features anteriores (menu, rodapé, cards, esqueletos, mensagens de estado e aviso de configuração), **When** esta feature é concluída, **Then** eles passam a usar o mesmo conjunto central de valores visuais, sem mudança de estrutura, de comportamento nem de textos.

---

### User Story 2 - Usar o site em qualquer tela (Priority: P1)

Uma pessoa visitante abre o site em computador, tablet ou celular e consegue fazer tudo o que o site oferece em qualquer tamanho. Em telas largas, os cards aparecem em grade com mais de uma coluna; em telas estreitas, em uma coluna. O menu vira o botão "Menu" em telas pequenas; os filtros, a pesquisa e o formulário continuam utilizáveis com o polegar, sem rolagem horizontal da página. Quando a pessoa amplia o zoom do navegador ou aumenta o tamanho do texto até 200%, nada some, nada fica sobreposto e nenhuma função deixa de funcionar. Na largura equivalente a 320 pixels, o conteúdo se reorganiza em uma coluna sem exigir rolagem em duas direções. O zoom do navegador nunca é impedido.

**Why this priority**: Metade do uso esperado é em celular, e o reflow e a ampliação são requisitos de acessibilidade de nível AA (e não melhorias futuras); o layout responsivo é a base sobre a qual todas as páginas dos próximos épicos serão construídas.

**Independent Test**: Abrir as cinco páginas nas larguras de referência (320, 375, 768, 1024 e 1440 pixels CSS), com texto padrão e ampliado a 200% e com zoom do navegador de 400% equivalente a 320 px, verificando ausência de rolagem horizontal, sobreposição e perda de conteúdo ou função, e ausência de bloqueio de zoom.

**Acceptance Scenarios**:

1. **Given** a largura equivalente a 320 pixels CSS, **When** qualquer das cinco páginas é exibida, **Then** todo o conteúdo e todas as funções estão acessíveis em uma coluna, sem rolagem horizontal da página (exceto, se houver, conteúdo que exija layout bidimensional, como tabelas largas, que rola dentro do próprio contêiner).
2. **Given** uma lista de cards, **When** a largura é de tela estreita (até o ponto de quebra de tablet), **Then** os cards aparecem em uma coluna; **When** a largura é intermediária, **Then** em duas colunas; **When** a largura é de computador, **Then** em três ou mais colunas, com a mesma altura de área de imagem e o mesmo espaçamento entre cards.
3. **Given** cards de alturas de conteúdo diferentes na mesma linha, **When** exibidos em grade, **Then** o alinhamento permanece consistente, os links principais estão numa posição previsível e nenhum conteúdo é cortado.
4. **Given** a navegação em tela estreita, **When** exibida, **Then** permanece como botão "Menu" com a lista recolhida (comportamento da feature 003), e o ponto de troca entre menu móvel e navegação em linha é o mesmo valor em estilos e em código.
5. **Given** controles de filtro, pesquisa e formulários (quando existirem nas páginas dos próximos épicos), **When** exibidos em tela pequena, **Then** o layout base já os acomoda: campos ocupam a largura disponível, rótulos ficam acima dos campos, botões têm largura e altura adequadas e a área de toque tem pelo menos 24 por 24 pixels CSS, sem sobreposição entre alvos adjacentes.
6. **Given** o texto ampliado a 200% (por zoom de texto ou do navegador), **When** qualquer página é exibida, **Then** nenhum texto é cortado, nenhum elemento fica sobreposto, cabeçalho, menu, cards, mensagens de estado e rodapé continuam completos e operáveis.
7. **Given** o zoom do navegador em até 400% (equivalente a 320 px de largura), **When** as páginas são exibidas, **Then** o conteúdo se reorganiza em uma coluna e nada se perde.
8. **Given** a configuração de visualização das páginas, **When** inspecionada, **Then** não impede nem limita o zoom (por exemplo, sem escala máxima e sem bloqueio de redimensionamento pelo usuário).
9. **Given** uma imagem, ícone ou elemento decorativo, **When** a largura diminui, **Then** não ultrapassa o contêiner e a área de imagem do card mantém sua proporção.
10. **Given** textos longos ou palavras sem quebra (por exemplo, títulos de atividade muito longos), **When** exibidos em 320 px, **Then** quebram dentro do contêiner sem estourar nem sobrepor outros elementos.
11. **Given** um dispositivo em modo retrato e paisagem, **When** a orientação muda, **Then** o layout se reorganiza sem perda de conteúdo e sem fixar a orientação.
12. **Given** os alvos de ponto de quebra (celular, tablet, computador), **When** o layout é verificado, **Then** os pontos de quebra usados nos estilos são definidos em um único lugar documentado, e o ponto de troca do menu coincide com eles.
13. **Given** que não há conteúdo longo o bastante para rolar, **When** a página é exibida em altura de tela grande, **Then** o rodapé permanece ao final do conteúdo ou da janela, sem espaço vazio estranho nem sobreposição com o conteúdo principal.

---

### User Story 3 - Reduzir o movimento quando eu preferir (Priority: P1)

Uma pessoa que configurou no sistema operacional ou no navegador a preferência por movimento reduzido usa o site sem transições deslizantes, sem efeitos de pulsar ou brilho e sem animações de entrada que não sejam essenciais. Todas as informações e funções continuam disponíveis e funcionam do mesmo jeito: o menu abre e fecha, mensagens de carregamento aparecem, estados de foco e de seleção mudam, mas sem movimento. Quem não tem essa preferência ativa vê as transições discretas previstas no design (por exemplo, mudança suave de cor no hover), que nunca carregam informação que só elas expliquem.

**Why this priority**: O respeito à preferência de movimento reduzido é decisão de projeto (DOC-15) e evita desconforto físico a pessoas sensíveis a movimento; também é um requisito de aceite do backlog (FE-013) e precisa valer desde a primeira animação introduzida, em vez de ser corrigido depois.

**Independent Test**: Alternar a preferência de movimento reduzido no navegador (ou por emulação) e percorrer as cinco páginas e todos os componentes que têm transição ou animação (menu, esqueletos, botões, campos, cards, mensagens de estado), conferindo que não há movimento com a preferência ativa e que todo o conteúdo e todas as funções permanecem iguais.

**Acceptance Scenarios**:

1. **Given** a preferência por movimento reduzido ativa, **When** qualquer componente com transição ou animação é usado, **Then** a transição ou animação não essencial é removida ou reduzida a uma troca imediata de estado.
2. **Given** a preferência ativa, **When** o menu móvel abre e fecha, **Then** não há deslocamento, deslizamento nem fade; a lista aparece e desaparece diretamente.
3. **Given** a preferência ativa, **When** a região de carregamento exibe esqueletos, **Then** os esqueletos ficam estáticos, sem pulsar nem brilho.
4. **Given** a preferência ativa, **When** os links de ancoragem, o link "Pular para o conteúdo principal" e o foco programático mudam a posição de rolagem, **Then** a rolagem é imediata, sem rolagem suave.
5. **Given** a preferência não ativa, **When** componentes mudam de estado (hover, foco, seleção, abertura do menu), **Then** as transições são curtas (breves e discretas), com duração e curva definidas centralmente, e nunca bloqueiam a interação.
6. **Given** qualquer animação existente, **When** removida ou desativada, **Then** nenhuma informação ou função deixa de estar disponível: o estado final é sempre alcançável sem depender da animação.
7. **Given** a interface, **When** inspecionada, **Then** não há conteúdo que pisque mais de três vezes por segundo, que se mova automaticamente por mais de cinco segundos sem controle de pausa, nem carrossel/rolagem automática.
8. **Given** a preferência alternada com a página aberta, **When** a pessoa a ativa ou desativa, **Then** o comportamento acompanha a preferência atual sem precisar recarregar a página.
9. **Given** o movimento reduzido ativo em um navegador que não oferece a preferência, **When** a página é usada, **Then** o comportamento padrão (com transições discretas) é aplicado sem erros.
10. **Given** uma nova animação ou transição adicionada no futuro, **When** criada, **Then** passa a obedecer à mesma regra central de movimento reduzido, em vez de exigir uma regra por componente.

---

### Edge Cases

- Navegador com preferência de cores ou modo de alto contraste do sistema ativo: textos, bordas e indicadores de foco continuam visíveis e não desaparecem por uso exclusivo de cores de fundo ou sombras.
- Navegador sem suporte a alguma propriedade visual moderna (por exemplo, variáveis CSS ou uma função de grade): a página continua legível e utilizável com um layout simples de uma coluna.
- Página sem JavaScript: o aspecto visual e a responsividade não dependem de scripts; apenas o comportamento do menu recolhido tem alternativa já definida na feature 003.
- Texto do usuário (preferência de tamanho de fonte do navegador) maior que o padrão: todos os tamanhos são relativos ao tamanho de fonte da pessoa e nenhum é fixado em pixels de modo que impeça a ampliação.
- Largura exatamente igual a um ponto de quebra: nunca há dois layouts concorrentes, e a transição não deixa elementos sobrepostos.
- Fonte Poppins ou Inter com carregamento lento: a página não "pula" visivelmente quando a fonte chega (a diferença de métricas entre a fonte de reserva e a final não causa deslocamento perceptível do conteúdo).
- Cores de categoria vindas de uma lista ainda não validada: categorias sem cor definida usam um tratamento neutro padrão, nunca ficam sem etiqueta.
- Cor definida pelo usuário no navegador (cores forçadas): o conteúdo continua legível e os controles permanecem identificáveis.
- Impressão: a página é legível ao imprimir, sem que fundos coloridos tornem o texto ilegível (cobertura básica, sem layout de impressão específico).
- Telas muito largas (acima de 1440 px): o conteúdo permanece com largura máxima de leitura confortável e centralizado, sem linhas de texto excessivamente longas.
- Tema escuro do sistema: fica fora do escopo desta versão; a interface mantém o tema claro definido pelo DOC-10, sem quebrar a leitura quando o navegador ativa o tema escuro.

## Requirements *(mandatory)*

### Functional Requirements

**Tokens visuais compartilhados (FE-011)**

- **FR-001**: Cores, famílias e tamanhos tipográficos, pesos, escala de espaçamento, raios de borda, espessuras de borda, sombras, durações de transição e estilo do indicador de foco MUST ser definidos em um único conjunto central de valores nomeados, e os estilos dos componentes MUST referenciar esse conjunto em vez de repetir valores.
- **FR-002**: A paleta MUST seguir o DOC-10: azul profundo e azul vivo como cores de marca, ação e navegação; laranja e amarelo somente como destaque; fundo cinza muito claro, texto cinza muito escuro e superfície branca. Quando um tom do DOC-10 não atingir o contraste exigido para o uso pretendido, MUST ser adotado um tom ajustado, e o ajuste (valor original, valor adotado, motivo e razão de contraste) MUST ser documentado.
- **FR-003**: O amarelo MUST NOT ser usado como cor de texto sobre fundos brancos ou muito claros; amarelo e laranja MUST NOT ser preenchimento dominante de página.
- **FR-004**: Todo texto MUST ter contraste de pelo menos 4,5:1 com o fundo (3:1 para texto grande, conforme a WCAG), e componentes e estados necessários para identificar controles MUST ter contraste de pelo menos 3:1, para cada combinação realmente usada na interface.
- **FR-005**: A verificação de contraste MUST cobrir, no mínimo, texto comum, texto sobre botões (primário, secundário e contornado), texto de etiquetas de categoria, texto de avisos e mensagens de estado, links (normal, visitado quando distinguível, hover e foco), bordas de campos e indicadores de foco; o resultado MUST ser registrado e reproduzível.
- **FR-006**: A tipografia MUST usar Poppins para títulos e chamadas e Inter para texto, botões, navegação, formulários e filtros, com hierarquia definida para título da página, título de seção, título de card, texto principal e texto auxiliar, em unidades relativas ao tamanho de fonte da pessoa.
- **FR-007**: Quando as fontes Poppins ou Inter não estiverem disponíveis, a interface MUST usar fontes de reserva do sistema com legibilidade equivalente, o texto MUST permanecer visível durante e após o carregamento, e o carregamento das fontes MUST NOT bloquear a exibição do conteúdo.
- **FR-008**: Texto principal MUST ter tamanho mínimo de 1 rem e o texto auxiliar MUST ter tamanho mínimo de 0,875 rem, com altura de linha e espaçamento entre parágrafos que preservem a legibilidade.
- **FR-009**: Links e botões MUST ser visualmente distinguíveis entre si: links em texto corrido MUST ter pista não cromática de que são links (por exemplo, sublinhado) e botões MUST ter forma de controle própria.
- **FR-010**: MUST existir três estilos de botão (primário, secundário e contornado) conforme o DOC-10, cada um com texto de contraste suficiente e estados de repouso, hover, foco, pressionado e desabilitado perceptíveis; a ação principal de cada tela MUST usar o estilo primário.
- **FR-011**: Todo controle interativo MUST ter indicador de foco por teclado visível, com contraste mínimo de 3:1 contra todos os fundos em que aparece, espessura e distância consistentes, e MUST NOT ter o indicador removido sem substituto equivalente.
- **FR-012**: Os estados de foco, hover, selecionado/ativo, erro e desabilitado MUST ser identificáveis e distinguíveis entre si, e cada estado MUST ser comunicado por pelo menos uma pista além da cor (forma, borda, ícone, texto ou peso).
- **FR-013**: Sucesso, aviso, erro, carregando e ausência de resultados MUST ser distinguíveis por texto e/ou ícone e por tratamento visual próprio, mantendo a identificação quando vistos em escala de cinza.
- **FR-014**: Etiquetas de categoria MUST ter o mesmo tratamento visual em todos os lugares, MUST exibir o nome da categoria por escrito e MUST NOT usar a cor como único identificador; categorias sem cor definida MUST usar um tratamento neutro padrão.
- **FR-015**: Cards de atividade, campos de pesquisa e filtros, menu, rodapé, esqueletos, mensagens de estado e avisos de configuração das features 001 a 003 MUST ser migrados para os valores centrais desta feature, preservando estrutura, comportamento, textos e nomes acessíveis.
- **FR-016**: Os valores centrais MUST ser documentados (nome, valor, uso e, quando aplicável, razão de contraste), de modo que as páginas dos próximos épicos reutilizem os mesmos valores sem redefini-los.
- **FR-017**: Ícones MUST ser simples e consistentes; ícones decorativos MUST ser ocultados de tecnologias assistivas e ícones que carregam informação MUST ter equivalente em texto.

**Layout responsivo (FE-012)**

- **FR-018**: Os pontos de quebra (celular, tablet e computador) MUST ser definidos em um único lugar documentado, MUST ser coerentes com o ponto de troca do menu da feature 003 e MUST ser expressos em unidades relativas ao tamanho de fonte.
- **FR-019**: O layout MUST abordar primeiro telas estreitas, de modo que a experiência de uma coluna seja o comportamento base e telas maiores acrescentem colunas e espaço.
- **FR-020**: O layout base MUST organizar listas de cards em uma coluna em telas estreitas, duas em telas intermediárias e três ou mais em telas largas, mantendo espaçamento, proporção da área de imagem e alinhamento consistentes entre os cards.
- **FR-021**: O layout base de cabeçalho, conteúdo principal, rodapé, campos, rótulos, botões, grupos de filtros e formulários MUST se adaptar a qualquer largura de 320 pixels CSS a 1440 pixels CSS ou mais, sem rolagem horizontal da página, sem sobreposição e sem corte de conteúdo.
- **FR-022**: Em 320 pixels CSS de largura, todas as páginas MUST oferecer todo o conteúdo e todas as funções em uma coluna, sem exigir rolagem em duas direções (exceto conteúdo que realmente exija layout bidimensional, que rola dentro do próprio contêiner).
- **FR-023**: Com texto ampliado até 200% e com zoom do navegador até 400%, o conteúdo e as funções MUST permanecer disponíveis e operáveis, sem perda, sobreposição ou corte de texto.
- **FR-024**: A configuração de visualização das páginas MUST NOT desativar nem limitar o zoom do navegador nem o redimensionamento de texto pela pessoa.
- **FR-025**: Tamanhos de caixas, contêineres e texto MUST NOT ser fixados de forma que impeçam a expansão com texto ampliado; alturas fixas MUST NOT cortar conteúdo, e larguras MUST se ajustar ao espaço disponível.
- **FR-026**: Controles interativos MUST ter área de toque de pelo menos 24 por 24 pixels CSS, sem sobreposição com alvos adjacentes, e os controles principais de formulários, filtros e menu MUST ter área confortável para toque (recomendado 44 por 44 pixels CSS).
- **FR-027**: Imagens, ícones e áreas de mídia MUST se ajustar à largura do contêiner sem ultrapassá-lo e MUST manter proporção constante.
- **FR-028**: Textos longos e palavras sem quebra MUST quebrar dentro do contêiner em qualquer largura, sem estourar nem sobrepor elementos.
- **FR-029**: O conteúdo principal MUST ter largura máxima de leitura confortável, centralizada em telas muito largas, com comprimento de linha de texto corrido limitado.
- **FR-030**: O layout MUST funcionar em orientação retrato e paisagem, sem bloqueio de orientação.
- **FR-031**: O rodapé MUST ficar ao final do conteúdo ou da janela sem sobrepor o conteúdo principal nem deixar espaço vazio indevido em páginas curtas ou longas.
- **FR-032**: O layout e a aparência MUST NOT depender de JavaScript; a aparência e a responsividade MUST funcionar com scripts desabilitados.
- **FR-033**: O layout MUST permanecer utilizável (legível, sem texto sobreposto) em navegadores que não ofereçam suporte a recursos visuais modernos, recorrendo a um layout simples de uma coluna.

**Movimento reduzido (FE-013)**

- **FR-034**: A interface MUST consultar a preferência por movimento reduzido do sistema ou do navegador por meio de uma regra central única, aplicada a todas as transições e animações, em vez de uma regra por componente.
- **FR-035**: Com a preferência ativa, todas as transições e animações não essenciais MUST ser removidas ou reduzidas a uma troca imediata de estado, incluindo o menu móvel, os esqueletos de carregamento, mudanças de estado de botões e campos, indicadores de foco e rolagem para âncoras.
- **FR-036**: Com a preferência ativa, a rolagem programática e por âncora MUST ser imediata (sem rolagem suave).
- **FR-037**: Sem a preferência ativa, as transições MUST ser curtas e discretas, com duração e curva definidas nos valores centrais, e MUST NOT atrasar nem bloquear a interação.
- **FR-038**: Nenhuma informação ou função MUST depender de animação: todo estado final MUST ser alcançável sem a animação.
- **FR-039**: A interface MUST NOT conter conteúdo que pisque mais de três vezes por segundo, nem movimento automático por mais de cinco segundos sem possibilidade de pausar, interromper ou ocultar.
- **FR-040**: A preferência MUST ser respeitada quando alterada com a página aberta, sem exigir recarga.
- **FR-041**: Animações e transições futuras MUST herdar a regra central de movimento reduzido sem configuração adicional por componente.

**Transversais**

- **FR-042**: Esta feature MUST NOT alterar a estrutura HTML, os textos, o comportamento ou o contrato com a API dos componentes existentes, restringindo-se a apresentação, ao layout e ao movimento (exceto os ajustes de marcação estritamente necessários para aplicar os estilos e a configuração de visualização das páginas).
- **FR-043**: As cinco páginas e os componentes existentes MUST permanecer plenamente funcionais e acessíveis por teclado, leitor de tela, zoom de 200% e largura de 320 pixels CSS depois da migração visual.
- **FR-044**: O comportamento desta feature MUST ser coberto por testes automatizados (incluindo verificação automática de contraste e de acessibilidade das cinco páginas, verificação de rolagem horizontal nas larguras de referência e verificação do movimento reduzido ativo e inativo), e a revisão manual de zoom, ampliação de texto, contraste e movimento reduzido MUST ser registrada. Verificações automáticas não substituem a revisão manual.
- **FR-045**: A identidade visual aplicada MUST NOT depender de imagens: o estado normal das atividades é a ausência de imagem (pendência de backend registrada), e o visual MUST permanecer completo e atraente com o fallback.

### Key Entities

- **Conjunto de valores visuais (tokens)**: valores nomeados e centralizados de cores, tipografia, espaçamento, bordas, raios, sombras, foco e movimento; usados por todos os componentes; cada valor de cor tem seu uso e sua razão de contraste.
- **Tom ajustado**: variação de uma cor do DOC-10 adotada para atingir o contraste exigido; registra cor original, cor adotada, uso e razão de contraste.
- **Estado de componente**: repouso, hover, foco, pressionado, selecionado/ativo, erro, desabilitado; cada estado tem ao menos uma pista visual além da cor.
- **Estilo de botão**: primário, secundário ou contornado; define aparência e hierarquia da ação.
- **Etiqueta de categoria**: texto com o nome da categoria e tratamento visual (cor própria ou neutra), sempre escrita.
- **Ponto de quebra**: largura a partir da qual o layout muda (celular, tablet, computador); definido uma vez e compartilhado com o menu.
- **Layout de grade de cards**: organização em uma, duas ou três ou mais colunas conforme a largura.
- **Preferência de movimento**: indicação, vinda do sistema ou do navegador, de que a pessoa quer movimento reduzido; muda o comportamento de todas as transições e animações.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das combinações de cor de texto e fundo realmente usadas nas cinco páginas e nos componentes existentes atingem 4,5:1 (3:1 para texto grande), e 100% dos componentes e indicadores de estado atingem 3:1, medidos e registrados.
- **SC-002**: Em 100% das cinco páginas, nas larguras de 320, 375, 768, 1024 e 1440 pixels CSS, a largura do conteúdo não excede a da janela, ou seja, não há rolagem horizontal da página.
- **SC-003**: Com texto ampliado a 200% e com o equivalente a 400% de zoom, 100% das páginas e dos componentes existentes mantêm todo o conteúdo e todas as funções operáveis, sem texto cortado nem sobreposição.
- **SC-004**: Em uma verificação visual dos componentes (botões, links, campos, cards, etiquetas, menu, mensagens de estado) em todos os estados, nenhuma pessoa avaliadora precisa clicar para saber se algo é link ou botão, e 100% dos estados (foco, hover, selecionado, erro, desabilitado) são distinguíveis uns dos outros sem usar cor.
- **SC-005**: Com a preferência por movimento reduzido ativa, 0 transições, deslocamentos, pulsos ou rolagens suaves são observados em todos os componentes verificados; com a preferência inativa, as transições previstas ocorrem em até 300 ms e não bloqueiam a interação.
- **SC-006**: Em 100% das verificações automáticas de acessibilidade das cinco páginas, nos estados carregando, erro, vazio e com cards, não restam violações de contraste ou de foco visível sem justificativa registrada.
- **SC-007**: A troca do ponto de quebra de um layout para outro não deixa a página sem navegação utilizável nem com duas navegações concorrentes em nenhuma largura de 320 a 1440 pixels CSS, verificada em intervalos de 1 pixel nos pontos de quebra.
- **SC-008**: Pessoas visitantes concluem, na primeira tentativa, as tarefas de abrir o menu, localizar a página de Explorar e acionar o botão principal de uma tela em celular (320 a 414 pixels CSS) e em computador (1024 pixels CSS ou mais), sem ajuda e sem ampliar a página.
- **SC-009**: Ao desativar o carregamento das fontes Poppins e Inter, 100% das páginas continuam legíveis e utilizáveis em fontes de reserva, sem texto invisível e sem sobreposição de conteúdo.
- **SC-010**: As próximas features (Início, Explorar, Detalhes, Sobre e Contato) conseguem usar os mesmos valores visuais e as mesmas classes de layout, sem acrescentar cores, fontes, espaçamentos ou pontos de quebra novos em seus estilos para entregar sua interface básica.

## Assumptions

- O escopo inclui as histórias FE-011, FE-012 e FE-013 do épico EP-FE-04 (Feature FE-F05 — Aplicar o design system). Conteúdo e comportamento próprios das páginas (pesquisa, filtros funcionais, paginação, detalhes, Sobre, formulário de contato) pertencem aos épicos EP-FE-05 a EP-FE-08, que usarão a base visual e de layout criada aqui.
- A feature migra os componentes das features 001 a 003 para a nova base visual, aproveitando os valores já existentes em `css/tokens.css`, `css/base.css`, `css/layout.css` e `css/components.css`; não reescreve a estrutura HTML nem o comportamento desses componentes.
- A paleta do DOC-10 é a referência de partida; o próprio DOC-10 prevê ajustes de tom após testes de contraste, e esses ajustes são decididos aqui, com registro (cor original, cor adotada, razão). Em especial, o azul vivo (`#2563EB`) e o laranja (`#F97316`) devem ser verificados com texto branco e escuro, e o amarelo (`#FACC15`) é restrito a detalhes decorativos.
- Os pontos de quebra exatos ainda não estão definidos no DOC-10 nem no DOC-09; este épico os define e documenta. O ponto de troca do menu já existente (48 rem) é mantido como um dos pontos de quebra, salvo decisão em contrário no planejamento.
- Os valores iniciais de tipografia e espaçamento do DOC-10 (títulos de 2 a 2,5 rem, seção de 1,5 a 1,75 rem, card de 1 a 1,125 rem, texto de 1 rem, auxiliar de 0,875 rem; escala de múltiplos de 4 pixels) são o ponto de partida e podem ser ajustados no planejamento.
- Poppins e Inter são as fontes definidas no DOC-10. A forma de disponibilizá-las (por exemplo, arquivos próprios ou serviço externo) será decidida no planejamento, considerando desempenho, privacidade e funcionamento sem rede externa; em qualquer caso, a interface precisa de fontes de reserva.
- O logotipo definitivo ainda não existe (DOC-10, seção 12): o nome tipográfico "Agenda Livre" já presente no cabeçalho continua sendo a marca nesta versão, e a produção dos arquivos finais do logotipo e do favicon não faz parte deste épico.
- As cores de categoria dependem da lista de categorias do backend, ainda não validada; categorias sem cor usam um tratamento neutro padrão, e o frontend não mantém uma lista paralela de categorias que possa divergir da API.
- Não há imagens de atividade na API (pendência registrada em `docs/PENDENCIAS-BACKEND.md`); portanto a identidade visual precisa funcionar plenamente com o fallback da feature 003 e não depende de fotografias.
- O tema escuro está fora do escopo; a interface mantém o tema claro do DOC-10. Uma versão clara/escura pode ser tratada em feature futura.
- Esta feature não exige novos recursos do backend; usa apenas o contrato público já documentado e não altera a comunicação com a API.
- A meta de acessibilidade é WCAG 2.2 nível AA (reflow 1.4.10, redimensionar texto 1.4.4, contraste 1.4.3 e 1.4.11, tamanho do alvo 2.5.8, foco visível 2.4.7 e 2.4.11); verificações automáticas complementam, mas não substituem, a revisão manual com teclado, leitor de tela, zoom e contraste.
- O público-alvo é o de visitantes anônimos do site público; não há autenticação e a administração permanece no Django Admin.
