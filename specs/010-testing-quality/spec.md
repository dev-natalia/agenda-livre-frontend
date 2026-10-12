# Feature Specification: Testes e qualidade do frontend

**Feature Branch**: `010-testing-quality`

**Created**: 2026-10-12

**Status**: Draft

**Input**: User description: "Épico EP-FE-10 do docs/16-backlog-do-frontend.md (Testes e qualidade do frontend), que reúne as histórias FE-041 (testes unitários), FE-042 (testes de navegador), FE-043 (verificações automáticas de acessibilidade) e FE-044 (documentar a execução e os resultados dos testes). Base: todos os documentos em docs/ do frontend (em especial DOC-14, DOC-15 e o registro DOC-17) e docs/ e specs/ do backend (agenda-livre-backend), em especial o DOC-05 e a feature 010-activity-images."

## Contexto

As features 001 a 009 já entregaram, junto com cada funcionalidade, uma suíte automatizada ampla: testes unitários, testes de navegador com respostas simuladas da API e uma matriz de acessibilidade automática. Esta feature **não recomeça a suíte do zero**: ela verifica a suíte existente contra o que o DOC-14 e o backlog exigem, fecha as lacunas encontradas e entrega o que ainda não existe, principalmente a documentação operacional dos testes e o registro de qualidade. Os atores são **a pessoa desenvolvedora** (que roda e mantém os testes), **quem avalia ou revisa o projeto** (que precisa reproduzir e confiar nos resultados) e, indiretamente, **a pessoa visitante** (protegida contra regressões).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Confiar na suíte: auditar a cobertura contra o DOC-14 e fechar as lacunas (Priority: P1)

Uma pessoa desenvolvedora quer saber, sem ler os cerca de 100 arquivos de teste, se cada comportamento que o DOC-14 manda verificar tem teste automático e onde estão as exceções. Existe uma matriz que liga cada item do DOC-14 (§6 unitários, §7 integração, §8 fluxos de navegador, §11 segurança, §12 dados de teste) ao teste que o cobre, ou declara a lacuna e o motivo (por exemplo, "só verificável à mão"). As lacunas que podem ser automatizadas são fechadas. Entre elas, ao menos: tratamento seguro de conteúdo vindo da API (texto com marcação não vira HTML executável), rejeição de URLs externas com esquema não permitido, ausência de segredos nos arquivos publicados, falhas sem detalhes internos na tela, e atividade com o campo de imagem real do backend (`{url, alt, decorative}` ou `null`).

**Why this priority**: O backlog pede testes de utilitários, cliente HTTP, validação, fluxos principais e verificações comuns de acessibilidade, mas só uma auditoria mostra o que realmente falta; sem ela, a suíte parece completa e não se sabe se é. É a base para as demais histórias e entrega valor mesmo sozinha.

**Independent Test**: Abrir a matriz, escolher qualquer item do DOC-14 e chegar ao teste correspondente (ou à lacuna declarada); rodar a suíte e ver que todo item marcado como coberto passa; introduzir de propósito uma regressão em um item de segurança (por exemplo, aceitar `javascript:` em um link) e ver a suíte falhar.

**Acceptance Scenarios**:

1. **Given** a lista de verificações do DOC-14 (§6, §7, §8, §11, §12), **When** a matriz é consultada, **Then** cada item aponta para pelo menos um teste automático existente ou para uma lacuna declarada com motivo (limitação de ambiente, verificação manual ou dependência do backend).
2. **Given** uma lacuna automatizável identificada na matriz, **When** a feature termina, **Then** ela foi coberta por teste e a matriz foi atualizada; nenhuma lacuna automatizável permanece sem justificativa.
3. **Given** um texto da API com marcação (`<script>`, `<img onerror>`, aspas e `&`), **When** aparece em cartão, detalhes ou mensagem, **Then** é exibido como texto literal e nenhum código é executado.
4. **Given** um link externo com esquema não permitido (`javascript:`, `data:`, `vbscript:`) ou malformado, **When** a atividade é exibida, **Then** nenhum link é gerado; e **Given** uma URL `http` ou `https` válida, **Then** o link abre em nova aba com as proteções de `rel` e indica isso no texto.
5. **Given** qualquer falha da API (rede, tempo esgotado, `5xx`, JSON inválido), **When** o erro é mostrado, **Then** a tela não contém pilha de execução, endereço interno, token nem texto bruto da resposta.
6. **Given** os arquivos publicados (HTML, CSS, JavaScript), **When** examinados por um teste, **Then** não contêm segredos nem credenciais, e a configuração da API contém apenas a URL base pública.
7. **Given** uma atividade cuja resposta traz `image: { url, alt, decorative }`, `image: null` ou o campo ausente, **When** cartão e detalhes são exibidos, **Then** cada caso tem comportamento definido e testado (imagem informativa com alternativa, decorativa com `alt` vazio, ausente com o fallback visual).

