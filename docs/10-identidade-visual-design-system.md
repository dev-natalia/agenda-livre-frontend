# DOC-10 — Identidade Visual e Design System

**Projeto:** Agenda Livre  
**Versão:** 0.1  
**Status:** Rascunho para validação  
**Última atualização:** 2026-10-11

## 1. Objetivo

Definir a direção visual do Agenda Livre e estabelecer regras iniciais para cores, tipografia, logotipo e componentes da interface pública. O objetivo é manter uma experiência consistente, acolhedora, acessível e fácil de reconhecer em diferentes páginas e tamanhos de tela.

Este documento registra as decisões tomadas até o momento. Detalhes ainda não validados são identificados como recomendações iniciais.

## 2. Direção visual

A identidade do Agenda Livre combinará duas características:

- **Institucional:** organização, clareza, confiança e facilidade de uso.
- **Cultural:** energia, diversidade, acolhimento e destaque para atividades artísticas, esportivas, educacionais e comunitárias.

A interface deve ser moderna e expressiva sem ficar visualmente carregada. A informação sobre as atividades é o elemento principal; os recursos gráficos devem ajudar a encontrá-la e compreendê-la.

### 2.1 Princípios visuais

- Priorizar leitura e navegação intuitiva.
- Usar fundos claros e espaços em branco para organizar o conteúdo.
- Reservar cores vibrantes para ações, etiquetas e detalhes importantes.
- Manter componentes consistentes entre as páginas.
- Adaptar os componentes a telas pequenas sem perder conteúdo ou funcionalidade.
- Não transmitir informações exclusivamente por meio de cores.

## 3. Paleta de cores

A paleta principal combina azul, laranja e amarelo, apoiada por cores neutras.

| Papel | Cor | Código hexadecimal | Uso recomendado |
|---|---|---|---|
| Primária | Azul profundo | `#1E40AF` | Marca, títulos de destaque, links e elementos principais |
| Secundária | Azul vivo | `#2563EB` | Botões primários, links ativos e indicadores de navegação |
| Destaque | Laranja | `#F97316` | Chamadas visuais, pequenos destaques e elementos de ação secundários |
| Apoio | Amarelo | `#FACC15` | Detalhes gráficos, ícones decorativos e realces pontuais |
| Fundo | Cinza muito claro | `#F8FAFC` | Fundo geral de páginas e áreas amplas |
| Texto | Cinza muito escuro | `#1F2937` | Texto principal e títulos sobre fundos claros |
| Superfície | Branco | `#FFFFFF` | Cards, formulários, menus e áreas de conteúdo |

### 3.1 Regras de uso

- Azul é a cor principal da interface e deve oferecer consistência entre páginas.
- Laranja e amarelo funcionam como cores de destaque, não como preenchimento dominante de toda a página.
- O amarelo não deve ser usado como cor de texto sobre fundo branco ou muito claro.
- Textos sobre botões e etiquetas coloridas devem ter contraste suficiente; verificar o contraste real de cada combinação durante a implementação.
- Estados de sucesso, aviso e erro devem incluir texto ou ícones identificáveis, e não depender somente da cor.
- As cores de categoria podem variar por categoria, desde que mantenham legibilidade e não sejam a única forma de identificar a categoria.

Os códigos acima constituem a paleta inicial do projeto e podem ser refinados após testes de contraste e validação visual.

## 4. Logotipo

### 4.1 Conceito

O logotipo será predominantemente tipográfico, com o nome **Agenda Livre** como elemento central. Um detalhe gráfico simples, inspirado em movimento, descoberta ou irradiação, poderá acompanhar o nome para acrescentar personalidade sem competir com a leitura.

### 4.2 Orientações

- Priorizar a leitura correta do nome “Agenda Livre”.
- Manter uma composição simples, reconhecível em tamanhos pequenos.
- Usar preferencialmente a versão azul sobre fundo claro.
- Preparar, quando necessário, uma versão clara para fundos escuros.
- Usar um símbolo reduzido ou favicon somente quando o espaço não permitir a marca completa.
- Preservar espaço livre ao redor da marca e não distorcer suas proporções.

O conceito está definido, mas os arquivos finais do logotipo, suas dimensões e suas versões técnicas ainda precisam ser preparados e validados.

