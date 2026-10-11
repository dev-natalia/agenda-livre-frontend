# DOC-15 — Diretrizes de Acessibilidade do Agenda Livre: Adaptações, Fontes e Obrigações

**Projeto:** Agenda Livre  
**Status:** Documento de referência para implementação e validação  
**Objetivo:** Registrar as adaptações de acessibilidade adotadas no projeto, explicar o que cada uma significa, indicar a fonte normativa ou técnica e distinguir obrigações legais, critérios de conformidade e decisões de projeto.

## 1. Objetivo e escopo

A acessibilidade é um princípio central do Agenda Livre e deve ser considerada desde a estrutura HTML até o design visual, a navegação, os estados dinâmicos, os formulários e os testes.

Este documento:
- reúne as adaptações acordadas para o projeto;
- explica sua finalidade prática;
- relaciona critérios relevantes das WCAG 2.2 e recomendações do eMAG;
- distingue exigências de conformidade de escolhas de implementação;
- define uma abordagem de validação.

**Importante:** este documento é uma referência técnica de produto, não um parecer jurídico. A obrigatoriedade legal concreta depende do enquadramento do responsável pelo site, do contexto de publicação e das normas aplicáveis. Não se deve presumir que toda recomendação técnica tenha, isoladamente, força de lei para qualquer projeto.

## 2. Referências principais

### 2.1 WCAG 2.2 — Web Content Accessibility Guidelines
As WCAG são diretrizes internacionais publicadas pelo W3C. Organizam critérios de sucesso testáveis nos princípios perceptível, operável, compreensível e robusto. A meta do Agenda Livre é **WCAG 2.2 nível AA**.

Fonte oficial: https://www.w3.org/TR/WCAG22/

Os níveis A, AA e AAA indicam níveis de critérios de conformidade. O projeto adota AA como meta; isso não significa que todo critério de nível AAA seja desnecessário em qualquer contexto, nem que uma verificação automatizada isolada comprove conformidade.

### 2.2 eMAG 3.1 — Modelo de Acessibilidade em Governo Eletrônico
O eMAG é um modelo brasileiro de recomendações para desenvolvimento acessível de sítios e portais, organizado em marcação, comportamento, conteúdo/informação, apresentação/design, multimídia e formulários.

Fonte oficial: https://emag.governoeletronico.gov.br/

O eMAG foi criado para orientar e padronizar a acessibilidade em sites e serviços, especialmente no contexto de governo eletrônico. A página oficial informa que sua observância foi institucionalizada para sítios e portais do governo no âmbito indicado pelo modelo. Isso não deve ser generalizado automaticamente para todo projeto privado ou acadêmico sem analisar o enquadramento.

### 2.3 Lei Brasileira de Inclusão — Lei nº 13.146/2015
O art. 63 prevê acessibilidade nos sítios da internet mantidos por empresas com sede ou representação comercial no Brasil e por órgãos de governo, para uso por pessoas com deficiência, conforme melhores práticas e diretrizes internacionais adotadas.

Fonte oficial: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13146.htm

A aplicabilidade legal e os efeitos específicos devem ser avaliados conforme o contexto do projeto. A lei não transforma automaticamente cada detalhe de implementação deste documento em obrigação literal independente; as WCAG fornecem critérios técnicos para orientar a avaliação.

### 2.4 WAI-ARIA Authoring Practices Guide (APG)
Guia técnico do W3C para padrões de interação acessíveis. Para o menu móvel do Agenda Livre, o padrão de divulgação (*disclosure*) é relevante.

Fonte: https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/

### 2.5 Fontes complementares
- WCAG 2.2, contraste mínimo: https://www.w3.org/TR/WCAG22/#contrast-minimum
- WCAG 2.2, redimensionamento de texto: https://www.w3.org/TR/WCAG22/#resize-text
- WCAG 2.2, reflow: https://www.w3.org/TR/WCAG22/#reflow
- WCAG 2.2, foco visível: https://www.w3.org/TR/WCAG22/#focus-visible
- WCAG 2.2, foco não obscurecido (mínimo): https://www.w3.org/TR/WCAG22/#focus-not-obscured-minimum
- WCAG 2.2, identificação de erros: https://www.w3.org/TR/WCAG22/#error-identification
- WCAG 2.2, rótulos ou instruções: https://www.w3.org/TR/WCAG22/#labels-or-instructions
- WCAG 2.2, mensagens de status: https://www.w3.org/TR/WCAG22/#status-messages
- WCAG 2.2, nome, função, valor: https://www.w3.org/TR/WCAG22/#name-role-value

