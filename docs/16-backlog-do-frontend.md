# DOC-16 — Backlog do Frontend

**Projeto:** Agenda Livre  
**Versão:** 0.1  
**Status:** Proposta inicial para revisão  
**Escopo:** Implementação do frontend público do Agenda Livre.

## 1. Objetivo

Organizar o trabalho do frontend em épicos, features e histórias de usuário, com prioridades, critérios de aceitação e dependências. Este backlog transforma as decisões dos documentos de especificação em unidades de trabalho verificáveis.

O DOC-16 complementa o DOC-04 — Backlog do Produto. O DOC-04 organiza o produto como um todo e prioriza especialmente o backend; este documento detalha o trabalho específico da interface pública. Quando houver sobreposição, a história do frontend descreve a experiência no navegador e depende do contrato da API definido no DOC-05.

As prioridades são propostas iniciais e devem ser revistas após estimativa de esforço e planejamento de implementação.

## 2. Convenções

### 2.1 Hierarquia

- **Épico:** área ampla de trabalho.
- **Feature:** capacidade funcional que agrupa histórias relacionadas.
- **História de usuário:** necessidade expressa do ponto de vista de quem usa ou mantém o sistema.
- **Critérios de aceitação:** resultados observáveis usados para validar a história.

### 2.2 Formato das histórias

> Como [tipo de usuário], quero [capacidade], para [benefício].

Cada história contém identificador, prioridade, descrição, critérios de aceitação e dependências/referências quando relevantes.

### 2.3 Prioridades

- **P0 — Essencial:** necessário para uma primeira versão utilizável e acessível.
- **P1 — Importante:** completa a experiência ou reduz riscos relevantes, mas pode vir depois do núcleo funcional.
- **P2 — Futuro:** melhoria que pode ser planejada para uma versão posterior.

Requisitos de acessibilidade aplicáveis aos fluxos essenciais fazem parte dos critérios de aceite dessas histórias; não são adiados para uma etapa futura de “acessibilização”.

### 2.4 Premissas
- Frontend com HTML semântico, CSS e JavaScript puro, organizado em módulos ES Modules.
- Frontend hospedado separadamente do backend Django.
- Comunicação com a API REST por HTTP usando Fetch API.
- Sem framework frontend ou roteador SPA.
- O Django Admin continua sendo a interface administrativa.
- O formulário de contato é demonstrativo e não envia mensagens.
- A meta de acessibilidade do projeto é WCAG 2.2 nível AA.
- Funcionalidades dependentes da API só serão consideradas concluídas quando o contrato real do DOC-05 as suportar.

## 3. Visão geral dos épicos

| Código | Épico | Objetivo |
|---|---|---|
| EP-FE-01 | Estrutura e configuração do frontend | Preparar arquivos, módulos e configurações para desenvolvimento e execução. |
| EP-FE-02 | Cliente e integração com a API | Centralizar comunicação HTTP e tratar respostas de forma consistente. |
| EP-FE-03 | Navegação e componentes compartilhados | Implementar estrutura comum, navegação e componentes reutilizáveis. |
| EP-FE-04 | Identidade visual e responsividade | Aplicar o design system e adaptar a interface a diferentes telas. |
| EP-FE-05 | Página inicial | Apresentar o projeto, pesquisa rápida e próximas atividades. |
| EP-FE-06 | Exploração de atividades | Permitir pesquisar, filtrar e navegar pelos resultados. |
| EP-FE-07 | Detalhes das atividades | Apresentar detalhes, links externos e estados de indisponibilidade. |
| EP-FE-08 | Páginas institucionais e contato | Implementar Sobre e formulário demonstrativo. |
| EP-FE-09 | Acessibilidade transversal | Validar e corrigir acessibilidade nas páginas e componentes. |
| EP-FE-10 | Testes e qualidade do frontend | Automatizar verificações e registrar critérios de qualidade. |

---

## 4. EP-FE-01 — Estrutura e configuração do frontend

### Feature FE-F01 — Estrutura de páginas e módulos

#### FE-001 — Criar a estrutura inicial do frontend
**Prioridade:** P0

Como pessoa desenvolvedora, quero uma estrutura organizada de páginas, estilos, scripts e recursos, para manter o frontend fácil de entender e evoluir.

