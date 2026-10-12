# DOC-18 — Backlog de Refinamento Visual do Frontend

**Projeto:** Agenda Livre  
**Versão:** 0.1  
**Status:** Proposta inicial baseada no código existente e na captura da página inicial  
**Objetivo:** Refinar a apresentação visual do frontend sem reconstruir funcionalidades que já estão implementadas.

## 1. Contexto e diagnóstico

Este backlog foi elaborado a partir dos arquivos do frontend fornecidos, incluindo as cinco páginas HTML, os estilos em `css/`, a organização descrita no README e as especificações presentes em `specs/`. A captura da página inicial também foi considerada como referência visual.

O projeto já possui uma base visual e técnica estruturada:
- tokens de design centralizados em `css/tokens.css`;
- estilos base, layout e componentes separados;
- fontes Inter e Poppins hospedadas localmente;
- componentes de botão, formulário, card, navegação e estados;
- comportamento responsivo e pontos de quebra documentados;
- regras de movimento reduzido;
- atenção explícita a contraste, foco visível e navegação por teclado.

Portanto, **o objetivo não é começar o CSS do zero**. O foco é melhorar a hierarquia visual, o uso do espaço, a composição das seções e a sensação de acabamento, preservando a arquitetura e os comportamentos existentes.

### 1.1 O que a captura sugere

Na página inicial apresentada:
- o cabeçalho e a área principal parecem estreitos em relação à largura disponível da janela;
- a área de busca tem aparência de conjunto de campos ainda pouco integrado visualmente;
- há bastante espaço entre algumas áreas e pouca diferenciação visual entre seções;
- a seção de próximas atividades parece pouco preenchida quando está no estado vazio;
- a página tem uma boa base de cores e ilustração, mas ainda pode ganhar mais personalidade por meio de superfícies, hierarquia e espaçamento.

Esses pontos são hipóteses visuais a validar nas diferentes páginas e tamanhos de tela. Não implicam que o código esteja funcionalmente incorreto.

## 2. Escopo

### Dentro do escopo
- melhorar hierarquia visual e ritmo de espaçamento;
- aprimorar cabeçalho, rodapé e largura de conteúdo;
- dar mais presença à área de busca e aos filtros;
- refinar cards e estados vazios, de carregamento e erro;
- harmonizar botões, campos, títulos, etiquetas e superfícies;
- melhorar a composição das páginas Sobre, Contato, Explorar e Detalhes;
- preservar e verificar acessibilidade e responsividade;
- definir critérios visuais observáveis para validar o resultado.

### Fora do escopo
- reescrever funcionalidades JavaScript;
- alterar contratos ou endpoints da API;
- trocar HTML/CSS/JavaScript puro por framework;
- redesenhar o produto ou mudar seu público;
- criar novas funcionalidades de negócio;
- alterar a identidade de marca sem necessidade demonstrada;
- adicionar bibliotecas visuais sem justificativa.

Mudanças estruturais em HTML ou JavaScript só devem ser propostas se forem necessárias para um resultado visual ou acessível e devem ser registradas como dependências, não presumidas como parte automática de uma tarefa de CSS.

## 3. Princípios de design

1. **Institucional, cultural e acolhedor:** aparência de serviço público moderno, sem parecer um painel administrativo.
2. **Hierarquia clara:** a pessoa deve perceber rapidamente o título, a ação principal e o conteúdo mais importante.
3. **Espaçamento intencional:** áreas relacionadas ficam visualmente agrupadas; seções diferentes recebem separação consistente.
4. **Superfícies com moderação:** cartões, painéis e sombras ajudam a agrupar conteúdo, mas não devem ser aplicados a todos os elementos.
5. **Identidade existente:** azul como cor dominante; laranja como destaque pontual; amarelo prioritariamente decorativo.
6. **Acessibilidade como requisito:** contraste, foco, teclado, ampliação, reflow e movimento reduzido não podem regredir.
7. **Consistência entre páginas:** os mesmos componentes devem parecer pertencer ao mesmo produto.
8. **Aprimoramento incremental:** reutilizar tokens e componentes antes de criar exceções.

## 4. Prioridades

- **P0 — Essencial para o refinamento:** afeta diretamente a hierarquia, a leitura ou a consistência visual da experiência principal.
- **P1 — Importante:** melhora o acabamento e a consistência entre páginas.
- **P2 — Opcional:** melhoria estética complementar que pode ser avaliada depois do núcleo.

