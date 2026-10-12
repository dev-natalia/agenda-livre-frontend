# Implementation Plan: Refinamento visual do frontend

**Branch**: `011-visual-refinement` | **Date**: 2026-10-12 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/011-visual-refinement/spec.md`

## Summary

Refinar a apresentação das cinco páginas (VIS-001 a VIS-024) e aplicar a marca do guia `docs/Guia de Marca Agenda Livre.png`, **sem tocar em comportamento, rotas, parâmetros de URL nem API**. A abordagem é **CSS primeiro, HTML e JS só onde indispensável**, e cada exceção é registrada como dependência (FR-031). Decisões principais:

1. **Marca como arquivos próprios** (`images/brand/`): logo e ícone em SVG, redesenhados a partir do guia (o repositório só tem o PNG do guia); ícone da aba (`icon.svg` + `apple-touch-icon.png`); sem variação para fundo escuro, porque o site não a usa (FR-002).
2. **Largura útil global** de `72rem` para `80rem`, em um único token; cabeçalho, `main` e rodapé continuam no mesmo contêiner; texto corrido mantém `--reading-max-width`.
3. **Novos tokens**, e só eles, para o que o refinamento precisa: superfícies (painel, tinta do hero), sombras (cabeçalho, painel), raios (painel), espaçamento maior entre seções e as **cores de categoria**. Nenhum valor literal fora de `tokens.css`.
4. **Cor por categoria** (decisão do usuário, opção B) **por `slug` da API**, não pelos nomes do guia: as categorias reais do backend são `cultura-e-artes`, `esporte-e-atividade-fisica`, `cursos-e-formacao`, `eventos-e-encontros`, `saude-e-bem-estar`, `lazer-e-recreacao` e `educacao-e-meio-ambiente`; Dança, Música e Teatro do guia são rótulos do protótipo, não categorias existentes. O JS só grava `data-category="<slug>"` (valor validado); a cor vem de seletores de atributo no CSS; slug desconhecido cai no neutro atual.
5. **Ícones de apoio** (localização, data, horário) como SVG inline decorativo, em um módulo pequeno, nos metadados de cards e detalhes; o texto continua presente (FR-022). O ícone de público fica de fora (a lista da API não o traz).
6. **Composição**: hero e busca como painéis (fundo, borda e sombra suave), cabeçalho com sombra discreta e item ativo com barra inferior **além** de negrito, cards com raio e sombra dos tokens, painéis de estado centralizados com as formas distintas preservadas (pontilhado, tracejado, borda lateral grossa).
7. **Mudanças de HTML mínimas e idênticas nas 5 páginas**: `<img>` do logo dentro do link da marca (nome acessível mantido), `<link rel="icon">` e `apple-touch-icon` no `<head>` e, se o CSS não bastar, um contêiner no hero e na busca do Início. Nenhum `id`, `name`, `aria-*` ou ordem existente muda.
8. **Validação**: testes existentes atualizados só onde medem o que mudou de propósito (com justificativa); testes novos para marca, cores de categoria (contraste de todos os pares), alinhamento e larguras de referência; **script de captura** antes/depois e **registro de revisão** em `docs/21-registro-de-revisao-visual.md`.

## Technical Context

**Language/Version**: HTML5, CSS3, JavaScript ES2022 (ES Modules); Node.js 20+ para testes (desenvolvido com 24)

**Primary Dependencies**: nenhuma nova, em produção ou desenvolvimento; usa `vitest`, `jsdom`, `@playwright/test` e `@axe-core/playwright` existentes. Fontes Inter e Poppins locais (já hospedadas)

**Storage**: nenhum

**Testing**: Vitest (tokens, contraste das cores de categoria, ativos de marca, estrutura das páginas); Playwright (alinhamento, larguras 320/375/768/1024/1440, rolagem horizontal, estados, teclado); matriz axe da feature 009 (linha de base: 337 aprovados, 20 ignorados com motivo); verificações manuais registradas como tal

**Target Platform**: navegadores modernos; arquivos estáticos

**Project Type**: web, frontend estático separado do backend Django

**Performance Goals**: sem regressão perceptível: logo e ícone em SVG leve (alvo abaixo de 10 KB cada), sem novas fontes nem bibliotecas, nenhuma imagem raster no caminho crítico além do `apple-touch-icon`

**Constraints**: HTML/CSS/JS puros; só `tokens.css`, `base.css`, `layout.css` e `components.css`; pontos de quebra 40/48/64rem mantidos (48rem sincronizado com `site-nav.js`); contraste conforme `specs/004-visual-identity-responsive/contracts/design-tokens.md`; sem rolagem horizontal em 320 px; sem remover ou enfraquecer teste existente; backend e contratos intocados

**Scale/Scope**: 5 páginas HTML; 4 arquivos CSS (~1130 linhas hoje); 3 módulos JS tocados (`activity-card`, `details/render`, novo `activity-icons`); 3 ativos de marca; ~5 testes novos; 3 documentos (registro de revisão, DOC-10 e README atualizados)

## Constitution Check

A constituição (`.specify/memory/constitution.md`) segue como modelo não preenchido; os gates vêm do DOC-09, DOC-10, DOC-14, DOC-15 e das features 001 a 010:

- HTML/CSS/JS puros, ES Modules, sem framework nem biblioteca visual (DOC-09; backlog §14): PASS
- Tokens centralizados, sem valores literais em componentes (DOC-10; backlog §14): PASS (D3)
- Contraste de todos os pares novos verificado por teste (contrato de tokens da 004): PASS (D4)
- Acessibilidade existente preservada: foco, teclado, `aria-*`, movimento reduzido, reflow, espaçamento de texto (DOC-15; features 009 e 010): PASS (D6)
- Marca sem alterar a identidade nem o conteúdo institucional (backlog §2): PASS
- Mudança de HTML/JS só como dependência registrada (backlog §2, FR-031): PASS (`contracts/structure-changes.md`)
- Sem teste removido, desativado ou enfraquecido; atualizações justificadas (DOC-14 §13): PASS (D8)
- Resultado automático não é prova de conformidade WCAG: PASS (registro de revisão)
- Backend inalterado: PASS

Reavaliação pós-design: sem violações. Sem entradas em Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/011-visual-refinement/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── brand-assets.md          # logo, ícone da aba: arquivos, uso, acessibilidade
│   ├── design-tokens-delta.md   # tokens novos/alterados e cores de categoria com contraste
│   ├── component-visuals.md     # regras visuais por componente e por história
│   ├── structure-changes.md     # únicas mudanças de HTML/JS permitidas (dependências)
│   └── visual-review-record.md  # formato do registro e das capturas antes/depois
├── checklists/requirements.md
└── tasks.md                     # gerado por /speckit-tasks

docs/
├── 21-registro-de-revisao-visual.md   # NOVO: resultado datado, decisões, links das capturas
└── visual-review/{before,after}/      # NOVO: capturas PNG por página e largura
```

