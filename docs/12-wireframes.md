# DOC-12 — Wireframes

**Projeto:** Agenda Livre  
**Versão:** 0.1  
**Status:** Rascunho para validação  
**Última atualização:** 2026-10-11

## 1. Objetivo

Registrar a estrutura preliminar das páginas públicas do Agenda Livre por meio de wireframes de baixa fidelidade. O documento define a hierarquia dos elementos e sua disposição geral, sem especificar o acabamento visual final nem substituir a implementação.

Os wireframes devem ser lidos em conjunto com o DOC-10 — Identidade Visual e Design System e o DOC-11 — Arquitetura da Informação e Mapa de Navegação.

## 2. Princípios gerais

- Priorizar a descoberta de atividades e a facilidade de navegação.
- Manter busca e filtros fáceis de localizar.
- Apresentar atividades com cards consistentes.
- Adaptar o layout para desktop e dispositivos móveis.
- Preservar a identidade visual definida no DOC-10: base clara, azul como cor principal, laranja e amarelo para destaques, Poppins em títulos e Inter em textos.
- Considerar apenas informações disponibilizadas pela API; campos opcionais devem ser omitidos quando não houver dados.
- Não apresentar atividades com status `CANCELLED` ou `FINISHED` na interface pública.
- Prever estados de carregamento, ausência de resultados, erro e conteúdo indisponível.
- A administração permanece no Django Admin e não faz parte dos wireframes públicos.

## 3. Elementos compartilhados

### 3.1 Cabeçalho

O cabeçalho público deve conter:

- Logotipo tipográfico Agenda Livre.
- Navegação para Início, Explorar, Sobre e Contato.
- Indicação visual e semântica da página atual.

No desktop, os itens de navegação ficam visíveis no cabeçalho. Em telas pequenas, a navegação pode ser recolhida em um menu acessível.

### 3.2 Rodapé

O rodapé deve oferecer acesso às páginas públicas relevantes e uma breve identificação do Agenda Livre. O conteúdo final será definido durante a implementação; não deve incluir informações institucionais não confirmadas.

### 3.3 Cards de atividades

Os cards devem manter uma estrutura consistente e podem conter, conforme os dados disponíveis:

- Imagem da atividade.
- Etiqueta com o nome da categoria.
- Título.
- Unidade responsável.
- Próxima data e horário relevantes.
- Link para consultar os detalhes.

A ausência de imagem ou de informação opcional não deve quebrar o layout. O card não deve sugerir que a inscrição é feita dentro do Agenda Livre.

## 4. Página inicial

### 4.1 Objetivo

Apresentar o Agenda Livre e oferecer caminhos para quem sabe o que procura e para quem deseja descobrir atividades disponíveis.

### 4.2 Wireframe — desktop

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ LOGO Agenda Livre                 Início  Explorar  Sobre  Contato      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ Descubra novas maneiras                         ┌────────────────────┐  │
│ de aprender, se divertir                         │                    │  │
│ e participar!                                     │  IMAGEM CULTURAL   │  │
│                                                  │                    │  │
│ Cursos, eventos e atividades                     └────────────────────┘  │
│ para todos os momentos.                                                  │
│                                                                         │
│ O que você procura?                                                      │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ Buscar por nome de atividade...                                     │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ Ou explore por:                                                         │
│ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ ┌──────────┐ │
│ │ Unidade      ▼ │ │ Categoria    ▼ │ │ Quando?      ▼ │ │ Explorar │ │
│ └────────────────┘ └────────────────┘ └────────────────┘ └──────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│ PRÓXIMAS ATIVIDADES                                  Ver todas →        │
│ Confira o que está acontecendo nos CEUs!                                │
│                                                                         │
│ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐              │
│ │     IMAGEM     │ │     IMAGEM     │ │     IMAGEM     │              │
│ │ [Categoria]    │ │ [Categoria]    │ │ [Categoria]    │              │
│ │ Título         │ │ Título         │ │ Título         │              │
│ │ Unidade       │ │ Unidade       │ │ Unidade       │              │
│ │ Próxima data   │ │ Próxima data   │ │ Próxima data   │              │
│ │ Ver detalhes   │ │ Ver detalhes   │ │ Ver detalhes   │              │
│ └────────────────┘ └────────────────┘ └────────────────┘              │
├─────────────────────────────────────────────────────────────────────────┤
│ Rodapé: identificação breve e links de navegação                       │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.3 Hierarquia e comportamento

