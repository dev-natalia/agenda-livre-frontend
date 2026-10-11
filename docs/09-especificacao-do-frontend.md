# DOC-09 — Especificação do Frontend

**Projeto:** Agenda Livre  
**Status:** Especificação técnica consolidada  
**Escopo:** Organização, implementação, integração e qualidade do frontend público.

## 1. Objetivo

Definir as decisões técnicas para desenvolver e manter o frontend público do Agenda Livre, incluindo stack, arquitetura, estrutura de arquivos, integração com a API REST, estado da interface, estilos, acessibilidade, segurança e testes.

O frontend deverá ser simples de operar e manter, com responsabilidades separadas do backend Django. A acessibilidade é um requisito transversal e deve orientar as decisões de estrutura, interação, apresentação e validação.

## 2. Escopo e responsabilidades

O frontend público contempla cinco páginas:

1. **Início** — apresentação do projeto, pesquisa rápida e próximas atividades.
2. **Explorar atividades** — pesquisa, filtros, resultados e paginação.
3. **Detalhes da atividade** — informações de uma atividade identificada por URL.
4. **Sobre o Agenda Livre** — apresentação institucional.
5. **Contato** — formulário demonstrativo, sem envio real de mensagens.

O Django Admin permanece como interface de administração e não faz parte deste frontend público.

### Responsabilidades do frontend
- Apresentar as informações retornadas pela API.
- Implementar a navegação e as interações públicas.
- Gerenciar os estados visuais de carregamento, sucesso, ausência de resultados e erro.
- Validar os campos do formulário demonstrativo.
- Preservar filtros, paginação e contexto de navegação quando possível.
- Implementar requisitos de acessibilidade, responsividade e identidade visual.
- Não acessar o PostgreSQL diretamente nem duplicar regras de negócio que pertencem ao backend.

### Responsabilidades do backend
- Disponibilizar os endpoints REST e os dados públicos.
- Aplicar regras de negócio, filtros, ordenação e paginação conforme o contrato da API.
- Controlar quais atividades podem ser exibidas publicamente.
- Gerenciar persistência e acesso ao banco de dados.
- Retornar respostas e códigos HTTP coerentes com a especificação da API.

A interface deve respeitar o contrato real da API. Funcionalidades não suportadas pelo backend não devem ser simuladas como se fossem garantidas.

## 3. Stack tecnológica

### 3.1 Tecnologias escolhidas
- **HTML5 semântico:** estrutura das páginas e dos componentes.
- **CSS:** identidade visual, layout, responsividade e estados visuais.
- **JavaScript puro (Vanilla JS):** interações e consumo da API.
- **Módulos JavaScript ES Modules:** separação do código por responsabilidade.
- **Fetch API:** requisições HTTP para a API REST.

Não será utilizado framework frontend como React, Vue ou Angular. A decisão mantém a solução simples e reduz dependências para o escopo acadêmico do projeto.

### 3.2 Bibliotecas
Não adicionar bibliotecas de interface, roteamento ou gerenciamento de estado sem uma necessidade concreta. Qualquer dependência futura deverá ter justificativa técnica, manutenção razoável e compatibilidade com os requisitos de acessibilidade.

## 4. Arquitetura de implantação

O frontend será independente do backend e hospedado como arquivos estáticos. O backend Django será executado separadamente e disponibilizará a API REST.

Fluxo de comunicação:

1. A pessoa acessa uma das páginas HTML hospedadas no serviço de arquivos estáticos.
2. O navegador carrega o HTML, o CSS e os módulos JavaScript.
3. O JavaScript faz requisições HTTP à API Django usando a Fetch API.
4. A API aplica as regras de negócio e retorna dados em formato JSON.
5. O frontend apresenta os dados e os estados correspondentes.

O navegador nunca se conecta diretamente ao PostgreSQL.

### 4.1 Origens e CORS
Como frontend e API podem estar em origens diferentes, o backend deverá permitir CORS somente para as origens autorizadas do frontend. Não usar uma política aberta indiscriminadamente em produção.

A origem de desenvolvimento e a origem de hospedagem deverão ser configuradas explicitamente. As configurações exatas serão definidas conforme os endereços usados no deploy.

### 4.2 HTTPS
Em ambientes publicados, o frontend e a API devem utilizar HTTPS. Não enviar dados da API por HTTP em produção.