## 3. Como interpretar “obrigatório”

Este documento utiliza três classificações:

- **Critério WCAG AA:** requisito técnico necessário para declarar conformidade com o nível AA, quando aplicável ao conteúdo e à funcionalidade avaliados.
- **Recomendação técnica:** boa prática que apoia a acessibilidade, mas que não corresponde necessariamente a um critério de sucesso específico ou a uma obrigação legal independente.
- **Decisão de projeto:** comportamento escolhido pelo Agenda Livre para criar uma experiência consistente e inclusiva. Mesmo quando é uma decisão de produto, passa a ser um requisito de implementação do projeto.

A presença de um padrão em uma diretriz não deve ser descrita como “lei” sem confirmar sua base legal e seu campo de aplicação. Do mesmo modo, cumprir alguns critérios isolados não equivale a comprovar conformidade WCAG completa.

## 4. Adaptações adotadas no Agenda Livre

| Adaptação | O que significa na prática | Referência principal | Classificação |
|---|---|---|---|
| Meta WCAG 2.2 AA | Avaliar o site contra os critérios aplicáveis dos níveis A e AA da WCAG 2.2. | WCAG 2.2 | Meta de conformidade do projeto; a obrigação legal depende do contexto. |
| HTML semântico | Usar `header`, `nav`, `main`, `footer`, títulos e elementos de formulário de acordo com sua função. | WCAG 1.3.1; eMAG — Marcação | Necessário para atender critérios aplicáveis de estrutura e relações; decisão de implementação. |
| Hierarquia lógica de títulos | Organizar títulos conforme a estrutura do conteúdo, não apenas pela aparência. | WCAG 1.3.1; eMAG | Critério de conformidade quando a estrutura e as relações precisam ser programaticamente determinadas. |
| Link “Pular para o conteúdo principal” | Oferecer atalho no início da página para evitar percorrer repetidamente o cabeçalho. | WCAG 2.4.1; eMAG, recomendação sobre âncoras para blocos de conteúdo | A forma específica é uma decisão de projeto; a WCAG exige mecanismo para contornar blocos repetidos quando aplicável. |
| Navegação por teclado | Todas as funcionalidades devem ser operáveis pelo teclado, sem armadilhas. | WCAG 2.1.1 e 2.1.2 | Critérios WCAG A. |
| Foco visível | Links, botões, campos e demais controles devem ter indicador de foco perceptível. | WCAG 2.4.7 | Critério WCAG AA. |
| Foco não obscurecido | O componente focado não deve ficar totalmente oculto por conteúdo criado pelo autor. | WCAG 2.4.11 | Critério WCAG AA. |
| Ordem de foco lógica | A navegação por teclado deve seguir uma sequência que preserve sentido e operabilidade. | WCAG 2.4.3 | Critério WCAG A. |
| Contraste de texto | Texto comum com pelo menos 4,5:1; texto grande com pelo menos 3:1, observadas as exceções da WCAG. | WCAG 1.4.3 | Critério WCAG AA. |
| Contraste de componentes | Componentes de interface e informação visual necessária para identificar estados devem atender aos requisitos aplicáveis de contraste. | WCAG 1.4.11 | Critério WCAG AA. |
| Não depender apenas de cor | Erros, estados e categorias também devem ser identificáveis por texto, forma, rótulo ou outro indicador. | WCAG 1.4.1; critérios aplicáveis de estado e identificação | Critério WCAG A em uso de cor; também decisão de design. |
| Ampliação de texto | O texto pode ser ampliado até 200% sem perda de conteúdo ou funcionalidade. | WCAG 1.4.4 | Critério WCAG AA. |
| Reflow | O conteúdo deve reorganizar-se em larguras equivalentes a 320 pixels CSS sem rolagem bidimensional desnecessária, ressalvadas exceções. | WCAG 1.4.10 | Critério WCAG AA. |
| Redimensionamento de espaçamento | Conteúdo deve suportar configurações de espaçamento definidas no critério sem perda de conteúdo ou funcionalidade. | WCAG 1.4.12 | Critério WCAG AA. |
| Texto alternativo | Imagens informativas precisam de alternativa textual equivalente; imagens decorativas devem ser ignoradas pelas tecnologias assistivas (`alt=""`). | WCAG 1.1.1; eMAG | Critério WCAG A. |
| Rótulos de formulário | Campos devem ter rótulos e instruções claros, associados programaticamente. | WCAG 3.3.2; WCAG 1.3.1; eMAG — Formulários | Critérios WCAG A. |
| Identificação de erros | Erros encontrados devem ser identificados e descritos em texto. | WCAG 3.3.1 | Critério WCAG A. |
| Sugestões para correção | Quando possível, oferecer orientação para corrigir o erro sem criar risco ou alterar o objetivo da entrada. | WCAG 3.3.3 | Critério WCAG AA, quando aplicável. |
| Mensagens de status | Resultados de busca, carregamento e outros status devem poder ser determinados programaticamente sem que seja necessário mover o foco. | WCAG 4.1.3 | Critério WCAG AA, quando aplicável. |
| Nome, função e estado dos controles | Estados de componentes dinâmicos devem ser expostos às tecnologias assistivas. | WCAG 4.1.2 | Critério WCAG A. |
| Menu móvel expansível | Botão com nome acessível e `aria-expanded` atualizado; links escondidos não devem continuar na ordem de foco. | WAI-ARIA APG — Disclosure; WCAG 4.1.2 | Padrão técnico recomendado e decisão de projeto; critérios WCAG aplicáveis continuam obrigatórios para a meta AA. |
| Controles nativos | Preferir `select`, `button`, `a`, `input` e outros elementos nativos antes de recriar componentes com `div`. | WCAG 4.1.2; eMAG | Recomendação técnica para reduzir complexidade e risco. |
| Erros do formulário | Mostrar todos os erros encontrados, associá-los aos campos e levar o foco ao primeiro campo inválido após o envio inválido. | WCAG 3.3.1; WCAG 3.3.3; WCAG 2.4.3 | Identificação e sugestões são critérios; mostrar todos ao mesmo tempo e focar o primeiro inválido são decisões de projeto. |
| Links externos em nova aba | Abrir inscrição/informações externas em nova aba e avisar a pessoa de forma acessível. | WCAG 3.2.2 quando aplicável; boas práticas de links | Decisão de projeto; a mudança de contexto inesperada deve ser evitada. |
| Movimento reduzido | Respeitar `prefers-reduced-motion` e minimizar movimento não essencial quando solicitado. | Preferência de mídia CSS; boas práticas de acessibilidade | Decisão de projeto/recomendação técnica, salvo situações em que outros critérios específicos se apliquem. |
| Skeleton loading | Mostrar placeholders visuais sem expô-los como resultados reais; comunicar carregamento e conclusão com mensagens concisas. | WCAG 4.1.3; WCAG 4.1.2 | Mensagens de status são critério AA quando aplicável; o skeleton é uma decisão de interface. |
| Erro de API sem deslocar foco | Anunciar erro e manter foco atual, deixando a ação de tentar novamente disponível. | WCAG 4.1.3; WCAG 2.4.3 | Status acessível é critério AA; preservar foco é decisão de projeto que reduz desorientação. |
| Estados sem resultado distintos de erro | Explicar separadamente que a pesquisa não encontrou itens e que houve falha técnica. | WCAG 3.3.2 e 4.1.3 quando aplicáveis; compreensibilidade | Decisão de projeto com apoio em boas práticas. |
| Quantidade de resultados | Mostrar e anunciar, por exemplo, “12 atividades encontradas”, quando o total estiver disponível. | WCAG 4.1.3 | Decisão de projeto; a mensagem de status deve ser acessível quando utilizada. |
| Imagem de fallback | Se a imagem não existir, mostrar fundo da identidade visual e ícone decorativo opcional, sem ícone quebrado. | WCAG 1.1.1 e princípios de robustez | Decisão de projeto; o tratamento deve preservar alternativas acessíveis. |
| Identificação da página atual | Marcar programaticamente o link correspondente à página atual, por exemplo com `aria-current="page"`. | WCAG 4.1.2; WAI-ARIA | Boa prática de implementação para expor estado. |
| Texto claro | Usar mensagens diretas, evitar jargão e instruções vagas. | eMAG — Conteúdo/Informação; WCAG 3.1.5 quando aplicável | Recomendação técnica e decisão editorial. |
| Testes manuais e automatizados | Verificar teclado, leitor de tela, zoom, contraste e estados dinâmicos; usar ferramentas automáticas como apoio. | eMAG — processo de avaliação; WCAG | Processo de qualidade do projeto; testes automatizados isolados não comprovam conformidade completa. |