## 5. Tipografia

A combinação escolhida é **Poppins para títulos** e **Inter para textos**.

| Aplicação | Família | Uso |
|---|---|---|
| Títulos e chamadas | Poppins | Títulos de páginas, títulos de seções e chamadas de destaque |
| Corpo de texto | Inter | Descrições, parágrafos, formulários, filtros e informações dos cards |
| Botões e navegação | Inter | Rótulos funcionais e itens de menu, priorizando legibilidade |

### 5.1 Hierarquia tipográfica inicial

Os tamanhos abaixo são referências iniciais, a ajustar durante os wireframes e a implementação.

| Elemento | Tamanho de referência | Peso recomendado |
|---|---:|---|
| Título principal da página | 2 a 2,5 rem | Poppins 600 ou 700 |
| Título de seção | 1,5 a 1,75 rem | Poppins 600 |
| Título de card | 1 a 1,125 rem | Poppins 600 |
| Texto principal | 1 rem | Inter 400 |
| Texto auxiliar | 0,875 rem | Inter 400 |
| Botões e controles | 0,875 a 1 rem | Inter 600 |

A hierarquia final deve ser consistente, responsiva e legível. Textos auxiliares não devem ficar pequenos a ponto de dificultar a leitura.

## 6. Componentes da interface

### 6.1 Cabeçalho e navegação

- Fundo claro e identidade visual visível.
- Logotipo no início do cabeçalho.
- Navegação para Início, Explorar atividades, Sobre e Contato.
- Indicação visual do item ativo, acompanhada de um estado semântico adequado.
- Em telas pequenas, a navegação poderá ser recolhida em um menu acessível.

### 6.2 Botões

Estilos iniciais:

- **Primário:** fundo azul `#2563EB`, texto com contraste adequado; usado para a ação principal, como “Buscar”.
- **Secundário:** fundo laranja `#F97316` quando a hierarquia da tela justificar; usar texto com contraste validado.
- **Contornado:** fundo transparente ou branco, borda azul e texto azul; usado para ações secundárias, como “Limpar filtros”.

Todos os botões devem apresentar estados perceptíveis de foco, hover, pressionado e desabilitado. O estado de foco por teclado não pode ser removido sem substituição visível.

### 6.3 Cards de atividades

O estilo escolhido é **híbrido**: cards brancos, organizados e discretos, com detalhes coloridos.

Cada card poderá apresentar, conforme os dados disponíveis:

- Imagem da atividade, quando houver.
- Etiqueta da categoria.
- Título da atividade.
- Unidade responsável.
- Próxima data ou informação de programação relevante.
- Horário, quando disponível.
- Link ou botão para consultar os detalhes.

Regras:

- Manter alinhamento, espaçamento e hierarquia consistentes.
- Não depender da imagem para comunicar o título ou a categoria.
- Evitar que a ausência de imagem quebre o layout.
- Garantir que o card e seus controles sejam acessíveis por teclado.
- Usar o card como caminho para os detalhes da atividade, sem sugerir inscrição interna no Agenda Livre.

### 6.4 Etiquetas de categoria

- Usar etiquetas compactas e visualmente distintas.
- A cor pode ajudar a diferenciar categorias, mas o nome da categoria deve sempre estar escrito.
- Validar contraste entre texto e fundo.
- Manter o mesmo tratamento visual para a mesma categoria em toda a interface.

### 6.5 Campos de busca e filtros

- Campos com rótulos claros e estados de foco visíveis.
- Busca em destaque na página inicial.
- Na página “Explorar atividades”, apresentar busca e filtros em uma barra horizontal acima dos resultados.
- Em dispositivos móveis, agrupar os filtros em uma seção expansível acionada por um botão “Filtros”.
- Permitir identificar e limpar os filtros aplicados.
- Mensagens de validação e erro devem explicar como corrigir o problema.

### 6.6 Ícones

- Preferir ícones simples e consistentes, com significado reconhecível.
- Usar ícones para apoiar informações como localização, data, horário e categoria.
- Quando o significado não for óbvio, incluir texto junto ao ícone.
- Ícones decorativos devem ser ocultados de tecnologias assistivas quando não acrescentarem informação.

## 7. Espaçamento, bordas e elevação

