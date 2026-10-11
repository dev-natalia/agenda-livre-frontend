# Contract: `js/components/region-state.js` (e ajuste em `error-state.js`)

## Marcação fornecida pela página (presente desde o carregamento)

```html
<section aria-labelledby="proximas-titulo">
  <h2 id="proximas-titulo">Próximas atividades</h2>
  <p class="visually-hidden" role="status" aria-live="polite" id="proximas-status"></p>
  <div id="proximas-content"></div>
</section>
```

## API

```text
export function createRegionState({ content, status, skeletonCount = 3, announceDelayMs = 300,
                                    renderSkeleton, loadingLabel = "Carregando…" }) -> RegionState

RegionState:
  showLoading({ announce = "Carregando…" } = {}) -> void
  showSuccess(nodeOrNodes, { announce = "" } = {}) -> void
  showEmpty({ message = "Nenhuma atividade encontrada.", hint = null, announce = message }) -> void
  showError(error, { onRetry }) -> void        // ignora error.category === "cancelled"
  getState() -> "idle" | "loading" | "success" | "empty" | "error"
  destroy() -> void                            // cancela temporizadores
```

## Regras
- `content` não é região live; `status` é a única região de anúncio.
- Cada `show*` substitui todo o conteúdo de `content` (nunca mistura anterior com novo) e escreve **uma** mensagem em `status` (limpa antes de escrever).
- `showLoading`: monta `loadingLabel` visível + `skeletonCount` esqueletos (`renderSkeleton(count)` da página ou o padrão `div.skeleton-card[aria-hidden="true"]`); o anúncio é adiado `announceDelayMs`; qualquer `show*` posterior cancela o anúncio pendente.
- `showEmpty`: texto distinto de erro; `hint` (ex.: "Altere ou limpe os filtros.") é exibido só se fornecido pela página (quando houver filtros).
- `showError`: delega a `renderErrorState(content, error, { onRetry, live: false })`; anuncia `error.userMessage`; sem botão se `!error.retryable`; "Tentar novamente" chama `onRetry` (que normalmente chama `showLoading` e repete a consulta).
- Foco: nenhum `show*` chama `focus()`, exceto a regra herdada de `error-state` (botão focado removido → `content` com `tabindex="-1"` recebe foco).
- Texto sempre via `textContent`.
- Dados do sucesso são DOM fornecido pela página (ex.: cards de `createActivityCard`); o componente não conhece atividades.

## Ajuste em `renderErrorState`
```text
renderErrorState(container, error, { onRetry, live = true } = {})
  // live === true  (padrão): define role="status" e aria-live="polite" no contêiner (comportamento da feature 002)
  // live === false: não toca em role/aria-live (a região de status é externa)
```

## Estilos (`components.css`)
- `.region-state__message`, `.region-state__hint` (vazio): borda e texto próprios, distintos de `.error-state__message` (ícone/prefixo de texto, não só cor).
- `.skeleton-card`: bloco estático com mesmas proporções do card; sem animação.
- `.visually-hidden` em `base.css`.
