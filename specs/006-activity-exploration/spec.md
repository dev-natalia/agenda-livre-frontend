# Feature Specification: Exploração de atividades

**Feature Branch**: `006-activity-exploration`

**Created**: 2026-10-11

**Status**: Draft

**Input**: User description: "Épico EP-FE-06 do docs/16-backlog-do-frontend.md (Features FE-F08 — Pesquisa e filtros e FE-F09 — Resultados e paginação), que reúne as histórias FE-019 (pesquisar atividades por texto), FE-020 (filtrar por unidade, categoria e período), FE-021 (limpar os filtros), FE-022 (ver a quantidade de resultados), FE-023 (entender quando não há resultados), FE-024 (navegar pela paginação), FE-025 (restaurar a listagem ao voltar dos detalhes) e FE-026 (ordenar pela próxima ocorrência). Base: todos os documentos em docs/ do frontend (em especial DOC-09, DOC-12, DOC-13 e DOC-15) e docs/ e specs/ do backend (agenda-livre-backend), em especial o contrato da API pública de consulta."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver e percorrer a listagem de atividades (Priority: P1)

Uma pessoa visitante abre a página Explorar atividades (diretamente ou pelo "Ver todas" da Início) e vê a listagem de atividades publicadas em cards, da que acontece mais cedo para a que acontece mais tarde. Cada card mostra categoria, nome, unidade e próxima data e horário, e leva aos detalhes. Quando há mais atividades do que cabem em uma página, a pessoa navega por controles de paginação (anterior, próxima e números de página) e sempre sabe em que página está.

**Why this priority**: É o coração do produto: sem a listagem navegável não há como consultar o acervo de atividades. Entrega valor sozinha, mesmo sem pesquisa nem filtros.

**Independent Test**: Abrir a página Explorar sem parâmetros com a API em execução e dados de exemplo suficientes para mais de uma página; conferir cards ordenados, total, controles de paginação e a troca de página.

**Acceptance Scenarios**:

1. **Given** que existem atividades publicadas, **When** a página Explorar é aberta sem parâmetros, **Then** aparecem os cards da primeira página, cada um com categoria, nome, unidade e próxima data e horário (ou "Sem data prevista"), reutilizando o card compartilhado.
2. **Given** a listagem exibida, **When** conferida a ordem, **Then** as atividades aparecem da próxima ocorrência futura mais próxima para a mais distante, e as recorrentes ocupam a posição da sua próxima ocorrência; atividades sem data prevista ficam ao final.
3. **Given** mais resultados do que cabem em uma página, **When** a listagem é exibida, **Then** há controles de página anterior e próxima e de números de página, e a página atual é identificada de forma programática e visual.
4. **Given** a primeira página, **When** exibida, **Then** o controle "Anterior" aparece como indisponível (e igualmente "Próxima" na última página), com o estado comunicado às tecnologias assistivas.
5. **Given** a pessoa aciona outra página, **When** a consulta é feita, **Then** os filtros aplicados são mantidos, os resultados anteriores dão lugar a esqueletos de card (sem misturar resultados antigos e novos) e a página escolhida fica refletida no endereço.
6. **Given** que todos os resultados cabem em uma única página, **When** a listagem é exibida, **Then** a paginação não é apresentada.
7. **Given** a ordem de atividades, **When** a interface a apresenta, **Then** usa a ordem devolvida pela API, sem reordenar nem recalcular ocorrências no navegador.
8. **Given** atividades canceladas ou encerradas, **When** a listagem é exibida, **Then** nenhuma delas aparece (regra aplicada pela API).
9. **Given** o foco do teclado em um controle de paginação, **When** a nova página termina de carregar, **Then** o foco continua em um elemento visível e operável e o início da lista é anunciado ou alcançável sem que a pessoa precise voltar manualmente ao topo.

---

### User Story 2 - Pesquisar por texto e filtrar por unidade, categoria e período (Priority: P1)

A pessoa digita parte do nome de uma atividade, escolhe (opcionalmente) uma unidade, uma categoria e um período, e aciona "Filtrar". Só então a listagem é atualizada, com esqueletos durante a consulta, e volta para a página 1. Enquanto a pessoa altera os campos antes de aplicar, os resultados que já estavam na tela permanecem. Os critérios aplicados ficam no endereço, de modo que a busca pode ser copiada, compartilhada e reaberta. Quem chega com critérios no endereço (por exemplo, vindo da Início) vê os campos já preenchidos e a listagem já filtrada.

