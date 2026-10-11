import { getConfigStatus } from "../config.js";
import { showConfigNotice } from "../components/config-notice.js";

export function init() {
  const main = document.querySelector("main");
  if (!main) return;

  showConfigNotice(getConfigStatus());
}

init();