## 5. Organização das páginas e URLs

Será utilizada uma página HTML por rota, sem implementar uma SPA.

Estrutura lógica:
- `index.html` — Início.
- `explorar.html` — Explorar atividades.
- `atividade.html?id=<identificador>` — Detalhes da atividade, usando o identificador estável definido pela API.
- `sobre.html` — Sobre o Agenda Livre.
- `contato.html` — Contato.

O parâmetro da página de detalhes é uma proposta técnica e deve ser alinhado ao identificador e às rotas realmente disponibilizados pela API. Se o deploy permitir URLs limpas para detalhes, elas poderão ser usadas sem alterar os princípios desta especificação.

Cada página deve funcionar quando acessada diretamente pela sua URL, e não apenas quando a pessoa chega a ela a partir da página inicial. Links internos devem usar caminhos válidos para o ambiente publicado.

### 5.1 Navegação
- Usar links HTML nativos para navegação entre páginas.
- Deixar o navegador gerir o histórico convencional.
- Usar parâmetros de URL para preservar termo de busca, filtros e página da listagem sempre que possível.
- Ao voltar dos detalhes, restaurar filtros, página e posição de rolagem quando tecnicamente possível.
- Não implementar roteador JavaScript próprio.

## 6. Estrutura de arquivos proposta

A estrutura abaixo é uma referência de organização. Os nomes podem ser ajustados aos padrões já existentes no repositório, mantendo a separação de responsabilidades.

```text
frontend/
├── index.html
├── explorar.html
├── atividade.html
├── sobre.html
├── contato.html
├── assets/
│   ├── images/
│   ├── icons/
│   └── fonts/
├── css/
│   ├── tokens.css
│   ├── base.css
│   ├── layout.css
│   ├── components.css
│   └── pages.css
└── js/
    ├── config.js
    ├── api/
    │   └── client.js
    ├── components/
    │   ├── navigation.js
    │   ├── activity-card.js
    │   ├── loading.js
    │   ├── status-message.js
    │   └── pagination.js
    ├── pages/
    │   ├── home.js
    │   ├── explore.js
    │   ├── activity-details.js
    │   ├── about.js
    │   └── contact.js
    └── utils/
        ├── dom.js
        ├── url-state.js
        └── validation.js
```

### 6.1 Responsabilidades dos módulos
- `config.js`: configurações públicas do frontend, incluindo a URL base da API.
- `api/client.js`: encapsular chamadas HTTP, parsing de respostas e tratamento comum de erros.
- `components/`: comportamentos reutilizáveis compartilhados entre páginas.
- `pages/`: inicialização e comportamento específico de cada página.
- `utils/`: funções pequenas e reutilizáveis, sem concentrar regras de negócio do backend.
- `css/tokens.css`: variáveis de design, como cores, espaçamentos, tipografia, bordas e foco.
- `css/base.css`: estilos globais, tipografia, resets mínimos e padrões de acessibilidade.
- `css/layout.css`: estrutura e comportamento responsivo do layout.
- `css/components.css`: estilos de componentes reutilizáveis.
- `css/pages.css`: ajustes específicos das páginas.

A estrutura é uma proposta para orientar o código; não é necessário criar arquivos vazios para todos os módulos antes de existir funcionalidade correspondente.

## 7. JavaScript modular e inicialização

- Utilizar módulos ES Modules com `type="module"` nos scripts.
- Cada página deve importar apenas os módulos de que precisa.
- Cada módulo de página deve inicializar seu comportamento sem assumir que elementos de outras páginas existem.
- Verificar a presença de elementos necessários antes de registrar eventos ou alterar o DOM.
- Evitar variáveis globais, funções gigantes e manipulação duplicada do mesmo componente.
- Manter funções de apresentação separadas da comunicação HTTP sempre que isso facilitar testes e manutenção.
- Não introduzir uma camada de abstração maior do que o projeto precisa.

## 8. Integração com a API REST

### 8.1 Configuração da URL
A URL base da API deverá ser definida em um único ponto de configuração. Não espalhar endereços de ambiente por vários módulos.

Como o frontend será composto por arquivos estáticos, essa configuração será pública e não poderá conter segredos. Ajustar a URL para os ambientes de desenvolvimento e publicação sem exigir mudanças em cada arquivo que faz requisições.