**Why this priority**: É a razão de existir da página Explorar; sem pesquisa e filtros a listagem não ajuda quem procura algo específico. Junto com a Story 1 forma o núcleo utilizável.

**Independent Test**: Preencher termo, unidade, categoria e período, conferir que nada é consultado até acionar "Filtrar", que o endereço passa a refletir os critérios e a página volta à 1; depois abrir esse endereço em uma nova janela e conferir os mesmos campos e resultados.

**Acceptance Scenarios**:

1. **Given** a página Explorar, **When** exibida, **Then** há campo de pesquisa por nome, três filtros (unidade, categoria e período) de seleção única e os botões "Filtrar" e "Limpar filtros", todos com rótulo visível e acessível e operáveis por teclado.
2. **Given** que a pessoa altera o texto ou qualquer filtro, **When** ainda não acionou "Filtrar", **Then** nenhuma consulta é feita e os resultados atuais continuam visíveis.
3. **Given** critérios alterados, **When** a pessoa aciona "Filtrar" (clique, toque ou Enter em um campo), **Then** os resultados são substituídos por esqueletos, uma consulta é feita com os critérios combinados (critério "E"), a página volta a 1 e o endereço passa a refletir os critérios.
4. **Given** que a pessoa estava na página 3, **When** aplica uma nova pesquisa, **Then** a listagem mostra a página 1 dos novos resultados.
5. **Given** as opções de unidade e categoria, **When** exibidas, **Then** correspondem às unidades e categorias ativas da API, ordenadas por nome, e nenhuma opção inexistente é oferecida; as opções de período são "Qualquer data", "Hoje", "Próximos 7 dias" e "Este mês", calculadas no fuso de São Paulo.
6. **Given** um endereço com critérios (por exemplo, `explorar.html?q=dança&unit=…&date_from=…`), **When** a página é aberta, **Then** os campos aparecem preenchidos com esses critérios, a listagem já vem filtrada e a página indicada é a exibida.
7. **Given** um endereço com parâmetros inválidos (UUID malformado, página negativa, data inválida, período desconhecido, termo acima de 100 caracteres), **When** a página é aberta, **Then** os valores inválidos são ignorados ou normalizados para valores seguros, nenhuma consulta que a API recusaria é enviada e a página continua utilizável.
8. **Given** um termo só com espaços, **When** a pessoa aciona "Filtrar", **Then** é tratado como vazio; **And** o campo limita o termo a 100 caracteres, o máximo aceito pela API.
9. **Given** uma pessoa que aciona "Filtrar" repetidas vezes ou muda os critérios e aplica em seguida, **When** há consultas em andamento, **Then** apenas o resultado da última pesquisa é exibido, nunca o de uma consulta anterior que chegou depois.
10. **Given** que a lista de unidades ou de categorias não pôde ser carregada, **When** a página é exibida, **Then** o filtro afetado oferece apenas "todas", a pessoa é informada de que as opções não puderam ser carregadas e a pesquisa por texto e os demais filtros continuam funcionando.
11. **Given** que a pessoa usa os botões voltar/avançar do navegador entre estados de pesquisa da própria página, **When** navega pelo histórico, **Then** campos, endereço e listagem voltam a ser consistentes com o estado daquele ponto do histórico.

---

### User Story 3 - Limpar os filtros e recomeçar (Priority: P1)

A pessoa que aplicou critérios e quer recomeçar aciona "Limpar filtros". Os campos voltam aos valores padrão ("todas as unidades", "todas as categorias", "qualquer data", texto vazio), a página volta à 1, o endereço deixa de ter critérios e a listagem geral é consultada automaticamente, sem exigir novo clique em "Filtrar".

**Why this priority**: É o caminho de saída de uma pesquisa sem resultado e complementa a pesquisa e os filtros; faz parte do critério de aceite da página.

**Independent Test**: Aplicar critérios, acionar "Limpar filtros" e conferir campos padrão, endereço sem critérios e listagem geral carregada.

**Acceptance Scenarios**:

