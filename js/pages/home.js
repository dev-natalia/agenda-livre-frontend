import { getConfigStatus } from "../config.js";
import { showConfigNotice } from "../components/config-notice.js";
import { initSiteNav } from "../components/site-nav.js";
import { initFilterOptions } from "../home/filter-options.js";
import { initQuickSearch } from "../home/quick-search.js";
import { initUpcoming } from "../home/upcoming-activities.js";

// Cada parte é isolada: a falha de uma não impede as demais.
export function init() {
  initSiteNav();

  const main = document.querySelector("main");
  if (!main) return;

  showConfigNotice(getConfigStatus());

  const form = document.getElementById("quick-search-form");
  if (form) initQuickSearch(form);

  const unitSelect = document.getElementById("filter-unit");
  const categorySelect = document.getElementById("filter-category");
  const optionsStatus = document.getElementById("filter-options-status");
  if (unitSelect && categorySelect && optionsStatus) {
    initFilterOptions({ unitSelect, categorySelect, statusEl: optionsStatus }).catch(() => {});
  }

  const content = document.getElementById("upcoming-content");
  const status = document.getElementById("upcoming-status");
  if (content && status) initUpcoming({ content, status }).load();
}

init();
