# Research: Identidade visual e responsividade

Todas as decisões abaixo resolvem as pendências deixadas em *Assumptions* da spec. Razões de contraste foram calculadas com a fórmula de luminância relativa da WCAG 2.x (2026-10-11).

## D1 — Paleta, tons ajustados e estados

**Decision**: Manter a paleta do DOC-10 como ponto de partida e ajustar apenas onde o uso exige contraste.

| Papel | Valor DOC-10 | Uso adotado | Razão | Ajuste |
|---|---|---|---|---|
| Primária | `#1E40AF` | links, marca, títulos de destaque, texto de botão contornado | 8,72 (branco), 8,34 (`#F8FAFC`) | nenhum |
| Secundária | `#2563EB` | fundo do botão primário com texto branco | 5,17 (branco) | nenhum; **não** usar como texto sobre `#F8FAFC` pequeno (4,94, passa, mas sem folga) — texto/links usam `#1E40AF` |
| Destaque | `#F97316` | fundo do botão secundário com texto **`#1F2937`** | 5,24 (texto escuro); 2,80 com texto branco ✗ | texto escuro em vez de branco; laranja nunca como texto/borda isolada (2,80 < 3:1) |
| Apoio | `#FACC15` | detalhe decorativo e realce; texto sobre ele `#1F2937` | 9,59 (texto escuro); 1,53 sobre branco ✗ | proibido como texto ou único contorno |
| Fundo / Superfície / Texto | `#F8FAFC` / `#FFFFFF` / `#1F2937` | — | 14,03 (texto sobre fundo) | nenhum |
| Laranja escuro (novo) | `#C2410C` | borda/ícone laranja quando necessário ≥ 3:1 e texto branco | 5,18 | tom novo, só se um componente precisar de laranja como linha ou texto |
| Borda de controle | `#767676` (atual) → `#64748B` | bordas de campos e componentes | 4,76 (branco) | passa 3:1 com folga |

Estados: foco = contorno de 3 px `#1E40AF` com recuo de 2 px, mais halo claro de 1 px para fundos azuis; hover = fundo mais escuro + sublinhado; ativo/selecionado = borda mais grossa + marca (✓ ou peso 700); erro = borda tracejada/ícone "!" + texto "Erro:"; desabilitado = borda tracejada + texto `#475569` (7,58) e `cursor: not-allowed`. Sucesso/aviso/erro/carregando/vazio mantêm padrões de borda distintos (sólida, tracejada, pontilhada, esquerda grossa), já presentes na feature 003.

**Rationale**: O DOC-10 §3.1 manda verificar contraste real e o DOC-09 autoriza ajustar tons. Ajustar o texto sobre o laranja (e não o laranja) preserva a identidade. Links usam o azul profundo, de contraste alto, e o azul vivo fica para fundos de botão.

**Alternatives considered**: escurecer o laranja para sustentar texto branco (perde o vigor do destaque e muda a identidade); usar amarelo como texto/foco (reprovado, 1,53); tema escuro (fora do escopo).

## D2 — Fontes Poppins e Inter

**Decision**: Hospedar localmente em `fonts/` arquivos `.woff2` (subconjunto latin): Inter variável (400–700) e Poppins 600 e 700. `@font-face` com `font-display: swap`, `<link rel="preload" as="font" crossorigin>` apenas para Inter e Poppins 600 (páginas já carregam Inter no texto). Pilha de reserva: `Inter, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif` e `Poppins, system-ui, ..., sans-serif`; o `@font-face` de reserva usa `size-adjust`/`ascent-override` para reduzir deslocamento (cumulative layout shift).

**Rationale**: Sem CDN, não há envio de IP a terceiros (privacidade), o site funciona na rede do equipamento público e o cache é controlado por nós. `swap` mantém o texto visível (FR-007). Poucos arquivos preservam o desempenho.

**Alternatives considered**: Google Fonts (dependência externa, privacidade); apenas fontes do sistema (descarta o DOC-10); Poppins em todos os pesos (peso de rede desnecessário).

## D3 — Pontos de quebra

**Decision**: três valores, mobile-first, em `rem`: **40 rem** (≈640 px, grade de cards em 2 colunas e formulários em 2 colunas), **48 rem** (768 px, navegação em linha; já usado por `site-nav.js`), **64 rem** (1024 px, 3+ colunas e largura de conteúdo máxima de 72 rem). A base (< 40 rem) é uma coluna. Documentados em `tokens.css` e `contracts/layout-breakpoints.md`; um teste lê os CSS e falha se aparecer outro valor ou se o 48 rem divergir de `site-nav.js`.

**Rationale**: Os três valores já existem no CSS da feature 003 (40/48/64); formalizá-los evita retrabalho e mantém o menu coerente. `rem` faz o layout acompanhar a ampliação do texto (zoom de texto dispara os pontos de quebra, favorecendo o reflow).

