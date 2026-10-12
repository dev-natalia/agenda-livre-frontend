# DOC-21 — Registro de Revisão Visual

**Projeto:** Agenda Livre  
**Status:** Registro da feature 011 — refinamento visual do frontend; a seção 12 acrescenta o redesenho visual da branch `012-visual-redesign`  
**Referências:** `docs/18-backlog-refinamento-visual-frontend.md` (VIS-001 a VIS-024), `specs/011-visual-refinement/spec.md`, `specs/011-visual-refinement/contracts/visual-review-record.md`, `docs/Guia de Marca Agenda Livre.png`

Este registro documenta o que foi executado e observado na data indicada. Passar nas verificações automáticas não prova conformidade com a WCAG 2.2 AA nem a ausência de defeitos. As verificações manuais que dependem de uma pessoa (teclado, ampliação, leitor de tela) estão separadas das automáticas na seção 7.

## 1. Identificação

- Data: 2026-10-12.
- Linha de base: ramo `main` no commit `9f9423c`, antes de qualquer mudança da feature 011.
- Execução final: ramo `011-visual-refinement`, com as mudanças ainda não commitadas no momento do registro (a árvore de trabalho é a evidência; o commit definitivo é anotado no pull request).
- Executado por: a pessoa desenvolvedora, com apoio do Claude Code.

## 2. Ambiente

- Sistema: Windows 11. Node.js 24.16.0; Python 3 (servidor estático dos testes).
- Navegador: Chromium headless do Playwright 1.64.0. Firefox e WebKit não foram usados.
- Ferramentas: Vitest 2.1.9, jsdom 25.0.1, `@playwright/test` 1.64.0, `@axe-core/playwright` 4.10.2.
- API: respostas simuladas (fixtures de `tests/fixtures/activities.js`); a API real não foi usada nesta feature.
- Não usados: leitor de tela, aparelhos reais, Firefox, WebKit.

## 3. Resultados

| Suíte | Comando | Aprovados | Falhos | Ignorados |
|---|---|---|---|---|
| Linha de base, unitária | `npm test` | 962 (47 arquivos) | 0 | 0 |
| Linha de base, navegador | `npm run test:e2e` | 647 | 0 | 20 |
| Final, unitária | `npm test` | 1083 (50 arquivos) | 0 | 0 |
| Final, navegador | `npm run test:e2e` | 702 | 0 | 20 |
| Final, só acessibilidade | `npm run test:a11y` | 337 | 0 | 20 |

- A linha de base unitária e a de navegador reproduzem o `docs/20-registro-de-qualidade.md`; a de acessibilidade (337 aprovados, 20 ignorados) é a mesma antes e depois.
- Acréscimo: 121 testes unitários (marca, cores de categoria, ícones, sombras e raios por token, e o próprio registro) e 55 de navegador (`tests/e2e/visual-refinement.spec.js`). Nenhum teste da linha de base foi removido ou desativado.
- Os 20 ignorados são os mesmos de antes: `tests/e2e/a11y-contrast-states.spec.js`, hover e foco por estado rodam só em 1280 px (motivo escrito no `test.skip`).
- Nenhuma violação nova de axe-core em relação à linha de base.

## 4. Testes atualizados

Nenhum foi removido nem enfraquecido. Os ajustes abaixo medem o que mudou de propósito (`specs/011-visual-refinement/contracts/structure-changes.md`):

| Teste | Mudança | Motivo |
|---|---|---|
| `tests/unit/design-tokens.test.js` | pares de contraste novos, largura 80rem, regras de sombra e raio por token | novos tokens da feature |
| `tests/e2e/home-accessibility.spec.js` | a página tem uma imagem exposta (o logo, "Agenda Livre") em vez de nenhuma | o logo do cabeçalho é conteúdo, não decoração |
| `tests/e2e/image-display.spec.js` (2 asserções) | a busca de imagens decorativas passou a considerar só `main` | o logo, fora do `main`, é imagem exposta por definição |
| `tests/unit/activity-card.test.js`, `tests/unit/details-render.test.js` | asserções acrescentadas (`data-category`, ícones) | novos comportamentos; as asserções de texto não mudaram |