---

### User Story 2 - Rodar e entender a suíte com um comando documentado (Priority: P1)

Uma pessoa que acabou de clonar o repositório, ou quem avalia o trabalho, segue o guia de testes e consegue, sem ajuda, instalar o necessário, rodar os testes unitários, os de navegador, os de acessibilidade e a suíte completa, e entender o que cada falha significa. O guia fala dos pré-requisitos (Node.js, Python para o servidor estático, instalação do Chromium do Playwright), dos comandos, de como rodar só um arquivo ou um grupo, da porta 5500 e do cuidado com um servidor já aberto nela, e de como ler uma falha. Hoje isso está espalhado no README e no registro de acessibilidade e não há um comando único para "tudo".

**Why this priority**: É o objetivo central da FE-041 ("comandos documentados", "falhas claramente identificáveis") e da FE-044. Testes que ninguém consegue reproduzir não protegem nada. É P1 porque quem avalia só enxerga o que consegue rodar.

**Independent Test**: Em uma cópia limpa do repositório (sem `node_modules`), seguir só o guia e chegar ao fim das duas suítes com resultado verde; depois quebrar um comportamento de propósito e conferir que a falha aponta com clareza o teste e o motivo.

**Acceptance Scenarios**:

1. **Given** uma cópia limpa do repositório, **When** a pessoa segue o guia de testes, **Then** consegue instalar as dependências, instalar o navegador de teste e rodar as suítes sem passos não documentados.
2. **Given** o guia, **When** a pessoa procura como rodar um único arquivo, um único teste, só os testes de acessibilidade, só os unitários ou tudo, **Then** encontra um comando para cada caso e existe um comando único que roda as suítes unitária e de navegador em sequência.
3. **Given** uma falha em qualquer suíte, **When** o resultado é lido, **Then** o nome do teste descreve o comportamento esperado (em português, como no restante da suíte) e a mensagem mostra o esperado e o obtido.
4. **Given** a execução da suíte, **When** ela termina, **Then** nenhum teste depende de dados pessoais reais, de rede externa, de relógio real sem controle ou de ordem de execução, e repetir a execução sem mudar nada dá o mesmo resultado.
5. **Given** o guia, **When** lido, **Then** explica a diferença entre o que é automatizado (unitário, navegador, axe-core) e o que continua manual (leitor de tela, teclado em dispositivos reais, avaliação visual), e afirma que passar na suíte não prova conformidade integral com a WCAG 2.2 AA.

---

### User Story 3 - Registrar o que foi testado, com que resultado e quais limites (Priority: P2)

Quem revisa o projeto abre um registro de qualidade e encontra, para a entrega, o que foi executado: data, versão (commit) testado, ambiente, ferramentas e versões, quantidade de testes aprovados, falhos e ignorados (e por que foram ignorados), os problemas encontrados com passos de reprodução e impacto, o que foi corrigido, as exceções justificadas e as limitações conhecidas. O registro de acessibilidade já existente (DOC-17) é referenciado em vez de duplicado. O registro também diz o que **não** foi verificado: navegadores além do Chromium, leitores de tela, aparelhos reais e integração com a API real.

**Why this priority**: Cumpre os critérios da FE-044 e do DOC-14 §14–15. Sem ele a suíte funciona, mas a entrega não tem evidência apresentável. Fica abaixo das duas histórias anteriores porque depende de a suíte estar auditada e executável.

**Independent Test**: Ler o registro sem abrir o código e responder: qual commit foi testado, em que ambiente, quantos testes passaram, o que foi ignorado e por quê, que defeitos apareceram e como reproduzi-los, e o que ainda falta verificar; conferir que os números batem com uma execução nova.

