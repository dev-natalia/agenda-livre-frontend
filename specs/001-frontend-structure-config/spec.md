# Feature Specification: Estrutura inicial e configuração do frontend

**Feature Branch**: `001-frontend-structure-config`

**Created**: 2026-10-11

**Status**: Draft

**Input**: User description: "Feature 001 do docs/16-backlog-do-frontend.md: Feature FE-F01 (Estrutura de páginas e módulos), que reúne as histórias FE-001 (criar a estrutura inicial do frontend) e FE-002 (configurar a URL base da API)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Abrir qualquer página pública diretamente (Priority: P1)

Uma pessoa desenvolvedora (ou revisora) abre o projeto pela primeira vez e encontra uma estrutura organizada: uma página separada para cada área pública (Início, Explorar, Detalhes, Sobre e Contato), com estilos, scripts e recursos em locais de responsabilidade clara. Cada página abre diretamente por sua própria URL, sem depender de passar pela página inicial.

**Why this priority**: É a base de todas as demais features do frontend. Sem as cinco páginas e a organização de estilos e scripts, nenhuma outra história pode ser implementada de forma consistente.

**Independent Test**: Servir o projeto como arquivos estáticos, abrir cada uma das cinco páginas diretamente pela URL e verificar que carregam sem erros no console, com estilos e módulos de script aplicados.

**Acceptance Scenarios**:

1. **Given** o projeto servido como arquivos estáticos, **When** a pessoa abre diretamente a URL de Início, Explorar, Detalhes, Sobre ou Contato, **Then** a página correspondente carrega, com seus estilos e scripts, sem erros no console do navegador.
2. **Given** a estrutura criada, **When** a pessoa desenvolvedora inspeciona os diretórios, **Then** estilos, scripts e recursos (imagens, ícones, fontes) estão em diretórios distintos com responsabilidade identificável.
3. **Given** o código de scripts, **When** inspecionado, **Then** utiliza módulos ES Modules, sem framework frontend e sem roteador SPA.
4. **Given** a estrutura inicial, **When** a pessoa desenvolvedora procura arquivos sem função, **Then** não encontra arquivos vazios criados sem funcionalidade correspondente.
5. **Given** uma página do frontend, **When** seu módulo de script inicializa, **Then** não assume a existência de elementos de outras páginas e não gera erro quando eles estão ausentes.

---

### User Story 2 - Entender e manter a organização do projeto (Priority: P2)

Uma pessoa que passa a colaborar com o projeto lê a documentação (README ou documentação técnica) e entende onde fica cada tipo de arquivo, como servir o frontend localmente e quais são as responsabilidades de cada diretório, sem precisar deduzir a partir do código.

**Why this priority**: Garante que a estrutura criada seja compreensível e sustentável, mas depende de a estrutura já existir.

**Independent Test**: Uma pessoa que não participou da criação lê apenas a documentação e consegue indicar onde adicionar uma nova página, um novo estilo e um novo módulo de script, e como abrir o site localmente.

**Acceptance Scenarios**:

1. **Given** o repositório, **When** a pessoa lê a documentação, **Then** encontra a descrição da organização real de diretórios e arquivos e a responsabilidade de cada um.
2. **Given** a documentação, **When** a pessoa segue as instruções, **Then** consegue servir o frontend localmente e abrir as cinco páginas.
3. **Given** que a organização real difere de alguma proposta dos documentos de especificação, **When** a documentação é lida, **Then** descreve a organização efetivamente adotada.

---

### User Story 3 - Configurar a URL base da API em um único lugar (Priority: P1)

Uma pessoa desenvolvedora aponta o frontend para a API do ambiente desejado (local, homologação ou publicado) alterando um único ponto de configuração, sem editar vários módulos. A configuração contém apenas valores públicos. Se o valor necessário estiver ausente ou inválido, a aplicação informa isso de forma compreensível.

**Why this priority**: Toda comunicação com a API depende dessa configuração; ela também protege contra URLs fixas espalhadas e contra o vazamento de segredos em arquivos estáticos públicos.

**Independent Test**: Alterar apenas o ponto de configuração para outro endereço de API válido e verificar que o frontend passa a usá-lo; depois remover/invalidar o valor e verificar que aparece uma mensagem de erro compreensível.

