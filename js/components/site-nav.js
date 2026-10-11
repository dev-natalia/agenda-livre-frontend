// Menu móvel como botão de divulgação (disclosure): o HTML traz os links visíveis e o botão
// oculto; este módulo só recolhe a lista em tela estreita, então sem JS a navegação segue acessível.
// 48rem precisa coincidir com o ponto de troca em css/layout.css.
const NARROW_QUERY = "(max-width: 47.99rem)";

let current = null;

export function initSiteNav(root = document) {
  if (current) return current;

  const button = root.querySelector(".site-header__toggle");
  const list = root.querySelector("#site-nav-list");
  if (!button || !list) return null;

  const media = window.matchMedia(NARROW_QUERY);
  let expanded = false;

  function render() {
    if (media.matches) {
      button.hidden = false;
      button.setAttribute("aria-expanded", String(expanded));
      list.hidden = !expanded;
    } else {
      button.hidden = true;
      list.hidden = false;
    }
  }

  function setExpanded(value) {
    expanded = value;
    render();
  }

  function onToggle() {
    setExpanded(!expanded);
  }

  function onKeydown(event) {
    if (event.key !== "Escape" || !media.matches || !expanded) return;
    setExpanded(false);
    button.focus();
  }

  function onMediaChange() {
    expanded = false;
    render();
  }

  button.addEventListener("click", onToggle);
  root.addEventListener("keydown", onKeydown);
  media.addEventListener("change", onMediaChange);
  render();

  current = {
    destroy() {
      button.removeEventListener("click", onToggle);
      root.removeEventListener("keydown", onKeydown);
      media.removeEventListener("change", onMediaChange);
      current = null;
    },
  };
  return current;
}