A prioridade trata do refinamento visual. Nenhum requisito de acessibilidade já aplicável pode ser adiado apenas por ter sido listado em uma história P1 ou P2.

## 5. Épicos

| Código | Épico | Objetivo |
|---|---|---|
| EP-VIS-01 | Hierarquia visual e composição global | Melhorar a largura útil, o ritmo de espaçamento e a leitura das páginas. |
| EP-VIS-02 | Cabeçalho e navegação | Dar acabamento à navegação sem mudar seu comportamento. |
| EP-VIS-03 | Página inicial e pesquisa | Transformar a busca em uma área visualmente organizada e fortalecer a apresentação inicial. |
| EP-VIS-04 | Cards e estados de conteúdo | Melhorar a apresentação de atividades, estados vazios, carregamento e erros. |
| EP-VIS-05 | Componentes e controles | Harmonizar botões, campos, etiquetas e superfícies. |
| EP-VIS-06 | Páginas internas | Aplicar uma composição mais refinada a Explorar, Detalhes, Sobre e Contato. |
| EP-VIS-07 | Validação visual, responsiva e acessível | Verificar que o refinamento funciona em diferentes telas e não introduz regressões. |

---

## 6. EP-VIS-01 — Hierarquia visual e composição global

### Feature VIS-F01 — Largura e ritmo de espaçamento

#### VIS-001 — Reavaliar a largura útil do site
**Prioridade:** P0

Como pessoa visitante, quero que o conteúdo aproveite melhor a largura disponível em telas grandes, para que a interface não pareça comprimida no centro da janela.

**Critérios de aceitação**
- O cabeçalho, conteúdo principal e rodapé mantêm alinhamento horizontal consistente.
- A largura máxima é avaliada nas resoluções de desktop, sem transformar parágrafos longos em linhas difíceis de ler.
- A largura útil da página inicial e da página Explorar permite acomodar seus elementos com equilíbrio.
- Páginas de leitura, como Sobre e Detalhes, podem manter uma largura menor que a área geral quando isso favorecer a legibilidade.
- O ajuste não cria rolagem horizontal em 320 CSS px nem prejudica a ampliação.
- O valor escolhido é centralizado em token quando for uma decisão global de design.

**Referências:** `css/tokens.css`, `css/layout.css`, DOC-10 e DOC-15.

#### VIS-002 — Estabelecer um ritmo consistente entre seções
**Prioridade:** P0

Como pessoa visitante, quero perceber agrupamentos e separações claras entre seções, para compreender a organização da página sem esforço adicional.

**Critérios de aceitação**
- Títulos e conteúdos relacionados ficam visualmente próximos.
- Seções principais têm espaçamento vertical consistente.
- Não há grandes vazios sem função entre componentes relacionados.
- As páginas mantêm respiro suficiente para evitar aparência congestionada.
- Os espaçamentos usam os tokens existentes ou novos tokens documentados, sem valores avulsos contraditórios.

#### VIS-003 — Reforçar a hierarquia tipográfica
**Prioridade:** P0

Como pessoa visitante, quero distinguir título da página, títulos de seção, títulos de cards e texto auxiliar, para localizar rapidamente a informação importante.

**Critérios de aceitação**
- A hierarquia visual é consistente entre as cinco páginas.
- Poppins continua reservada aos títulos e Inter ao texto e aos controles, conforme a identidade existente.
- Títulos não competem visualmente com o conteúdo principal nem ficam pequenos demais em relação à área disponível.
- Textos auxiliares permanecem legíveis e respeitam o tamanho mínimo definido no design system.
- A ampliação do texto não provoca sobreposição nem corte.

---

## 7. EP-VIS-02 — Cabeçalho e navegação

### Feature VIS-F02 — Acabamento do cabeçalho

#### VIS-004 — Refinar o cabeçalho compartilhado
**Prioridade:** P0

Como pessoa visitante, quero reconhecer a marca e localizar a navegação com facilidade, para entender onde estou e para onde posso ir.

**Critérios de aceitação**
- Marca e links de navegação têm alinhamento vertical consistente.
- O cabeçalho possui espaçamento interno suficiente e não parece apertado.
- O estado da página atual permanece evidente sem depender somente da cor.
- A separação entre cabeçalho e conteúdo é visualmente clara, usando borda, fundo ou sombra discreta quando apropriado.
- O refinamento é aplicado de forma consistente nas cinco páginas.
- A navegação móvel, o botão Menu, `aria-expanded`, a ordem de foco e o link para pular ao conteúdo continuam funcionando.

