import { ApiError } from "../api/errors.js";
import { defaultIcon } from "../components/activity-card.js";
import { createActivityMedia } from "../components/activity-media.js";
import {
  createCalendarIcon,
  createClockIcon,
  createLocationIcon,
  prependIcon,
  setCategorySlug,
} from "../components/activity-icons.js";
import { safeExternalUrl } from "./external-link.js";
import { scheduleViews } from "./schedule-model.js";

const NO_DATE_TEXT = "Sem data prevista";

const hasText = (value) => typeof value === "string" && value.trim() !== "";

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function section(title, ...children) {
  const node = el("section", "activity-details__section");
  node.append(el("h2", "activity-details__section-title", title), ...children);
  return node;
}

function fallbackMedia() {
  const box = el("div", "activity-details__media image-fallback");
  box.setAttribute("aria-hidden", "true");
  const icon = defaultIcon();
  icon.setAttribute("aria-hidden", "true");
  icon.setAttribute("focusable", "false");
  box.append(icon);
  return box;
}

function media(image) {
  return createActivityMedia(image, { className: "activity-details__media", createFallback: fallbackMedia });
}

function header(data) {
  const box = el("header", "activity-details__header");
  if (hasText(data.category?.name)) box.append(setCategorySlug(el("p", "activity-details__category", data.category.name), data.category));
  const title = el("h1", "activity-details__title", data.title.trim());
  title.tabIndex = -1;
  box.append(title);
  if (hasText(data.summary)) box.append(el("p", "activity-details__summary", data.summary.trim()));
  if (hasText(data.unit?.name)) box.append(prependIcon(el("p", "activity-details__unit", data.unit.name.trim()), createLocationIcon));
  return box;
}

function whenSection(data) {
  const { items, upcoming } = scheduleViews(data.schedules, data.next_occurrences);
  const children = [];

  if (items.length) {
    const list = el("ul", "activity-details__schedules");
    for (const item of items) {
      const li = el("li", "activity-details__schedule");
      li.append(prependIcon(el("p", "activity-details__period", item.periodLabel), createCalendarIcon));
      if (item.weekdaysLabel) li.append(el("p", "activity-details__weekdays", item.weekdaysLabel));
      if (item.timeLabel) li.append(prependIcon(el("p", "activity-details__time", item.timeLabel), createClockIcon));
      list.append(li);
    }
    children.push(list);
  }

  if (upcoming.length) {
    const list = el("ul", "activity-details__upcoming");
    for (const occurrence of upcoming) {
      const li = el("li");
      const time = el("time", undefined, occurrence.label);
      time.setAttribute("datetime", occurrence.datetime);
      li.append(time);
      list.append(li);
    }
    children.push(el("h3", "activity-details__subtitle", "Próximas datas"), list);
  } else {
    children.push(el("p", "activity-details__no-date", NO_DATE_TEXT));
  }
  return section("Quando", ...children);
}

function audienceSection(data) {
  const names = (Array.isArray(data.target_audiences) ? data.target_audiences : [])
    .map((audience) => audience?.name)
    .filter(hasText);
  const notes = hasText(data.target_audience_notes) ? data.target_audience_notes.trim() : null;
  if (!names.length && !notes) return null;

  const children = [];
  if (names.length) {
    const list = el("ul", "activity-details__audiences");
    for (const name of names) list.append(el("li", undefined, name.trim()));
    children.push(list);
  }
  if (notes) children.push(el("p", "activity-details__notes", notes));
  return section("Público", ...children);
}

function descriptionSection(data) {
  if (!hasText(data.description)) return null;
  return section("Sobre a atividade", el("p", "activity-details__description", data.description.trim()));
}

function placeSection(data) {
  const lines = [data.unit?.address, data.unit?.neighborhood].filter(hasText).map((line) => line.trim());
  if (!lines.length) return null;
  const children = lines.map((line, index) => {
    const paragraph = el("p", "activity-details__place", line);
    return index === 0 ? prependIcon(paragraph, createLocationIcon) : paragraph;
  });
  return section("Local", ...children);
}

function externalLink(data) {
  const href = safeExternalUrl(data.external_registration_url);
  if (!href) return null;
  const link = el("a", "button external-link");
  link.href = href;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.append(document.createTextNode("Inscrição ou informações (site externo, abre em nova aba)"));
  const wrapper = el("p", "activity-details__actions");
  wrapper.append(link);
  return wrapper;
}

// Dados da API só entram por textContent/atributos. Seções sem conteúdo não são criadas.
export function renderDetails(data) {
  if (!data || typeof data !== "object" || !hasText(data.id) || !hasText(data.title)) {
    throw new ApiError("invalid_response");
  }
  const article = el("article", "activity-details__article");
  // Informações práticas (quando, público, local, inscrição) ficam num bloco próprio, que o CSS
  // coloca ao lado do texto em telas largas; a descrição longa segue depois dele.
  const practical = el("div", "activity-details__practical");
  practical.append(whenSection(data));
  for (const part of [audienceSection(data), placeSection(data), externalLink(data)]) {
    if (part) practical.append(part);
  }
  article.append(media(data.image), header(data), practical);
  const description = descriptionSection(data);
  if (description) article.append(description);
  return [article];
}

export function renderNotFound() {
  const box = el("section", "not-found");
  const title = el("h1", "not-found__title", "Atividade não encontrada ou não disponível");
  title.tabIndex = -1;
  const actions = el("p", "not-found__actions");
  const explore = el("a", "button", "Explorar outras atividades");
  explore.href = "explorar.html";
  const home = el("a", "button button--outline", "Voltar ao Início");
  home.href = "index.html";
  actions.append(explore, home);
  box.append(
    title,
    el("p", "not-found__text", "O link pode estar incorreto ou a atividade pode ter sido encerrada ou removida."),
    actions,
  );
  return [box];
}