## 5. Aplicação por componente

### 5.1 Navegação
- Link de salto no início.
- Links de navegação com nomes claros.
- Página atual identificada programaticamente.
- Foco visível e sequência lógica.
- Menu móvel controlado por botão de divulgação com estado exposto.

### 5.2 Pesquisa e filtros
- Rótulo visível para cada campo.
- Controles nativos sempre que possível.
- Selecionar filtros não deve disparar busca automaticamente; “Filtrar” aplica a seleção.
- “Limpar filtros” limpa e atualiza a listagem.
- A atualização deve comunicar carregamento, resultado vazio, quantidade ou erro sem deslocar o foco.
- Paginação deve ser navegável por teclado e informar a página atual.

### 5.3 Cards e imagens
- Link principal com nome acessível claro.
- Não tornar controles aninhados ou duplicados de forma confusa.
- Texto alternativo conforme a finalidade da imagem.
- Imagens ausentes recebem fallback visual; ícones decorativos não devem ser anunciados.
- Links externos informam que abrirão nova aba.

### 5.4 Formulário de contato
- Rótulos associados a todos os campos.
- Campos obrigatórios identificados em texto e programaticamente.
- Limites e instruções explicados antes ou junto aos campos.
- Erros em texto, associados ao campo e sem depender apenas de cor.
- Todos os erros encontrados aparecem na mesma tentativa.
- Foco no primeiro campo inválido após envio inválido.
- Após validação bem-sucedida, substituir o formulário por painel que informa claramente que o formulário é demonstrativo e não envia mensagens.
- A mudança de painel deve ser anunciada e o foco tratado de forma previsível.

