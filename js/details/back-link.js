const isPlainLeftClick = (event) =>
  event.button === 0 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey;

function cameFromExplore(referrer, origin) {
  try {
    const url = new URL(referrer);
    return url.origin === origin && url.pathname.endsWith("/explorar.html");
  } catch {
    return false;
  }
}

// O link sempre aponta para a Explorar. Vindo dela, o clique simples volta pelo histórico, o que
// reaproveita a restauração de termo, filtros, página e rolagem da própria Explorar.
export function initBackLink(
  link,
  { referrer = document.referrer, historyRef = history, origin = location.origin } = {},
) {
  if (!link || !cameFromExplore(referrer, origin)) return;
  link.addEventListener("click", (event) => {
    if (!isPlainLeftClick(event) || !(historyRef.length > 1)) return;
    event.preventDefault();
    historyRef.back();
  });
}
