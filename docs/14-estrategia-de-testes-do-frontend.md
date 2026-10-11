# DOC-14 — Estratégia de Testes do Frontend

**Projeto:** Agenda Livre  
**Status:** Estratégia de testes proposta para orientar a implementação  
**Escopo:** Testes automatizados e manuais do frontend público, incluindo acessibilidade.

## 1. Objetivo

Definir como verificar a qualidade do frontend do Agenda Livre, incluindo comportamento funcional, integração com a API REST, responsividade, segurança no tratamento de dados e acessibilidade.

A estratégia complementa o DOC-07 — Estratégia de Testes, concentrando-se no frontend desenvolvido com HTML, CSS e JavaScript puro. O DOC-15 — Diretrizes de Acessibilidade define as adaptações e referências de acessibilidade; este documento descreve como verificar parte delas.

A meta de acessibilidade do projeto é **WCAG 2.2 nível AA**. A execução dos testes descritos aqui contribui para a validação, mas não constitui por si só uma certificação ou garantia de conformidade integral.

## 2. Escopo

### Incluído
- As cinco páginas públicas: Início, Explorar atividades, Detalhes da atividade, Sobre e Contato.
- Módulos JavaScript e utilitários.
- Componentes reutilizáveis, como navegação, cards, mensagens de status, skeletons e paginação.
- Requisições à API REST e tratamento de respostas.
- Pesquisa, filtros, ordenação e paginação conforme suportados pela API.
- Estados de carregamento, sucesso, lista vazia, erro e atividade indisponível.
- Validação do formulário demonstrativo.
- Navegação por teclado, tecnologias assistivas, contraste, ampliação e responsividade.
- Tratamento seguro de conteúdo e URLs externas.

### Fora do escopo
- Testes internos do backend Django e da persistência PostgreSQL, cobertos pela estratégia de testes do backend.
- Testes do Django Admin.
- Testes de infraestrutura e deploy além das verificações necessárias para acessar o frontend e a API.
- Testes de envio real do formulário de contato, pois o formulário é demonstrativo e não envia mensagens.

## 3. Estratégia geral

A estratégia combina quatro abordagens:

1. **Testes unitários:** verificam funções e módulos isoladamente.
2. **Testes de integração:** verificam a colaboração entre módulos do frontend e o contrato da API.
3. **Testes funcionais de navegador (end-to-end):** verificam os fluxos completos como uma pessoa os utiliza.
4. **Testes manuais de acessibilidade e usabilidade:** identificam problemas que ferramentas automáticas não conseguem detectar com segurança.

Ferramentas automáticas devem complementar, e não substituir, testes manuais. Uma suíte aprovada não garante que todo o site seja acessível ou livre de defeitos.

## 4. Ferramentas

### 4.1 Vitest
Utilizado para testes unitários de módulos e funções JavaScript.

Casos adequados:
- construção e normalização de parâmetros;
- leitura e validação de valores da URL;
- funções de validação do formulário;
- formatação de informações apresentadas nos cards;
- tratamento de respostas e erros do cliente HTTP;
- utilitários sem dependência de interação real do navegador.

Documentação: https://vitest.dev/

### 4.2 Playwright
Utilizado para testes funcionais no navegador, cobrindo fluxos entre páginas e interações reais.

Casos adequados:
- navegação entre páginas;
- pesquisa e filtros;
- paginação;
- abertura de detalhes;
- estados de carregamento e falha;
- validação do formulário;
- navegação por teclado e verificações básicas de responsividade.

Documentação: https://playwright.dev/

### 4.3 axe-core
Utilizado para verificar automaticamente problemas comuns de acessibilidade nas páginas e estados testados. Pode ser integrado aos testes do Playwright por meio da integração apropriada.

Casos adequados:
- ausência de nomes acessíveis;
- problemas de associação entre campos e rótulos;
- uso inadequado de atributos ARIA;
- problemas de contraste que a ferramenta consiga identificar;
- problemas estruturais detectáveis automaticamente.

Documentação: https://github.com/dequelabs/axe-core