As medidas abaixo são recomendações iniciais para criar consistência:

- Usar uma escala regular de espaçamento baseada em múltiplos de `4px`.
- Aplicar espaçamento interno confortável em cards e formulários.
- Usar bordas discretas e cantos arredondados de forma consistente.
- Preferir separação por espaçamento e contraste a sombras fortes.
- Reservar sombras suaves para indicar elevação de elementos como cards, menus e campos em foco, quando apropriado.

Os valores definitivos de espaçamento, raio de borda e sombra serão estabelecidos durante a construção dos componentes.

## 8. Imagens e elementos gráficos

- Usar imagens pertinentes às atividades, quando disponíveis e autorizadas.
- Priorizar imagens nítidas, com enquadramento adequado e proporções consistentes nos cards.
- Definir um tratamento de fallback para atividades sem imagem.
- Elementos geométricos e formas coloridas podem dar personalidade à página inicial, mas não devem prejudicar a leitura.
- Não usar imagens meramente decorativas como substitutas de informações textuais.
- Quando uma imagem tiver função informativa, fornecer texto alternativo apropriado.

## 9. Responsividade

A identidade visual deve funcionar em celulares, tablets e desktops.

- Em telas grandes, aproveitar o espaço para organizar atividades em grade.
- Em telas pequenas, usar uma coluna para os cards de atividades quando necessário para preservar a legibilidade.
- Ajustar títulos e espaçamentos para evitar cortes ou rolagem horizontal.
- Adaptar a navegação e os filtros para interação por toque.
- Garantir que controles tenham tamanho e espaçamento adequados para uso em dispositivos móveis.
- Preservar a hierarquia visual e as ações principais em todas as larguras.

Os pontos de quebra exatos serão definidos no documento técnico do frontend e validados durante a implementação.

## 10. Acessibilidade visual

A interface deverá seguir estes princípios:

- Contraste suficiente entre texto e fundo.
- Navegação por teclado e foco visível.
- Tipografia legível e hierarquia de títulos coerente.
- Rótulos associados aos campos de formulário.
- Informações que não dependam exclusivamente de cor, imagem ou ícone.
- Estados de carregamento, sucesso, ausência de resultados e erro comunicados de forma clara.
- Texto alternativo para imagens informativas.
- Respeito às preferências de redução de movimento, caso sejam adicionadas animações.

As combinações de cores e os componentes deverão ser verificados com ferramentas de avaliação de contraste e testes manuais.

## 11. Referência visual

A imagem conceitual criada durante a definição visual serve como referência de direção para:

- Logotipo tipográfico com detalhe gráfico simples.
- Paleta azul, laranja e amarelo.
- Poppins em títulos e Inter em textos.
- Cards claros com etiquetas de categoria coloridas.
- Busca em destaque na página inicial.
- Barra horizontal de filtros na página de exploração.
- Adaptação da página inicial e das listagens para desktop e dispositivos móveis.

A imagem é uma referência conceitual, não uma especificação pixel a pixel nem um conjunto de arquivos de interface prontos para produção.

## 12. Pendências para validação

Antes de considerar o design system definitivo, será necessário:

- Validar as combinações de cores e o contraste.
- Definir os arquivos finais e as variações do logotipo.
- Confirmar os tamanhos tipográficos e a escala de espaçamento na implementação.
- Definir os pontos de quebra responsivos.
- Validar o uso de imagens e os estados sem imagem.
- Conferir a consistência visual com os wireframes e a especificação das interfaces.

## 13. Relação com os demais documentos

Este documento deve ser utilizado em conjunto com:

- **DOC-01 — Visão do Produto e Requisitos:** objetivos e escopo do Agenda Livre.
- **DOC-09 — Especificação do Frontend:** organização técnica e integração com a API.
- **DOC-11 — Arquitetura da Informação e Mapa de Navegação:** páginas e hierarquia de conteúdo.
- **DOC-12 — Wireframes:** estrutura visual preliminar das telas.
- **DOC-13 — Especificação de Interfaces e Comportamentos:** regras de interação dos componentes.

---

**Status do documento:** rascunho para validação.  
**Próxima revisão sugerida:** após a elaboração dos wireframes e a validação dos componentes visuais.
