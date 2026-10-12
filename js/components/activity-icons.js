// Ícones de apoio dos metadados de atividade (localização, data, horário) e a validação do
// identificador de categoria usado para a cor da etiqueta. Os ícones são decorativos: o texto
// ao lado continua sendo a informação. Tudo é montado por DOM, nunca por innerHTML.

const SVG_NS = "http://www.w3.org/2000/svg";

function createIcon(shapes) {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("class", "meta-icon");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", "16");
  svg.setAttribute("height", "16");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "1.75");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  for (const [tag, attributes] of shapes) {
    const shape = document.createElementNS(SVG_NS, tag);
    for (const [name, value] of Object.entries(attributes)) shape.setAttribute(name, value);
    svg.append(shape);
  }
  return svg;
}

export const createLocationIcon = () =>
  createIcon([
    ["path", { d: "M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" }],
    ["circle", { cx: "12", cy: "9.5", r: "2.5" }],
  ]);

export const createCalendarIcon = () =>
  createIcon([
    ["rect", { x: "3", y: "5", width: "18", height: "16", rx: "2" }],
    ["path", { d: "M3 10h18M8 3v4M16 3v4" }],
  ]);

export const createClockIcon = () =>
  createIcon([
    ["circle", { cx: "12", cy: "12", r: "9" }],
    ["path", { d: "M12 7v5l3 2" }],
  ]);

// Coloca o ícone antes do conteúdo atual do elemento, que passa a ficar em um <span>.
// O nome acessível e o texto do elemento não mudam (o SVG é aria-hidden e não tem texto).
export function prependIcon(element, makeIcon) {
  const label = document.createElement("span");
  label.append(...element.childNodes);
  element.classList.add("meta-line");
  element.append(makeIcon(), label);
  return element;
}

const SLUG = /^[a-z0-9-]+$/;

// A cor da etiqueta vem de seletores `[data-category="<slug>"]` no CSS. O slug vem da API,
// então só um identificador simples é gravado; qualquer outro valor deixa a etiqueta neutra.
export function setCategorySlug(element, category) {
  const slug = category?.slug;
  if (typeof slug === "string" && SLUG.test(slug)) element.setAttribute("data-category", slug);
  return element;
}
