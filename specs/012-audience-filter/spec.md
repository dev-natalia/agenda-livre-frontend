# Feature Specification: Filtro por público-alvo

**Feature Branch**: `012-audience-filter`

**Created**: 2026-10-12

**Status**: Draft

**Input**: User description: "Vamos adicionar um filtro a mais, por público. Base: agenda-livre-backend/docs/10-filtro-por-publico-alvo.md (épico EP-11; a história US-050 é o aceite do frontend), já implementado no backend."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Filtrar atividades por público-alvo na página Explorar (Priority: P1)

Uma pessoa visitante abre a página Explorar atividades e, ao lado dos filtros de unidade, categoria e período, encontra um filtro de público-alvo (por exemplo, "Adultos", "Crianças", "Todas as idades"). Ela escolhe um público, aciona "Filtrar" e a listagem passa a mostrar apenas as atividades voltadas àquele público, voltando para a página 1. O critério fica no endereço, de modo que a busca pode ser copiada, compartilhada e reaberta com o campo já preenchido. As opções do filtro vêm do catálogo de públicos-alvo publicado pela API, sem valores fixos na interface.

**Why this priority**: É o objetivo da funcionalidade: permitir que a pessoa encontre o que é voltado a ela ou à sua família. Entrega valor sozinha, mesmo sem o público aparecer nos cards.

**Independent Test**: Abrir a página Explorar com a API em execução, escolher um público, acionar "Filtrar" e conferir que só aparecem atividades daquele público, que o endereço reflete o critério e que abrir esse endereço em uma nova janela mostra o campo preenchido e a mesma listagem.

**Acceptance Scenarios**:

1. **Given** a página Explorar, **When** exibida, **Then** há um filtro de público-alvo de seleção única, com rótulo visível e acessível, operável por teclado e com o mesmo comportamento visual e de interação dos filtros de unidade e categoria.
2. **Given** as opções do filtro, **When** exibidas, **Then** correspondem aos públicos-alvo ativos devolvidos pela API, ordenados por nome, precedidas da opção "Todos os públicos" (sem filtro); nenhum público inexistente é oferecido.
3. **Given** que a pessoa escolheu um público mas ainda não acionou "Filtrar", **When** os resultados são observados, **Then** nenhuma consulta nova foi feita e a listagem atual continua visível.
4. **Given** um público escolhido, **When** a pessoa aciona "Filtrar", **Then** os resultados são substituídos por esqueletos, a consulta é feita com o público combinado aos demais critérios (critério "E": texto, unidade, categoria e período), a página volta a 1 e o endereço passa a refletir o público escolhido.
5. **Given** um endereço com um público válido, **When** a página é aberta, **Then** o filtro aparece preenchido com esse público e a listagem já vem filtrada.
6. **Given** um endereço com um identificador de público malformado, **When** a página é aberta, **Then** o valor é ignorado, nenhuma consulta que a API recusaria é enviada e a página continua utilizável.
7. **Given** que a pessoa escolhe um público específico (por exemplo, "Adultos"), **When** a listagem é exibida, **Then** ela inclui também atividades marcadas como "Todas as idades", conforme a regra da API, sem que a interface reclassifique ou filtre resultados por conta própria.
8. **Given** que a lista de públicos-alvo não pôde ser carregada, **When** a página é exibida, **Then** o filtro oferece apenas "Todos os públicos", a pessoa é informada de que as opções não puderam ser carregadas e a pesquisa por texto e os demais filtros continuam funcionando.
9. **Given** uma combinação de público com outros filtros que não tem resultados, **When** a listagem é exibida, **Then** aparece a mesma mensagem de "nenhum resultado" já usada para os demais filtros, com a possibilidade de limpar os filtros.

---

### User Story 2 - Limpar o filtro de público junto com os demais (Priority: P1)

A pessoa que aplicou o filtro de público pode removê-lo. Ao acionar "Limpar filtros", o público volta a "Todos os públicos", assim como os demais critérios, e a listagem geral é restaurada.

**Why this priority**: Sem poder remover o critério, o filtro vira uma armadilha; é parte do mesmo fluxo da Story 1 e reaproveita o comportamento dos filtros atuais.