#### VIS-005 — Harmonizar o rodapé com o restante da interface
**Prioridade:** P1

Como pessoa visitante, quero que o rodapé pareça parte do mesmo produto, para encerrar a navegação de forma consistente.

**Critérios de aceitação**
- Marca, links e espaçamento do rodapé seguem o mesmo sistema visual do cabeçalho.
- A borda superior separa o rodapé sem competir com o conteúdo.
- Em páginas curtas, o rodapé permanece ao final da página, sem sobreposição.
- Em telas estreitas, os links continuam legíveis e fáceis de acionar.

---

## 8. EP-VIS-03 — Página inicial e pesquisa

### Feature VIS-F03 — Área de apresentação inicial

#### VIS-006 — Melhorar a composição do hero
**Prioridade:** P0

Como pessoa visitante, quero entender rapidamente a proposta do Agenda Livre, para reconhecer o valor do site antes de começar a pesquisar.

**Critérios de aceitação**
- O título e o subtítulo formam um bloco visual coerente.
- A ilustração complementa o texto e não disputa com ele pela atenção.
- O alinhamento entre texto e imagem é equilibrado em desktop.
- Em telas estreitas, texto e imagem reorganizam-se sem apertar o título ou criar rolagem horizontal.
- O hero mantém a ilustração decorativa sem anúncio redundante por leitor de tela.
- O título continua sendo o elemento textual de maior destaque da página.

### Feature VIS-F04 — Área de pesquisa rápida

#### VIS-007 — Agrupar visualmente a busca e os filtros
**Prioridade:** P0

Como pessoa visitante, quero reconhecer a pesquisa como uma área única e organizada, para preencher os critérios de busca com facilidade.

**Critérios de aceitação**
- Campo de texto, filtros e ação principal formam um grupo visual coerente.
- Um fundo de superfície, borda ou sombra discreta pode delimitar o grupo, sem excesso de caixas dentro de caixas.
- Rótulos ficam claramente associados aos respectivos campos e acima deles.
- A ação “Explorar” se destaca como a ação principal.
- O layout de desktop distribui os campos sem deixar larguras desproporcionais ou controles comprimidos.
- Em telas estreitas, os controles ocupam a largura disponível e ficam em uma ordem natural.
- O comportamento do formulário e os parâmetros enviados à página Explorar não mudam.

#### VIS-008 — Refinar o botão principal da busca
**Prioridade:** P0

Como pessoa visitante, quero identificar imediatamente a ação principal da busca, para saber como aplicar meus critérios.

**Critérios de aceitação**
- O botão primário tem hierarquia visual maior que ações secundárias.
- Altura, espaçamento, borda e tipografia seguem o sistema de botões existente.
- Hover, foco visível, estado pressionado e estado desabilitado são distinguíveis.
- O texto do botão permanece legível com contraste suficiente.
- A área de acionamento atende ao tamanho mínimo estabelecido no design system.
- O refinamento não altera o funcionamento do envio.

### Feature VIS-F05 — Seção de próximas atividades

#### VIS-009 — Melhorar a hierarquia da seção de próximas atividades
**Prioridade:** P0

Como pessoa visitante, quero distinguir o título da seção, sua explicação e o acesso à listagem completa, para descobrir atividades sem confusão visual.

**Critérios de aceitação**
- Título, texto introdutório e link “Ver todas” têm hierarquia clara.
- O link “Ver todas” continua visível e utilizável em desktop e celular.
- A seção tem espaçamento consistente em relação à busca e ao rodapé.
- O layout funciona com três cards, um card, skeletons, estado vazio ou erro.
- Não é necessário alterar a lógica de carregamento da seção.

---

## 9. EP-VIS-04 — Cards e estados de conteúdo

### Feature VIS-F06 — Refinamento dos cards de atividade

#### VIS-010 — Dar acabamento visual aos cards
**Prioridade:** P0

Como pessoa visitante, quero comparar cards de atividades visualmente consistentes, para localizar informações relevantes com rapidez.

**Critérios de aceitação**
- Imagem ou fallback, categoria, título, unidade e data formam uma hierarquia previsível.
- Cantos, bordas, sombra e espaçamentos seguem os tokens compartilhados.
- A sombra é discreta e não substitui uma borda ou estado necessário para identificar o componente.
- Títulos longos quebram sem transbordar.
- Cards de uma mesma linha mantêm alinhamento consistente mesmo quando o texto tem comprimentos diferentes.
- O link esticado continua tendo uma única parada de foco e seu foco é claramente visível.
- O card permanece utilizável com teclado e em telas estreitas.