**Acceptance Scenarios**:

1. **Given** uma execução completa da suíte, **When** o registro é preenchido, **Then** contém data, commit, sistema, versões de Node.js, Playwright, Vitest e axe-core, e contagens de aprovados, falhos e ignorados que coincidem com a saída real.
2. **Given** testes ignorados de propósito, **When** o registro é lido, **Then** cada grupo de ignorados traz o motivo (por exemplo, estados de hover rodam só na largura de desktop) e nenhum teste foi desligado só para obter resultado verde.
3. **Given** um defeito encontrado durante a feature, **When** registrado, **Then** traz passos de reprodução, páginas e estados afetados, impacto, gravidade, correção ou justificativa e o teste que o protege contra regressão; defeitos que bloqueiam teclado, leitor de tela ou tarefa central têm prioridade na lista.
4. **Given** o registro, **When** lido, **Then** lista as limitações conhecidas: apenas Chromium, sem leitor de tela, sem aparelhos reais, e integração com a API real feita apenas nas verificações descritas.
5. **Given** o registro de acessibilidade (DOC-17), **When** o registro de qualidade o cita, **Then** o referencia sem copiar seus números, de modo que os dois não se contradigam.

---

### User Story 4 - Verificar o contrato com a API real, não só com respostas simuladas (Priority: P2)

A suíte usa respostas simuladas para ser reproduzível, mas o DOC-14 (§7, §12) e o backlog avisam que o mock não prova a integração. Existe uma verificação separada e opcional que roda os fluxos centrais (lista, busca, lista vazia, detalhes, inexistente, página fora do intervalo, campo de imagem) contra o backend em execução e compara o formato real com o que o frontend espera. Ela só roda quando a pessoa a pede e informa o endereço da API; sem isso, é ignorada de forma explícita e não derruba a suíte padrão. Divergências encontradas são anotadas em `docs/PENDENCIAS-BACKEND.md`, como já se faz.

**Why this priority**: Valor alto para a confiança, mas depende de o backend estar rodando; por isso não bloqueia as histórias anteriores e a suíte padrão deve continuar independente do backend.

**Independent Test**: Com o backend de demonstração rodando, executar a verificação e ver cada fluxo confirmado ou divergência anotada; sem o backend, executar a suíte padrão e ver que passa normalmente, com a verificação real listada como não executada.

**Acceptance Scenarios**:

1. **Given** o backend em execução e a URL informada pela pessoa, **When** a verificação de contrato roda, **Then** confere lista paginada, lista vazia, filtro inválido, detalhe existente, detalhe inexistente e o formato do campo `image`, e informa por fluxo se o formato real coincide com o esperado.
2. **Given** nenhuma URL de API informada, **When** a suíte padrão roda, **Then** a verificação de contrato é ignorada com mensagem clara e a suíte padrão passa sem acesso à rede.
3. **Given** uma divergência entre o contrato real e o esperado, **When** detectada, **Then** é descrita em `docs/PENDENCIAS-BACKEND.md` com o observado, o esperado e o impacto, e não é "corrigida" no frontend sem registro.
4. **Given** a verificação rodando contra um backend, **When** termina, **Then** nada foi gravado nele (somente leituras) e nenhum dado pessoal real foi usado.

---

### User Story 5 - Executar a suíte automaticamente em integração contínua (Priority: P3)

Quando uma alteração é enviada ao repositório, a suíte unitária, a de navegador e a de acessibilidade rodam sozinhas e o resultado aparece para quem revisa. Uma falha impede considerar a alteração aprovada e o relatório de falhas fica disponível. Os testes não são desativados para liberar uma entrega.

**Why this priority**: O backlog trata a integração contínua como condicional ("se houver CI"). É valiosa, mas a feature entrega valor sem ela; por isso é a última e pode ficar fora do escopo se o repositório não for usá-la.

**Independent Test**: Enviar uma alteração que quebra um teste de propósito e ver o resultado vermelho com o relatório; reverter e ver verde.

**Acceptance Scenarios**:

