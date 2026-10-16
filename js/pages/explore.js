import { getConfigStatus } from "../config.js";
import { showConfigNotice } from "../components/config-notice.js";
import { initSiteNav } from "../components/site-nav.js";
import { initListing } from "../explore/listing.js";
import { initSearchForm } from "../explore/search-form.js";
import { readSnapshot, saveSnapshot, updateScroll } from "../explore/snapshot.js";
import { DEFAULT_CRITERIA, buildExploreSearch, parseExploreSearch } from "../explore/url-state.js";

const PAGE = "explorar.html";

const urlFor = (criteria, page) => {
  const search = buildExploreSearch(criteria, page);
  return search ? `${PAGE}?${search}` : PAGE;
};

const isPlainLeftClick = (event) =>
  event.button === 0 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey;

function cameFromHistory() {
  try {
    return performance.getEntriesByType("navigation")[0]?.type === "back_forward";
  } catch {
    return false;
  }
}

function restoreScroll(snapshot, content) {
  history.scrollRestoration = "manual";
  requestAnimationFrame(() => {
    if (snapshot.scrollY > 0) {
      window.scrollTo(0, snapshot.scrollY);
      return;
    }
    const link = snapshot.activityId
      ? [...content.querySelectorAll("a[href]")].find((a) => a.href.includes(encodeURIComponent(snapshot.activityId)))
      : null;
    link?.closest(".activity-card")?.scrollIntoView({ block: "center" });
  });
}

// O endereço é a fonte da verdade: cada aplicação, limpeza ou troca de página atualiza o histórico
// nativo e consulta a listagem; `popstate` e a volta dos detalhes releem o endereço.
export function init() {
  initSiteNav();

  const main = document.querySelector("main");
  if (!main) return;

  showConfigNotice(getConfigStatus());

  const els = {
    form: document.getElementById("explore-form"),
    term: document.getElementById("search-q"),
    unit: document.getElementById("filter-unit"),
    category: document.getElementById("filter-category"),
    audience: document.getElementById("filter-audience"),
    period: document.getElementById("filter-period"),
    clear: document.getElementById("explore-clear"),
    notice: document.getElementById("filter-options-status"),
    heading: document.getElementById("results-heading"),
    summary: document.getElementById("results-summary"),
    status: document.getElementById("results-status"),
    content: document.getElementById("results-content"),
    nav: document.getElementById("results-pagination"),
  };
  if (Object.values(els).some((el) => !el)) return;

  let applied = { criteria: { ...DEFAULT_CRITERIA }, page: 1 };
  const searchOf = ({ criteria, page }) => buildExploreSearch(criteria, page);

  const listing = initListing({
    content: els.content,
    status: els.status,
    summary: els.summary,
    nav: els.nav,
    // Página fora do intervalo: volta à página 1 dos mesmos critérios (uma única vez por navegação).
    onPageOutOfRange: ({ criteria }) => go(criteria, 1, { replace: true }),
    onLoaded: (state) => saveSnapshot(searchOf(state), state.data),
  });

  const form = initSearchForm({
    form: els.form,
    termInput: els.term,
    unitSelect: els.unit,
    categorySelect: els.category,
    audienceSelect: els.audience,
    periodSelect: els.period,
    clearButton: els.clear,
    noticeEl: els.notice,
    onApply: (criteria) => go(criteria, 1),
    onClear: () => go({ ...DEFAULT_CRITERIA }, 1),
  });

  // Atualiza o endereço (push se mudou, replace se igual ou a pedido) e consulta a listagem.
  function go(criteria, page, { replace = false, syncForm = true } = {}) {
    applied = { criteria, page };
    const target = urlFor(criteria, page);
    const current = `${location.pathname.split("/").pop() || PAGE}${location.search}`;
    if (replace || target === current) history.replaceState(null, "", target);
    else history.pushState(null, "", target);
    if (syncForm) form.setCriteria(criteria);
    return listing.load(applied);
  }

  // `useCache`: volta pelo histórico/dos detalhes. A cópia vale 5 minutos; fora disso, consulta a API.
  function restoreFromAddress({ useCache = false } = {}) {
    const parsed = parseExploreSearch(location.search);
    applied = { criteria: parsed.criteria, page: parsed.page };
    if (parsed.changed) history.replaceState(null, "", urlFor(parsed.criteria, parsed.page));
    form.setCriteria(parsed.criteria);

    const snapshot = useCache ? readSnapshot(searchOf(applied)) : null;
    if (snapshot && listing.showCached(applied, snapshot)) {
      restoreScroll(snapshot, els.content);
      return Promise.resolve();
    }
    return listing.load(applied);
  }

  // Guarda a rolagem e o card acionado para a volta dos detalhes.
  els.content.addEventListener("click", (event) => {
    const link = event.target.closest?.(".activity-card a[href]");
    if (!link) return;
    const id = new URL(link.href).searchParams.get("id");
    updateScroll(searchOf(applied), window.scrollY, id);
  });
  window.addEventListener("pagehide", () => updateScroll(searchOf(applied), window.scrollY));

  // Links de página: clique simples atualiza sem recarregar; Ctrl/Cmd/nova aba seguem o link normal.
  els.nav.addEventListener("click", (event) => {
    const link = event.target.closest?.("a[href]");
    if (!link || !isPlainLeftClick(event)) return;
    event.preventDefault();
    const page = parseExploreSearch(new URL(link.href).search).page;
    // Trocar de página não descarta o que a pessoa está editando nos campos.
    go(applied.criteria, page, { syncForm: false });
    // O link clicado deixa de existir na reconstrução: o foco vai para o início da lista.
    els.heading.focus();
  });

  window.addEventListener("popstate", () => restoreFromAddress({ useCache: true }));

  // Opções em paralelo com a primeira listagem; critério removido é descartado e a lista refeita.
  restoreFromAddress({ useCache: cameFromHistory() });
  form
    .loadOptions()
    .then(({ dropped }) => {
      if (!dropped.unit && !dropped.category && !dropped.audience) return;
      const criteria = {
        ...applied.criteria,
        unit: dropped.unit ? "" : applied.criteria.unit,
        category: dropped.category ? "" : applied.criteria.category,
        audience: dropped.audience ? "" : applied.criteria.audience,
      };
      return go(criteria, applied.page, { replace: true });
    })
    .catch(() => {});
}

init();