#### VIS-011 — Refinar a etiqueta de categoria
**Prioridade:** P1

Como pessoa visitante, quero reconhecer a categoria de uma atividade sem depender somente da cor, para entender o tipo de atividade com rapidez.

**Critérios de aceitação**
- A etiqueta tem tamanho e espaçamento proporcionais ao conteúdo.
- O nome da categoria continua escrito.
- Fundo, texto e borda mantêm contraste suficiente.
- A etiqueta mantém o mesmo tratamento em Início, Explorar e Detalhes quando aplicável.
- O estilo não depende de uma cor específica por categoria sem decisão documentada.

### Feature VIS-F07 — Estados vazios, carregamento e erro

#### VIS-012 — Integrar o estado vazio ao design
**Prioridade:** P0

Como pessoa visitante, quero que a ausência de atividades seja apresentada de forma clara e acolhedora, para entender que a consulta foi concluída sem resultados.

**Critérios de aceitação**
- O estado vazio parece parte da interface, não uma caixa de diagnóstico.
- A mensagem principal tem destaque e a orientação complementar é legível.
- A forma do contêiner é consistente com outros painéis de estado.
- A aparência continua distinguível de carregamento e erro, inclusive em escala de cinza.
- Quando aplicável, a mensagem mantém a orientação para ver ou pesquisar outras atividades.

#### VIS-013 — Harmonizar skeletons e estados de erro
**Prioridade:** P1

Como pessoa visitante, quero que carregamento e erro tenham apresentação consistente, para compreender o estado da página sem confundi-lo com conteúdo real.

**Critérios de aceitação**
- Skeletons têm dimensões coerentes com os cards que substituem.
- Skeletons não usam animação que prejudique pessoas que preferem movimento reduzido.
- Erros são visualmente distinguíveis do estado vazio.
- A ação de nova tentativa mantém a aparência de botão primário.
- O texto e as mensagens acessíveis existentes não são removidos nem substituídos apenas por ícones.

---

## 10. EP-VIS-05 — Componentes e controles

### Feature VIS-F08 — Botões, campos e superfícies

#### VIS-014 — Harmonizar botões em todas as páginas
**Prioridade:** P0

Como pessoa visitante, quero que os botões tenham aparência e estados consistentes, para reconhecer ações principais e secundárias em qualquer página.

**Critérios de aceitação**
- Botões primário, secundário e contornado mantêm hierarquia consistente.
- Botões com o mesmo papel parecem iguais em todas as páginas.
- Texto, borda e fundo atendem aos contrastes definidos.
- Hover, foco, ativo e desabilitado continuam distinguíveis sem depender só da cor.
- Links em texto continuam visualmente reconhecíveis como links, sem serem confundidos com botões.

#### VIS-015 — Refinar campos de pesquisa e formulário
**Prioridade:** P0

Como pessoa visitante, quero campos visualmente claros e consistentes, para preencher pesquisas e formulários com segurança.

**Critérios de aceitação**
- Campos têm alturas, bordas, raios e espaçamento interno consistentes.
- Rótulos e textos auxiliares ficam visualmente associados aos campos.
- Foco e erro são visíveis sem depender apenas da cor.
- Campos de texto, selects e textarea mantêm comportamento nativo e possibilidade de zoom.
- O refinamento não remove mensagens de validação nem associações programáticas existentes.

#### VIS-016 — Usar sombras e bordas com moderação
**Prioridade:** P1

Como pessoa visitante, quero que os agrupamentos sejam claros sem excesso de efeitos, para manter a interface organizada e confortável de ler.

**Critérios de aceitação**
- Sombras são usadas apenas quando ajudam a estabelecer hierarquia ou separar superfícies.
- Bordas continuam identificando controles e componentes quando necessário.
- Não há acúmulo de sombra, borda forte e fundo contrastante no mesmo elemento sem justificativa.
- Valores de sombra, raio e borda usam tokens centralizados.
- O resultado continua claro em telas de baixa qualidade e em alto contraste quando aplicável.

---

## 11. EP-VIS-06 — Páginas internas

### Feature VIS-F09 — Explorar e Detalhes

#### VIS-017 — Dar mais presença à área de filtros da página Explorar
**Prioridade:** P0

Como pessoa visitante, quero reconhecer os filtros como uma ferramenta de pesquisa, para ajustar os critérios antes de consultar resultados.

