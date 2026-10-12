import { initSiteNav } from "../components/site-nav.js";

// Página estática: não usa a API (DOC-05 §3.3), então não exibe o aviso de configuração.
export function init() {
  initSiteNav();
}

init();