1. **Given** critérios aplicados, **When** a pessoa aciona "Limpar filtros", **Then** todos os campos voltam ao padrão, a página volta à 1, o endereço fica sem critérios e a listagem geral é solicitada automaticamente.
2. **Given** a listagem geral sendo consultada após a limpeza, **When** a consulta está em andamento, termina vazia ou falha, **Then** os mesmos estados de carregamento, vazio e erro das demais consultas são usados.
3. **Given** critérios digitados mas ainda não aplicados, **When** a pessoa aciona "Limpar filtros", **Then** esses critérios também são descartados.
4. **Given** que a listagem já está sem critérios, **When** a pessoa aciona "Limpar filtros", **Then** nada quebra e não há consulta redundante visível ao usuário.
5. **Given** o acionamento de "Limpar filtros", **When** a atualização termina, **Then** o foco permanece em um elemento visível e operável (por padrão, no próprio botão ou em outro controle estável da barra de filtros).

---

### User Story 4 - Saber quantas atividades foram encontradas (Priority: P1)

Depois de cada consulta bem-sucedida, a pessoa vê quantas atividades foram encontradas no total ("1 atividade encontrada", "12 atividades encontradas"), e quem usa leitor de tela recebe a mesma informação por uma região de status, sem que o foco se mova. A quantidade nunca é a da página atual apresentada como se fosse o total.

**Why this priority**: Dá contexto à pesquisa e confirma ao usuário que os critérios surtiram efeito; é critério de aceite do fluxo essencial e simples de entregar com a listagem.

**Independent Test**: Aplicar uma pesquisa com 1 resultado, outra com vários resultados em mais de uma página e a geral; conferir o texto (singular/plural), que o total é o total geral e que o anúncio ocorre uma vez, sem mover o foco.

**Acceptance Scenarios**:

1. **Given** uma consulta com sucesso e total confiável, **When** os resultados são exibidos, **Then** aparece a quantidade total com concordância correta ("1 atividade encontrada" / "N atividades encontradas").
2. **Given** resultados em várias páginas, **When** a pessoa troca de página, **Then** a quantidade exibida continua sendo o total geral, não o número de cards da página.
3. **Given** a atualização do resultado, **When** concluída, **Then** a quantidade é comunicada por uma região de status acessível, uma única vez, sem deslocar o foco.
4. **Given** que não foi possível obter um total confiável, **When** os resultados são exibidos, **Then** nenhuma quantidade é apresentada (a interface não inventa um número).
5. **Given** a consulta em andamento, **When** os esqueletos estão visíveis, **Then** a quantidade anterior não é mostrada como se fosse a atual, e o carregamento é comunicado de forma breve às tecnologias assistivas.

---

### User Story 5 - Entender quando não há resultados e quando há erro (Priority: P1)

Se nenhuma atividade corresponde aos critérios, a pessoa vê "Nenhuma atividade encontrada", com orientação para ajustar ou limpar os filtros; os campos continuam disponíveis para edição. Se a consulta falha por problema de comunicação com a API, a pessoa vê uma mensagem amigável diferente, com o botão "Tentar novamente", que refaz a consulta com esqueletos. Lista vazia e erro nunca se confundem.

**Why this priority**: Pesquisas sem resultado são comuns e falhas de API são esperadas; sem estados distintos a página parece quebrada ou ambígua. Faz parte dos critérios de aceite das páginas essenciais.

**Independent Test**: Aplicar um termo sem correspondência e conferir a mensagem de vazio com ação para limpar; simular falha de rede e erro de servidor e conferir a mensagem de erro com "Tentar novamente", inclusive uma segunda falha e uma recuperação.

**Acceptance Scenarios**:

