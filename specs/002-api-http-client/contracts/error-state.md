# Contract: `js/components/error-state.js`

```text
export function renderErrorState(container, error, { onRetry } = {}) -> void
  // container: elemento fornecido pela página (região de status já presente no DOM)
  // Substitui o conteúdo por: <p class="error-state__message"> userMessage </p>
  // e, se error.retryable && onRetry, <button type="button">Tentar novamente</button>
  // Texto sempre via textContent. Não chama focus() em nenhum caso.

export function clearErrorState(container) -> void
  // Remove o erro (usado ao entrar em carregamento ou sucesso)
```

## Requisitos de marcação
- O contêiner tem `role="status"` e `aria-live="polite"` desde o carregamento da página (região existente antes da mudança).
- Erros `cancelled` não são renderizados (a página usa `isCancelled`).
- Ao acionar o botão: `onRetry()` é chamado uma vez; o botão fica desabilitado até a página limpar/recriar o estado, evitando cliques repetidos; o foco, se estava no botão, é movido para o contêiner (`tabindex="-1"`) para não ser perdido.
- Estilos em `css/components.css`; estados de foco visíveis conforme `tokens.css`; informação não depende só de cor.
