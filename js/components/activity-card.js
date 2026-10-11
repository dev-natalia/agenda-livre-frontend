import { activityDetailsUrl, formatOccurrence } from "../utils/format.js";

const SVG_NS = "http://www.w3.org/2000/svg";
const NO_DATE_TEXT = "Sem data prevista";

function hasText(value) {
  return typeof value === "string" && value.trim() !== "";
}

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

// Ícone padrão (calendário), puramente decorativo.
function defaultIcon() {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", "48");
  svg.setAttribute("height", "48");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "1.5");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  const rect = document.createElementNS(SVG_NS, "rect");
  for (const [name, value] of [["x", "3"], ["y", "5"], ["width", "18"], ["height", "16"], ["rx", "2"]]) {
    rect.setAttribute(name, value);
  }
  const path = document.createElementNS(SVG_NS, "path");
  path.setAttribute("d", "M3 10h18M8 3v4M16 3v4");
  svg.append(rect, path);
  return svg;
}

function createFallback(activity, categoryIcons) {
  const media = createElement("div", "activity-card__media image-fallback");
  media.setAttribute("aria-hidden", "true");
  const makeIcon = categoryIcons[activity.category?.slug] ?? defaultIcon;
  const icon = makeIcon();
  icon.setAttribute("aria-hidden", "true");
  icon.setAttribute("focusable", "false");
  media.append(icon);
  return media;
}

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function createMedia(activity, categoryIcons) {
  const fallback = () => createFallback(activity, categoryIcons);
  const image = activity.image;
  if (!image || !isHttpUrl(image.url)) return fallback();

  const media = createElement("div", "activity-card__media");
  const img = document.createElement("img");
  img.src = image.url;
  img.alt = typeof image.alt === "string" ? image.alt : "";
  img.loading = "lazy";
  img.addEventListener("error", () => media.replaceWith(fallback()), { once: true });
  media.append(img);
  return media;
}

function unitLabel(unit) {
  if (!unit || !hasText(unit.name)) return null;
  return hasText(unit.neighborhood) ? `${unit.name} · ${unit.neighborhood}` : unit.name;
}

function createWhen(occurrence) {
  const formatted = formatOccurrence(occurrence);
  const when = createElement("p", "activity-card__when");
  if (!formatted) {
    when.textContent = NO_DATE_TEXT;
    return when;
  }
  const time = document.createElement("time");
  time.setAttribute("datetime", formatted.datetime);
  time.textContent = formatted.timeLabel ? `${formatted.dateLabel} · ${formatted.timeLabel}` : formatted.dateLabel;
  when.append(time);
  return when;
}

// Os dados vêm da API: sempre textContent/atributos, nunca innerHTML.
export function createActivityCard(activity, { headingLevel = 3, categoryIcons = {} } = {}) {
  if (!activity || !hasText(activity.id) || !hasText(activity.title)) return null;

  const card = createElement("article", "activity-card");
  card.append(createMedia(activity, categoryIcons));

  const body = createElement("div", "activity-card__body");
  if (hasText(activity.category?.name)) {
    body.append(createElement("p", "activity-card__category", activity.category.name));
  }

  const level = Math.min(6, Math.max(2, Number(headingLevel) || 3));
  const heading = createElement(`h${level}`, "activity-card__title");
  const link = document.createElement("a");
  link.href = activityDetailsUrl(activity.id);
  link.textContent = activity.title;
  heading.append(link);
  body.append(heading);

  const unit = unitLabel(activity.unit);
  if (unit) body.append(createElement("p", "activity-card__unit", unit));

  body.append(createWhen(activity.next_occurrence));
  card.append(body);
  return card;
}