1. Cabeçalho e navegação.
2. Área de apresentação com título, texto breve e imagem cultural grande.
3. Busca por nome da atividade.
4. Filtros rápidos de unidade, categoria e período, seguidos do botão **Explorar**.
5. Seção **Próximas atividades**, com três cards no desktop e link **Ver todas**.
6. Rodapé.

A busca por texto e os filtros são caminhos complementares. O botão **Explorar** leva à página de listagem com os critérios informados. Se nenhum critério for informado, abre a listagem completa.

Os filtros rápidos devem usar opções compatíveis com os dados e parâmetros disponíveis na API. As opções de período e sua implementação deverão ser confirmadas na especificação de interface e na API.

A seção de próximas atividades mostra atividades publicadas com ocorrências futuras, ordenadas cronologicamente pela próxima ocorrência. A interface deve considerar programações recorrentes. Atividades canceladas ou finalizadas não devem ser exibidas.

A seção de categorias separada foi removida; a categoria será uma opção nos filtros.

### 4.4 Wireframe — mobile

```text
┌───────────────────────────────┐
│ LOGO Agenda Livre        [☰]  │
├───────────────────────────────┤
│ Descubra novas maneiras       │
│ de aprender, se divertir      │
│ e participar!                 │
│                               │
│ ┌───────────────────────────┐ │
│ │     IMAGEM CULTURAL       │ │
│ └───────────────────────────┘ │
│                               │
│ O que você procura?           │
│ ┌───────────────────────────┐ │
│ │ Buscar atividade...      │ │
│ └───────────────────────────┘ │
│                               │
│ Unidade                 [▼]   │
│ Categoria               [▼]   │
│ Quando?                 [▼]   │
│ ┌───────────────────────────┐ │
│ │          Explorar         │ │
│ └───────────────────────────┘ │
├───────────────────────────────┤
│ PRÓXIMAS ATIVIDADES           │
│ Ver todas →                   │
│                               │
│ ┌───────────────────────────┐ │
│ │          IMAGEM           │ │
│ │ [Categoria]               │ │
│ │ Título                    │ │
│ │ Unidade • Data/horário    │ │
│ │ Ver detalhes              │ │
│ └───────────────────────────┘ │
│ ┌───────────────────────────┐ │
│ │          IMAGEM           │ │
│ │ ...                       │ │
│ └───────────────────────────┘ │
│ ┌───────────────────────────┐ │
│ │          IMAGEM           │ │
│ │ ...                       │ │
│ └───────────────────────────┘ │
├───────────────────────────────┤
│ Rodapé                        │
└───────────────────────────────┘
```

No celular, os elementos são empilhados verticalmente. Os filtros permanecem visíveis como controles compactos; o refinamento final do componente poderá considerar o espaço disponível. Os cards aparecem em uma coluna.

## 5. Página Explorar atividades

### 5.1 Objetivo

Permitir que o visitante pesquise e refine a listagem de atividades de todas as unidades cadastradas.

### 5.2 Wireframe — desktop

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ LOGO Agenda Livre                 Início  Explorar  Sobre  Contato      │
├─────────────────────────────────────────────────────────────────────────┤
│ Explorar atividades                                                     │
│ Encontre cursos, eventos e atividades nos CEUs.                         │
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ Buscar por nome da atividade...                                     │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ ┌──────────┐ │
│ │ Unidade      ▼ │ │ Categoria    ▼ │ │ Quando?      ▼ │ │ Filtrar  │ │
│ └────────────────┘ └────────────────┘ └────────────────┘ └──────────┘ │
│ Limpar filtros                                                         │
│                                                                         │
│ [Quantidade de resultados, se disponível]                              │
│                                                                         │
│ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐              │
│ │     IMAGEM     │ │     IMAGEM     │ │     IMAGEM     │              │
│ │ [Categoria]    │ │ [Categoria]    │ │ [Categoria]    │              │
│ │ Título         │ │ Título         │ │ Título         │              │
│ │ Unidade        │ │ Unidade        │ │ Unidade        │              │
│ │ Data/horário   │ │ Data/horário   │ │ Data/horário   │              │
│ │ Ver detalhes   │ │ Ver detalhes   │ │ Ver detalhes   │              │
│ └────────────────┘ └────────────────┘ └────────────────┘              │
│                                                                         │
│                    [Anterior] [1] [2] [3] [Próxima]                    │
├─────────────────────────────────────────────────────────────────────────┤
│ Rodapé                                                                  │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.3 Regras de organização