**Alternatives considered**: breakpoints em `px` (não acompanham texto ampliado); container queries (sem ganho para as páginas atuais); quarto ponto em 90 rem (a largura máxima de leitura resolve telas largas).

## D4 — Movimento reduzido

**Decision**: tokens `--motion-duration` (150 ms) e `--motion-ease`; todos os componentes usam `transition: <prop> var(--motion-duration) var(--motion-ease)`. Em `base.css`, um único bloco `@media (prefers-reduced-motion: reduce)` zera `--motion-duration` e, como rede de segurança, aplica `*, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; }`. `scroll-behavior: smooth` só é declarado sob `@media (prefers-reduced-motion: no-preference)`. A preferência é lida pelo próprio CSS, então mudanças com a página aberta valem sem recarga (FR-040).

**Rationale**: Uma regra central (FR-034/FR-041) vale para animações futuras sem configuração por componente. Zerar o token é limpo; a rede de segurança cobre CSS de terceiros ou esquecimentos. 0,01 ms (em vez de 0) mantém eventos `transitionend`/`animationend` disparando.

**Alternatives considered**: regra por componente (frágil); consulta em JavaScript (desnecessária e quebra sem JS); remover toda transição (perde o refinamento para quem não tem a preferência).

## D5 — Alvos de toque e espaçamento

**Decision**: tokens `--target-min: 2.75rem` (44 px, recomendado) aplicado como `min-height`/`min-width` a botões, itens de navegação, campos e botão de menu; piso absoluto de 24 px (WCAG 2.5.8) coberto pelo axe (`target-size`, tag `wcag22aa`, já em uso) e por teste de medida. Escala de espaçamento em múltiplos de 4 px: 4, 8, 12, 16, 24, 32, 48, 64 (`--space-1`…`--space-8`), mantendo os nomes `--space-1…5` atuais.

**Rationale**: DOC-10 §7 pede múltiplos de 4 px; DOC-10 §9 pede alvos confortáveis em toque.

**Alternatives considered**: apenas 24 px (cumpre o mínimo, mas é pouco confortável); 48 px em tudo (infla componentes densos como a etiqueta).

## D6 — Verificação de contraste

**Decision**: pares texto/fundo e componente/fundo realmente usados ficam declarados em um mapa em `tests/unit/design-tokens.test.js`; o teste lê os valores de `tokens.css`, calcula a razão e exige 4,5 (texto), 3 (texto grande/componentes) e falha com a lista de pares reprovados. A varredura axe nas cinco páginas (feature 003) continua como segunda rede. A tabela de razões vive em [contracts/design-tokens.md](contracts/design-tokens.md).

**Rationale**: Cumpre FR-005 (reproduzível e registrado) sem dependência nova e protege contra regressões quando um token mudar.

**Alternatives considered**: apenas axe (não enxerga estados hover/foco/desabilitado nem pares não renderizados); ferramenta externa de contraste (manual e não reprodutível).

## D7 — Reflow, ampliação e zoom nos testes

**Decision**: Playwright com viewports 320, 375, 768, 1024 e 1440 nas cinco páginas, asserindo `document.documentElement.scrollWidth <= window.innerWidth`; texto a 200% por `html { font-size: 200% }` injetado e por `deviceScaleFactor`/viewport de 320 px para o equivalente a 400% de zoom; interseção de caixas entre cabeçalho, menu e conteúdo; leitura de `meta[name=viewport]` para garantir ausência de `maximum-scale`/`user-scalable=no`; uma sonda que monta a grade de cards sintéticos (reaproveitando o padrão de `shared-components.spec.js`) para medir 1/2/3 colunas.

**Rationale**: SC-002/SC-003/SC-007 são mensuráveis por geometria. Reaproveita a técnica de sonda já adotada.

**Alternatives considered**: depender só de revisão manual (não repetível); imagens de referência visuais (frágeis a pequenas variações de fonte).

## D8 — Modo de cores forçadas, impressão e tema escuro

**Decision**: não declarar `forced-colors` especial além de garantir que contornos de foco e bordas usem `outline`/`border` (que o sistema preserva) e não só `background`/`box-shadow`; incluir `@media print` mínimo (fundo branco, texto escuro, ocultar navegação) como cobertura básica; manter tema claro e não declarar `color-scheme: dark`.

**Rationale**: Atende aos casos de borda da spec sem criar variantes que precisem de verificação própria.

**Alternatives considered**: tema escuro agora (fora do escopo); layout de impressão completo (fora do escopo).

## Pendências do backend

Nenhuma nova. A ausência de imagem de atividade (já registrada em `docs/PENDENCIAS-BACKEND.md`) é tratada como caso normal; esta feature não depende de nenhuma imagem (FR-045).