**Critérios de aceitação**
- Título, descrição, filtros e ações têm hierarquia clara.
- A área de filtros fica visualmente separada dos resultados.
- “Filtrar” é a ação principal e “Limpar filtros” é secundária.
- O estado de carregamento e o resumo de resultados permanecem claros.
- O layout funciona com todos os filtros e botões em telas estreitas.
- Os parâmetros, paginação, histórico e estado da URL continuam funcionando como antes.

#### VIS-018 — Melhorar a leitura dos detalhes da atividade
**Prioridade:** P1

Como pessoa visitante, quero encontrar título, próxima ocorrência, unidade e descrição em uma ordem visual clara, para decidir se a atividade me interessa.

**Critérios de aceitação**
- Título e metadados essenciais aparecem antes de informações complementares.
- Data, horário, unidade e local são visualmente distinguíveis.
- Descrição longa mantém uma largura confortável de leitura.
- Links externos são reconhecíveis e continuam indicando que abrem um site externo.
- O estado “não encontrada ou não disponível” mantém caminho visual claro para voltar à exploração.
- Não são inventados dados ausentes da API.

### Feature VIS-F10 — Sobre e Contato

#### VIS-019 — Melhorar a composição da página Sobre
**Prioridade:** P1

Como pessoa visitante, quero ler a explicação do projeto em blocos bem organizados, para entender sua finalidade sem enfrentar uma parede de texto.

**Critérios de aceitação**
- O conteúdo mantém largura de leitura confortável.
- Seções e subtítulos ficam claramente separados.
- O botão ou link para explorar atividades é destacado como ação principal da página.
- O texto continua legível com ampliação e em celular.
- O conteúdo institucional não é reescrito como parte desta história, salvo se houver decisão separada.

#### VIS-020 — Refinar a apresentação do formulário de Contato
**Prioridade:** P1

Como pessoa visitante, quero preencher o formulário demonstrativo em uma área organizada, para entender facilmente a sequência de campos e ações.

**Critérios de aceitação**
- Formulário, aviso de demonstração e campos são agrupados com clareza.
- O aviso de que nenhuma mensagem será enviada continua evidente.
- A largura dos campos facilita a leitura e o preenchimento.
- Botões de envio e limpeza são visualmente distinguíveis.
- Erros, resumo de validação e confirmação mantêm a hierarquia visual e a acessibilidade existentes.
- O formulário continua demonstrativo e não passa a enviar ou armazenar dados.

---

## 12. EP-VIS-07 — Validação visual, responsiva e acessível

### Feature VIS-F11 — Revisão visual entre páginas

#### VIS-021 — Verificar consistência visual das cinco páginas
**Prioridade:** P0

Como pessoa responsável pelo projeto, quero comparar as cinco páginas após o refinamento, para evitar que cada uma pareça ter sido estilizada separadamente.

**Critérios de aceitação**
- Início, Explorar, Detalhes, Sobre e Contato usam os mesmos tokens e padrões para componentes equivalentes.
- Cabeçalho, rodapé, links, botões, campos, foco e mensagens mantêm consistência.
- Nenhuma página apresenta valores visuais avulsos sem justificativa.
- As diferenças entre páginas são explicadas por suas funções, não por estilos inconsistentes.
- A revisão registra problemas encontrados e decisões adotadas.

#### VIS-022 — Validar responsividade após as mudanças
**Prioridade:** P0

Como pessoa visitante, quero continuar usando todas as páginas em celular, tablet e desktop, para que o refinamento visual não prejudique a experiência em nenhum tamanho.

**Critérios de aceitação**
- As páginas são verificadas em 320, 375, 768, 1024 e 1440 pixels CSS.
- Não há rolagem horizontal da página em 320 pixels CSS, exceto conteúdo bidimensional que tenha contêiner próprio.
- Navegação, filtros, cards, formulários e rodapé não ficam sobrepostos.
- Títulos longos e mensagens extensas quebram corretamente.
- O zoom não é bloqueado.
- Os pontos de quebra existentes são mantidos ou alterados de forma documentada e sincronizada com o menu móvel.

#### VIS-023 — Revalidar acessibilidade visual e interação
**Prioridade:** P0

Como pessoa com necessidades de acesso diversas, quero que a nova apresentação preserve contraste, foco, ampliação e operação por teclado, para utilizar o site sem perder informação ou funcionalidade.