1. **Given** uma consulta com sucesso e zero resultados, **When** a listagem é exibida, **Then** aparece uma mensagem própria e distinta de erro ("Nenhuma atividade encontrada") com orientação para alterar ou limpar os filtros, sem paginação nem quantidade enganosa.
2. **Given** a mensagem de lista vazia, **When** a pessoa edita os campos de pesquisa e filtros, **Then** eles continuam disponíveis e funcionais; **And** há uma ação para limpar os filtros.
3. **Given** uma falha de rede, erro de servidor, tempo esgotado, limite de requisições (`429`) ou resposta inesperada, **When** a consulta termina, **Then** os esqueletos dão lugar a uma mensagem amigável, sem detalhes técnicos, e ao botão "Tentar novamente", sem mostrar resultados antigos como atuais.
4. **Given** a mensagem de erro, **When** a pessoa aciona "Tentar novamente", **Then** a mensagem dá lugar a esqueletos e a consulta é refeita com os mesmos critérios e página; uma nova falha restaura a mensagem e o botão.
5. **Given** cliques repetidos e rápidos em "Tentar novamente", **When** há consulta em andamento, **Then** não são iniciadas consultas redundantes.
6. **Given** a lista vazia, o erro ou o carregamento, **When** o estado muda, **Then** a mudança é comunicada por região de status acessível, sem mover o foco.
7. **Given** que o endereço da API não está configurado ou é inválido, **When** a página é exibida, **Then** o aviso de configuração existente é apresentado e a listagem não fica em esqueleto indefinidamente.
8. **Given** uma página fora do intervalo no endereço (por exemplo, `?page=999`, que a API recusa), **When** a página é aberta, **Then** a interface volta à página 1 dos mesmos critérios em vez de mostrar erro técnico ou uma lista incorreta.

---

### User Story 6 - Voltar dos detalhes para a listagem como a deixei (Priority: P2)

A pessoa abre os detalhes de uma atividade a partir da listagem e, ao voltar (pelo botão voltar do navegador ou por um link de retorno), reencontra a listagem com o mesmo termo, filtros e página, os mesmos resultados sem espera desnecessária e, quando possível, a mesma posição de rolagem. Se abriu os detalhes diretamente por um link, há um caminho claro para "Explorar atividades".

**Why this priority**: Melhora muito a comparação entre atividades e reduz retrabalho, mas a listagem é plenamente utilizável sem isso (os critérios já ficam no endereço); por isso vem depois do núcleo funcional.

**Independent Test**: Aplicar critérios, ir à página 2, rolar, abrir uma atividade e voltar pelo histórico; conferir campos, página, resultados e posição. Repetir abrindo os detalhes por link direto e conferindo o caminho para Explorar.

**Acceptance Scenarios**:

1. **Given** critérios e página aplicados, **When** a pessoa abre os detalhes e volta pelo histórico do navegador, **Then** campos, endereço e página da listagem são os mesmos de antes.
2. **Given** que os resultados anteriores ainda são válidos, **When** a pessoa volta dos detalhes, **Then** a listagem aparece sem esqueletos prolongados, reaproveitando os resultados guardados quando possível.
3. **Given** que a posição de rolagem anterior pode ser restaurada, **When** a listagem reaparece, **Then** a página retorna aproximadamente ao ponto em que estava (ao card aberto); se não for viável, a listagem começa no topo sem erro.
4. **Given** que o estado guardado está ausente, expirado ou foi descartado, **When** a pessoa volta, **Then** a listagem é reconstruída a partir do endereço com uma nova consulta e continua correta.
5. **Given** dados guardados que ficaram desatualizados (por exemplo, após tempo prolongado), **When** a pessoa volta, **Then** a interface não apresenta como atuais resultados que podem não valer mais (o conteúdo é revalidado ou recarregado).
6. **Given** a página de detalhes aberta diretamente por link, **When** a pessoa procura voltar, **Then** existe um caminho claro para a página Explorar atividades.

---

### Edge Cases