**Independent Test**: Aplicar um público e outros filtros, acionar "Limpar filtros" e conferir campos vazios, endereço sem critérios e listagem geral na página 1.

**Acceptance Scenarios**:

1. **Given** filtros aplicados incluindo um público, **When** a pessoa aciona "Limpar filtros", **Then** o campo de público volta a "Todos os públicos", o endereço perde o critério e a listagem geral é exibida a partir da página 1.
2. **Given** que o público é o único critério aplicado, **When** a página é exibida, **Then** a ação de limpar filtros está disponível e a quantidade de resultados reflete a listagem filtrada.
3. **Given** que a pessoa usa os botões voltar/avançar do navegador entre estados de pesquisa, **When** navega pelo histórico, **Then** o campo de público, o endereço e a listagem voltam a ser consistentes com aquele ponto do histórico.

---

### User Story 3 - Ver o público-alvo em cada card (Priority: P2)

Em cada card de atividade da listagem, a pessoa vê a quem a atividade se destina (por exemplo, "Adultos" ou "Crianças, Adolescentes"), sem precisar abrir os detalhes. Atividades sem público-alvo informado não exibem essa informação e o card não fica com espaço vazio ou texto quebrado.

**Why this priority**: Complementa o filtro dando contexto aos resultados, mas o filtro funciona sem isso.

**Independent Test**: Abrir a listagem e conferir que cada card mostra seus públicos-alvo na ordem devolvida pela API, e que um card de atividade sem público não mostra a informação nem deixa lacuna.

**Acceptance Scenarios**:

1. **Given** uma atividade com públicos-alvo, **When** seu card é exibido na listagem, **Then** o card mostra os nomes dos públicos, de forma legível e sem comprometer a leitura dos demais dados (categoria, nome, unidade, data e horário).
2. **Given** uma atividade sem públicos-alvo, **When** seu card é exibido, **Then** nenhuma informação de público aparece e o layout do card permanece íntegro.
3. **Given** uma atividade com muitos públicos-alvo ou nomes longos, **When** seu card é exibido, **Then** o texto não quebra o layout em nenhuma largura de tela.
4. **Given** o card compartilhado também usado em outras páginas (como a Início), **When** a mesma atividade é exibida ali, **Then** o comportamento é consistente com o da Explorar: se os dados de público estiverem presentes, aparecem; se não, o card se comporta como antes.

---

### Edge Cases

- A API responde erro de validação para o público: a mensagem é tratada como nos demais filtros (campo identificado, mensagem em português, página utilizável).
- O público escolhido deixa de existir ou é desativado entre o carregamento das opções e a consulta (ou vem de um endereço antigo): a API devolve lista vazia e a página mostra o estado de "nenhum resultado" já existente, sem erro.
- Pessoa aplica pesquisas em sequência rápida: apenas o resultado da última é exibido, como nos demais filtros.
- Mais de um público-alvo no endereço (parâmetro repetido): somente um é considerado, pois o filtro é de seleção única.
- Catálogo de públicos vazio: o filtro oferece apenas "Todos os públicos".
- Nomes de público muito longos nas opções ou no card: não quebram o layout em telas estreitas.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A página Explorar MUST oferecer um filtro de público-alvo de seleção única, com a opção padrão "Todos os públicos", ao lado dos filtros de unidade, categoria e período.
- **FR-002**: As opções do filtro MUST ser obtidas do catálogo de públicos-alvo da API pública, ordenadas por nome, sem valores fixos na interface.
- **FR-003**: O filtro MUST seguir o mesmo modelo de aplicação dos demais: escolher não dispara consulta; a consulta ocorre ao acionar "Filtrar", combinando o público com os demais critérios pelo critério "E" e voltando à página 1.
- **FR-004**: O público escolhido MUST ser refletido no endereço da página e restaurado a partir dele (campo preenchido e listagem filtrada), permitindo compartilhar e reabrir a busca.
- **FR-005**: Um identificador de público inválido no endereço MUST ser ignorado, sem enviar à API uma consulta que ela recusaria, mantendo a página utilizável.
- **FR-006**: Se o catálogo de públicos não puder ser carregado, o filtro MUST oferecer apenas "Todos os públicos", informar a pessoa de que as opções não puderam ser carregadas e manter funcionais os demais filtros.
- **FR-007**: "Limpar filtros" MUST também limpar o público, restaurando a listagem geral na página 1.
- **FR-008**: A interface MUST apresentar os resultados na ordem e com o conteúdo devolvidos pela API, sem reclassificar atividades por público nem reaplicar a regra de "Todas as idades" no navegador.
- **FR-009**: A mensagem de "nenhum resultado" e o tratamento de erros de validação e de rede existentes MUST valer também para consultas que envolvam o público.
- **FR-010**: O card de atividade MUST exibir os públicos-alvo da atividade quando informados pela listagem e MUST omitir a informação, sem deixar lacuna, quando não houver.
- **FR-011**: O novo filtro e a exibição no card MUST atender aos requisitos de acessibilidade, responsividade e identidade visual já adotados nos demais filtros e cards (rótulo visível e acessível, operação por teclado, estados de foco, leitura em telas estreitas).
- **FR-012**: A documentação do frontend (backlog, documentos de páginas e contrato consumido) MUST ser atualizada para registrar o filtro por público-alvo como parte do escopo da página Explorar.
- **FR-013**: Os testes automatizados existentes da página Explorar e do card MUST continuar passando, e o comportamento novo MUST ser coberto por testes no mesmo padrão dos demais filtros.