## 5. Revisão entre páginas (VIS-021)

- Cabeçalho, rodapé, links, botões, campos e etiquetas usam os mesmos tokens e seletores nas cinco páginas. O teste `visual-refinement.spec.js` compara botões, campos e links entre as cinco páginas e exige resultado idêntico.
- A marca (logo e ícone) é idêntica nas cinco páginas, e cabeçalho, conteúdo e rodapé começam no mesmo eixo horizontal nas cinco larguras de referência.
- Diferenças entre páginas são funcionais: Início tem hero e busca; Explorar tem filtros e paginação; Detalhes e Sobre usam largura de leitura; Contato tem o painel do formulário.

## 6. Responsividade (VIS-022)

Verificado por teste em 320, 375, 768, 1024 e 1440 pixels CSS, nas cinco páginas: sem rolagem horizontal, sem sobreposição dos controles da busca e dos filtros, alvos de toque com pelo menos 44 px. O viewport não bloqueia o zoom, e os testes anteriores de texto a 200% continuam aprovados. Pontos de quebra mantidos (40, 48 e 64 rem).

## 7. Acessibilidade (VIS-023)

**Automático (executado):**

- Todos os pares de cor novos (texto branco sobre as sete cores de categoria; texto e links sobre a tinta do hero) passam nos mínimos de contraste, no teste de tokens.
- Matriz axe-core, foco visível, estados sem depender só de cor, espaçamento de texto e movimento reduzido: `npm run test:a11y`, 337 aprovados.
- A página atual na navegação se distingue por negrito e barra inferior espessa, não só por cor.

**Manual — NÃO realizado nesta execução:**

- Percurso por teclado dos fluxos principais (navegar, buscar, filtrar, paginar, abrir detalhes, enviar o contato), com leitor de tela e em aparelhos reais. Pendente: deve ser feito por uma pessoa antes de aprovar a entrega.
- Ampliação do texto e do zoom do navegador a olho, e avaliação em alto contraste do sistema.

Nenhuma conformidade integral com a WCAG 2.2 AA é declarada.

## 8. Antes e depois (VIS-024)

Capturas geradas por `npm run capture -- before` (antes de qualquer mudança) e `npm run capture -- after`, com respostas simuladas, nas mesmas larguras e estados: `docs/visual-review/before/` e `docs/visual-review/after/` (37 arquivos cada).

| Página | Estado | Antes | Depois |
|---|---|---|---|
| Início | resultados, 1440 | `docs/visual-review/before/inicio-resultados-1440.png` | `docs/visual-review/after/inicio-resultados-1440.png` |
| Início | resultados, 375 | `docs/visual-review/before/inicio-resultados-375.png` | `docs/visual-review/after/inicio-resultados-375.png` |
| Início | vazio, 768 | `docs/visual-review/before/inicio-vazio-768.png` | `docs/visual-review/after/inicio-vazio-768.png` |
| Início | erro, 768 | `docs/visual-review/before/inicio-erro-768.png` | `docs/visual-review/after/inicio-erro-768.png` |
| Explorar | resultados, 1440 | `docs/visual-review/before/explorar-resultados-1440.png` | `docs/visual-review/after/explorar-resultados-1440.png` |
| Explorar | vazio, 320 | `docs/visual-review/before/explorar-vazio-320.png` | `docs/visual-review/after/explorar-vazio-320.png` |
| Detalhes | resultados, 768 | `docs/visual-review/before/detalhes-resultados-768.png` | `docs/visual-review/after/detalhes-resultados-768.png` |
| Detalhes | não encontrada, 320 | `docs/visual-review/before/detalhes-nao-encontrada-320.png` | `docs/visual-review/after/detalhes-nao-encontrada-320.png` |
| Sobre | 1440 | `docs/visual-review/before/sobre-resultados-1440.png` | `docs/visual-review/after/sobre-resultados-1440.png` |
| Contato | 1440 | `docs/visual-review/before/contato-resultados-1440.png` | `docs/visual-review/after/contato-resultados-1440.png` |
| Contato | confirmação, 768 | `docs/visual-review/before/contato-confirmacao-768.png` | `docs/visual-review/after/contato-confirmacao-768.png` |