- Termo com acentos, "&", "#", espaços e aspas: chega à API e ao endereço sem corromper os parâmetros.
- Termo de 100 caracteres exatos: aceito; acima disso, bloqueado no campo e ignorado se vier pelo endereço.
- `date` presente junto com `date_from`/`date_to` no endereço: a interface prioriza uma combinação válida e nunca envia uma combinação que a API recusaria.
- `date_from` posterior a `date_to`, intervalo acima de 366 dias ou datas inválidas no endereço: normalizados antes da consulta; a página abre utilizável.
- Parâmetros desconhecidos no endereço (por exemplo, `period` vindo do envio sem JavaScript da Início): ignorados sem erro; as chaves de período conhecidas são traduzidas para as datas correspondentes.
- Unidade ou categoria do endereço que não existe mais ou deixou de estar ativa: o campo cai no padrão e a pessoa é informada de que o critério não pôde ser aplicado; a página não quebra.
- A API responde `400` para `page` fora do intervalo (divergência registrada em docs/PENDENCIAS-BACKEND.md): tratado como página inexistente, com retorno à página 1.
- O total de resultados diminui entre duas consultas e a página atual deixa de existir: volta à última página válida ou à primeira, sem tela vazia enganosa.
- Atividade sem ocorrência futura, sem categoria ou sem unidade em um resultado: o card se mantém íntegro, sem textos "undefined" ou "null".
- Título muito longo ou sem espaços: quebra dentro do card sem estourar o layout.
- Atividades sem imagem (caso normal nesta versão): visual padrão de imagem ausente, sem ícone quebrado.
- Resposta atrasada de uma consulta anterior (troca rápida de página ou de critérios, saída da página): nunca sobrescreve o resultado mais recente nem causa erro visível.
- JavaScript indisponível: a página mostra uma mensagem estática de que a listagem depende de JavaScript, e a navegação principal continua funcionando.
- Muitas páginas de resultados: a paginação continua utilizável em 320 px de largura (por exemplo, exibindo apenas uma janela de números ao redor da página atual) sem rolagem horizontal.
- Texto ampliado a 200% e movimento reduzido: barra de filtros reorganiza-se em coluna, e os esqueletos não têm animação.

## Requirements *(mandatory)*

### Functional Requirements

**Estrutura da página**

- **FR-001**: A página Explorar atividades MUST apresentar, nesta ordem: título principal e frase de apoio, campo de pesquisa por texto, barra de filtros (unidade, categoria e período) com os botões "Filtrar" e "Limpar filtros", área de resultados (quantidade, cards ou estado vazio/erro) e paginação.
- **FR-002**: A página MUST ter um único título principal, títulos de seção sem saltos de nível e a estrutura semântica compartilhada (link de pular conteúdo, cabeçalho, navegação, conteúdo principal, rodapé).
- **FR-003**: A página MUST funcionar quando aberta diretamente por seu endereço, com ou sem critérios.

**Pesquisa e filtros (FE-019, FE-020)**

- **FR-004**: O campo de pesquisa e cada filtro MUST ter rótulo visível associado programaticamente e ser operável por teclado; os filtros MUST ser de seleção única.
- **FR-005**: As opções de unidade e categoria MUST vir das unidades e categorias ativas da API, ordenadas por nome; as de período MUST ser "Qualquer data", "Hoje", "Próximos 7 dias" e "Este mês", traduzidas para critérios de data da API no fuso de São Paulo. O sistema MUST NOT oferecer filtros que a API não suporte.
- **FR-006**: Alterar o texto ou os filtros MUST NOT disparar consulta; os critérios MUST ser aplicados somente por "Filtrar" (clique, toque ou Enter em um campo).
- **FR-007**: Enquanto a pessoa altera os campos antes de aplicar, os resultados atuais MUST permanecer visíveis e inalterados.
- **FR-008**: Ao aplicar, o sistema MUST consultar a API combinando todos os critérios informados (critério "E"), substituir os resultados por esqueletos durante a consulta e reiniciar a paginação na página 1.
- **FR-009**: O termo MUST ser normalizado (espaços nas pontas removidos; só espaços equivale a vazio), limitado a 100 caracteres e transportado sem alteração do conteúdo, inclusive com acentos e caracteres especiais.
- **FR-010**: O sistema MUST NOT enviar à API valores que ela recusaria (termo acima de 100 caracteres, UUID malformado, datas inválidas, `date` combinada com `date_from`/`date_to`, `date_from` posterior a `date_to`, intervalo acima de 366 dias, página menor que 1).
- **FR-011**: Se a lista de unidades ou de categorias não puder ser carregada, o filtro afetado MUST oferecer apenas "todas", MUST informar a pessoa de que as opções não puderam ser carregadas e MUST NOT impedir a pesquisa por texto nem os demais filtros.

**Estado na URL (FE-019, FE-020, FE-021, FE-024)**