**Critérios de aceitação**
- Existem páginas HTML separadas para Início, Explorar, Detalhes, Sobre e Contato.
- CSS e JavaScript ficam organizados em diretórios com responsabilidades claras.
- O JavaScript utiliza módulos ES Modules.
- A estrutura não exige framework frontend nem roteador SPA.
- A organização real é documentada no README ou na documentação técnica.
- Não são criados arquivos vazios sem função definida.

#### FE-002 — Configurar a URL base da API
**Prioridade:** P0

Como pessoa desenvolvedora, quero configurar a URL base da API em um único lugar, para alternar entre ambientes sem alterar vários módulos.

**Critérios de aceitação**
- Os módulos não espalham URLs fixas da API pelo código.
- A configuração permite apontar para a API do ambiente utilizado.
- A configuração contém apenas valores públicos e nenhum segredo.
- A aplicação apresenta erro compreensível quando a configuração necessária está ausente ou inválida.

**Dependências:** DOC-05 e DOC-08.

---

## 5. EP-FE-02 — Cliente e integração com a API

### Feature FE-F02 — Cliente HTTP comum

#### FE-003 — Centralizar requisições HTTP
**Prioridade:** P0

Como pessoa desenvolvedora, quero um cliente HTTP compartilhado, para manter consistentes as requisições e o tratamento das respostas da API.

**Critérios de aceitação**
- As chamadas utilizam Fetch API por meio de um módulo compartilhado.
- URLs e parâmetros são construídos por APIs apropriadas, como `URL` e `URLSearchParams`.
- A resposta HTTP é verificada por `response.ok`.
- Respostas JSON, respostas sem corpo e respostas inválidas são tratadas conforme o endpoint.
- Erros de rede e erros HTTP são diferenciáveis.
- As páginas recebem erros de forma consistente e podem apresentar o estado apropriado.

#### FE-004 — Tratar falhas e respostas inesperadas da API
**Prioridade:** P0

Como pessoa visitante, quero receber mensagens claras quando não for possível carregar os dados, para entender o que aconteceu e o que posso fazer.

**Critérios de aceitação**
- Erros técnicos internos não são exibidos diretamente na interface.
- A falha é distinguida de uma resposta válida sem resultados.
- Quando houver nova tentativa prevista, a interface oferece uma ação “Tentar novamente”.
- O erro é comunicado de forma acessível sem deslocar o foco desnecessariamente.
- Os detalhes técnicos não expõem tokens, segredos ou informações internas.

#### FE-005 — Evitar que respostas antigas sobrescrevam pesquisas recentes
**Prioridade:** P1

Como pessoa visitante, quero ver os resultados da última pesquisa que apliquei, para que respostas lentas não apresentem dados desatualizados.

**Critérios de aceitação**
- Uma nova pesquisa pode cancelar ou invalidar a consulta anterior.
- A resposta de uma consulta antiga não substitui os resultados da pesquisa mais recente.
- O estado de carregamento corresponde à consulta vigente.
- O comportamento é coberto por teste automatizado.

---

## 6. EP-FE-03 — Navegação e componentes compartilhados

### Feature FE-F03 — Navegação entre páginas

#### FE-006 — Navegar entre as páginas públicas
**Prioridade:** P0

Como pessoa visitante, quero navegar entre Início, Explorar, Sobre e Contato, para encontrar as funcionalidades do Agenda Livre.

**Critérios de aceitação**
- A navegação utiliza links HTML nativos com destinos válidos.
- As cinco páginas podem ser acessadas diretamente por URL.
- A página atual é identificada programaticamente.
- A ordem de foco é lógica e os links funcionam com teclado.
- A navegação não depende de JavaScript para realizar a troca básica entre páginas.

#### FE-007 — Usar o menu móvel
**Prioridade:** P0

Como pessoa visitante em um dispositivo móvel, quero abrir e fechar a navegação, para acessar as páginas sem ocupar permanentemente todo o espaço da tela.

**Critérios de aceitação**
- O menu é controlado por botão com nome acessível.
- O estado aberto/fechado é comunicado por `aria-expanded`.
- Links ocultos não permanecem na ordem de foco.
- O menu funciona com teclado e tecnologias assistivas.
- Não são criadas armadilhas de teclado.
- A preferência por movimento reduzido é respeitada.

### Feature FE-F04 — Componentes compartilhados

#### FE-008 — Reutilizar cards de atividades
**Prioridade:** P0