**Diferenças observadas e aprovadas pela revisão do desenvolvimento** (a aprovação final é da pessoa responsável pelo projeto):

- Marca: logo no cabeçalho e ícone na aba; cabeçalho e rodapé com fundo de borda a borda e conteúdo alinhado em 80rem.
- Início: hero e busca como painéis; "Explorar" alinhado como ação principal; seção de próximas atividades com título, introdução e "Ver todas".
- Cards: etiqueta colorida por categoria com o nome escrito, ícones de local e data, mesma altura e data alinhada na base.
- Estados: vazio (tracejado), carregando (pontilhado) e erro (borda lateral) com painel de mesmo formato e formas distintas.
- Explorar, Detalhes, Sobre e Contato: filtros e formulário em painel; detalhes com etiqueta e ícones; "Limpar campos" do Contato como botão contornado.

## 9. Problemas

### VR-001 — Painéis de vazio e erro não ocupavam a largura da seção

- **Onde:** Início e Explorar, estados vazio e erro.
- **Observado:** a regra global de largura de leitura dos parágrafos limitava o painel a 65ch, deixando-o mais estreito que os cards.
- **Situação:** corrigido (`max-width: none` nos painéis de estado em `css/components.css`).

### VR-002 — Grade de busca do Início com uma coluna a mais em 1024 px ou mais

- **Onde:** Início, a partir de 64rem.
- **Observado:** o botão "Explorar" ficava alinhado antes da borda direita do painel (havia uma coluna vazia na grade, já na versão anterior).
- **Situação:** corrigido (`css/layout.css`, quatro colunas: três filtros e o botão).

### VR-003 — Formulário de Contato centralizado sob um título alinhado à esquerda

- **Onde:** Contato, desktop.
- **Observado:** o bloco do formulário não compartilhava a borda esquerda do título.
- **Situação:** corrigido (bloco alinhado à esquerda).

### Aberto

- O texto do rodapé em celular (marca à esquerda e links empilhados à direita) segue como estava; não foi tratado nesta feature.

## 10. Decisões

- **Largura útil:** `72rem` para `80rem` (`--content-max-width`); parágrafos seguem em 65ch; Sobre e Detalhes mantêm largura de leitura.
- **Cabeçalho e rodapé de borda a borda**, com o conteúdo interno alinhado ao de `main` por cálculo de recuo, sem mudar o HTML.
- **Cor por categoria por slug** da API (opção B escolhida pela pessoa responsável): sete cores, texto branco, categoria sem cor usa o tratamento neutro (DOC-10 §3.1).
- **Logo e ícone** redesenhados em SVG a partir do guia, com texto em curvas; sem variação para fundo escuro.
- **Quatro colunas de cards em desktop (como no guia): não adotadas.** Três colunas já comportam o conteúdo com equilíbrio em 1440 px; quatro reduziriam a largura de cada card e dos títulos.
- **Item atual da navegação:** negrito e barra inferior, sem sublinhado.
- **Fora do escopo, por exigirem funcionalidade nova:** favoritar, ordenação, contador de resultados, filtros recolhíveis, carrossel, busca no cabeçalho, ícone de público e a foto do prédio.

## 11. Limites

- Só Chromium; sem leitor de tela, sem aparelhos reais e sem a API real nesta feature.
- A verificação manual por teclado e de ampliação não foi feita (seção 7).
- As capturas usam respostas simuladas, nas larguras 320, 375 (Início e Explorar), 768, 1024 (Início e Explorar) e 1440; testes não comparam pixels.
- O logo e o ícone são uma recriação do guia, não os arquivos originais de um designer; se houver arquivos oficiais, devem substituí-los em `images/brand/`.

## 12. Redesenho visual (branch `012-visual-redesign`)

Segundo passe de design sobre o resultado da feature 011, mantendo marca, paleta e fontes do guia. As seções 1 a 11 acima continuam descrevendo a 011 e não foram alteradas. As capturas `docs/visual-review/after/` são o estado da 011 e servem de "antes" aqui; as novas ficam em `docs/visual-review/redesign/` (`npm run capture -- redesign`, 37 arquivos, mesmos estados e larguras).