### Source Code (repository root)

```text
index.html, explorar.html, atividade.html, sobre.html, contato.html   # marca no cabeçalho, ícones no <head>
images/
├── hero-culture.svg            # existente, mantida
└── brand/                      # NOVO: logo.svg, icon.svg, apple-touch-icon.png
css/
├── tokens.css                  # novos tokens (contrato design-tokens-delta)
├── base.css                    # tipografia, links, foco (ajustes finos)
├── layout.css                  # largura, cabeçalho, rodapé, hero, busca, páginas internas
└── components.css              # botões, campos, cards, etiquetas, estados, formulário
js/components/
├── activity-card.js            # data-category e ícones nos metadados
└── activity-icons.js           # NOVO: SVGs decorativos (local, calendário, relógio)
js/details/render.js            # data-category na categoria e ícones nos metadados
tests/
├── unit/                       # brand-assets, category-colors (novos); design-tokens, site-shell (atualizados)
├── e2e/                        # visual-refinement.spec.js (novo); atualizações pontuais
└── capture/capture-screens.mjs # NOVO: captura antes/depois (fora do npm test)
docs/10-identidade-visual-design-system.md   # atualizado: logo, ícone e cores de categoria definitivos
README.md                                    # atualizado: imagens de marca e comando de captura
```

**Structure Decision**: o projeto continua estático e sem build. O trabalho se concentra nos quatro CSS e em mudanças mínimas e idênticas de HTML. Os ativos de marca ficam em `images/brand/`, separados da ilustração do hero. A captura de telas é um script de apoio, fora das suítes, para não tornar os testes lentos nem dependentes de imagens de referência.

## Complexity Tracking

Sem violações a justificar.