**Critérios de aceitação**
- Combinações de texto e fundo mantêm contraste mínimo WCAG aplicável: 4,5:1 para texto comum e 3:1 para texto grande.
- Componentes visuais necessários para identificar controles e estados atendem ao contraste não textual aplicável.
- Foco por teclado permanece visível em todos os fundos usados.
- Nenhum estado depende exclusivamente da cor.
- Testes automatizados de acessibilidade continuam passando ou têm violações corrigidas.
- São realizadas verificações manuais por teclado nos fluxos principais.
- O comportamento de `prefers-reduced-motion` permanece válido.
- A revisão não declara conformidade integral baseada apenas em testes automatizados.

#### VIS-024 — Comparar capturas antes e depois
**Prioridade:** P1

Como pessoa responsável pelo projeto, quero comparar capturas das páginas antes e depois, para avaliar objetivamente se as mudanças melhoraram a hierarquia visual.

**Critérios de aceitação**
- Existem capturas comparáveis de Início, Explorar, Detalhes, Sobre e Contato.
- A comparação usa larguras equivalentes e estados de conteúdo documentados.
- A revisão considera pelo menos o estado com resultados e o estado vazio/erro quando aplicável.
- As diferenças aprovadas e os problemas restantes são registrados.
- A aprovação considera legibilidade, consistência e acessibilidade, não apenas preferência estética.

---

## 13. Ordem recomendada de execução

1. **VIS-001 a VIS-003:** acertar largura, espaçamento e hierarquia tipográfica.
2. **VIS-004 a VIS-005:** refinar cabeçalho e rodapé compartilhados.
3. **VIS-006 a VIS-009:** compor hero, busca e próximas atividades.
4. **VIS-010 a VIS-013:** refinar cards e estados de conteúdo.
5. **VIS-014 a VIS-016:** harmonizar botões, campos, bordas e sombras.
6. **VIS-017 a VIS-020:** levar o mesmo acabamento às páginas internas.
7. **VIS-021 a VIS-024:** comparar páginas e validar responsividade e acessibilidade.

A ordem é uma recomendação. Se a implementação revelar uma dependência técnica, a sequência pode ser ajustada sem alterar os critérios de aceite.

## 14. Restrições e dependências

- Manter HTML, CSS e JavaScript puro, com módulos ES.
- Reutilizar os tokens em `css/tokens.css`; evitar cores, fontes, sombras e durações literais em componentes.
- Preservar os três arquivos de estilo principais (`base.css`, `layout.css`, `components.css`) e sua separação de responsabilidades, salvo justificativa concreta.
- Preservar as rotas, os parâmetros de URL, o histórico e a integração atual com a API.
- Preservar mensagens acessíveis, `aria-*`, foco visível e link “Pular para o conteúdo principal”.
- Não introduzir fontes remotas nem dependências visuais sem justificativa.
- Revalidar os testes de tokens, shell compartilhado, responsividade e acessibilidade existentes.
- Os critérios de cores e contraste devem seguir o contrato `specs/004-visual-identity-responsive/contracts/design-tokens.md`, não somente a paleta original do DOC-10.

## 15. Definição de pronto

O refinamento pode ser considerado concluído quando:
- os critérios das histórias P0 forem atendidos;
- as cinco páginas apresentarem uma linguagem visual consistente;
- o layout funcionar nas larguras de referência;
- contraste, foco, teclado, ampliação e movimento reduzido continuarem atendidos;
- os testes existentes passarem, ou qualquer exceção estiver documentada e justificada;
- as capturas antes/depois tiverem sido revisadas;
- não houver regressão na navegação, na busca, na paginação, nos detalhes ou no formulário demonstrativo.

## 16. Relação com os documentos existentes

- **DOC-09 — Especificação do Frontend:** stack e arquitetura do frontend.
- **DOC-10 — Identidade Visual e Design System:** identidade visual de referência.
- **DOC-11 — Arquitetura da Informação:** estrutura das páginas e navegação.
- **DOC-12 — Wireframes:** organização funcional das páginas.
- **DOC-13 — Especificação de Interfaces e Comportamentos:** estados e interações.
- **DOC-14 — Estratégia de Testes do Frontend:** validação funcional e visual.
- **DOC-15 — Diretrizes de Acessibilidade:** critérios de acessibilidade.
- `css/tokens.css`, `css/base.css`, `css/layout.css` e `css/components.css`: implementação visual atual.
- `specs/004-visual-identity-responsive/`: contratos e decisões atuais de design, responsividade e movimento.

## 17. Histórico de versões

| Versão | Alteração |
|---|---|
| 0.1 | Criação do backlog de refinamento visual com base no frontend existente e na captura da página inicial. |