Como pessoa visitante, quero encontrar informações essenciais das atividades em cards consistentes, para comparar opções com facilidade.

**Critérios de aceitação**
- Os cards mantêm estrutura e hierarquia visual consistentes entre Início e Explorar.
- O conteúdo usa HTML semântico.
- O link principal tem nome acessível claro.
- As informações disponíveis incluem título e metadados relevantes, como categoria, unidade e próxima ocorrência.
- Campos opcionais ausentes não quebram o card.
- A interação principal funciona por teclado.

#### FE-009 — Exibir um fallback quando uma atividade não tiver imagem
**Prioridade:** P0

Como pessoa visitante, quero que atividades sem imagem continuem visualmente completas, para que a ausência de uma imagem não prejudique a leitura da listagem.

**Critérios de aceitação**
- O espaço da imagem usa fundo baseado na identidade visual.
- Pode haver ícone decorativo relacionado à categoria.
- Não aparece imagem quebrada nem espaço vazio inesperado.
- Elementos decorativos não geram anúncios desnecessários em leitores de tela.

#### FE-010 — Exibir mensagens de status compartilhadas
**Prioridade:** P0

Como pessoa visitante, quero compreender quando uma área está carregando, falhou ou não encontrou resultados, para saber como prosseguir.

**Critérios de aceitação**
- Carregamento, erro e ausência de resultados têm mensagens distintas.
- As mensagens são claras e não expõem detalhes técnicos.
- As atualizações são comunicadas às tecnologias assistivas quando apropriado.
- O foco não é movido automaticamente apenas porque o conteúdo mudou.
- Anúncios duplicados são evitados.

---

## 7. EP-FE-04 — Identidade visual e responsividade

### Feature FE-F05 — Aplicar o design system

#### FE-011 — Aplicar tokens visuais compartilhados
**Prioridade:** P0

Como pessoa visitante, quero uma interface visualmente consistente, para reconhecer padrões de navegação e interação em todo o site.

**Critérios de aceitação**
- Cores, tipografia, espaçamentos, bordas e estilos de foco são centralizados em variáveis CSS quando apropriado.
- A paleta segue o DOC-10, com ajustes nos tons necessários para atender ao contraste.
- Links e botões têm aparência distinguível.
- Estados de foco, hover, selecionado, erro e desabilitado são identificáveis.
- Os estados não dependem apenas de cor.

#### FE-012 — Adaptar o layout a diferentes telas
**Prioridade:** P0

Como pessoa visitante, quero utilizar o site em desktop, tablet e celular, para acessar as atividades no dispositivo disponível.

**Critérios de aceitação**
- Cards se adaptam à largura da tela, com uma coluna em telas estreitas.
- Menu, filtros e formulário permanecem utilizáveis em telas pequenas.
- Não há perda de conteúdo ou funcionalidade nos tamanhos testados.
- O layout é verificado em largura equivalente a 320 pixels CSS.
- Texto ampliado até 200% não causa perda de conteúdo ou funcionalidade.
- Não se desativa o zoom do navegador.

#### FE-013 — Respeitar a preferência por movimento reduzido
**Prioridade:** P0

Como pessoa que prefere movimento reduzido, quero que animações não essenciais sejam minimizadas, para utilizar o site com mais conforto.

**Critérios de aceitação**
- A interface consulta `prefers-reduced-motion`.
- Transições e animações não essenciais são reduzidas ou removidas quando a preferência está ativa.
- Nenhuma informação ou funcionalidade depende da animação.
- O comportamento é testado nos estados relevantes.

---

## 8. EP-FE-05 — Página inicial

### Feature FE-F06 — Pesquisa rápida

#### FE-014 — Pesquisar atividades pela página inicial
**Prioridade:** P0

Como pessoa visitante, quero informar um termo e seguir para a listagem, para encontrar atividades de meu interesse.

**Critérios de aceitação**
- Existe campo de pesquisa com rótulo acessível.
- A pesquisa é aplicada somente quando a pessoa aciona “Explorar”.
- Não são enviadas requisições a cada alteração do texto.
- O termo é encaminhado à listagem e representado na URL quando possível.
- Sem critérios de pesquisa, o botão abre a listagem geral.

### Feature FE-F07 — Filtros rápidos e próximas atividades

