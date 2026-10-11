import { MAX_TERM_LENGTH, normalizeTerm, periodRange } from "../home/search-criteria.js";
import { addDays, lastDayOfMonth, todayInSaoPaulo } from "../utils/dates.js";

// Contrato: specs/006-activity-exploration/contracts/explore-url.md. Sem acesso a window/document.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PERIOD_KEYS = ["any", "today", "week", "month"];

export const DEFAULT_CRITERIA = Object.freeze({ term: "", unit: "", category: "", period: "any" });

function uuidOrEmpty(value) {
  const text = String(value ?? "").trim();
  return UUID.test(text) ? text : "";
}

function parsePage(value) {
  if (value === null || !/^\d+$/.test(value)) return 1;
  const page = Number(value);
  return Number.isSafeInteger(page) && page >= 1 ? page : 1;
}

// Só os períodos oferecidos pela interface são reconhecidos, sempre em relação a `hoje`.
export function inferPeriod({ date, date_from: dateFrom, date_to: dateTo } = {}, hoje = todayInSaoPaulo()) {
  if (dateFrom === hoje && dateTo === addDays(hoje, 6)) return "week";
  if (dateFrom === hoje && dateTo === lastDayOfMonth(hoje)) return "month";
  if (date === hoje) return "today";
  return "any";
}

export function parseExploreSearch(search, hoje = todayInSaoPaulo()) {
  const raw = String(search ?? "").replace(/^\?/, "");
  const params = new URLSearchParams(raw);

  let period = inferPeriod(
    { date: params.get("date"), date_from: params.get("date_from"), date_to: params.get("date_to") },
    hoje,
  );
  const key = params.get("period");
  if (period === "any" && PERIOD_KEYS.includes(key)) period = key;

  const criteria = {
    term: normalizeTerm(params.get("q")),
    unit: uuidOrEmpty(params.get("unit")),
    category: uuidOrEmpty(params.get("category")),
    period,
  };
  const page = parsePage(params.get("page"));
  return { criteria, page, changed: buildExploreSearch(criteria, page, hoje) !== raw };
}

export function buildExploreSearch(criteria, page = 1, hoje = todayInSaoPaulo()) {
  const params = new URLSearchParams();
  const term = normalizeTerm(criteria?.term);
  if (term) params.set("q", term);
  if (criteria?.unit) params.set("unit", criteria.unit);
  if (criteria?.category) params.set("category", criteria.category);
  const range = periodRange(criteria?.period, hoje);
  for (const name of ["date", "date_from", "date_to"]) {
    if (range[name]) params.set(name, range[name]);
  }
  if (Number.isSafeInteger(page) && page > 1) params.set("page", String(page));
  return params.toString();
}

// Parâmetros de /activities/ (sem page/page_size): nada vazio, e date nunca junto de date_from/date_to.
export function toApiParams(criteria, hoje = todayInSaoPaulo()) {
  const params = {};
  const term = normalizeTerm(criteria?.term);
  if (term) params.q = term;
  if (criteria?.unit) params.unit = criteria.unit;
  if (criteria?.category) params.category = criteria.category;
  return { ...params, ...periodRange(criteria?.period, hoje) };
}

export { MAX_TERM_LENGTH };
