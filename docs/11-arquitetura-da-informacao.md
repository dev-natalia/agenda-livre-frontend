# DOC-11 — Arquitetura da Informação e Mapa de Navegação

**Projeto:** Agenda Livre  
**Versão:** 0.1  
**Status:** Rascunho para validação  
**Última atualização:** 2026-10-11

## 1. Objetivo

Definir a organização das páginas públicas do Agenda Livre, a hierarquia das informações e os caminhos de navegação entre elas. Este documento orienta a elaboração dos wireframes e não define a identidade visual final nem os detalhes técnicos de implementação.

## 2. Princípios de organização

- Facilitar a descoberta de atividades com poucos passos.
- Dar destaque à busca e às próximas atividades.
- Permitir a exploração de atividades de todas as unidades cadastradas.
- Organizar as atividades por categoria, sem exigir que o usuário conheça previamente a estrutura dos CEUs.
- Manter URLs que possam ser abertas diretamente e compartilhadas.
- Preservar os filtros na URL quando o usuário estiver explorando atividades.
- Usar linguagem clara e navegação consistente.
- Não criar páginas próprias para cada unidade na primeira versão.
- Não criar um filtro por público-alvo, pois esse recurso não foi implementado no backend.
- Manter a administração de conteúdo no Django Admin, fora do escopo do frontend público.

## 3. Mapa do site

A primeira versão do frontend público terá cinco páginas principais:

1. **Início**
2. **Explorar atividades**
3. **Detalhes da atividade**
4. **Sobre o Agenda Livre**
5. **Contato**

Além dessas páginas, haverá estados de interface, como carregamento, ausência de resultados, erro de comunicação e página não encontrada. Esses estados não precisam ser páginas independentes.

### 3.1 Estrutura hierárquica

```text
Agenda Livre
├── Início
├── Explorar atividades
│   ├── Busca por palavra-chave
│   ├── Filtro por unidade
│   ├── Filtro por categoria
│   └── Filtro por data/período
├── Detalhes da atividade
├── Sobre o Agenda Livre
└── Contato
```

As categorias serão exploradas dentro da página de atividades, usando o filtro de categoria. Não haverá páginas exclusivas para cada categoria na primeira versão.

Não haverá páginas exclusivas para unidades. A listagem pública poderá conter atividades de todas as unidades cadastradas.

## 4. Navegação principal

A navegação principal deverá oferecer acesso claro às páginas Início, Explorar atividades, Sobre e Contato.

A página de detalhes de uma atividade será acessada a partir de um card ou de um link direto. Ela não precisa necessariamente aparecer como item fixo no menu principal.

A navegação deve funcionar em telas grandes e pequenas. A organização exata do menu mobile será definida nos wireframes.

## 5. Conteúdo e hierarquia por página

### 5.1 Início

**Objetivo:** apresentar a plataforma e ajudar o visitante a encontrar atividades.

**Hierarquia proposta:**

1. Cabeçalho e navegação principal.
2. Área de apresentação do Agenda Livre, com uma mensagem curta e acolhedora.
3. Busca por palavra-chave, com destaque visual e funcional, posicionada antes da seção de próximas atividades.
4. Próximas atividades, também com destaque.
5. Acesso à exploração completa.
6. Categorias para descoberta, em posição secundária em relação à busca e às próximas atividades.
7. Rodapé com links institucionais e navegação complementar.

A página inicial deverá apresentar atividades de todas as unidades cadastradas. A unidade de cada atividade deve estar claramente identificada no card. Não haverá seleção obrigatória de uma unidade para visualizar o conteúdo.

A seção de próximas atividades deverá listar atividades publicadas que tenham ocorrências futuras, ordenadas cronologicamente pela próxima ocorrência. Essa regra também se aplica a programações recorrentes: a ordenação considera a próxima ocorrência futura, e não apenas a data inicial da programação.

A quantidade de cards será definida durante os wireframes e conforme as informações disponibilizadas pela API. No desktop, os cards serão organizados em uma grade; em telas de celular, a apresentação será adaptada para uma única coluna.

### 5.2 Explorar atividades

**Objetivo:** permitir que o visitante encontre atividades por busca e filtros.

**Conteúdo previsto:**