#### FE-015 — Selecionar filtros rápidos
**Prioridade:** P0

Como pessoa visitante, quero selecionar unidade, categoria e período na página inicial, para restringir a pesquisa antes de abrir a listagem.

**Critérios de aceitação**
- Os filtros permitem uma seleção por campo.
- Os valores padrão representam todas as unidades, todas as categorias e o período padrão definido.
- Cada controle possui rótulo visível e acessível.
- Selecionar opções não dispara requisições.
- Apenas opções suportadas pela API são oferecidas.

#### FE-016 — Ver as próximas atividades na página inicial
**Prioridade:** P0

Como pessoa visitante, quero ver próximas atividades ao abrir o site, para descobrir opções sem precisar iniciar uma pesquisa.

**Critérios de aceitação**
- A página consulta a API ao ser aberta.
- São exibidas até três atividades publicadas com ocorrências futuras.
- A ordem considera a próxima ocorrência futura, inclusive para atividades recorrentes, conforme o contrato da API.
- Atividades `CANCELLED` e `FINISHED` não aparecem.
- Cada card permite abrir os detalhes em uma URL direta.
- A seção oferece caminho para ver todas as atividades.

#### FE-017 — Entender o carregamento das próximas atividades
**Prioridade:** P0

Como pessoa visitante, quero perceber que as próximas atividades estão sendo carregadas, para entender que a página está buscando dados.

**Critérios de aceitação**
- Durante a consulta, aparecem três skeleton cards.
- Os placeholders não são anunciados como atividades reais.
- O carregamento e a conclusão são comunicados de maneira objetiva às tecnologias assistivas.
- O foco não é deslocado apenas pela atualização.

#### FE-018 — Recuperar uma falha ao carregar próximas atividades
**Prioridade:** P0

Como pessoa visitante, quero tentar novamente quando as próximas atividades não puderem ser carregadas, para ter outra oportunidade de consultar os dados.

**Critérios de aceitação**
- A falha apresenta mensagem clara e botão “Tentar novamente”.
- Acionar a nova tentativa substitui a mensagem por skeleton loading.
- Uma nova falha restaura a mensagem de erro.
- A falha da seção não impede o uso do restante da página.
- O erro é anunciado sem mover o foco desnecessariamente.

---

## 9. EP-FE-06 — Exploração de atividades

### Feature FE-F08 — Pesquisa e filtros

#### FE-019 — Pesquisar atividades por texto
**Prioridade:** P0

Como pessoa visitante, quero pesquisar atividades por texto, para encontrar resultados que correspondam ao que procuro.

**Critérios de aceitação**
- A pesquisa usa os parâmetros definidos no DOC-05.
- A busca só ocorre após a ação “Filtrar”.
- Os resultados atuais permanecem visíveis enquanto os campos são alterados antes da aplicação.
- Ao aplicar uma nova pesquisa, a página atual volta para 1.
- O estado da busca é refletido na URL quando possível.

#### FE-020 — Filtrar atividades por unidade, categoria e período
**Prioridade:** P0

Como pessoa visitante, quero combinar filtros, para reduzir a listagem às atividades relevantes.

**Critérios de aceitação**
- Os filtros disponíveis correspondem às capacidades reais da API.
- Os filtros podem ser combinados.
- Os controles têm rótulos visíveis e são operáveis por teclado.
- Alterar os campos não consulta a API até acionar “Filtrar”.
- Ao aplicar, os resultados são atualizados dinamicamente com skeleton loading.
- A nova consulta começa na página 1.

#### FE-021 — Limpar os filtros
**Prioridade:** P0

Como pessoa visitante, quero limpar os filtros e ver novamente a listagem geral, para recomeçar a pesquisa com facilidade.

**Critérios de aceitação**
- “Limpar filtros” restaura todos os valores padrão.
- A listagem geral é solicitada automaticamente após a limpeza.
- A página atual é redefinida para 1.
- A URL é atualizada quando possível.
- Carregamento, resultado vazio e erro são tratados de acordo com os estados comuns.

### Feature FE-F09 — Resultados e paginação

#### FE-022 — Ver a quantidade de resultados
**Prioridade:** P0

Como pessoa visitante, quero saber quantas atividades foram encontradas, para compreender o resultado da pesquisa.

