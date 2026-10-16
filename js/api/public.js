import { request } from "./client.js";
import { toApiParams } from "../explore/url-state.js";
import { todayInSaoPaulo } from "../utils/dates.js";

const UPCOMING_COUNT = 3;
const OPTIONS_PAGE_SIZE = 50;
export const PAGE_SIZE = 12;

// `scope` (createRequestScope) cancela a consulta anterior do mesmo escopo; sem ele, consulta direta.
function get(path, { scope, fetchImpl, params }) {
  const options = { params, fetchImpl };
  return scope ? scope.run(path, options) : request(path, options);
}

export function fetchUpcomingActivities({ scope, fetchImpl } = {}) {
  return get("/activities/", {
    scope,
    fetchImpl,
    params: { date_from: todayInSaoPaulo(), page_size: UPCOMING_COUNT },
  });
}

export function fetchUnits({ scope, fetchImpl } = {}) {
  return get("/units/", { scope, fetchImpl, params: { page_size: OPTIONS_PAGE_SIZE } });
}

export function fetchCategories({ scope, fetchImpl } = {}) {
  return get("/categories/", { scope, fetchImpl, params: { page_size: OPTIONS_PAGE_SIZE } });
}

export function fetchAudiences({ scope, fetchImpl } = {}) {
  return get("/audiences/", { scope, fetchImpl, params: { page_size: OPTIONS_PAGE_SIZE } });
}

// Listagem da Explorar: critérios já normalizados (js/explore/url-state.js), page omitido na primeira.
export function fetchActivities({ criteria, page = 1, scope, fetchImpl } = {}) {
  const params = { ...toApiParams(criteria ?? {}), page_size: PAGE_SIZE };
  if (page > 1) params.page = page;
  return get("/activities/", { scope, fetchImpl, params });
}

// Detalhe de uma atividade pública; o `404` é uniforme (inexistente, malformado ou não publicada).
export function fetchActivityDetails(id, { scope, fetchImpl } = {}) {
  return get(`/activities/${encodeURIComponent(id)}/`, { scope, fetchImpl });
}