- Título e breve orientação.
- Campo de busca por palavra-chave.
- Filtros por unidade, categoria e data/período, organizados em uma barra horizontal acima dos resultados.
- Indicação dos filtros ativos, quando aplicável.
- Ação para limpar os filtros.
- Lista de resultados.
- Paginação, conforme o contrato da API.
- Estado sem resultados.
- Estado de carregamento.
- Estado de erro de comunicação.

Os filtros poderão ser combinados. A página deverá indicar claramente quando não houver resultados.

Em telas de celular, os filtros deverão ser apresentados em uma seção expansível, acionada por um controle como “Filtros”, para evitar uma barra horizontal apertada e preservar espaço para os resultados.

Não haverá filtro por público-alvo na primeira versão, pois ele não foi implementado no backend.

### 5.3 Detalhes da atividade

**Objetivo:** apresentar as informações necessárias para que o visitante compreenda a atividade.

**Hierarquia proposta:**

1. Nome da atividade.
2. Categoria e status relevante, quando aplicável.
3. Descrição.
4. Unidade responsável.
5. Data, horário e programação.
6. Público-alvo e informações complementares, quando disponíveis.
7. Link externo de inscrição ou informações, quando existir.
8. Navegação de retorno à exploração de atividades.

Cada atividade deverá ter uma URL própria, acessível diretamente e compartilhável. A página não deverá depender de o visitante ter passado pela página inicial antes de abri-la.

Se o visitante acessar os detalhes a partir de uma busca, o caminho de retorno deverá preservar, quando possível, a busca, os filtros e a página em que estava.

Atividades com status `CANCELLED` ou `FINISHED` não serão apresentadas na interface pública. A listagem e os detalhes públicos devem respeitar essa regra, de acordo com os dados e recursos disponibilizados pela API.

O Agenda Livre não processará inscrições. Um link externo poderá direcionar o visitante para outro serviço, se houver um endereço cadastrado.

### 5.4 Sobre o Agenda Livre

**Objetivo:** explicar a finalidade e o contexto do projeto.

Conteúdo proposto:

- Apresentação breve do Agenda Livre.
- Objetivo da plataforma.
- Explicação de que o site reúne informações sobre atividades dos CEUs.
- Informações institucionais pertinentes ao projeto acadêmico.

O conteúdo definitivo será elaborado posteriormente.

### 5.5 Contato

**Objetivo:** disponibilizar uma página de contato e demonstrar um fluxo de envio de mensagem na interface.

A página deverá conter, no mínimo:

- Título e breve instrução.
- Campo **Nome**.
- Campo **E-mail**.
- Campo **Assunto**.
- Campo **Mensagem**.
- Ação para enviar a mensagem.
- Validação visual dos campos.
- Estado de envio.
- Confirmação visual após o envio simulado.
- Mensagens de erro de validação, quando aplicáveis.

A obrigatoriedade dos campos, os limites de caracteres e as regras específicas de validação serão detalhados na especificação de interface.

**Limitação funcional registrada:** o formulário não enviará e-mail nem encaminhará a mensagem a um serviço externo. O envio será simulado no frontend, com uma confirmação visual. A interface não deverá afirmar que a mensagem foi realmente recebida por uma equipe ou encaminhada a um destinatário real.

Os campos definitivos, as regras de validação e o texto de confirmação serão definidos na especificação de interface e nos wireframes.

## 6. Categorias e descoberta

As categorias serão um caminho secundário de descoberta na página inicial e um filtro na página Explorar atividades.

A lista inicial de categorias proposta nos documentos do produto ainda precisa ser validada. A interface deverá refletir as categorias efetivamente disponibilizadas pela API, evitando manter uma lista independente e divergente no frontend.

Não serão criadas páginas exclusivas por categoria na primeira versão. A seleção de uma categoria levará à página Explorar atividades com o filtro correspondente aplicado.

## 7. Unidades

A página inicial e a exploração de atividades deverão incluir atividades de todas as unidades cadastradas.

A unidade deverá estar identificada nos cards e nos detalhes da atividade. A página Explorar atividades permitirá filtrar por unidade.

Não haverá páginas exclusivas para unidades na primeira versão. A estrutura deve, entretanto, permitir que novas unidades sejam adicionadas ao sistema sem exigir mudanças na arquitetura de navegação.

## 8. URLs e preservação do estado

### 8.1 Exploração e filtros