### 5.5 Carregamento, erro e atualização dinâmica
- Skeletons são decorativos e não substituem a comunicação acessível do estado.
- Usar região de status apropriada; evitar anúncios redundantes.
- Não mover o foco só porque resultados foram atualizados.
- Erro da API e ausência de resultados são estados distintos.
- A ação de nova tentativa deve permanecer acessível por teclado.

## 6. Critérios e níveis: o que é requisito de conformidade?

A tabela abaixo resume critérios especialmente relevantes para o projeto. A redação oficial da WCAG deve ser consultada para avaliar exceções e aplicabilidade.

| Critério WCAG 2.2 | Nível | Relevância para o Agenda Livre |
|---|---|---|
| 1.1.1 Conteúdo não textual | A | Alternativas textuais para imagens informativas. |
| 1.3.1 Informações e relações | A | Estrutura semântica, títulos e rótulos. |
| 1.4.1 Uso de cor | A | Não comunicar informação apenas por cor. |
| 1.4.3 Contraste (mínimo) | AA | Contraste de textos. |
| 1.4.4 Redimensionar texto | AA | Ampliação até 200%. |
| 1.4.10 Reflow | AA | Layout adaptável em viewport estreito. |
| 1.4.11 Contraste não textual | AA | Contraste de componentes e estados visuais aplicáveis. |
| 1.4.12 Espaçamento de texto | AA | Tolerância a espaçamento aumentado. |
| 2.1.1 Teclado | A | Funcionalidades operáveis por teclado. |
| 2.1.2 Sem bloqueio de teclado | A | Entrada e saída de componentes sem armadilhas. |
| 2.4.1 Ignorar blocos | A | Mecanismo para contornar blocos repetidos. |
| 2.4.3 Ordem do foco | A | Sequência de foco que preserva sentido. |
| 2.4.7 Foco visível | AA | Indicador perceptível de foco. |
| 2.4.11 Foco não obscurecido (mínimo) | AA | Foco não totalmente oculto por conteúdo do autor. |
| 3.3.1 Identificação do erro | A | Erros descritos em texto. |
| 3.3.2 Rótulos ou instruções | A | Orientação clara nos formulários. |
| 3.3.3 Sugestão de erro | AA | Orientação para corrigir erros quando possível. |
| 4.1.2 Nome, função, valor | A | Controles e estados programaticamente determinados. |
| 4.1.3 Mensagens de status | AA | Anúncio acessível de resultados, carregamento e status sem mover foco. |

A tabela não representa uma auditoria completa das WCAG. O critério aplicável deve ser verificado contra a especificação oficial e o comportamento implementado.

## 7. Plano de validação

A validação deve combinar testes manuais, ferramentas automáticas e, quando possível, avaliação com pessoas usuárias de tecnologias assistivas.