- **FR-012**: Os critérios aplicados (termo, unidade, categoria, período) e a página atual MUST ser representados no endereço da página, com os mesmos nomes de parâmetro do contrato de endereço já usado pela Início (`q`, `unit`, `category`, `date`, `date_from`, `date_to`) e `page` para a página, de modo que o endereço possa ser copiado, compartilhado e reaberto; valores padrão e vazios MUST NOT entrar no endereço.
- **FR-013**: Ao abrir a página, o sistema MUST ler o endereço, preencher os campos, consultar a listagem correspondente e exibir a página indicada; parâmetros inválidos ou desconhecidos MUST ser ignorados ou normalizados para valores seguros, sem quebrar a página.
- **FR-014**: Aplicar critérios, limpar filtros e trocar de página MUST criar uma entrada no histórico do navegador, e usar voltar/avançar MUST restaurar campos, endereço e listagem daquele ponto, sem recarregar a página inteira.
- **FR-015**: O sistema MUST tolerar o parâmetro `period` (chave de período) vindo do envio sem JavaScript da página Início, traduzindo as chaves conhecidas para os critérios de data e ignorando as desconhecidas.

**Limpar filtros (FE-021)**

- **FR-016**: "Limpar filtros" MUST restaurar todos os campos aos valores padrão (inclusive o termo e quaisquer critérios digitados e ainda não aplicados), reiniciar a página em 1, atualizar o endereço para o estado sem critérios e consultar automaticamente a listagem geral, sem exigir "Filtrar".
- **FR-017**: A consulta disparada por "Limpar filtros" MUST usar os mesmos estados de carregamento, vazio e erro das demais consultas.

**Resultados, quantidade e ordem (FE-022, FE-026)**

- **FR-018**: Cada resultado MUST ser exibido com o card de atividade compartilhado (categoria, nome, unidade, próxima data e horário ou "Sem data prevista", visual de imagem ausente) e MUST abrir os detalhes da atividade na mesma aba por um endereço direto.
- **FR-019**: A ordem dos resultados MUST ser a devolvida pela API (próxima ocorrência futura mais próxima primeiro, recorrentes pela próxima ocorrência, sem ocorrência ao final); o frontend MUST NOT reordenar, recalcular ocorrências nem criar regra de ordenação própria.
- **FR-020**: A listagem MUST mostrar apenas o que a API devolve como público, sem tentar exibir ou filtrar atividades canceladas ou encerradas por conta própria.
- **FR-021**: Após cada consulta bem-sucedida com total confiável, o sistema MUST exibir a quantidade total de resultados da pesquisa com concordância correta ("1 atividade encontrada", "N atividades encontradas") e MUST comunicá-la por uma região de status acessível, uma única vez, sem mover o foco.
- **FR-022**: O sistema MUST NOT apresentar a quantidade de cards da página atual como total geral e MUST NOT mostrar quantidade quando não houver total confiável.

**Paginação (FE-024)**

- **FR-023**: Havendo mais de uma página de resultados, o sistema MUST oferecer paginação tradicional com controles anterior/próxima e números de página, usando o tamanho de página e o total que a API informa; sem mais de uma página, a paginação MUST NOT ser exibida.
- **FR-024**: A página atual MUST ser identificada de forma visual e programática; controles indisponíveis (anterior na primeira página, próxima na última) MUST ter o estado comunicado de forma acessível; todos MUST ter nomes acessíveis e ser operáveis por teclado; a paginação MUST funcionar em 320 px sem rolagem horizontal.
- **FR-025**: Trocar de página MUST manter os critérios aplicados, mostrar esqueletos no lugar dos resultados anteriores, atualizar o endereço e MUST NOT deslocar o foco para um elemento que deixou de existir.
- **FR-026**: Se a API recusar a página solicitada por estar fora do intervalo (inclusive com resposta `400` ou `404`), o sistema MUST retornar à página 1 dos mesmos critérios, sem mostrar erro técnico nem simular páginas incorretas.

**Estados de carregamento, vazio e erro (FE-023)**