### 4.4 Ferramentas complementares
- Ferramentas de contraste para verificar combinações específicas de cores.
- Ferramentas de desenvolvedor do navegador para examinar estrutura, foco e requisições.
- Leitores de tela disponíveis no ambiente de teste.
- Lighthouse como auditoria complementar, não como substituto da suíte nem de avaliação manual.

Não é necessário adotar todas as ferramentas complementares desde o primeiro momento. A combinação mínima proposta é Vitest, Playwright e axe-core, acompanhada de testes manuais.

## 5. Organização dos testes

A organização deve acompanhar a estrutura real do repositório. Uma proposta é:

```text
frontend/
├── ...arquivos da aplicação...
└── tests/
    ├── unit/
    │   ├── url-state.test.js
    │   ├── validation.test.js
    │   └── api-client.test.js
    ├── integration/
    │   ├── explore.test.js
    │   └── activity-details.test.js
    ├── e2e/
    │   ├── navigation.spec.js
    │   ├── explore.spec.js
    │   ├── contact.spec.js
    │   └── accessibility.spec.js
    └── fixtures/
        └── activities.js
```

A estrutura é ilustrativa; os nomes devem ser ajustados aos módulos efetivamente implementados. Evitar criar arquivos de teste vazios ou testar funções que ainda não existem.

## 6. Testes unitários

Testar funções isoladas com entradas válidas, inválidas e limites relevantes.

### 6.1 Estado da URL
- Interpretar termo de pesquisa, unidade, categoria, período e página.
- Tratar parâmetros ausentes.
- Normalizar valores inválidos para padrões seguros.
- Gerar parâmetros sem perder critérios válidos.
- Garantir que uma nova pesquisa reinicie a página para 1.

### 6.2 Validação do formulário
- Detectar campos obrigatórios vazios.
- Verificar formato de e-mail.
- Verificar limites de caracteres definidos na implementação.
- Verificar comprimento mínimo e máximo da mensagem.
- Retornar erros claros e associados aos campos corretos.
- Aceitar entradas válidas dentro dos limites.

### 6.3 Cliente HTTP
- Construir URL e query string corretamente.
- Tratar respostas de sucesso.
- Tratar códigos HTTP de erro.
- Tratar falhas de rede.
- Tratar JSON inválido ou formato inesperado.
- Tratar respostas sem corpo quando aplicável.
- Não considerar automaticamente respostas HTTP de erro como sucesso.

### 6.4 Apresentação de dados
- Tratar campos opcionais ausentes.
- Formatar datas e horários com segurança.
- Evitar falha de renderização quando uma atividade não tem imagem.
- Não apresentar como total geral uma quantidade que represente apenas a página atual.

## 7. Testes de integração

Verificar a colaboração entre os módulos de página, o cliente HTTP, os componentes e os dados retornados pela API.

### Casos prioritários
- A página inicial consulta e apresenta as próximas atividades.
- A página Explorar envia os filtros selecionados ao aplicar a busca.
- “Limpar filtros” restaura os padrões e atualiza os resultados.
- A paginação envia a página solicitada e mantém os filtros.
- A página de detalhes solicita a atividade correta.
- Campos opcionais ausentes não quebram o layout.
- Erros HTTP e falhas de rede levam ao estado de erro correto.
- Respostas antigas não sobrescrevem resultados de uma pesquisa mais recente.
- A quantidade exibida corresponde ao total fornecido pela API, quando disponível.
- A ordenação por próxima ocorrência segue a regra definida e o contrato real da API.

### Isolamento
Sempre que possível, usar respostas controladas ou mocks para tornar os testes reproduzíveis. Manter alguns testes contra um ambiente integrado para verificar se o contrato real da API continua compatível.

Os mocks não devem ser usados como única evidência de integração: um mock pode divergir da implementação real.

## 8. Testes funcionais no navegador

Os testes end-to-end devem verificar fluxos completos e observáveis pela pessoa usuária.