1. **Given** uma alteração enviada ao repositório, **When** o fluxo automático roda, **Then** executa as suítes unitária e de navegador (incluindo acessibilidade) em um ambiente limpo, a partir do guia de testes.
2. **Given** uma falha em qualquer teste, **When** o fluxo termina, **Then** é marcado como reprovado e disponibiliza o relatório e os artefatos de falha (por exemplo, capturas).
3. **Given** a verificação de contrato com a API real, **When** o fluxo automático roda, **Then** ela fica de fora, pois o backend não está disponível nesse ambiente.

---

### Edge Cases

- A porta usada pelos testes de navegador já está ocupada por outro servidor: o guia explica o sintoma (recusas intermitentes de conexão) e a solução (encerrar o servidor) e a suíte não falha de forma enganosa.
- O navegador de teste não foi instalado: a mensagem de falha aponta o passo que falta, e o guia o cobre.
- Teste que depende de data ou hora: usa relógio controlado, para não falhar perto da virada do dia ou em fuso diferente.
- Execução em outro sistema operacional (Linux, macOS): caminhos e comandos do guia não assumem Windows.
- Teste instável (passa e falha sem mudança): é investigado e corrigido, não repetido até passar nem desativado; se algo precisar ser ignorado, o motivo fica no registro.
- A API real devolve campo novo ou ausente que a simulação não previa: a verificação de contrato mostra a divergência e a fixture de teste é atualizada.
- A contagem do registro envelhece depois de novas features: o registro indica a data e o commit a que se refere, e o teste de conferência do registro falha se contagens declaradas deixarem de existir.
- Violação de acessibilidade corrigida que reaparece: o teste de regressão já existente (feature 009) continua rodando e a matriz o referencia.

## Requirements *(mandatory)*

### Functional Requirements

**Testes unitários (FE-041)**

- **FR-001**: O projeto MUST manter a ferramenta de testes unitários como dependência de desenvolvimento, com comando documentado para rodar tudo, um arquivo e um teste isolado, e modo de observação.
- **FR-002**: Os testes unitários MUST cobrir, no mínimo, os utilitários de estado da URL, a validação do formulário, o cliente HTTP (sucesso, erros de HTTP, rede, tempo esgotado, JSON inválido, resposta vazia, cancelamento) e a formatação dos dados exibidos, conforme DOC-14 §6.
- **FR-003**: Os testes MUST usar apenas dados sintéticos e reproduzíveis, relógio controlado quando dependem de data, e não depender de rede externa, de ordem de execução nem de dados pessoais reais.
- **FR-004**: Uma falha MUST identificar o teste pelo comportamento esperado e mostrar valor esperado e obtido.

**Testes de navegador (FE-042)**

- **FR-005**: Os testes de navegador MUST cobrir os fluxos principais de navegação, pesquisa, filtros, paginação, detalhes e contato descritos no DOC-14 §8, nas cinco páginas.
- **FR-006**: Os testes de navegador MUST simular respostas de sucesso e de falha da API (lista, lista vazia, erro HTTP, falha de rede, JSON inválido, resposta lenta, página fora do intervalo) a partir de fixtures compartilhadas e documentadas.
- **FR-007**: As fixtures MUST cobrir os casos do DOC-14 §12: atividade completa, sem imagem, com imagem informativa, com imagem decorativa, sem URL externa, com campos opcionais ausentes, recorrente, cancelada ou encerrada, lista vazia e várias páginas, e MUST refletir o formato real do DOC-05 e do campo `image` do backend.
- **FR-008**: A configuração MUST subir o servidor local sozinha, não exigir dados pessoais reais e ter comando documentado para toda a suíte e para um arquivo ou grupo.
- **FR-009**: Os testes de navegador MUST ser estáveis: dois ciclos seguidos sem mudanças MUST dar o mesmo resultado, sem repetições automáticas que escondam instabilidade.

**Acessibilidade automática (FE-043)**

- **FR-010**: As verificações automáticas de acessibilidade MUST cobrir as cinco páginas e os estados dinâmicos principais do DOC-14 §9.1 (carregada, menu móvel aberto, resultados, nenhum resultado, erro da API, formulário com erros, painel de confirmação), nas duas larguras já definidas.
- **FR-011**: Cada violação encontrada MUST ser corrigida ou justificada formalmente com escopo, motivo e mitigação, e nenhum alerta pode ser ignorado só para obter resultado verde.
- **FR-012**: A documentação e as mensagens da suíte MUST deixar claro que a verificação automática não prova conformidade integral e que teclado e leitor de tela continuam sendo verificados à mão.
- **FR-013**: A matriz de acessibilidade existente (feature 009) MUST continuar rodando, sem ser duplicada, e esta feature só MUST acrescentar o que a auditoria apontar como ausente.