- **FR-027**: Durante qualquer consulta da listagem, o sistema MUST exibir esqueletos de card no lugar dos resultados, ocultos das tecnologias assistivas, sem misturar resultados antigos e novos, e MUST comunicar o carregamento por região de status breve e acessível.
- **FR-028**: Consulta com sucesso e zero resultados MUST exibir mensagem própria e distinta de erro ("Nenhuma atividade encontrada"), com orientação para alterar ou limpar os filtros, comunicada às tecnologias assistivas, mantendo os campos disponíveis para edição.
- **FR-029**: Falha de rede, tempo esgotado, erro de servidor, limite de requisições ou resposta inesperada MUST exibir mensagem amigável, sem detalhes técnicos, e o botão "Tentar novamente", sem mostrar resultados antigos como atuais; acionar o botão MUST refazer a consulta com os mesmos critérios e página, com esqueletos; nova falha MUST restaurar a mensagem.
- **FR-030**: Cliques repetidos em ações que disparam consulta ("Filtrar", "Limpar filtros", paginação, "Tentar novamente") MUST NOT gerar consultas redundantes, e uma resposta atrasada MUST NOT sobrescrever uma mais recente.
- **FR-031**: Mudanças de estado (carregando, concluído, vazio, erro) MUST ser comunicadas por região de status e MUST NOT deslocar o foco do teclado; o foco MUST permanecer sempre em elemento visível e operável.
- **FR-032**: Se o endereço da API não estiver configurado, o aviso de configuração existente MUST ser exibido e a listagem MUST NOT ficar em esqueleto indefinidamente.

**Retorno dos detalhes (FE-025)**

- **FR-033**: Ao voltar dos detalhes pelo histórico, o sistema MUST restaurar termo, filtros e página, e SHOULD reaproveitar os resultados anteriores quando ainda válidos e restaurar a posição de rolagem quando tecnicamente viável.
- **FR-034**: Na ausência, expiração ou invalidez do estado guardado, o sistema MUST reconstruir a listagem a partir do endereço com uma nova consulta; resultados guardados MUST NOT ser apresentados como atuais além do prazo em que continuam confiáveis.
- **FR-035**: Para quem chega aos detalhes sem estado anterior, MUST existir caminho claro para a página Explorar atividades (a ser entregue junto à página de detalhes ou verificado como já existente).

**Transversais**

- **FR-036**: A página MUST cumprir os requisitos de acessibilidade do DOC-15 (WCAG 2.2 AA): teclado sem armadilhas, foco visível e não obscurecido, contraste, reflow até 320 px, ampliação de texto a 200%, movimento reduzido, estados não comunicados só por cor, erros e avisos em texto.
- **FR-037**: Todo texto vindo da API MUST ser inserido de forma segura (como texto, nunca como HTML), e a página MUST NOT conter credenciais nem segredos.
- **FR-038**: Sem JavaScript, a página MUST exibir uma mensagem estática informando que a listagem depende de JavaScript, mantendo a navegação principal funcional.

### Key Entities *(include if feature involves data)*

