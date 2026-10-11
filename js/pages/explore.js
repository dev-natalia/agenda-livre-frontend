import { getConfigStatus } from "../config.js";
import { showConfigNotice } from "../components/config-notice.js";
import { initSiteNav } from "../components/site-nav.js";

export function init() {
  initSiteNav();

  const main = document.querySelector("main");
  if (!main) return;

  showConfigNotice(getConfigStatus());
}

init();
