import { createRequestScope } from "../api/client.js";
import { isCancelled } from "../api/errors.js";
import { fetchActivityDetails } from "../api/public.js";
import { getConfigStatus } from "../config.js";
import { showConfigNotice } from "../components/config-notice.js";
import { createRegionState } from "../components/region-state.js";
import { initSiteNav } from "../components/site-nav.js";
import { initBackLink } from "../details/back-link.js";
import { parseActivityId } from "../details/id.js";
import { renderDetails, renderNotFound } from "../details/render.js";

const SITE = "Agenda Livre";
const TITLES = {
  notFound: `Atividade não encontrada — ${SITE}`,
  error: `Erro ao carregar a atividade — ${SITE}`,
};

function renderSkeleton() {
  return Array.from({ length: 2 }, () => {
    const el = document.createElement("div");
    el.className = "skeleton-card skeleton-card--text";
    el.setAttribute("aria-hidden", "true");
    return el;
  });
}

// `options` existe para os testes (consulta, endereço e histórico injetados).
export function init(options = {}) {
  initSiteNav();

  const main = document.querySelector("main");
  const content = document.getElementById("details-content");
  const status = document.getElementById("details-status");
  if (!main || !content || !status) return null;

  showConfigNotice(getConfigStatus());
  initBackLink(document.getElementById("details-back"), {
    ...(options.referrer !== undefined && { referrer: options.referrer }),
    ...(options.historyRef && { historyRef: options.historyRef }),
  });

  const scope = createRequestScope();
  const fetchDetails = options.fetchDetails ?? ((id) => fetchActivityDetails(id, { scope }));
  const search = options.search ?? location.search;
  const region = createRegionState({ content, status, skeletonCount: 2, renderSkeleton });

  // Cada consulta tem uma geração; resposta de geração anterior nunca sobrescreve a mais recente.
  let generation = 0;

  function showNotFound() {
    region.showSuccess(renderNotFound(), { announce: "Atividade não encontrada ou não disponível." });
    document.title = TITLES.notFound;
  }

  function showError(error) {
    // Resposta inesperada também admite nova tentativa (FR-017).
    if (error?.category === "invalid_response") error.retryable = true;
    region.showError(error, { onRetry: load });
    document.title = TITLES.error;
  }

  async function load() {
    generation += 1;
    const current = generation;

    const id = parseActivityId(search);
    if (!id) {
      scope.cancel();
      showNotFound();
      return;
    }

    region.showLoading({ announce: "Carregando detalhes da atividade…" });
    try {
      const data = await fetchDetails(id);
      if (current !== generation) return;
      const nodes = renderDetails(data);
      region.showSuccess(nodes, { announce: "Detalhes da atividade carregados." });
      document.title = `${data.title.trim()} — ${SITE}`;
    } catch (error) {
      if (current !== generation || isCancelled(error)) return;
      if (error?.category === "not_found") showNotFound();
      else showError(error);
    }
  }

  function destroy() {
    generation += 1;
    scope.cancel();
    region.destroy();
  }

  window.addEventListener("pagehide", destroy);
  load();
  return { reload: load, destroy };
}

init();
