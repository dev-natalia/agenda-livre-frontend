import { addDays, lastDayOfMonth, todayInSaoPaulo } from "../utils/dates.js";

export const MAX_TERM_LENGTH = 100;

export const PERIODS = Object.freeze([
  { key: "any", label: "Qualquer data" },
  { key: "today", label: "Hoje" },
  { key: "week", label: "Próximos 7 dias" },
  { key: "month", label: "Este mês" },
]);

const EXPLORE_PAGE = "explorar.html";

export function normalizeTerm(value) {
  return String(value ?? "")
    .trim()
    .slice(0, MAX_TERM_LENGTH)
    .trim();
}

// `hoje` é AAAA-MM-DD no fuso de São Paulo. `date` nunca coexiste com `date_from`/`date_to` (a API recusa).
export function periodRange(key, hoje) {
  switch (key) {
    case "today":
      return { date: hoje };
    case "week":
      return { date_from: hoje, date_to: addDays(hoje, 6) };
    case "month":
      return { date_from: hoje, date_to: lastDayOfMonth(hoje) };
    default:
      return {};
  }
}

function present(value) {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

// Contrato: specs/005-home-page/contracts/explore-url.md. Padrões e vazios não entram.
export function buildExploreUrl({ term, unit, category, period } = {}, hoje = todayInSaoPaulo()) {
  const params = new URLSearchParams();
  const q = normalizeTerm(term);
  if (q) params.set("q", q);
  if (present(unit)) params.set("unit", present(unit));
  if (present(category)) params.set("category", present(category));
  const range = periodRange(period, hoje);
  for (const key of ["date", "date_from", "date_to"]) {
    if (range[key]) params.set(key, range[key]);
  }
  const query = params.toString();
  return query ? `${EXPLORE_PAGE}?${query}` : EXPLORE_PAGE;
}