**Critérios de aceitação**
- O total é exibido quando a API fornece um valor confiável.
- Singular e plural são apresentados corretamente.
- A quantidade é comunicada por uma região de status acessível.
- A atualização não desloca o foco.
- Não se apresenta a quantidade da página atual como total geral.

#### FE-023 — Entender quando não há resultados
**Prioridade:** P0

Como pessoa visitante, quero receber uma mensagem quando nenhum resultado corresponder à pesquisa, para poder ajustar meus critérios.

**Critérios de aceitação**
- A lista vazia tem mensagem própria e distinta de erro técnico.
- A interface orienta a pessoa a alterar ou limpar os filtros.
- A mensagem é comunicada às tecnologias assistivas.
- Os filtros atuais continuam disponíveis para edição.

#### FE-024 — Navegar pela paginação
**Prioridade:** P0

Como pessoa visitante, quero navegar entre páginas de resultados, para consultar muitas atividades sem uma lista excessivamente longa.

**Critérios de aceitação**
- A paginação tradicional é utilizada se suportada pela API.
- Existem controles para páginas e navegação anterior/próxima conforme aplicável.
- A página atual é identificada programaticamente.
- A mudança de página mantém os filtros e apresenta skeleton loading.
- A URL representa a página atual quando possível.
- Se a API não suportar paginação, o comportamento é adaptado ao contrato real e não simula páginas incorretas.

#### FE-025 — Restaurar a listagem ao voltar dos detalhes
**Prioridade:** P1

Como pessoa visitante, quero voltar à listagem no estado em que a deixei, para continuar comparando atividades sem refazer a pesquisa.

**Critérios de aceitação**
- Filtros, termo e página são preservados quando possível.
- A posição de rolagem é restaurada quando tecnicamente viável.
- Resultados anteriores podem ser reutilizados quando ainda válidos.
- O comportamento funciona com histórico do navegador e parâmetros de URL.
- Se não houver estado anterior, existe caminho claro para Explorar.

#### FE-026 — Ordenar pela próxima ocorrência
**Prioridade:** P0

Como pessoa visitante, quero ver primeiro as atividades que acontecerão mais cedo, para encontrar oportunidades próximas.

**Critérios de aceitação**
- A ordem é da próxima ocorrência futura mais próxima para a mais distante.
- Atividades recorrentes usam sua próxima ocorrência futura.
- A responsabilidade por cálculo e ordenação é alinhada com o DOC-05 e o backend.
- A implementação não cria uma regra conflitante com a API.

**Dependências:** suporte de dados e ordenação no backend.

---

## 10. EP-FE-07 — Detalhes das atividades

### Feature FE-F10 — Consulta de detalhes

#### FE-027 — Consultar detalhes de uma atividade
**Prioridade:** P0

Como pessoa visitante, quero abrir uma atividade e consultar suas informações, para decidir se ela é relevante para mim.

**Critérios de aceitação**
- A atividade é carregada por URL direta e identificador válido.
- São exibidos título, categoria, unidade, descrição e dados de ocorrência disponíveis.
- Público-alvo, local e informações adicionais são exibidos quando fornecidos pela API.
- Campos opcionais ausentes não quebram a página.
- O carregamento e os erros seguem os estados comuns acessíveis.

#### FE-028 — Abrir inscrição ou informação externa
**Prioridade:** P1

Como pessoa visitante, quero acessar o link externo de inscrição ou informação quando disponível, para continuar no serviço responsável pela atividade.

**Critérios de aceitação**
- O link só aparece quando há URL válida.
- O link abre em nova aba.
- A abertura em nova aba é indicada de maneira acessível.
- A URL é validada e não permite esquemas perigosos.
- A abertura externa não impede a pessoa de continuar com a página do Agenda Livre.

#### FE-029 — Consultar atividade indisponível ou inexistente
**Prioridade:** P0

Como pessoa visitante, quero entender quando uma atividade não está mais disponível ou não existe, para não confundir os casos.

**Critérios de aceitação**
- Quando a API permite identificar uma atividade cancelada ou encerrada, a interface informa que ela não está mais disponível.
- A página de indisponibilidade oferece “Explorar outras atividades”.
- Uma atividade inexistente apresenta página 404 com caminhos para Início e Explorar.
- A interface não expõe dados privados para distinguir os estados.
- A distinção respeita o contrato real da API.

---

## 11. EP-FE-08 — Páginas institucionais e contato