Os filtros e os parâmetros de busca deverão ser representados na URL sempre que possível, de modo que a consulta possa ser recarregada ou compartilhada.

Exemplo conceitual:

```text
/atividades?categoria=cultura&unidade=ceu-navegantes
```

O formato exato dos parâmetros deverá corresponder à API e à implementação final. O exemplo é ilustrativo, não um contrato de URL já definido.

### 8.2 Detalhes

Cada atividade deverá possuir uma URL própria, para permitir acesso direto e compartilhamento.

### 8.3 Voltar à listagem

Quando o visitante abrir uma atividade a partir da página de exploração e retornar, o sistema deverá preservar os filtros e a página anterior quando tecnicamente viável. O comportamento detalhado será especificado nos wireframes e na especificação de interface.

## 9. Rodapé

O rodapé deverá oferecer acesso consistente às páginas Sobre e Contato, além de links institucionais que sejam pertinentes e estejam disponíveis.

Não incluir links externos ou informações institucionais sem confirmar sua pertinência e disponibilidade.

## 10. Estados gerais da interface

As páginas que dependem de dados da API deverão prever:

- **Carregamento:** informar visualmente que o conteúdo está sendo buscado.
- **Sucesso:** apresentar os dados recebidos.
- **Sem resultados:** explicar que a consulta não encontrou atividades e, quando apropriado, oferecer uma forma de limpar filtros ou tentar outra busca.
- **Erro:** informar que não foi possível carregar o conteúdo e oferecer uma ação de nova tentativa quando pertinente.
- **Página não encontrada:** apresentar uma mensagem clara e um caminho de retorno à página inicial ou à exploração de atividades.

Esses estados serão detalhados nos wireframes e na especificação de interface.

## 11. Acessibilidade e usabilidade

- Usar títulos e hierarquia de conteúdo claros.
- Manter navegação consistente entre páginas.
- Identificar campos e mensagens de validação de forma compreensível.
- Não comunicar estados somente por cor.
- Garantir que os principais caminhos possam ser usados por teclado.
- Prever uma experiência adaptada a telas pequenas.
- Manter nomes de links e botões claros sobre seu destino ou ação.

Os critérios técnicos e de verificação de acessibilidade permanecem descritos no DOC-06 e serão detalhados para a interface nos documentos de frontend.

## 12. Pendências para validação

- [ ] Validar a lista definitiva de categorias.
- [ ] Confirmar o conteúdo institucional da página Sobre.
- [x] Definir os campos do formulário de Contato: Nome, E-mail, Assunto e Mensagem.
- [ ] Definir a obrigatoriedade dos campos, os limites de caracteres e as validações do formulário.
- [ ] Definir os textos de sucesso e erro do envio simulado.
- [ ] Confirmar os parâmetros de busca e filtros suportados pela API.
- [x] Atividades canceladas e finalizadas não serão apresentadas na interface pública.
- [x] Definir o critério das próximas atividades: atividades publicadas com ocorrências futuras, ordenadas pela próxima ocorrência.
- [ ] Definir a quantidade de cards exibidos na página inicial.
- [x] Definir o layout responsivo das próximas atividades: grade no desktop e uma coluna no celular.
- [ ] Confirmar quais informações de público-alvo estarão disponíveis na resposta da API para exibição nos detalhes.
- [ ] Definir o formato final das URLs e os parâmetros usados para preservar filtros.

## 13. Relação com outros documentos

- **DOC-01 — Visão do Produto e Requisitos:** objetivo, escopo e requisitos do produto.
- **DOC-02 — Arquitetura do Sistema:** tecnologias e arquitetura prevista.
- **DOC-03 — Modelo de Dados:** informações disponíveis sobre atividades, unidades e categorias.
- **DOC-04 — Backlog do Produto:** histórias de usuário e critérios de aceitação.
- **DOC-05 — Especificação da API REST:** endpoints, filtros, paginação e respostas.
- **DOC-06 — Requisitos Não Funcionais:** acessibilidade, usabilidade, segurança e desempenho.
- **DOC-07 — Estratégia de Testes:** testes gerais e de integração.
- **DOC-08 — Estratégia de Infraestrutura e Deploy:** configuração e execução da aplicação.

O próximo documento visual será o **DOC-12 — Wireframes**, após a revisão e validação desta arquitetura da informação.