**Auditoria, segurança e contrato**

- **FR-014**: MUST existir uma matriz de cobertura ligando cada verificação do DOC-14 (§6, §7, §8, §11, §12) ao teste automático correspondente ou a uma lacuna declarada com motivo, mantida junto da documentação de testes.
- **FR-015**: Texto vindo da API MUST ser exibido como texto literal em todos os pontos da interface, e MUST haver teste com marcação inesperada e caracteres especiais em cartão, detalhes e mensagens.
- **FR-016**: Links externos MUST ser gerados só para `http` e `https` válidos; esquemas como `javascript:`, `data:` e `vbscript:` e URLs malformadas MUST ser rejeitados, e os links válidos MUST abrir em nova aba com `rel` de proteção e indicação no texto, tudo coberto por teste.
- **FR-017**: MUST haver teste que confirme a ausência de segredos ou credenciais nos arquivos publicados e que a configuração pública contenha apenas a URL base da API.
- **FR-018**: Mensagens de falha exibidas MUST NOT conter pilha de execução, endereços internos, tokens nem corpo bruto da resposta, e MUST haver teste para os tipos de falha da API.
- **FR-019**: MUST existir uma verificação de contrato opcional contra a API real, somente leitura, acionada por comando e por URL informada, que fica explicitamente ignorada (não falha) quando a URL não é informada, e registra divergências em `docs/PENDENCIAS-BACKEND.md`.
- **FR-020**: Respostas de pesquisa antigas MUST NOT sobrescrever as de uma pesquisa mais recente, e MUST haver teste de navegador que o prove com respostas fora de ordem.

**Documentação e registro (FE-044)**

- **FR-021**: MUST existir um guia de testes com pré-requisitos, instalação, todos os comandos, interpretação de falhas, porta e servidor, organização das pastas, como adicionar um teste, e a fronteira entre o automatizado e o manual; o README MUST apontar para ele sem duplicar o conteúdo.
- **FR-022**: MUST existir um comando único que roda a suíte unitária e a de navegador em sequência e falha se qualquer uma falhar.
- **FR-023**: MUST existir um registro de qualidade (DOC-14 §15) com data, commit, ambiente, ferramentas e versões, contagens de aprovados, falhos e ignorados com motivo, defeitos com passos de reprodução, impacto e gravidade, exceções, limitações e verificações não feitas.
- **FR-024**: O registro MUST referenciar o registro de acessibilidade (DOC-17) sem copiar seus números, e um teste MUST falhar se o registro citar arquivos de teste que não existem mais.
- **FR-025**: Os critérios de aceite do DOC-14 §14 MUST ser conferidos um a um no registro, cada um com situação (atendido, atendido com ressalva, não verificado) e evidência.
- **FR-026**: Se houver integração contínua, ela MUST rodar as suítes unitária e de navegador a partir do guia, marcar falha quando qualquer teste falhar e publicar o relatório; a verificação de contrato com a API real MUST ficar fora dela.
- **FR-027**: Nenhum teste existente MUST ser removido, desativado ou enfraquecido para obter resultado verde; a suíte atual (692 unitários e 624 de navegador na linha de base de 2026-10-12) MUST continuar passando.

### Key Entities

