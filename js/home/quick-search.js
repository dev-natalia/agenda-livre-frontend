import { buildExploreUrl } from "./search-criteria.js";

// A pesquisa só é aplicada ao acionar "Explorar": nenhum listener de input/change consulta a API.
export function initQuickSearch(form, navigate = (url) => location.assign(url)) {
  let navigating = false;
  const field = (name) => form.elements[name]?.value ?? "";

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (navigating) return;
    navigating = true;
    navigate(
      buildExploreUrl({
        term: field("q"),
        unit: field("unit"),
        category: field("category"),
        audience: field("audience"),
        period: field("period"),
      }),
    );
  });

  // Voltar pelo histórico (cache de páginas) deve reabilitar o envio.
  window.addEventListener("pageshow", () => {
    navigating = false;
  });
}
