import { expect, test } from "@playwright/test";
import { scenarios } from "./helpers/a11y-matrix.js";
import { mountProbeCards } from "./helpers/viewports.js";

// Espaçamento de texto (WCAG 1.4.12), ampliação a 200% (1.4.4) e reflow a 320 px (1.4.10) nos estados
// com mais texto: nada se corta, nada se sobrepõe, nada rola na horizontal (FE-040, FR-027 a FR-029).
const SPACING = "* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }";
const ZOOM = "html { font-size: 200% !important; }";
const MODES = {
  "espaçamento de texto": SPACING,
  "texto a 200%": ZOOM,
  "200% com espaçamento": `${ZOOM} ${SPACING}`,
};

const targets = scenarios({
  states: ["carregada", "resultados", "vazio", "erro-api", "form-erros", "confirmacao"],
  widths: [1280, 320],
});

// Lê o layout: rolagem horizontal, texto cortado, controles sobrepostos e cabeçalho sobre o conteúdo.
function inspectLayout() {
  const visible = (el) => {
    const rect = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
  };
  const name = (el) => `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ""}${typeof el.className === "string" && el.className ? `.${el.className.split(" ")[0]}` : ""}`;

  const clipped = [...document.querySelectorAll("body *")]
    .filter((el) => visible(el) && el.textContent.trim() && !el.closest(".visually-hidden, .skeleton-card, svg, [aria-hidden='true']"))
    .filter((el) => {
      const style = getComputedStyle(el);
      const clips = ["hidden", "clip"].includes(style.overflowX) || ["hidden", "clip"].includes(style.overflowY);
      if (!clips) return false;
      return el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1;
    })
    .map(name);

  const controls = [...document.querySelectorAll("a[href], button, input, select, textarea")]
    .filter((el) => visible(el) && !el.matches(".skip-link"));
  const overlaps = [];
  for (let i = 0; i < controls.length; i += 1) {
    for (let j = i + 1; j < controls.length; j += 1) {
      const [a, b] = [controls[i], controls[j]];
      if (a.contains(b) || b.contains(a)) continue;
      const ra = a.getBoundingClientRect();
      const rb = b.getBoundingClientRect();
      const x = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
      const y = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
      if (x > 1 && y > 1) overlaps.push(`${name(a)} × ${name(b)}`);
    }
  }

  const header = document.querySelector("body > header")?.getBoundingClientRect();
  const main = document.querySelector("main")?.getBoundingClientRect();
  return {
    horizontalScroll: document.documentElement.scrollWidth > window.innerWidth,
    clipped,
    overlaps,
    headerOverMain: Boolean(header && main && header.bottom > main.top + 1),
  };
}

for (const [mode, css] of Object.entries(MODES)) {
  test.describe(mode, () => {
    for (const scenario of targets) {
      test(scenario.name, async ({ page }) => {
        await scenario.open(page);
        await page.addStyleTag({ content: css });
        // Um título de 200 caracteres sem espaços é o pior caso de quebra de linha nos cartões.
        if (scenario.state === "resultados" && scenario.page !== "atividade.html") await mountProbeCards(page, 2);
        if (scenario.width === 320) {
          const toggle = page.getByRole("button", { name: "Menu" });
          if (await toggle.isVisible()) await toggle.click();
        }
        await page.waitForTimeout(250);
        const layout = await page.evaluate(inspectLayout);
        expect(layout).toEqual({ horizontalScroll: false, clipped: [], overlaps: [], headerOverMain: false });
      });
    }
  });
}