- A busca por texto aparece antes dos filtros.
- Os filtros de unidade, categoria e período ficam em uma barra horizontal.
- A pessoa escolhe os filtros e clica em **Filtrar** para aplicar a seleção.
- **Limpar filtros** remove os critérios aplicados e retorna à listagem completa.
- A contagem de resultados só será exibida se a API disponibilizar essa informação de forma confiável.
- A paginação será apresentada se houver suporte no endpoint de listagem.
- Os filtros e a página atual devem ser preservados na URL quando possível.
- A listagem deve incluir somente atividades elegíveis para exibição pública.
- Os cards usam três colunas no desktop, adaptando-se a duas ou uma coluna conforme a largura disponível.

### 5.4 Wireframe — mobile

```text
┌───────────────────────────────┐
│ LOGO Agenda Livre        [☰]  │
├───────────────────────────────┤
│ Explorar atividades           │
│                               │
│ ┌───────────────────────────┐ │
│ │ Buscar por nome...       │ │
│ └───────────────────────────┘ │
│                               │
│ ┌───────────────────────────┐ │
│ │ Unidade               [▼] │ │
│ └───────────────────────────┘ │
│ ┌───────────────────────────┐ │
│ │ Categoria             [▼] │ │
│ └───────────────────────────┘ │
│ ┌───────────────────────────┐ │
│ │ Quando?               [▼] │ │
│ └───────────────────────────┘ │
│ [Filtrar]       [Limpar filtros]
│                               │
│ Resultados encontrados        │
│                               │
│ ┌───────────────────────────┐ │
│ │          IMAGEM           │ │
│ │ [Categoria]               │ │
│ │ Título                    │ │
│ │ Unidade • Data/horário    │ │
│ │ Ver detalhes              │ │
│ └───────────────────────────┘ │
│ ┌───────────────────────────┐ │
│ │          IMAGEM           │ │
│ │ ...                       │ │
│ └───────────────────────────┘ │
│                               │
│       [Anterior] [Próxima]    │
├───────────────────────────────┤
│ Rodapé                        │
└───────────────────────────────┘
```

No celular, os filtros são organizados verticalmente para facilitar a interação. A implementação poderá agrupá-los em uma seção expansível acionada por **Filtros**, desde que todos os controles continuem acessíveis e o botão de aplicação permaneça claro.

## 6. Página Detalhes da atividade

### 6.1 Objetivo

Apresentar as informações disponíveis de uma atividade em uma página própria, acessível por link direto e pelos cards da listagem.

