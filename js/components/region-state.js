import { isCancelled } from "../api/errors.js";
import { renderErrorState } from "./error-state.js";

function defaultSkeleton(count) {
  return Array.from({ length: count }, () => {
    const el = document.createElement("div");
    el.className = "skeleton-card";
    el.setAttribute("aria-hidden", "true");
    return el;
  });
}

// `content` é o conteúdo visível (não é região live); `status` é a única região de anúncio.
// Ambos devem existir no HTML antes da primeira troca de estado.
export function createRegionState({
  content,
  status,
  skeletonCount = 3,
  announceDelayMs = 300,
  renderSkeleton = defaultSkeleton,
  loadingLabel = "Carregando…",
}) {
  let state = "idle";
  let announceTimer = null;

  function cancelPendingAnnouncement() {
    if (announceTimer !== null) {
      clearTimeout(announceTimer);
      announceTimer = null;
    }
  }

  function announce(message) {
    status.textContent = "";
    status.textContent = message ?? "";
  }

  function enter(nextState, nodes, message) {
    cancelPendingAnnouncement();
    state = nextState;
    content.replaceChildren(...nodes);
    announce(message);
  }

  function messageBox(className, title, hint) {
    const box = document.createElement("p");
    box.className = className;
    const strong = document.createElement("span");
    strong.className = "region-state__title";
    strong.textContent = title;
    box.append(strong);
    if (hint) {
      const extra = document.createElement("span");
      extra.className = "region-state__hint";
      extra.textContent = hint;
      box.append(extra);
    }
    return box;
  }

  return {
    getState: () => state,

    showLoading({ announce: message = "Carregando…" } = {}) {
      cancelPendingAnnouncement();
      state = "loading";
      content.replaceChildren(
        messageBox("region-state__loading", loadingLabel),
        ...[].concat(renderSkeleton(skeletonCount)),
      );
      status.textContent = "";
      announceTimer = setTimeout(() => {
        announceTimer = null;
        announce(message);
      }, announceDelayMs);
    },

    showSuccess(nodeOrNodes, { announce: message = "" } = {}) {
      enter("success", [].concat(nodeOrNodes ?? []), message);
    },

    showEmpty({ message = "Nenhuma atividade encontrada.", hint = null, announce: spoken = message } = {}) {
      enter("empty", [messageBox("region-state__empty", message, hint)], spoken);
    },

    showError(error, { onRetry } = {}) {
      if (isCancelled(error)) return;
      cancelPendingAnnouncement();
      state = "error";
      renderErrorState(content, error, { onRetry, live: false });
      announce(error.userMessage);
    },

    destroy: cancelPendingAnnouncement,
  };
}