- **Matriz de cobertura**: tabela que liga cada verificação exigida pelo DOC-14 ao teste que a cumpre ou à lacuna declarada; atributos: item do DOC-14, tipo (unitário, integração, navegador, segurança, manual), teste ou arquivo, situação, motivo da lacuna.
- **Fixture de API**: resposta sintética e reproduzível que representa um caso do DOC-14 §12 (atividade completa, sem imagem, recorrente, cancelada, lista vazia, erro); atributos: nome, formato fiel ao DOC-05, caso que representa.
- **Registro de qualidade**: documento datado de uma execução; atributos: commit, ambiente, versões das ferramentas, contagens, ignorados com motivo, defeitos, exceções, limitações, critérios de aceite conferidos.
- **Defeito registrado**: problema encontrado; atributos: passos de reprodução, páginas e estados, impacto, gravidade, situação, teste de regressão.
- **Verificação de contrato**: execução opcional contra a API real; atributos: fluxo, formato esperado, formato observado, divergência registrada.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos itens verificáveis do DOC-14 (§6, §7, §8, §11, §12) aparecem na matriz de cobertura, cada um com teste ou lacuna justificada, e 0 lacunas automatizáveis ficam sem justificativa ao final.
- **SC-002**: Uma pessoa que nunca rodou o projeto consegue, só com o guia, executar as duas suítes até o resultado final em até 15 minutos (excluindo o tempo de download das dependências) e sem ajuda externa.
- **SC-003**: Um único comando executa a suíte completa e sai com falha se qualquer teste falhar; o resultado final mostra de forma legível quantos testes passaram, falharam e foram ignorados.
- **SC-004**: Duas execuções completas consecutivas, sem mudanças no código, dão resultado idêntico, sem testes instáveis, sem repetições automáticas e sem teste desativado sem motivo no registro.
- **SC-005**: As verificações de segurança do DOC-14 §11 que podem ser automatizadas (texto como texto, esquemas de URL, segredos, mensagens sem detalhes internos) têm teste e, ao reintroduzir cada falha de propósito, a suíte reprova.
- **SC-006**: As cinco páginas e os sete estados dinâmicos do DOC-14 §9.1 continuam verificados por axe-core nas duas larguras, com 0 violações sem correção ou justificativa formal.
- **SC-007**: A verificação de contrato contra a API real cobre pelo menos 6 fluxos (lista, busca, vazia, detalhe, inexistente, página fora do intervalo) e o formato do campo de imagem, roda sem gravar nada e, sem URL informada, deixa a suíte padrão verde sem acessar a rede.
- **SC-008**: O registro de qualidade permite a quem revisa reproduzir as contagens: os números declarados coincidem com os de uma execução nova no mesmo commit, e 100% dos critérios de aceite do DOC-14 §14 têm situação e evidência.
- **SC-009**: A suíte da linha de base (692 testes unitários e 624 de navegador aprovados em 2026-10-12) continua aprovada, com 0 testes removidos ou enfraquecidos.

## Assumptions

- A suíte existente é o ponto de partida; esta feature audita, completa e documenta, e não reescreve testes que já cumprem o que o DOC-14 exige.
- Vitest, Playwright e axe-core já estão adotados e atendem ao DOC-14 §4; não se trocam ferramentas, e Lighthouse e outras ferramentas complementares ficam fora de escopo.
- Os testes de navegador continuam usando Chromium como navegador mínimo exigido; Firefox e WebKit são desejáveis, mas só entram se o custo for pequeno, e sua ausência é declarada no registro como limitação.
- A integração contínua é opcional, como diz o backlog ("se houver CI"): se o repositório não for hospedado onde isso seja possível, a História 5 é adiada e declarada no registro, sem prejudicar o restante.
- A verificação de contrato com a API real depende de o backend de demonstração estar acessível na máquina de quem a roda; ela nunca é requisito da suíte padrão.
- O backend entregou o campo `image` (`{url, alt, decorative}` ou `null`) na feature `010-activity-images` e o item correspondente de `docs/PENDENCIAS-BACKEND.md` pode estar resolvido; as fixtures seguem o formato do DOC-05 atual, e qualquer diferença é tratada como divergência a registrar.
- Testes manuais com leitor de tela, aparelhos reais e avaliação visual continuam responsabilidade humana e fora da automação; esta feature os documenta, mas não os executa nem os declara concluídos.
- A cobertura por percentagem de linhas não é critério de aceite: a medida de suficiência é a matriz de comportamentos do DOC-14, não um número de cobertura de código.
- Defeitos encontrados na auditoria são corrigidos nesta feature quando pequenos e dentro do escopo de testes e qualidade; os que exigirem mudança relevante de comportamento são registrados e levados a uma feature própria.
- O registro de acessibilidade (DOC-17) permanece o documento de referência para conformidade WCAG; o registro de qualidade só o referencia.
- O guia de testes recebe número próprio na sequência dos documentos de `docs/` e passa a ser a fonte única de instruções de execução; o README mantém só um resumo e o link.