### 8.2 Cliente HTTP
O módulo central de API deverá:
- utilizar a Fetch API;
- construir URLs e parâmetros de consulta de forma segura, usando APIs como `URL` e `URLSearchParams`;
- verificar `response.ok`, pois a Fetch API não rejeita automaticamente a Promise em respostas HTTP de erro;
- tratar respostas sem corpo quando aplicável;
- interpretar JSON apenas quando a resposta e o endpoint esperados indicarem JSON;
- diferenciar erro HTTP, erro de rede e resposta inválida;
- propagar erros de forma consistente para que a página possa apresentar o estado adequado;
- evitar repetir lógica de parsing e tratamento em cada página.

### 8.3 Contrato da API
Os nomes exatos dos endpoints, parâmetros, formatos de resposta, paginação, campos de atividade e códigos HTTP devem seguir o DOC-05 e a implementação real do backend. Este documento não substitui a especificação da API.

### 8.4 Filtros, ordenação e paginação
- O frontend envia somente os filtros suportados pela API.
- Filtros selecionados são aplicados apenas após a ação explícita “Filtrar”.
- Ao aplicar novos filtros, a listagem volta à página 1.
- “Limpar filtros” restaura os padrões e solicita a listagem geral.
- A ordenação desejada é pela próxima ocorrência futura, da mais próxima à mais distante. A responsabilidade de cálculo deve ser alinhada ao contrato da API para evitar regras divergentes no frontend e no backend.
- Paginação tradicional será usada se houver suporte na API.
- A quantidade total só será mostrada quando puder ser obtida de forma confiável.

### 8.5 Concorrência e solicitações repetidas
- Desabilitar ou proteger temporariamente a ação que dispara uma solicitação quando cliques repetidos puderem gerar operações redundantes.
- Se uma nova busca substituir uma consulta anterior, impedir que uma resposta antiga sobrescreva os resultados mais recentes. Pode-se usar `AbortController` ou identificar cada solicitação.
- Não manter resultados antigos como se fossem a resposta atual quando a política definida exigir skeleton durante a nova consulta.

## 9. Estado da interface e parâmetros de URL

Não será adotada biblioteca de gerenciamento de estado. O estado será mantido por módulos JavaScript e pelo navegador, de maneira simples e explícita.

### 9.1 Estado da listagem
Quando suportado, representar na URL:
- termo de pesquisa;
- unidade;
- categoria;
- período;
- página atual.

A URL deve poder ser copiada e compartilhada, e os valores devem ser restaurados ao abrir a página. Parâmetros inválidos devem ser normalizados para valores seguros e válidos.

### 9.2 Histórico e retorno
- Usar a navegação nativa do navegador.
- Preservar filtros e página na URL.
- Preservar a posição de rolagem quando possível.
- Restaurar o contexto anterior ao retornar dos detalhes, sem exigir que a pessoa refaça a pesquisa.
- Garantir que a página continue utilizável se o histórico ou o estado anterior não estiver disponível.

## 10. Componentes reutilizáveis

Os componentes devem ser criados quando houver reutilização real ou quando uma responsabilidade transversal justificar centralização.

Componentes previstos:
- cabeçalho e navegação responsiva;
- card de atividade;
- skeleton de atividade;
- mensagem de status e erro;
- paginação;
- fallback visual para imagem ausente;
- controles e mensagens de validação do formulário.

Cada componente deverá:
- ter responsabilidade clara;
- usar HTML semântico;
- oferecer nomes acessíveis e estados programáticos adequados;
- funcionar com teclado;
- manter foco visível;
- não depender apenas de cor;
- evitar duplicar conteúdo anunciado por leitores de tela.

Não transformar todo fragmento de HTML em componente JavaScript sem necessidade. Priorizar simplicidade e comportamento previsível.

## 11. CSS, design system e responsividade

### 11.1 Design tokens
Centralizar as variáveis visuais em CSS custom properties. A paleta inicial do DOC-10 é uma referência visual, mas as combinações finais devem ser verificadas quanto ao contraste. Quando necessário, os tons devem ser ajustados para cumprir a meta WCAG 2.2 AA.

### 11.2 Organização dos estilos
- Manter estilos globais separados de layout e componentes.
- Evitar estilos inline repetidos.
- Usar classes com nomes claros e consistentes.
- Preferir layouts flexíveis, Grid e unidades relativas.
- Evitar dimensões rígidas que provoquem corte de texto ou sobreposição.
- Não desativar o zoom do navegador.
- Usar estados visuais explícitos para hover, foco, seleção, erro e desabilitado.

