import { initContactForm } from "../contact/form.js";
import { initSiteNav } from "../components/site-nav.js";

// Página estática e demonstrativa: não usa a API (DOC-05 §3.3) nem envia dados.
export function init() {
  initSiteNav();
  initContactForm();
}

init();