### 8.1 Navegação compartilhada
- Abrir diretamente cada uma das cinco páginas.
- Navegar entre páginas por links.
- Confirmar que a página atual está identificada de forma acessível.
- Acionar “Pular para o conteúdo principal”.
- Abrir e fechar o menu móvel.
- Confirmar que links externos abrem em nova aba e têm indicação acessível.

### 8.2 Página Início
- Exibir três próximas atividades quando houver dados suficientes.
- Ordenar pela próxima ocorrência futura, incluindo recorrência conforme a regra acordada.
- Não exibir atividades com status `CANCELLED` ou `FINISHED`.
- Mostrar skeleton loading durante a consulta.
- Mostrar mensagem de erro e “Tentar novamente” em caso de falha.
- Garantir que uma falha nessa seção não impeça o uso das outras partes da página.
- Aplicar pesquisa e filtros rápidos somente após clicar em “Explorar”.

### 8.3 Página Explorar
- Aplicar busca por texto e filtros suportados pela API.
- Manter os resultados existentes enquanto os campos são alterados antes de clicar em “Filtrar”.
- Mostrar skeleton durante a consulta.
- Retornar à página 1 ao aplicar novos filtros.
- Limpar filtros e carregar a listagem geral.
- Exibir a quantidade de resultados quando disponível.
- Mostrar estado específico quando não houver resultados.
- Diferenciar lista vazia de erro da API.
- Navegar pela paginação e preservar filtros.
- Restaurar filtros e página ao abrir um detalhe e retornar, quando possível.

### 8.4 Página Detalhes
- Abrir uma atividade por URL direta.
- Apresentar os campos disponíveis.
- Mostrar fallback quando a imagem estiver ausente.
- Mostrar link externo apenas quando houver URL válida.
- Apresentar mensagem de indisponibilidade para atividade cancelada/encerrada quando a API permitir identificá-la com segurança.
- Apresentar página 404 para atividade inexistente.
- Retornar à listagem preservando seu estado quando possível.

### 8.5 Página Sobre
- Carregar corretamente o conteúdo institucional.
- Manter estrutura semântica e hierarquia de títulos.
- Verificar os links de navegação.

### 8.6 Página Contato
- Tentar enviar o formulário vazio.
- Enviar formulário com vários campos inválidos e verificar que todos os erros são apresentados.
- Confirmar associação dos erros aos campos.
- Confirmar foco no primeiro campo inválido.
- Enviar dados válidos e verificar que o formulário é substituído por painel demonstrativo.
- Confirmar que a mensagem não afirma que houve envio real.
- Voltar ao formulário e verificar o comportamento de preservação dos valores definido na implementação.

## 9. Testes de acessibilidade

A acessibilidade deve ser verificada continuamente, não apenas no final do desenvolvimento. O DOC-15 é a referência principal para adaptações e critérios.

### 9.1 Testes automáticos
Executar axe-core nas cinco páginas e nos principais estados dinâmicos:
- página carregada;
- menu móvel aberto;
- resultados da listagem;
- nenhum resultado;
- erro da API;
- formulário com erros;
- painel de confirmação.

Investigar cada violação. Não ignorar um alerta apenas para obter uma execução verde; exceções justificadas devem ser registradas com escopo, razão e alternativa de mitigação.

### 9.2 Teclado
Verificar manualmente:
- todos os controles podem ser alcançados e operados por teclado;
- a ordem de foco é lógica;
- o indicador de foco é visível;
- o foco não fica totalmente oculto por conteúdo da interface;
- não existem armadilhas de teclado;
- o link “Pular para o conteúdo principal” funciona;
- abrir e fechar o menu não deixa links ocultos na ordem de foco;
- as atualizações de resultados não movem o foco inesperadamente;
- a paginação e o formulário podem ser usados sem mouse.

### 9.3 Leitores de tela
Testar pelo menos um leitor de tela compatível com o ambiente disponível. Quando possível, ampliar a cobertura com combinações diferentes de navegador e leitor de tela.