**Resultados (data: 2026-10-12, mesmo ambiente da seção 2):**

| Suíte | Comando | Aprovados | Falhos | Ignorados |
|---|---|---|---|---|
| Unitária | `npm test` | 1105 (50 arquivos) | 0 | 0 |
| Navegador | `npm run test:e2e` | 702 | 0 | 20 |
| Só acessibilidade | `npm run test:a11y` | 337 | 0 | 20 |

**O que mudou:**

- Início: hero em painel azul da marca com ilustração nova (`images/hero-rays.svg`), título maior e busca sobreposta à base do hero. Entre 48rem e 64rem a busca usa duas colunas.
- Cards planos, sem sombra; etiqueta de categoria presa à borda da imagem; data separada por filete.
- Cabeçalho mais leve (links sem sublinhado, exceto a página atual); filtros do Explorar em faixa azul-clara; seções de Sobre separadas por filetes.
- Detalhes em duas colunas a partir de 64rem, com Quando, Público e Local num bloco próprio.

**Testes atualizados:** `tests/unit/details-render.test.js` e `tests/e2e/details-content.spec.js` esperam agora a ordem Quando, Público, Local, Sobre a atividade, porque `js/details/render.js` agrupa as informações práticas num contêiner (dependência de estrutura registrada conforme FR-031). Nenhum teste foi removido nem enfraquecido.

**Comparação (feature 011 e redesenho):**

| Página | Estado | Feature 011 | Redesenho |
|---|---|---|---|
| Início | resultados, 1440 | `docs/visual-review/after/inicio-resultados-1440.png` | `docs/visual-review/redesign/inicio-resultados-1440.png` |
| Início | resultados, 768 | `docs/visual-review/after/inicio-resultados-768.png` | `docs/visual-review/redesign/inicio-resultados-768.png` |
| Início | resultados, 375 | `docs/visual-review/after/inicio-resultados-375.png` | `docs/visual-review/redesign/inicio-resultados-375.png` |
| Início | erro, 768 | `docs/visual-review/after/inicio-erro-768.png` | `docs/visual-review/redesign/inicio-erro-768.png` |
| Explorar | resultados, 1440 | `docs/visual-review/after/explorar-resultados-1440.png` | `docs/visual-review/redesign/explorar-resultados-1440.png` |
| Explorar | vazio, 320 | `docs/visual-review/after/explorar-vazio-320.png` | `docs/visual-review/redesign/explorar-vazio-320.png` |
| Detalhes | resultados, 1440 | `docs/visual-review/after/detalhes-resultados-1440.png` | `docs/visual-review/redesign/detalhes-resultados-1440.png` |
| Detalhes | resultados, 320 | `docs/visual-review/after/detalhes-resultados-320.png` | `docs/visual-review/redesign/detalhes-resultados-320.png` |
| Sobre | 1440 | `docs/visual-review/after/sobre-resultados-1440.png` | `docs/visual-review/redesign/sobre-resultados-1440.png` |
| Contato | 1440 | `docs/visual-review/after/contato-resultados-1440.png` | `docs/visual-review/redesign/contato-resultados-1440.png` |

**Problema encontrado na revisão das capturas:**

- **VR-004 — Seletor "Categoria" cortava o texto em 768 px.** Com três seletores lado a lado em 48rem, "Todas as categorias" aparecia como "Todas as categoria". Corrigido: duas colunas nessa faixa (`css/layout.css`); capturas refeitas e conferidas em 768 e 1024.

**Observado nas capturas:** Início (1440, 1024, 768, 375, erro em 768), Explorar (1440, vazio em 320), Detalhes (1440 e 320), Sobre e Contato (1440). **Não observadas a olho:** as demais capturas do conjunto (por exemplo Sobre e Contato em 320 e 768, e os estados vazio e erro de Início e Explorar em outras larguras); nelas só há a verificação automática.

**Limites:** valem os da seção 11. A verificação manual por teclado, leitor de tela, ampliação e alto contraste continua pendente; nenhuma conformidade integral com a WCAG 2.2 AA é declarada. A animação dos raios do hero só foi verificada pela regra de movimento reduzido nos testes, não a olho.