### Feature FE-F11 — Conteúdo institucional

#### FE-030 — Consultar a página Sobre
**Prioridade:** P0

Como pessoa visitante, quero entender o objetivo do Agenda Livre, para saber como a plataforma pode me ajudar a descobrir atividades.

**Critérios de aceitação**
- A página explica o objetivo do projeto com linguagem direta.
- O conteúdo possui hierarquia de títulos coerente.
- A navegação compartilhada está presente.
- O conteúdo permanece legível em telas estreitas e com ampliação.

### Feature FE-F12 — Formulário de contato demonstrativo

#### FE-031 — Preencher o formulário de contato
**Prioridade:** P1

Como pessoa visitante, quero preencher um formulário de contato demonstrativo, para experimentar a interface e suas validações.

**Critérios de aceitação**
- Existem campos Nome, E-mail, Assunto e Mensagem.
- Os campos obrigatórios estão identificados em texto e programaticamente.
- Cada campo tem rótulo visível associado.
- Os limites e instruções necessários são apresentados.
- A implementação não envia dados a um serviço externo.

#### FE-032 — Receber feedback acessível de validação
**Prioridade:** P1

Como pessoa visitante, quero identificar todos os erros do formulário e entender como corrigi-los, para corrigir os dados sem tentativas repetidas.

**Critérios de aceitação**
- A tentativa inválida apresenta todos os erros encontrados.
- Os erros são específicos, em texto, e associados aos campos.
- Campos inválidos são identificados programaticamente.
- O foco é direcionado ao primeiro campo inválido.
- A pessoa pode percorrer e corrigir os demais erros.
- Os valores válidos já preenchidos são preservados.
- A validação não depende somente da cor.

#### FE-033 — Ver a confirmação demonstrativa
**Prioridade:** P1

Como pessoa visitante, quero receber uma confirmação após preencher corretamente o formulário, para entender o resultado da interação.

**Critérios de aceitação**
- Após validação bem-sucedida, o formulário é substituído por um painel de confirmação.
- O painel afirma explicitamente que o formulário é demonstrativo e que nenhuma mensagem foi enviada.
- A mudança é comunicada às tecnologias assistivas.
- O foco é gerenciado de forma previsível.
- Existe botão “Voltar ao formulário”.
- O comportamento de retorno preserva os valores, salvo se a pessoa escolher limpá-los.

---

## 12. EP-FE-09 — Acessibilidade transversal

Este épico organiza verificações transversais. Os requisitos de acessibilidade também permanecem nos critérios de aceite das histórias funcionais relevantes.

### Feature FE-F13 — Estrutura e navegação acessíveis

#### FE-034 — Implementar estrutura semântica e títulos
**Prioridade:** P0

Como pessoa que utiliza tecnologia assistiva, quero que as páginas tenham regiões e títulos estruturados, para compreender e navegar pelo conteúdo.

**Critérios de aceitação**
- O documento declara `lang="pt-BR"`.
- São utilizados elementos semânticos de acordo com sua função.
- A hierarquia de títulos é lógica.
- Controles interativos são implementados com elementos HTML apropriados.
- ARIA complementa a semântica quando necessário, sem substituir elementos nativos adequados.

#### FE-035 — Pular diretamente ao conteúdo principal
**Prioridade:** P0

Como pessoa que navega por teclado, quero pular o cabeçalho e ir diretamente ao conteúdo principal, para reduzir a navegação repetitiva.

**Critérios de aceitação**
- O link está no início da ordem de foco.
- O link fica visível ao receber foco.
- O destino é o conteúdo principal da página atual.
- O comportamento funciona nas cinco páginas públicas.

#### FE-036 — Usar o site com teclado e foco visível
**Prioridade:** P0

Como pessoa que navega por teclado, quero operar os controles e identificar o foco, para usar o site sem mouse.

**Critérios de aceitação**
- Funcionalidades essenciais são operáveis por teclado.
- Não existem armadilhas de teclado.
- A ordem do foco preserva sentido e operabilidade.
- O indicador de foco é visível e não fica totalmente obscurecido.
- Estados de interação não dependem exclusivamente de cor.

### Feature FE-F14 — Alternativas e comunicação acessíveis

#### FE-037 — Disponibilizar alternativas textuais adequadas
**Prioridade:** P0