### 7.1 Testes manuais mínimos
- Percorrer todas as páginas apenas com `Tab`, `Shift+Tab`, `Enter` e `Space` quando aplicável.
- Confirmar que o foco está sempre visível, segue uma ordem lógica e não fica encoberto.
- Acionar o link “Pular para o conteúdo principal”.
- Abrir e fechar o menu móvel com teclado.
- Usar filtros e paginação sem mouse.
- Confirmar anúncios de carregamento, resultados, ausência de resultados e erro por leitor de tela.
- Enviar o formulário vazio e com múltiplos erros; confirmar que todos são apresentados e associados aos campos.
- Verificar o foco após erro e após a exibição do painel de confirmação.
- Ampliar o texto a 200% e testar reflow em largura equivalente a 320 CSS pixels.
- Testar combinações reais de cores com ferramenta de contraste.
- Ativar `prefers-reduced-motion` e confirmar que movimentos não essenciais são removidos ou reduzidos.
- Inspecionar imagens informativas, decorativas e fallbacks.

### 7.2 Ferramentas automáticas
Podem ser utilizadas ferramentas como axe DevTools, Lighthouse ou WAVE como apoio. Resultados automáticos precisam de revisão manual: ferramentas não identificam todos os problemas de usabilidade com leitores de tela, ordem de foco, clareza textual ou comportamento contextual.

### 7.3 Evidências
Registrar:
- páginas e componentes avaliados;
- navegador e tecnologias assistivas usados;
- critérios testados;
- problemas encontrados;
- correções realizadas;
- limitações conhecidas e dependências da API.

## 8. Limitações e dependências

- A conformidade final depende da implementação, do conteúdo real, dos estados dinâmicos e de testes; não pode ser declarada apenas porque este documento existe.
- A quantidade total de resultados só deve ser anunciada quando estiver disponível de forma confiável na API.
- A ordenação por próxima ocorrência depende dos dados e da regra de recorrência.
- A distinção entre atividade indisponível e inexistente depende de informação que a API possa fornecer com segurança.
- O formulário de contato é demonstrativo e não deve alegar que mensagens foram enviadas ou recebidas.
- As fontes e diretrizes podem evoluir; verificar versões oficiais durante revisões futuras.

## 9. Checklist de implementação

- [ ] `lang="pt-BR"` definido.
- [ ] Estrutura HTML semântica e títulos coerentes.
- [ ] Link “Pular para o conteúdo principal”.
- [ ] Navegação completa por teclado.
- [ ] Foco visível e não obscurecido.
- [ ] Contraste de texto e componentes verificado.
- [ ] Texto redimensionável e reflow testados.
- [ ] Rótulos, instruções e erros de formulário acessíveis.
- [ ] Mensagens de status acessíveis sem deslocamento de foco.
- [ ] Menu móvel com estado acessível.
- [ ] Textos alternativos adequados.
- [ ] Preferência de movimento reduzido respeitada.
- [ ] Resultados vazios diferenciados de erros técnicos.
- [ ] Testes manuais e automáticos registrados.
- [ ] Dependências da API verificadas.
- [ ] Problemas encontrados corrigidos ou documentados.

## 10. Fontes oficiais

1. **W3C — Web Content Accessibility Guidelines (WCAG) 2.2:** https://www.w3.org/TR/WCAG22/
2. **W3C WAI — Understanding WCAG 2.2:** https://www.w3.org/WAI/WCAG22/Understanding/
3. **W3C WAI-ARIA Authoring Practices Guide — Disclosure Pattern:** https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
4. **Governo Federal — eMAG 3.1:** https://emag.governoeletronico.gov.br/
5. **Governo Digital — Modelo de Acessibilidade:** https://www.gov.br/governodigital/pt-br/acessibilidade-e-usuario/acessibilidade-digital/modelo-de-acessibilidade
6. **Brasil — Lei nº 13.146/2015 (Lei Brasileira de Inclusão), art. 63:** https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13146.htm

## 11. Relação com outros documentos do Agenda Livre

- DOC-01 — Visão do Produto e Requisitos.
- DOC-05 — Especificação da API REST.
- DOC-06 — Requisitos Não Funcionais.
- DOC-07 — Estratégia de Testes.
- DOC-10 — Identidade Visual e Design System.
- DOC-11 — Arquitetura da Informação.
- DOC-12 — Wireframes.
- DOC-13 — Especificação de Interfaces e Comportamentos.
- DOC-14 — Estratégia de Testes do Frontend.

Este documento complementa os demais: os requisitos funcionais definem o que o produto faz; este documento registra como a acessibilidade deve ser incorporada e avaliada.