### Key Entities

- **Público-alvo**: grupo de pessoas a que uma atividade se destina (por exemplo, Adultos, Crianças, Todas as idades). Tem identificador, nome e identificador textual. Fornecido pela API pública, somente leitura para o frontend.
- **Atividade (na listagem)**: passa a trazer a lista de públicos-alvo (identificador e nome), ordenada por nome, vazia quando não houver.
- **Critérios de pesquisa**: conjunto de texto, unidade, categoria, público-alvo e período aplicado à listagem, representado no endereço da página.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Uma pessoa visitante consegue restringir a listagem a um público-alvo em até 3 interações (abrir o filtro, escolher, acionar "Filtrar") a partir da página Explorar.
- **SC-002**: 100% dos endereços de busca com público válido, quando reabertos, exibem o campo preenchido e a mesma listagem filtrada.
- **SC-003**: Em 100% das combinações do público com texto, unidade, categoria e período, todos os resultados exibidos atendem simultaneamente a todos os critérios aplicados.
- **SC-004**: Com a falha do carregamento dos públicos simulada, a pesquisa por texto e os demais filtros continuam funcionando em 100% dos casos testados.
- **SC-005**: O filtro e os públicos nos cards são utilizáveis apenas com teclado e sem rolagem horizontal em larguras de tela de 320 px ou mais.
- **SC-006**: Nenhum teste automatizado existente deixa de passar após a mudança.

## Assumptions

- O backend já implementa o catálogo de públicos-alvo, o filtro por público e a lista de públicos em cada item da listagem (DOC-10 do backend, feature 011, status "Implementado"); a verificação em ambiente real é pendência do backend, não desta entrega.
- O filtro é de seleção única, como unidade e categoria; a seleção múltipla está fora do escopo (a API trata um único público por consulta).
- A regra inclusiva de "Todas as idades" (escolher um público específico também devolve as atividades de "Todas as idades") é responsabilidade da API; a interface apenas apresenta o resultado.
- A opção "Todos os públicos" equivale a não filtrar, de modo análogo ao "todas" dos filtros de unidade e categoria.
- O filtro do Django Admin (US-049) e qualquer mudança no backend estão fora do escopo deste repositório.
- Contagem de atividades por público, ordenação por público e busca no texto livre de observações do público estão fora do escopo.
- O texto livre de observações de público continua exibido apenas nos detalhes, que não mudam nesta entrega.
- O card compartilhado e a página Explorar existentes (specs 003 e 006) são a base; a Início apenas herda o card, sem ganhar o filtro.