### 11.3 Responsividade
- Cards em grade no desktop e uma coluna em telas estreitas.
- Navegação móvel por menu expansível acessível.
- Filtros e formulários devem caber em larguras pequenas.
- Testar reflow em largura equivalente a 320 pixels CSS e ampliação de texto até 200%.
- Evitar rolagem horizontal desnecessária, exceto em conteúdo para o qual ela seja realmente necessária pelas exceções da WCAG.

### 11.4 Movimento
Respeitar `prefers-reduced-motion: reduce`, reduzindo ou removendo animações não essenciais. O conteúdo e as funcionalidades devem continuar disponíveis.

## 12. Acessibilidade como requisito de implementação

A meta do projeto é WCAG 2.2 nível AA. O DOC-15 contém as adaptações, referências, classificação dos requisitos e plano de validação. Este documento define como elas afetam as decisões técnicas do frontend.

Requisitos centrais:
- declarar `lang="pt-BR"`;
- utilizar HTML semântico e hierarquia lógica de títulos;
- oferecer link “Pular para o conteúdo principal”;
- garantir navegação por teclado sem armadilhas;
- apresentar foco visível e não totalmente obscurecido;
- atender aos requisitos aplicáveis de contraste de texto e componentes;
- permitir redimensionamento de texto e reflow;
- associar rótulos, instruções e erros aos campos;
- comunicar estados dinâmicos sem mover o foco desnecessariamente;
- fornecer textos alternativos adequados para imagens informativas;
- usar `alt=""` em imagens decorativas;
- não depender somente de cor para transmitir informação;
- respeitar movimento reduzido;
- testar com teclado, tecnologias assistivas e ferramentas automáticas.

### 12.1 Regiões de status e atualizações
- Anunciar carregamento, conclusão, resultado vazio e falha de maneira objetiva.
- Utilizar `aria-live` ou semântica de status apropriada quando necessário, evitando adicionar ARIA sem motivo.
- Não anunciar skeleton cards como atividades reais.
- Não deslocar o foco só porque os resultados foram atualizados.
- Evitar anúncios duplicados ou excessivos.

### 12.2 Formulários
- Utilizar rótulos visíveis e associados aos campos.
- Identificar campos obrigatórios por texto e programaticamente.
- Mostrar todos os erros encontrados na mesma tentativa.
- Associar cada erro ao campo correspondente, por exemplo com `aria-describedby`, e sinalizar o estado inválido quando aplicável.
- Após uma tentativa inválida, mover o foco ao primeiro campo inválido, mantendo os demais erros identificáveis.
- Após validação bem-sucedida, substituir o formulário demonstrativo por painel que informa que nenhuma mensagem foi enviada.
- Comunicar a mudança e gerenciar o foco de forma previsível.

## 13. Segurança no frontend

- Nunca incluir credenciais, chaves privadas ou segredos nos arquivos HTML, CSS ou JavaScript.
- Considerar qualquer dado retornado pela API como dado a validar antes de apresentar.
- Inserir texto não confiável com APIs seguras de DOM, como `textContent`, em vez de concatená-lo indiscriminadamente em `innerHTML`.
- Se HTML dinâmico for realmente necessário, utilizar uma estratégia de sanitização apropriada; não presumir que dados da API são seguros apenas por serem internos.
- Validar URLs antes de criar links externos e permitir apenas esquemas esperados, como HTTPS (e HTTP apenas quando justificado em desenvolvimento).
- Links externos que abrem em nova aba devem ser implementados com as proteções adequadas, por exemplo `rel="noopener noreferrer"` quando aplicável, e informar acessivelmente que uma nova aba será aberta.
- Não confiar na validação do frontend como substituta da validação no backend.
- Configurar CORS no backend com origens autorizadas.
- Publicar frontend e API com HTTPS.
- Evitar expor detalhes internos de erros ao usuário; registrar detalhes técnicos apenas nos mecanismos de desenvolvimento/observabilidade disponíveis.

## 14. Formulário de contato demonstrativo

O formulário de contato é apenas demonstrativo e não envia dados a um serviço.

Campos definidos:
- Nome;
- E-mail;
- Assunto;
- Mensagem.