Como pessoa que utiliza leitor de tela, quero receber alternativas adequadas para imagens informativas, sem anúncios desnecessários para imagens decorativas.

**Critérios de aceitação**
- Imagens informativas têm texto alternativo equivalente à sua finalidade.
- Imagens decorativas usam `alt=""`.
- O texto alternativo não repete automaticamente o título da atividade sem avaliar a finalidade da imagem.
- Ícones decorativos não são anunciados desnecessariamente.
- Imagens ausentes usam o fallback visual definido.

#### FE-038 — Comunicar estados dinâmicos às tecnologias assistivas
**Prioridade:** P0

Como pessoa que utiliza leitor de tela, quero ser informada sobre carregamento, resultados e erros, para compreender as atualizações sem precisar descobrir visualmente o que mudou.

**Critérios de aceitação**
- Carregamento, conclusão, erro e ausência de resultados são comunicados quando apropriado.
- A mensagem é objetiva e não repetida desnecessariamente.
- O foco não é deslocado apenas por uma atualização.
- Skeletons não são anunciados como conteúdo real.
- A implementação usa semântica nativa ou ARIA apropriada ao caso.

### Feature FE-F15 — Critérios visuais de acessibilidade

#### FE-039 — Verificar contraste e estados visuais
**Prioridade:** P0

Como pessoa com baixa visão, quero ler textos e identificar controles e estados, para utilizar as funcionalidades com segurança.

**Critérios de aceitação**
- As combinações reais de texto e fundo atendem aos contrastes WCAG aplicáveis.
- Estados necessários para identificar controles e componentes atendem aos critérios de contraste não textual aplicáveis.
- Links, foco, erro, seleção e desabilitado são identificáveis.
- As cores são ajustadas quando necessário, preservando a identidade visual tanto quanto possível.
- A verificação considera os estados reais, não apenas os valores de cor isolados.

#### FE-040 — Verificar ampliação, reflow e movimento reduzido
**Prioridade:** P0

Como pessoa que precisa ampliar o conteúdo ou prefere menos movimento, quero continuar usando o site sem perda de funcionalidade ou desconforto evitável.

**Critérios de aceitação**
- Texto pode ser ampliado até 200% sem perda de conteúdo ou funcionalidade.
- O layout se reorganiza em largura equivalente a 320 pixels CSS, respeitadas as exceções aplicáveis.
- Espaçamentos de texto aumentados não causam perda de conteúdo ou funcionalidade.
- `prefers-reduced-motion` reduz ou remove movimentos não essenciais.
- As verificações são realizadas manualmente nos principais fluxos.

---

## 13. EP-FE-10 — Testes e qualidade do frontend

### Feature FE-F16 — Testes automatizados

#### FE-041 — Configurar testes unitários com Vitest
**Prioridade:** P0

Como pessoa desenvolvedora, quero testar módulos e funções isoladamente, para identificar regressões rapidamente.

**Critérios de aceitação**
- Vitest está configurado como dependência de desenvolvimento.
- Existem comandos documentados para executar os testes.
- São testados utilitários de URL, validação e cliente HTTP conforme implementados.
- Os testes usam dados sintéticos e reproduzíveis.
- Falhas são claramente identificáveis.

#### FE-042 — Configurar testes de navegador com Playwright
**Prioridade:** P0

Como pessoa desenvolvedora, quero executar fluxos no navegador, para verificar o comportamento integrado das páginas.

**Critérios de aceitação**
- Playwright está configurado.
- Os fluxos principais de navegação, pesquisa, detalhes e contato têm testes.
- É possível simular respostas de sucesso e falha da API.
- Os testes podem ser executados por comando documentado.
- A configuração não exige dados pessoais reais.

#### FE-043 — Automatizar verificações comuns de acessibilidade
**Prioridade:** P0

Como pessoa desenvolvedora, quero detectar problemas comuns de acessibilidade automaticamente, para encontrar regressões durante o desenvolvimento.

**Critérios de aceitação**
- axe-core é integrado à suíte de navegador.
- As cinco páginas e os estados dinâmicos principais são verificados.
- Violações são investigadas e corrigidas ou justificadas formalmente.
- O resultado automático não é tratado como prova de conformidade integral.
- Os testes manuais de teclado e leitor de tela continuam previstos.

### Feature FE-F17 — Processo de qualidade

#### FE-044 — Documentar a execução e os resultados dos testes
**Prioridade:** P1