Verificar:
- nomes, funções e estados dos controles;
- rótulos de campos;
- mensagens de erro associadas;
- anúncio de carregamento, conclusão, quantidade, ausência de resultados e falha;
- comunicação da confirmação demonstrativa;
- identificação da página e da hierarquia de títulos;
- texto alternativo das imagens informativas;
- ausência de anúncios desnecessários para imagens e ícones decorativos.

Axe-core não substitui esses testes.

### 9.4 Contraste e cor
- Verificar combinações reais de texto e fundo, inclusive botões, links, mensagens de erro e estados de foco.
- Confirmar os contrastes exigidos pela WCAG para texto e componentes, observando as exceções aplicáveis.
- Garantir que erro, seleção e estado não sejam comunicados apenas por cor.
- Verificar estados de hover, foco, selecionado e desabilitado.

### 9.5 Ampliação, reflow e espaçamento
- Ampliar o texto até 200% e confirmar que conteúdo e funcionalidades permanecem disponíveis.
- Testar o reflow em largura equivalente a 320 pixels CSS.
- Verificar que filtros, menu, cards e formulário não se sobrepõem ou cortam conteúdo.
- Testar as configurações de espaçamento de texto previstas pela WCAG 2.2.
- Não desativar zoom do navegador.

### 9.6 Movimento reduzido
Ativar `prefers-reduced-motion: reduce` e verificar que animações não essenciais são removidas ou reduzidas sem perda de informação ou funcionalidade.

### 9.7 Limitações dos testes automáticos
Ferramentas automáticas detectam apenas certas classes de problema. A aprovação do axe-core ou do Lighthouse não demonstra, isoladamente, conformidade integral com WCAG 2.2 AA.

## 10. Testes responsivos e de navegador

Verificar pelo menos:
- viewport desktop;
- viewport intermediário/tablet;
- viewport móvel estreito;
- ampliação de texto/zoom;
- orientação vertical e horizontal quando relevante.

Confirmar:
- ausência de conteúdo cortado;
- navegação utilizável;
- cards adaptáveis;
- filtros e formulários utilizáveis;
- imagens com proporções adequadas;
- foco visível;
- nenhuma funcionalidade dependente exclusivamente de hover;
- comportamento adequado com movimento reduzido.

Os navegadores e dispositivos exatos devem ser definidos conforme o ambiente de desenvolvimento e o público-alvo. No mínimo, testar um navegador desktop baseado em Chromium e, quando possível, um navegador adicional.

## 11. Testes de segurança no frontend

- Confirmar que dados textuais da API são inseridos como texto e não interpretados inadvertidamente como HTML executável.
- Testar conteúdo com caracteres especiais e marcação inesperada.
- Validar URLs externas e rejeitar esquemas não permitidos, como `javascript:`.
- Confirmar que links externos em nova aba utilizam as proteções apropriadas.
- Verificar que não existem segredos embutidos nos arquivos frontend.
- Confirmar que falhas não exibem stack traces, tokens ou detalhes internos.
- Confirmar que a validação do frontend não é tratada como substituta da validação do backend.

Estes testes verificam precauções do frontend; a segurança completa da aplicação exige também testes do backend e da configuração de infraestrutura.

## 12. Dados de teste e mocks

Utilizar fixtures controladas que cubram:
- atividade com todos os campos;
- atividade sem imagem;
- atividade sem URL externa;
- campos opcionais ausentes;
- atividade recorrente;
- atividade cancelada ou encerrada;
- listagem vazia;
- várias páginas de resultados;
- erro HTTP;
- falha de rede;
- resposta JSON inválida.

Não usar dados pessoais reais nos testes. Fixtures devem ser sintéticas e reproduzíveis.

Quando o comportamento depender de capacidades específicas da API — filtros, paginação, ordenação, total de resultados ou visibilidade de atividades — validar o contrato real do DOC-05 e não presumir que o mock comprova a integração.

## 13. Execução e automação

Os scripts concretos de execução devem ser definidos nos arquivos de configuração do projeto. Como ponto de partida, prever comandos separados para:
- testes unitários com Vitest;
- testes de navegador com Playwright;
- verificações automatizadas de acessibilidade;
- execução conjunta da suíte.