### 6.2 Wireframe — desktop

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ LOGO Agenda Livre                 Início  Explorar  Sobre  Contato      │
├─────────────────────────────────────────────────────────────────────────┤
│ ← Voltar para atividades                                               │
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │                                                                     │ │
│ │                        IMAGEM DA ATIVIDADE                          │ │
│ │                                                                     │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ [Categoria]                                                            │
│ Nome da atividade                                                      │
│ Unidade responsável                                                    │
│ Data ou período • Horário, quando disponível                           │
│ Público-alvo, quando disponível                                        │
│                                                                         │
│ Sobre a atividade                                                      │
│ Descrição completa, conforme cadastrada.                               │
│                                                                         │
│ Local e informações adicionais, quando disponíveis.                    │
│                                                                         │
│ [Saiba mais / Inscreva-se] — somente se houver link externo             │
├─────────────────────────────────────────────────────────────────────────┤
│ Rodapé                                                                  │
└─────────────────────────────────────────────────────────────────────────┘
```

### 6.3 Wireframe — mobile

```text
┌───────────────────────────────┐
│ LOGO Agenda Livre        [☰]  │
├───────────────────────────────┤
│ ← Voltar para atividades      │
│                               │
│ ┌───────────────────────────┐ │
│ │                           │ │
│ │     IMAGEM DA ATIVIDADE   │ │
│ │                           │ │
│ └───────────────────────────┘ │
│                               │
│ [Categoria]                   │
│ Nome da atividade             │
│ Unidade responsável           │
│ Data ou período               │
│ Horário, se disponível        │
│ Público-alvo, se disponível   │
│                               │
│ Sobre a atividade             │
│ Descrição completa...         │
│                               │
│ Local e informações adicionais│
│                               │
│ [Saiba mais / Inscreva-se]    │
│ (se houver link externo)      │
├───────────────────────────────┤
│ Rodapé                        │
└───────────────────────────────┘
```

### 6.4 Regras

- A imagem ocupa a largura do conteúdo e tem alternativa visual quando não houver imagem.
- Campos opcionais ausentes não devem gerar espaços vazios nem rótulos sem valor.
- O link externo só aparece quando houver URL cadastrada.
- O botão deve deixar claro que a pessoa será encaminhada para um site externo.
- Ao voltar à listagem, preservar busca, filtros e página anterior quando possível.
- Atividades canceladas ou finalizadas não devem ser exibidas como atividades públicas disponíveis.
- A página deve funcionar por acesso direto à URL da atividade.

## 7. Página Sobre o Agenda Livre

### 7.1 Objetivo

Explicar de forma institucional e direta a finalidade do projeto.

### 7.2 Wireframe — desktop

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ LOGO Agenda Livre                 Início  Explorar  Sobre  Contato      │
├─────────────────────────────────────────────────────────────────────────┤
│ Sobre o Agenda Livre                                                    │
│                                                                         │
│ O que é o projeto?                                                      │
│ Texto de apresentação da plataforma e de sua proposta.                 │
│                                                                         │
│ Nosso objetivo                                                         │
│ Texto sobre facilitar a descoberta de cursos, eventos e atividades.    │
│                                                                         │
│ Acesso à cultura e à educação                                           │
│ Texto sobre centralizar informações e aproximar a comunidade.           │
├─────────────────────────────────────────────────────────────────────────┤
│ Rodapé                                                                  │
└─────────────────────────────────────────────────────────────────────────┘
```

### 7.3 Wireframe — mobile

```text
┌───────────────────────────────┐
│ LOGO Agenda Livre        [☰]  │
├───────────────────────────────┤
│ Sobre o Agenda Livre          │
│                               │
│ O que é o projeto?            │
│ Texto de apresentação...      │
│                               │
│ Nosso objetivo                │
│ Texto sobre o objetivo...     │
│                               │
│ Acesso à cultura e à educação │
│ Texto explicativo...          │
├───────────────────────────────┤
│ Rodapé                        │
└───────────────────────────────┘
```

O conteúdo textual definitivo será redigido e validado separadamente. Não devem ser inventadas parcerias, serviços ou promessas institucionais.

## 8. Página Contato

### 8.1 Objetivo

Oferecer uma interface demonstrativa de contato, com formulário centralizado.

**Limitação importante:** o formulário não enviará e-mails nem encaminhará mensagens a uma equipe. O envio será simulado e a interface deverá informar isso com transparência.

