import { request } from "./client.js";
import { todayInSaoPaulo } from "../utils/dates.js";

const UPCOMING_COUNT = 3;
const OPTIONS_PAGE_SIZE = 50;

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