A sintaxe final dos comandos dependerá da configuração efetiva do repositório. Este documento não pressupõe que os pacotes já estejam instalados.

### Execução durante o desenvolvimento
- Executar testes unitários após alterações em utilitários e módulos.
- Executar testes relevantes de integração ao alterar o cliente HTTP ou a comunicação com a API.
- Executar testes end-to-end ao alterar fluxos ou navegação.
- Executar verificações de acessibilidade nas páginas e estados modificados.
- Antes de uma entrega, executar a suíte definida e registrar falhas conhecidas.

### Integração contínua
Se houver pipeline de CI disponível, executar automaticamente testes unitários, testes end-to-end e verificações automáticas de acessibilidade. Uma falha deve ser investigada; não desabilitar testes permanentemente apenas para liberar uma entrega.

## 14. Critérios de aceite

Uma entrega do frontend pode ser considerada aprovada para o escopo testado quando:

- Os testes unitários e de integração previstos passam.
- Os principais fluxos end-to-end das cinco páginas passam.
- Não existem falhas críticas conhecidas que impeçam os fluxos principais.
- Não há violações de acessibilidade automatizadas sem análise e resolução ou justificativa documentada.
- A navegação por teclado funciona nos fluxos essenciais.
- Os testes manuais de leitor de tela definidos para a entrega foram executados.
- Contraste, ampliação e reflow foram verificados.
- Erros, carregamento, lista vazia e sucesso são comunicados de maneira distinta.
- O formulário identifica erros corretamente e deixa claro que não envia mensagens.
- A integração com a API segue o contrato real.
- Problemas conhecidos, limitações e exceções são registrados.

A aprovação de uma suíte não equivale a uma declaração formal de conformidade WCAG. A meta AA exige avaliação dos critérios aplicáveis em todo o conteúdo e nos diferentes estados relevantes.

## 15. Registro de resultados e defeitos

Para cada execução relevante, registrar:
- data da execução;
- versão ou commit testado;
- ferramentas e versões;
- páginas e estados avaliados;
- testes aprovados e reprovados;
- problemas de acessibilidade encontrados;
- gravidade, impacto e passos para reprodução;
- correções realizadas ou justificativas para exceções;
- limitações de ambiente ou de integração.

Priorizar defeitos que bloqueiem a navegação por teclado, impeçam o uso de leitores de tela, ocultem conteúdo ou impeçam tarefas centrais.

## 16. Dependências e pontos a confirmar

- Estrutura final do repositório e comandos de execução.
- Endpoints e formatos de resposta da API conforme DOC-05.
- Suporte real da API a filtros, paginação, ordenação e total de resultados.
- Identificador e URL final dos detalhes da atividade.
- Ambiente disponível para testes integrados.
- Navegadores e leitores de tela disponíveis para validação manual.
- Configuração do pipeline de CI, caso seja adotado.

## 17. Relação com outros documentos

- **DOC-05 — Especificação da API REST:** contrato utilizado nos testes de integração.
- **DOC-07 — Estratégia de Testes:** estratégia geral do projeto.
- **DOC-09 — Especificação do Frontend:** arquitetura e stack testadas.
- **DOC-10 — Identidade Visual e Design System:** tokens, cores e componentes a validar.
- **DOC-12 — Wireframes:** estrutura visual das páginas.
- **DOC-13 — Especificação de Interfaces e Comportamentos:** comportamentos esperados nos testes.
- **DOC-15 — Diretrizes de Acessibilidade:** adaptações, critérios e fontes de referência.

## 18. Referências técnicas

- Vitest: https://vitest.dev/
- Playwright: https://playwright.dev/
- axe-core: https://github.com/dequelabs/axe-core
- WCAG 2.2: https://www.w3.org/TR/WCAG22/
- WAI-ARIA Authoring Practices Guide: https://www.w3.org/WAI/ARIA/apg/
- eMAG 3.1: https://emag.governoeletronico.gov.br/
