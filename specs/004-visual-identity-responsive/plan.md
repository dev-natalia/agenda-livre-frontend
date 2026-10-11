# Implementation Plan: Identidade visual e responsividade

**Branch**: `004-visual-identity-responsive` | **Date**: 2026-10-11 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/004-visual-identity-responsive/spec.md`

## Summary

Entregar o épico EP-FE-04 (FE-011, FE-012, FE-013) sem alterar estrutura HTML, textos nem comportamento dos componentes das features 001–003: (1) um único conjunto de *design tokens* em `css/tokens.css` (cor com tons ajustados por contraste, tipografia Poppins/Inter hospedada localmente com fontes de reserva, escala de espaçamento em múltiplos de 4 px, raios, sombras, foco, duração/curva de transição); (2) migração de `base.css`, `layout.css` e `components.css` para consumir só tokens, com estilos de botão (primário, secundário, contornado), estados (foco, hover, ativo, erro, desabilitado) com pista não cromática e etiqueta de categoria com tratamento neutro padrão; (3) layout *mobile-first* com três pontos de quebra documentados (40/48/64 rem), grade de cards 1→2→3+ colunas, largura máxima de leitura, alvos de toque ≥ 44 px, sem rolagem horizontal de 320 a 1440 px; (4) uma regra central de movimento reduzido (tokens de duração zerados + rede de segurança para `animation`/`transition`/`scroll-behavior`). Verificação: teste unitário de razões de contraste lidas de `tokens.css`, testes Playwright de reflow, ampliação, movimento reduzido e axe nas cinco páginas, e revisão manual registrada.

## Technical Context

**Language/Version**: HTML5, CSS3, JavaScript ES2022 (ES Modules); Node.js 20+ apenas para testes

**Primary Dependencies**: nenhuma em produção; dev: `vitest`, `jsdom`, `@playwright/test`, `@axe-core/playwright` (existentes). Fontes Poppins/Inter como arquivos `.woff2` locais em `fonts/` (sem CDN, sem pacote em runtime)

**Storage**: N/A

**Testing**: Vitest (parser de `tokens.css` + razões de contraste das combinações declaradas; coerência dos pontos de quebra entre CSS e `site-nav.js`; ausência de valores literais de cor/fonte fora de `tokens.css`; regra central de movimento reduzido presente); Playwright (sem rolagem horizontal em 320/375/768/1024/1440 nas 5 páginas; texto 200% e 320 px; `reducedMotion: reduce` vs `no-preference` em menu, esqueleto, botões e rolagem; fontes bloqueadas; grade 1/2/3 colunas; axe com `color-contrast`, `target-size`); revisão manual (zoom, texto 200%, alto contraste do SO, escala de cinza) registrada em `quickstart.md`

**Target Platform**: navegadores modernos, arquivos estáticos

**Project Type**: web, frontend estático separado do backend Django

**Performance Goals**: fontes não bloqueiam a renderização (`font-display: swap`); no máximo 4 arquivos de fonte; sem CSS adicional de bibliotecas; transições ≤ 200 ms (SC-005 admite até 300 ms)

**Constraints**: sem framework, sem pré-processador, sem JS para aparência/responsividade (FR-032); cores/tamanhos/fontes só via tokens; unidades `rem` para texto e pontos de quebra (FR-018, FR-025); nenhuma alteração de contrato com a API; zoom nunca bloqueado (`meta viewport` já correto)

**Scale/Scope**: 4 arquivos CSS reorganizados (`tokens.css` ampliado; `base.css`, `layout.css`, `components.css` migrados), +1 pasta `fonts/` (4 `.woff2`), ajustes mínimos de `<head>` nas 5 páginas (preload/CSS), 3 specs de teste novas, 1 contrato de tokens documentado

## Constitution Check

A constituição (`.specify/memory/constitution.md`) segue como modelo não preenchido; os gates vêm dos DOC-09 §Estilos/Acessibilidade, DOC-10, DOC-13 §3, DOC-15 e das decisões das features 001–003:

- Tokens centralizados em variáveis CSS; paleta do DOC-10 com ajustes por contraste documentados (DOC-09 §Estilos, DOC-10 §3): PASS (D1)
- Poppins (títulos) e Inter (texto) com fonte de reserva e sem bloqueio (DOC-10 §5): PASS (D2)
- HTML/CSS/JS puros, sem framework nem pré-processador (DOC-09): PASS
- Contraste 4,5:1 / 3:1 verificado por combinação real (WCAG 1.4.3/1.4.11, DOC-15): PASS (D1, D6)
- Reflow 320 px, texto 200%, zoom não bloqueado (WCAG 1.4.4/1.4.10, DOC-13 §3): PASS (D3, D4)
- Alvo de toque ≥ 24 px (WCAG 2.5.8), foco visível (2.4.7/2.4.11): PASS (D5)
- `prefers-reduced-motion` respeitado por regra central (DOC-13 §3, DOC-15): PASS (D4)
- Estados e mensagens sem depender só de cor (DOC-10 §3.1, §10): PASS (D1)
- Sem alterar HTML/comportamento/textos/contrato da API dos componentes (FR-042): PASS
- Aparência independente de JavaScript (FR-032): PASS
- Ponto de troca do menu em CSS e em `site-nav.js` coincidem (feature 003): PASS, agora coberto por teste (D3)

Reavaliação pós-design: sem violações. Sem entradas em Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/004-visual-identity-responsive/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── design-tokens.md
│   ├── layout-breakpoints.md
│   └── motion.md
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
fonts/                       # novo: Inter (variável, latin) e Poppins 600/700 (latin), .woff2
css/
├── tokens.css               # ampliado: cor (com tons ajustados), tipografia, espaço, raio, sombra, foco, movimento
├── base.css                 # @font-face, reset, tipografia base, links, foco, regra central de movimento reduzido
├── layout.css               # contêineres, cabeçalho/rodapé, grade de cards, pontos de quebra, rodapé colado ao fim
└── components.css           # botões (.button--primary/secondary/outline), campos, etiqueta, cards, estados, esqueleto
*.html (5 páginas)           # <link rel="preload"> das fontes críticas; sem outra mudança estrutural
tests/
├── unit/
│   ├── design-tokens.test.js     # razões de contraste, literais fora de tokens, breakpoints × site-nav.js
│   └── motion-rule.test.js       # regra central de movimento reduzido presente e sem exceções por componente
└── e2e/
    ├── responsive-reflow.spec.js # 5 páginas × larguras; texto 200%; grade; alvos de toque; fonte bloqueada
    └── reduced-motion.spec.js    # menu, esqueleto, botão, âncora com e sem a preferência
```

**Structure Decision**: mantém o frontend estático plano das features anteriores; nenhuma pasta nova além de `fonts/`. CSS segue em quatro arquivos com responsabilidades fixas (tokens → base → layout → components), na mesma ordem de carga já usada pelas páginas.

## Complexity Tracking

Sem violações a justificar. Observação: variáveis CSS não podem ser usadas em *media queries*; por isso os três pontos de quebra aparecem como literais em `rem` em `layout.css`/`components.css` e são documentados em `tokens.css` e em [contracts/layout-breakpoints.md](contracts/layout-breakpoints.md); um teste unitário garante que só esses três valores existam e que o de 48 rem coincide com `site-nav.js`.
