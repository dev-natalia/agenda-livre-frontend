import { isCancelled } from "../api/errors.js";

export function clearErrorState(container) {
  container.replaceChildren();
}

// O contêiner deve existir no DOM antes do erro, para que a mudança seja anunciada.
export function renderErrorState(container, error, { onRetry, live = true } = {}) {
  clearErrorState(container);
  if (isCancelled(error)) return;

  // Com live: false, o anúncio fica a cargo de uma região de status externa.
  if (live) {
    container.setAttribute("role", "status");
    container.setAttribute("aria-live", "polite");
  }

  const message = document.createElement("p");
  message.className = "error-state__message";
  message.textContent = error.userMessage;
  container.append(message);

  if (error.retryable && typeof onRetry === "function") {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "error-state__retry";
    button.textContent = "Tentar novamente";
    button.addEventListener("click", () => {
      if (button.disabled) return;
      button.disabled = true;
      if (document.activeElement === button) {
        container.setAttribute("tabindex", "-1");
        container.focus();
      }
      onRetry();
    });
    container.append(button);
  }
}