- **Critérios de pesquisa**: o conjunto de termo de texto (até 100 caracteres), unidade, categoria e período escolhidos; todos opcionais, combinados por "E". Existem em dois estados: *em edição* (nos campos, ainda não aplicados) e *aplicados* (no endereço e na última consulta).
- **Atividade (resumo)**: item da listagem, com identificador, título, unidade (nome e bairro), categoria (nome) e próxima ocorrência (data, horário de início e fim) quando houver; não traz imagem nesta versão.
- **Página de resultados**: um recorte da listagem, com total geral de atividades, indicação de página anterior e próxima, página atual e tamanho de página.
- **Opção de filtro**: unidade ou categoria ativa (identificador e nome) ou período predefinido (chave, rótulo e intervalo de datas calculado em São Paulo).
- **Estado guardado da listagem**: critérios aplicados, página, resultados e posição de rolagem preservados para a volta dos detalhes, com prazo de validade.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Uma pessoa visitante consegue, a partir da página Explorar, encontrar uma atividade específica combinando termo, unidade, categoria e período e abrir seus detalhes em até 1 minuto e sem ajuda, em pelo menos 90% das tentativas de teste de usabilidade.
- **SC-002**: Em 100% dos casos verificados, a alteração de campos antes de acionar "Filtrar" não dispara nenhuma consulta e não altera os resultados exibidos.
- **SC-003**: Em 100% dos casos verificados, aplicar uma nova pesquisa ou limpar filtros resulta na página 1, e o endereço resultante, aberto em uma nova janela, reproduz os mesmos campos, página e resultados.
- **SC-004**: Em até 2 segundos após a resposta da API chegar, a listagem, a quantidade e a paginação estão atualizadas na tela, para páginas de até 50 atividades.
- **SC-005**: Em 100% das consultas, a quantidade exibida corresponde ao total geral informado pela API (nunca ao tamanho da página) e usa singular/plural corretos.
- **SC-006**: Nos cenários de teste de lista vazia e de erro, 100% das pessoas avaliadas distinguem corretamente "nenhum resultado" de "falha de comunicação" e sabem qual ação tomar (ajustar/limpar filtros ou tentar novamente).
- **SC-007**: Em testes de corrida (consultas disparadas em rápida sucessão), 0 ocorrências de resultado antigo sobrescrevendo o mais recente.
- **SC-008**: Ao voltar dos detalhes pelo histórico, em pelo menos 95% dos casos com estado guardado válido a listagem reaparece com os mesmos critérios, página e resultados, sem nova espera perceptível, e em 100% dos casos sem estado guardado a listagem é reconstruída corretamente a partir do endereço.
- **SC-009**: A página inteira (campos, filtros, paginação, estados e retorno) é operável apenas com teclado, e os anúncios de carregamento, quantidade, vazio e erro são percebidos por leitor de tela sem movimentar o foco, em testes manuais com pelo menos um leitor de tela.
- **SC-010**: A página permanece utilizável, sem perda de conteúdo ou função e sem rolagem horizontal, em 320 px de largura e com texto ampliado a 200%, e passa nas verificações automáticas de acessibilidade sem violações graves.
- **SC-011**: Nenhuma combinação de parâmetros de endereço (inválidos, desconhecidos, fora do intervalo) deixa a página em branco, em esqueleto indefinido ou com erro técnico visível.

## Assumptions

- A API pública de consulta segue o contrato em `agenda-livre-backend/specs/006-public-consultation/contracts/public-api.md`: `GET /activities/` aceita `q`, `unit`, `category`, `date`, `date_from`, `date_to`, `page` e `page_size`; responde no envelope `{count, next, previous, results}`; ordena por próxima ocorrência; e `GET /units/` e `GET /categories/` listam apenas registros ativos. O total `count` é considerado confiável.
- O filtro por bairro (`neighborhood`) existe na API, mas não está no backlog do frontend nem nos wireframes; fica **fora do escopo** desta feature.
- O tamanho de página é o padrão da API (12), em múltiplos adequados à grade de 3 colunas; o usuário não escolhe o tamanho.
- Para "página fora do intervalo", a API hoje responde `400` em vez do `404` do contrato (pendência registrada em `docs/PENDENCIAS-BACKEND.md`); a interface trata ambos como "página inexistente" e volta à página 1, independentemente de como o backend resolver a pendência.
- A página Início (feature 005) já entrega o contrato de endereço para a Explorar (`explorar.html?q=…&unit=…&category=…&date…`); esta feature o consome sem alterá-lo.
- Os componentes compartilhados (card de atividade, esqueleto, mensagens de status e erro, cliente HTTP com cancelamento de consultas concorrentes, navegação) e a identidade visual já existem (features 002 a 004) e serão reutilizados; a paginação é um componente novo, previsto no DOC-09.
- O endereço dos detalhes das atividades segue o padrão já usado pelo card compartilhado; a página de detalhes em si pertence ao EP-FE-07, e o caminho de retorno para a Explorar na ausência de histórico (FR-035) é verificado em conjunto com ela.
- A preservação de resultados e rolagem para o retorno (FE-025, prioridade P1 no backlog) é "quando tecnicamente viável"; o prazo de validade do estado guardado é curto (alguns minutos) e será definido no planejamento.
- Como a API não fornece imagens de atividades nesta versão, todos os cards usam o visual de imagem ausente.
- Ordenação e cálculo de ocorrências são responsabilidade exclusiva do backend; o frontend não duplica essas regras.
- No celular, os filtros ficam empilhados na vertical; agrupá-los em seção expansível é opcional (wireframe 5.4) e não é exigido por esta spec.
- Fora do escopo: detalhes da atividade (EP-FE-07), páginas institucionais (EP-FE-08), ordenação escolhida pelo usuário, escolha do tamanho da página, filtros além de unidade/categoria/período e rolagem infinita.
