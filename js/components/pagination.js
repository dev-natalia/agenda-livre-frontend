function item(child) {
  const li = document.createElement("li");
  li.className = "pagination__item";
  li.append(child);
  return li;
}

function link(text, href, className, label) {
  const a = document.createElement("a");
  a.className = className;
  a.href = href;
  a.textContent = text;
  if (label) a.setAttribute("aria-label", label);
  return a;
}

function disabled(text) {
  const span = document.createElement("span");
  span.className = "pagination__link pagination__link--disabled";
  span.setAttribute("aria-disabled", "true");
  span.textContent = text;
  return span;
}

function step(text, target, hrefFor, rel) {
  if (target === null) return item(disabled(text));
  const a = link(text, hrefFor(target), "pagination__link", `${text} (página ${target})`);
  a.rel = rel;
  return item(a);
}

// Links navegam: cada página é um <a href> real (funciona em nova aba e sem JavaScript).
export function renderPagination(nav, model, hrefFor) {
  nav.replaceChildren();
  if (!model) {
    nav.hidden = true;
    return;
  }

  const list = document.createElement("ul");
  list.className = "pagination__list";
  list.append(step("Anterior", model.previous, hrefFor, "prev"));

  for (const entry of model.items) {
    if (entry.type === "gap") {
      const gap = document.createElement("span");
      gap.className = "pagination__gap";
      gap.setAttribute("aria-hidden", "true");
      gap.textContent = "…";
      list.append(item(gap));
    } else if (entry.number === model.current) {
      const current = link(String(entry.number), hrefFor(entry.number), "pagination__link pagination__link--current", `Página ${entry.number}, atual`);
      current.setAttribute("aria-current", "page");
      list.append(item(current));
    } else {
      list.append(item(link(String(entry.number), hrefFor(entry.number), "pagination__link", `Ir para a página ${entry.number}`)));
    }
  }

  list.append(step("Próxima", model.next, hrefFor, "next"));
  nav.append(list);
  nav.hidden = false;
}
