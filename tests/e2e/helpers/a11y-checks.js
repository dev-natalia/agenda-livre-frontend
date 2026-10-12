// Leituras de página compartilhadas pelos testes transversais de acessibilidade.

// Títulos visíveis, na ordem do documento.
export const headingOutline = (page) =>
  page.evaluate(() =>
    [...document.querySelectorAll("h1, h2, h3, h4, h5, h6, [role=heading]")]
      .filter((el) => el.getClientRects().length > 0 && getComputedStyle(el).visibility !== "hidden")
      .map((el) => ({
        level: el.getAttribute("aria-level") ? Number(el.getAttribute("aria-level")) : Number(el.tagName[1]),
        text: el.textContent.trim().replace(/\s+/g, " "),
      })),
  );

// Contagem de regiões por papel (landmarks), sem contar as ocultas.
export const landmarks = (page) =>
  page.evaluate(() => {
    const visible = (el) => el.getClientRects().length > 0;
    const count = (selector) => [...document.querySelectorAll(selector)].filter(visible).length;
    return {
      banner: count("body > header, [role=banner]"),
      main: count("main, [role=main]"),
      contentinfo: count("body > footer, [role=contentinfo]"),
      navigation: [...document.querySelectorAll("nav, [role=navigation]")]
        .filter(visible)
        .map((el) => el.getAttribute("aria-label") ?? el.getAttribute("aria-labelledby") ?? ""),
    };
  });

// Nome acessível aproximado (aria-labelledby, aria-label, conteúdo de texto, alt de imagens internas, title).
export const accessibleName = (locator) =>
  locator.evaluate((el) => {
    const byId = (ids) =>
      ids
        .split(/\s+/)
        .map((id) => document.getElementById(id)?.textContent ?? "")
        .join(" ");
    const text = (node) => {
      if (node.nodeType === Node.TEXT_NODE) return node.textContent;
      if (node.nodeType !== Node.ELEMENT_NODE) return "";
      if (node.getAttribute("aria-hidden") === "true") return "";
      const style = getComputedStyle(node);
      if (style.display === "none" || style.visibility === "hidden") return "";
      if (node.tagName === "IMG") return node.getAttribute("alt") ?? "";
      if (node.tagName === "svg") return node.getAttribute("aria-label") ?? "";
      return [...node.childNodes].map(text).join(" ");
    };
    const labelled = el.getAttribute("aria-labelledby");
    const name =
      (labelled && byId(labelled)) ||
      el.getAttribute("aria-label") ||
      text(el) ||
      el.getAttribute("title") ||
      "";
    return name.replace(/\s+/g, " ").trim();
  });

export const activeElementId = (page) => page.evaluate(() => document.activeElement?.id ?? "");

// Descrição curta do elemento com foco, para diagnóstico.
const describe = () => {
  const el = document.activeElement;
  if (!el || el === document.body) return null;
  const rect = el.getBoundingClientRect();
  const hiddenAncestor = el.closest("[hidden], [inert], [aria-hidden=true]");
  const style = getComputedStyle(el);
  return {
    tag: el.tagName.toLowerCase(),
    id: el.id,
    text: (el.getAttribute("aria-label") ?? el.textContent ?? el.value ?? "").trim().replace(/\s+/g, " ").slice(0, 60),
    box: { top: rect.top + scrollY, left: rect.left + scrollX, width: rect.width, height: rect.height },
    hidden: Boolean(hiddenAncestor) || style.display === "none" || style.visibility === "hidden" || rect.width === 0 || rect.height === 0,
    inNav: Boolean(el.closest("nav[aria-label='Navegação principal']")),
  };
};

// Pressiona Tab a partir do início do documento e devolve os elementos que recebem foco, em ordem.
// Para quando o foco sai da página (volta ao body), repete um elemento ou atinge `maxSteps`.
export async function focusOrder(page, maxSteps = 120) {
  await page.evaluate(() => {
    document.activeElement?.blur?.();
    window.scrollTo(0, 0);
  });
  const visited = [];
  for (let step = 0; step < maxSteps; step += 1) {
    await page.keyboard.press("Tab");
    const info = await page.evaluate(describe);
    if (!info) return { visited, left: true };
    const previous = visited.at(-1);
    visited.push(info);
    if (previous && previous.tag === info.tag && previous.id === info.id && previous.text === info.text
      && previous.box.top === info.box.top && previous.box.left === info.box.left) {
      return { visited, left: false, stuck: true };
    }
  }
  return { visited, left: false };
}