### 8.2 Wireframe — desktop

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ LOGO Agenda Livre                 Início  Explorar  Sobre  Contato      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│                         Entre em contato                                │
│                Preencha os campos do formulário abaixo.                 │
│                                                                         │
│                    ┌────────────────────────────┐                       │
│                    │ Nome                       │                       │
│                    │ [________________________] │                       │
│                    │ E-mail                     │                       │
│                    │ [________________________] │                       │
│                    │ Assunto                    │                       │
│                    │ [________________________] │                       │
│                    │ Mensagem                   │                       │
│                    │ [________________________] │                       │
│                    │ [________________________] │                       │
│                    │                            │                       │
│                    │      [Enviar mensagem]     │                       │
│                    └────────────────────────────┘                       │
│                                                                         │
│       Aviso: formulário demonstrativo; nenhuma mensagem será enviada.  │
├─────────────────────────────────────────────────────────────────────────┤
│ Rodapé                                                                  │
└─────────────────────────────────────────────────────────────────────────┘
```

### 8.3 Wireframe — mobile

```text
┌───────────────────────────────┐
│ LOGO Agenda Livre        [☰]  │
├───────────────────────────────┤
│ Entre em contato              │
│ Preencha o formulário abaixo. │
│                               │
│ Nome                          │
│ [_________________________]   │
│ E-mail                        │
│ [_________________________]   │
│ Assunto                       │
│ [_________________________]   │
│ Mensagem                      │
│ [_________________________]   │
│ [_________________________]   │
│                               │
│ [ Enviar mensagem ]           │
│                               │
│ Formulário demonstrativo:     │
│ nenhuma mensagem será enviada.│
├───────────────────────────────┤
│ Rodapé                        │
└───────────────────────────────┘
```

### 8.4 Regras

- Campos: Nome, E-mail, Assunto e Mensagem.
- Rótulos devem permanecer visíveis e associados aos campos.
- A validação e os limites de caracteres serão definidos no DOC-13.
- Após a submissão simulada, mostrar uma confirmação visual que não afirme que a mensagem foi entregue ou recebida.
- Se houver erros de validação, indicar quais campos precisam de correção.

## 9. Estados compartilhados da interface

Além dos layouts de página, devem ser considerados os seguintes estados:

### 9.1 Carregamento

Apresentar uma indicação de carregamento durante a consulta à API. Evitar que a página pareça vazia ou travada.

### 9.2 Listagem com resultados

Apresentar os cards e os controles de navegação disponíveis, mantendo a hierarquia visual definida.

### 9.3 Nenhum resultado

Informar claramente que nenhuma atividade corresponde aos critérios selecionados e oferecer uma ação para limpar os filtros ou tentar outra busca.

### 9.4 Erro de comunicação com a API

Apresentar uma mensagem compreensível, sem expor detalhes técnicos internos, e oferecer nova tentativa quando apropriado.

### 9.5 Atividade não encontrada ou indisponível

Se uma URL de detalhes não corresponder a uma atividade pública disponível, mostrar uma página de estado indisponível ou não encontrada e um caminho para voltar à listagem.

### 9.6 Imagem indisponível

Usar um espaço reservado consistente com a identidade visual, sem deixar que a ausência de imagem prejudique o card ou a página de detalhes.

## 10. Responsividade e acessibilidade

- Usar layouts que se adaptem à largura da tela sem rolagem horizontal desnecessária.
- Priorizar uma coluna para cards em telas pequenas.
- Garantir navegação por teclado e foco visível.
- Usar rótulos explícitos nos campos de formulário e filtros.
- Garantir contraste adequado para texto, controles e estados.
- Não comunicar estado apenas por cor.
- Fornecer textos alternativos para imagens informativas.
- Respeitar preferências de redução de movimento caso sejam usadas animações.
- Garantir que menus, filtros e botões sejam operáveis por toque e teclado.

## 11. Decisões confirmadas e pontos a validar

### 11.1 Decisões confirmadas

- A página inicial terá imagem cultural grande.
- A busca por texto e os filtros rápidos ficam na área de apresentação.
- Os filtros rápidos são unidade, categoria e período.
- A página inicial terá uma seção de próximas atividades com três cards no desktop.
- Não haverá seção separada de categorias na página inicial.
- A página de exploração terá barra horizontal de filtros no desktop.
- A aplicação de filtros na listagem será acionada pelo botão **Filtrar**.
- A listagem usará cards em grade e paginação quando suportada pela API.
- A página de detalhes terá imagem grande no topo.
- A página Sobre será institucional e direta.
- A página Contato terá formulário centralizado e envio simulado, sem encaminhamento real.

### 11.2 Pontos a validar na especificação de interface

- Valores finais e opções do filtro de período.
- Quantidade e comportamento exato dos resultados por página, conforme suporte da API.
- Exibição de contagem total de resultados, conforme resposta da API.
- Comportamento do menu mobile.
- Textos finais da página inicial, Sobre e Contato.
- Validações e limites dos campos do formulário.
- Dimensões finais, pontos de quebra e comportamento dos componentes.
- Tratamento final de atividades sem imagem ou sem campos opcionais.

## 12. Relação com outros documentos

- **DOC-01 — Visão do Produto e Requisitos:** objetivo e escopo.
- **DOC-05 — Especificação da API REST:** recursos e parâmetros disponíveis.
- **DOC-09 — Especificação do Frontend:** organização técnica do frontend.
- **DOC-10 — Identidade Visual e Design System:** cores, tipografia e componentes visuais.
- **DOC-11 — Arquitetura da Informação e Mapa de Navegação:** estrutura e relações entre páginas.
- **DOC-13 — Especificação de Interfaces e Comportamentos:** regras detalhadas de interação.
- **DOC-14 — Estratégia de Testes do Frontend:** validação das telas e interações.

---

**Status do documento:** rascunho para validação.  
**Próxima revisão sugerida:** após a elaboração do DOC-13 e a confirmação dos parâmetros e recursos efetivamente disponíveis na API.