**Acceptance Scenarios**:

1. **Given** o ponto único de configuração com uma URL válida de API, **When** qualquer módulo precisa do endereço da API, **Then** obtém a URL a partir dessa configuração e nenhum outro módulo contém o endereço fixo.
2. **Given** a necessidade de usar outro ambiente, **When** a pessoa altera somente o ponto de configuração, **Then** todo o frontend passa a apontar para a API do novo ambiente sem outras alterações.
3. **Given** a configuração ausente, **When** uma página que depende da API é aberta, **Then** a pessoa vê uma mensagem compreensível de configuração ausente, sem detalhes técnicos internos.
4. **Given** a configuração com valor inválido (não é uma URL válida), **When** a aplicação é carregada, **Then** a pessoa vê uma mensagem compreensível de configuração inválida e nenhuma requisição é feita a um endereço malformado.
5. **Given** os arquivos de configuração, **When** inspecionados, **Then** contêm apenas valores públicos e nenhum segredo, token ou credencial.

---

### Edge Cases

- A URL base da API informada com ou sem barra final, ou com caminho de versão (`/api/v1`): a aplicação deve normalizar de forma que os módulos montem endereços corretos nos dois casos.
- A URL base com esquema não permitido (por exemplo `javascript:` ou `file:`): deve ser tratada como configuração inválida.
- A URL base em HTTP em um ambiente publicado: o frontend deve sinalizar a configuração como inadequada para produção, permitindo HTTP apenas em desenvolvimento local.
- A página de Detalhes aberta sem o identificador da atividade ou com identificador malformado: a página deve carregar de forma estável (sem erro de script); o tratamento do estado em si pertence a feature posterior.
- Página aberta em um ambiente onde os arquivos estáticos são servidos em subcaminho: links internos e referências a estilos e scripts devem continuar funcionando.
- Navegador sem JavaScript habilitado: a estrutura e o conteúdo estático das páginas continuam acessíveis.
- Falha de carregamento de um módulo de script: a página deve continuar exibindo seu conteúdo estático.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O projeto MUST conter páginas separadas para Início, Explorar atividades, Detalhes da atividade, Sobre e Contato, cada uma acessível diretamente por sua própria URL.
- **FR-002**: Cada página MUST carregar seus estilos e scripts compartilhados e específicos sem erros no console do navegador.
- **FR-003**: Estilos, scripts e recursos (imagens, ícones, fontes) MUST ficar em diretórios distintos, com responsabilidades claras e documentadas (por exemplo: variáveis visuais, estilos globais, layout, componentes, estilos por página; configuração, cliente da API, componentes, módulos por página, utilitários).
- **FR-004**: Os scripts MUST ser organizados em módulos ES Modules, cada página importando apenas os módulos de que precisa.
- **FR-005**: O projeto MUST NOT depender de framework frontend nem de roteador SPA; a navegação entre páginas MUST ocorrer por links HTML nativos.
- **FR-006**: O módulo de script de cada página MUST verificar a presença dos elementos de que depende antes de registrar eventos ou alterar a página, não gerando erro quando executado em página diferente da prevista.
- **FR-007**: A estrutura MUST NOT incluir arquivos vazios sem função definida; módulos só são criados quando houver funcionalidade correspondente.
- **FR-008**: O projeto MUST incluir documentação (README ou documentação técnica) que descreva a organização real de diretórios e arquivos, a responsabilidade de cada um e como servir o frontend localmente.
- **FR-009**: Cada página MUST declarar o idioma português do Brasil e ter título de página distinto e descritivo, como base para os requisitos de acessibilidade das features seguintes.
- **FR-010**: A URL base da API MUST ser definida em um único ponto de configuração; nenhum outro módulo MAY conter o endereço da API fixo no código.
- **FR-011**: A configuração MUST permitir apontar o frontend para a API do ambiente em uso (local, homologação, publicado) alterando somente esse ponto.
- **FR-012**: A configuração MUST conter apenas valores públicos; segredos, tokens e credenciais MUST NOT constar em nenhum arquivo do frontend.
- **FR-013**: A aplicação MUST validar a configuração da URL base da API ao ser carregada e, se ela estiver ausente ou inválida, MUST apresentar mensagem compreensível, sem expor detalhes técnicos internos, e MUST NOT realizar requisições a endereços malformados.
- **FR-014**: A validação da URL base MUST aceitar somente os esquemas HTTP/HTTPS, normalizar a presença ou ausência de barra final e sinalizar o uso de HTTP fora do desenvolvimento local.
- **FR-015**: O módulo de configuração MUST oferecer aos demais módulos uma forma única de obter a URL base validada.
- **FR-016**: A configuração e a validação MUST ter testes automatizados cobrindo URL válida, ausente, malformada, com esquema não permitido e normalização de barra final.