Como pessoa desenvolvedora, quero instruções para executar e registrar os testes, para que outras pessoas possam reproduzir as verificações.

**Critérios de aceitação**
- Os comandos e pré-requisitos são documentados.
- Os resultados relevantes incluem versão testada, ambiente e problemas encontrados.
- Defeitos de acessibilidade têm passos de reprodução e impacto registrados.
- Limitações conhecidas são documentadas.
- Se houver CI, a suíte definida pode ser executada automaticamente.

---

## 14. Resumo de prioridades

| Prioridade | Histórias | Diretriz |
|---|---|---|
| P0 | FE-001 a FE-004, FE-006 a FE-024, FE-026 a FE-029, FE-030, FE-034 a FE-043 | Núcleo funcional, integração essencial e acessibilidade dos fluxos principais. |
| P1 | FE-005, FE-025, FE-028, FE-031 a FE-033, FE-044 | Melhorias de robustez, contato demonstrativo e documentação operacional. |
| P2 | Nenhuma história explicitamente atribuída nesta versão | Novos aprimoramentos serão priorizados após avaliação do escopo e esforço. |

As prioridades P0/P1 são uma proposta inicial e devem ser revisadas em conjunto com o backlog geral e a capacidade de implementação. Se uma história P1 bloquear um fluxo necessário para a entrega ou um requisito de acessibilidade aplicável, sua prioridade deve ser elevada.

## 15. Dependências do backend e da API

As histórias abaixo dependem diretamente de capacidades ou dados da API:

- **FE-015, FE-019, FE-020 e FE-021:** filtros e parâmetros de pesquisa definidos no DOC-05.
- **FE-016, FE-017 e FE-018:** endpoint e dados das próximas atividades.
- **FE-022:** disponibilidade do total de resultados.
- **FE-024:** suporte a paginação.
- **FE-026:** dados e regra de ordenação pela próxima ocorrência.
- **FE-027 e FE-029:** endpoint de detalhes e tratamento de atividade inexistente/indisponível.
- **FE-028:** campo de URL externa.
- **FE-002 a FE-005:** contrato HTTP, configuração CORS e disponibilidade da API.

Não considerar essas dependências implementadas apenas porque os testes usam mocks. Confirmar o contrato real e executar testes integrados quando o ambiente estiver disponível.

## 16. Critérios para considerar uma história pronta

Antes de iniciar uma história:
- objetivo e critérios de aceitação estão claros;
- dependências e contrato da API são conhecidos;
- os dados necessários estão identificados;
- requisitos de acessibilidade aplicáveis foram considerados;
- a história pode ser testada de forma observável.

Antes de concluir uma história:
- critérios de aceitação foram verificados;
- testes relevantes foram criados ou atualizados;
- navegação por teclado e foco foram verificados quando houver interação;
- estados de carregamento, erro e ausência de dados foram tratados quando aplicáveis;
- a documentação foi atualizada quando necessário;
- problemas conhecidos foram corrigidos ou registrados.

## 17. Relação com outros documentos

- **DOC-01 — Visão do Produto e Requisitos:** escopo do produto.
- **DOC-04 — Backlog do Produto:** backlog geral, principalmente funcionalidades do backend.
- **DOC-05 — Especificação da API REST:** contrato de integração.
- **DOC-06 — Requisitos Não Funcionais:** requisitos de qualidade.
- **DOC-07 — Estratégia de Testes:** abordagem geral de testes.
- **DOC-08 — Infraestrutura e Deploy:** configuração de execução e publicação.
- **DOC-09 — Especificação do Frontend:** arquitetura e stack.
- **DOC-10 — Identidade Visual e Design System:** tokens e componentes visuais.
- **DOC-11 — Arquitetura da Informação:** páginas e navegação.
- **DOC-12 — Wireframes:** estrutura visual das páginas.
- **DOC-13 — Especificação de Interfaces e Comportamentos:** comportamento esperado.
- **DOC-14 — Estratégia de Testes do Frontend:** métodos de validação.
- **DOC-15 — Diretrizes de Acessibilidade:** referências, adaptações e critérios.

## 18. Histórico de versões

| Versão | Alteração |
|---|---|
| 0.1 | Criação inicial do backlog do frontend, com épicos, features, histórias, prioridades, critérios de aceitação e dependências. |