Requisitos:
- validar obrigatoriedade, formato de e-mail e limites de caracteres;
- definir limites mínimo/máximo da mensagem;
- apresentar erros específicos e acessíveis;
- não alegar que a mensagem foi enviada ou recebida;
- após validação bem-sucedida, mostrar painel de confirmação com explicação explícita;
- oferecer ação para voltar ao formulário.

Os limites numéricos finais devem ser definidos na implementação e mantidos consistentes com os testes.

## 15. Testes e qualidade

A estratégia detalhada está no DOC-14 (estratégia de testes do frontend) e no DOC-07 (estratégia de testes geral). Os testes devem incluir, no mínimo:

### Funcionais
- carregamento das cinco páginas;
- navegação direta por URL;
- pesquisa e filtros;
- limpeza dos filtros;
- paginação quando suportada;
- detalhes de atividade e links externos;
- estados de carregamento, erro e lista vazia;
- validação e confirmação demonstrativa do formulário.

### Integração
- respostas de sucesso da API;
- erros HTTP e falhas de rede;
- JSON inválido ou resposta inesperada;
- parâmetros e formatos alinhados ao DOC-05;
- concorrência entre pesquisas;
- comportamento quando campos opcionais não estão presentes.

### Acessibilidade
- navegação completa por teclado;
- foco visível e ordem lógica;
- link para pular ao conteúdo;
- operação do menu móvel;
- leitor de tela para carregamento, erros e resultados;
- formulário com múltiplos erros;
- contraste;
- zoom a 200% e reflow;
- preferência de movimento reduzido;
- textos alternativos e fallbacks.

Ferramentas automáticas ajudam a encontrar problemas, mas não substituem testes manuais e avaliação de comportamento real com tecnologias assistivas.

## 16. Critérios de aceite técnicos

- O frontend usa HTML, CSS e JavaScript puro, sem framework frontend.
- As cinco páginas são arquivos HTML separados e podem ser acessadas diretamente.
- O frontend é hospedado separadamente do backend Django.
- As requisições passam por um módulo centralizado de cliente HTTP.
- A URL base da API fica em configuração única e não contém segredos.
- CORS permite apenas origens autorizadas.
- O frontend não acessa diretamente o PostgreSQL.
- O contrato do DOC-05 é respeitado.
- Filtros e paginação são preservados na URL quando suportados.
- Estados de carregamento, erro e ausência de resultados são distintos e acessíveis.
- Não há perda de conteúdo em ampliação/reflow previstos.
- Os critérios de acessibilidade relevantes foram verificados e as limitações foram registradas.
- O formulário demonstrativo não afirma enviar mensagens.
- Os testes definidos nos DOC-07 e DOC-14 são executados conforme o escopo implementado.

## 17. Dependências e decisões a confirmar durante a implementação

- URL pública e URL de desenvolvimento da API.
- Origens permitidas na configuração CORS do Django.
- Endpoints, parâmetros e formato exato de paginação conforme DOC-05.
- Identificador e padrão final da URL de detalhes da atividade.
- Hospedagem escolhida para os arquivos estáticos.
- Como serão fornecidas as configurações públicas para cada ambiente.
- Suporte da API à ordenação por próxima ocorrência e filtros disponíveis.
- Limites numéricos definitivos dos campos do formulário.

Esses itens são configurações ou dependências técnicas. Não alteram as decisões centrais de stack, separação entre frontend e backend ou prioridade de acessibilidade.

## 18. Referências internas e externas

### Documentação do Agenda Livre
- DOC-02 — Arquitetura do Sistema.
- DOC-05 — Especificação da API REST.
- DOC-06 — Requisitos Não Funcionais.
- DOC-07 — Estratégia de Testes.
- DOC-10 — Identidade Visual e Design System.
- DOC-11 — Arquitetura da Informação.
- DOC-12 — Wireframes.
- DOC-13 — Especificação de Interfaces e Comportamentos.
- DOC-14 — Estratégia de Testes do Frontend.
- DOC-15 — Diretrizes de Acessibilidade do Agenda Livre.

### Referências técnicas
- HTML Living Standard: https://html.spec.whatwg.org/
- MDN — JavaScript modules: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
- MDN — Fetch API: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
- MDN — CORS: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
- WCAG 2.2: https://www.w3.org/TR/WCAG22/
- WAI-ARIA Authoring Practices Guide — Disclosure: https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