### Key Entities

- **Página pública**: uma das cinco áreas navegáveis (Início, Explorar, Detalhes, Sobre, Contato); possui URL própria, estilos e módulo de script específicos.
- **Módulo de script**: unidade de código com responsabilidade única (configuração, cliente da API, componente, página ou utilitário), importada apenas pelas páginas que precisam dela.
- **Configuração pública do frontend**: conjunto de valores não sensíveis que variam por ambiente; nesta feature, a URL base da API.
- **Estado de configuração**: resultado da validação da configuração (válida, ausente, inválida, inadequada para produção) que determina se a aplicação pode consultar a API.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das cinco páginas públicas abrem diretamente por URL e carregam sem erros no console do navegador.
- **SC-002**: Trocar a API de ambiente exige alterar exatamente um arquivo/ponto de configuração; uma busca por endereços fixos da API nos demais módulos retorna zero ocorrências.
- **SC-003**: Uma pessoa desenvolvedora que não participou da criação consegue, usando apenas a documentação, servir o frontend localmente e abrir as cinco páginas em até 10 minutos.
- **SC-004**: Em 100% dos casos de configuração ausente ou inválida testados, a pessoa vê uma mensagem compreensível e nenhuma requisição é enviada a um endereço malformado.
- **SC-005**: Nenhum arquivo vazio sem função e nenhum segredo estão presentes na estrutura entregue (verificado por inspeção).
- **SC-006**: Os testes automatizados de configuração passam em 100% dos cenários definidos (válida, ausente, malformada, esquema não permitido, barra final).

## Assumptions

- A feature corresponde à Feature FE-F01 do DOC-16, que contém as histórias FE-001 e FE-002 (ambas P0); o termo "feature 001" foi interpretado dessa forma.
- O escopo limita-se à estrutura e à configuração; o conteúdo funcional das páginas (pesquisa, cards, detalhes, formulário), o cliente HTTP, a navegação compartilhada, o design system e as verificações completas de acessibilidade pertencem a features seguintes (FE-F02 em diante).
- As páginas desta feature contêm apenas esqueleto mínimo (estrutura semântica básica, título, idioma e inclusão de estilos e scripts), suficiente para validar a estrutura.
- A organização de diretórios segue como referência a proposta do DOC-09 (páginas `index`, `explorar`, `atividade`, `sobre`, `contato`; diretórios de recursos, estilos e scripts) e pode ser ajustada, desde que a documentação descreva o resultado real.
- A página de Detalhes identifica a atividade por parâmetro de URL, conforme proposta do DOC-09; o formato final depende de alinhamento com a API.
- A API do backend expõe o caminho base `/api/v1/` (DOC-05) e libera CORS por lista de origens configurável (`CORS_ALLOWED_ORIGINS`); a origem de desenvolvimento do frontend precisa constar nessa lista, o que é responsabilidade de configuração do backend.
- O frontend é hospedado como arquivos estáticos separados do backend; a hospedagem definitiva ainda não foi decidida, portanto a estrutura não deve presumir um domínio ou subcaminho específico.
- O mecanismo de fornecimento da configuração por ambiente (arquivo versionado, arquivo de exemplo, ou substituição no deploy) fica a critério do planejamento, desde que respeite os requisitos desta especificação.
- Os testes automatizados de unidade usam Vitest, conforme a estratégia do DOC-14 e o backlog (FE-041); nesta feature cobrem apenas a configuração.
