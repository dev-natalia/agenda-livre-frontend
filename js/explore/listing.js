import { fetchActivities as defaultFetchActivities, PAGE_SIZE } from "../api/public.js";
import { ApiError, isCancelled } from "../api/errors.js";
import { createRequestScope } from "../api/client.js";
import { createActivityCard } from "../components/activity-card.js";
import { renderPagination } from "../components/pagination.js";
import { createRegionState } from "../components/region-state.js";
import { buildPaginationModel } from "./pagination-model.js";
import { buildExploreSearch } from "./url-state.js";

const LOADING_MESSAGE = "Carregando atividades…";
const EMPTY_MESSAGE = "Nenhuma atividade encontrada.";
const EMPTY_HINT = "Altere ou limpe os filtros para ver mais atividades.";
const LOADED_WITHOUT_TOTAL = "Atividades carregadas.";

const hasTotal = (count) => Number.isInteger(count) && count >= 0;

export function countLabel(count) {
  return count === 1 ? "1 atividade encontrada" : `${count} atividades encontradas`;
}

function toCards(data) {
  if (!Array.isArray(data?.results)) throw new ApiError("invalid_response");
  return data.results.map((activity) => createActivityCard(activity, { headingLevel: 3 })).filter(Boolean);
}

// Página inexistente: o backend responde 400 com erro em `page` (o contrato diz 404); ambos valem.
function isPageOutOfRange(error, page) {
  if (page <= 1 || !(error instanceof ApiError)) return false;
  return error.category === "not_found" || (error.category === "bad_request" && Boolean(error.fieldErrors?.page));
}

// Os elementos devem existir no HTML antes da primeira troca de estado. Este módulo nunca move o foco.
export function initListing({
  content,
  status,
  summary,
  nav,
  fetchActivities = defaultFetchActivities,
  onPageOutOfRange = () => {},
  onLoaded = () => {},
}) {
  const scope = createRequestScope();
  const region = createRegionState({
    content,
    status,
    skeletonCount: PAGE_SIZE,
    loadingLabel: LOADING_MESSAGE,
  });
  let generation = 0;
  let inflight = null;

  const hrefForCriteria = (criteria) => (page) => {
    const search = buildExploreSearch(criteria, page);
    return search ? `explorar.html?${search}` : "explorar.html";
  };

  function clearAuxiliary() {
    summary.textContent = "";
    renderPagination(nav, null, () => "");
  }

  async function run({ criteria, page }) {
    const mine = ++generation;
    clearAuxiliary();
    region.showLoading({ announce: LOADING_MESSAGE });

    let data;
    let cards;
    try {
      data = await fetchActivities({ criteria, page, scope });
      cards = toCards(data);
    } catch (error) {
      if (isCancelled(error) || mine !== generation) return;
      if (isPageOutOfRange(error, page)) {
        onPageOutOfRange({ criteria, page });
        return;
      }
      region.showError(error instanceof ApiError ? error : new ApiError("invalid_response", { cause: error }), {
        onRetry: () => load({ criteria, page }),
      });
      return;
    }
    if (mine !== generation) return;

    if (cards.length === 0) {
      if (data.count > 0) {
        // Total positivo sem nenhuma atividade válida: resposta incoerente, não "sem resultados".
        region.showError(new ApiError("invalid_response"), { onRetry: () => load({ criteria, page }) });
        return;
      }
      region.showEmpty({ message: EMPTY_MESSAGE, hint: EMPTY_HINT, announce: `${EMPTY_MESSAGE} ${EMPTY_HINT}` });
      return;
    }

    present({ criteria, page }, data, cards, { announce: true });
    onLoaded({ criteria, page, data });
  }

  // O total só aparece quando a API o informa de forma confiável; nunca o tamanho da página.
  function present({ criteria, page }, data, cards, { announce }) {
    if (hasTotal(data.count)) summary.textContent = countLabel(data.count);
    const message = hasTotal(data.count) ? `${countLabel(data.count)}.` : LOADED_WITHOUT_TOTAL;
    region.showSuccess(cards, { announce: announce ? message : "" });
    renderPagination(
      nav,
      buildPaginationModel({
        current: page,
        count: data.count,
        pageSize: PAGE_SIZE,
        hasPrevious: Boolean(data.previous),
        hasNext: Boolean(data.next),
      }),
      hrefForCriteria(criteria),
    );
  }

  // Resultados guardados (volta dos detalhes): sem esqueleto e sem anúncio de carregamento.
  // Devolve false quando a cópia não serve, para o chamador consultar a API.
  function showCached(state, data) {
    let cards;
    try {
      cards = toCards(data);
    } catch {
      return false;
    }
    if (cards.length === 0) return false;
    generation += 1;
    inflight = null;
    scope.cancel();
    clearAuxiliary();
    present(state, data, cards, { announce: false });
    return true;
  }

  // Acionamentos repetidos da mesma consulta em andamento não geram consultas redundantes.
  function load(state) {
    const key = JSON.stringify([state.criteria, state.page]);
    if (inflight?.key === key) return inflight.promise;
    const promise = run(state).finally(() => {
      if (inflight?.promise === promise) inflight = null;
    });
    inflight = { key, promise };
    return promise;
  }

  return {
    load,
    showCached,
    destroy() {
      generation += 1;
      inflight = null;
      scope.cancel();
      region.destroy();
    },
  };
}
