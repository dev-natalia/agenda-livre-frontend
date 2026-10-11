import { expect, test } from "@playwright/test";
import { PAGES, mountProbeCards } from "./helpers/viewports.js";

function channel(v) {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function parseRgb(value) {
  const m = value.match(/rgba?\(([\d.]+)[, ]+([\d.]+)[, ]+([\d.]+)/);
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
}

function ratio(a, b) {
  const l = (rgb) => 0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2]);
  const [hi, lo] = [l(a), l(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

async function mountControls(page) {
  await page.evaluate(() => {
    const box = document.createElement("div");
    box.id = "probe-controls";
    box.innerHTML = `
      <p>Texto com <a id="probe-link" href="sobre.html">um link</a> no meio.</p>
      <button id="probe-primary" class="button button--primary" type="button">Primário</button>
      <button id="probe-secondary" class="button button--secondary" type="button">Secundário</button>
      <button id="probe-outline" class="button button--outline" type="button">Contornado</button>
      <button id="probe-disabled" class="button button--primary" type="button" disabled>Desabilitado</button>
      <label for="probe-input">Campo</label><input id="probe-input" type="text">`;
    document.querySelector("main").append(box);
  });
}

const style = (page, selector, props) =>
  page.evaluate(
    ({ selector, props }) => {
      const cs = getComputedStyle(document.querySelector(selector));
      return Object.fromEntries(props.map((p) => [p, cs.getPropertyValue(p)]));
    },
    { selector, props },
  );

test.describe("consistência visual", () => {
  for (const path of PAGES) {
    test(`${path}: títulos em Poppins e texto em Inter`, async ({ page }) => {
      await page.goto(`/${path}`);
      const h1 = await style(page, "h1", ["font-family"]);
      const body = await style(page, "body", ["font-family"]);
      expect(h1["font-family"]).toMatch(/Poppins/);
      expect(body["font-family"]).toMatch(/Inter/);
    });
  }

  test("links em texto corrido são sublinhados e botões têm forma própria", async ({ page }) => {
    await page.goto("/index.html");
    await mountControls(page);
    const link = await style(page, "#probe-link", ["text-decoration-line"]);
    expect(link["text-decoration-line"]).toContain("underline");
    for (const id of ["primary", "secondary", "outline"]) {
      const b = await style(page, `#probe-${id}`, ["border-top-width", "min-height", "text-decoration-line"]);
      expect(parseFloat(b["border-top-width"])).toBeGreaterThanOrEqual(2);
      expect(parseFloat(b["min-height"])).toBeGreaterThanOrEqual(44);
    }
  });

  test("texto dos botões atinge contraste 4,5:1", async ({ page }) => {
    await page.goto("/index.html");
    await mountControls(page);
    for (const id of ["primary", "secondary", "outline"]) {
      const s = await style(page, `#probe-${id}`, ["color", "background-color"]);
      let bg = parseRgb(s["background-color"]);
      if (!bg || s["background-color"].includes(", 0)")) bg = [255, 255, 255];
      expect(ratio(parseRgb(s.color), bg), `botão ${id}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  test("foco por teclado é visível em link, botões, campo e botão de menu", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto("/index.html");
    await mountControls(page);
    for (const selector of ["#probe-link", "#probe-primary", "#probe-secondary", "#probe-outline", "#probe-input", ".site-header__toggle"]) {
      await page.locator(selector).focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      const f = await style(page, selector, ["outline-width", "outline-style", "outline-color"]);
      expect(f["outline-style"], selector).not.toBe("none");
      expect(parseFloat(f["outline-width"]), selector).toBeGreaterThanOrEqual(3);
      const bg = parseRgb(await page.evaluate(() => getComputedStyle(document.body).backgroundColor));
      expect(ratio(parseRgb(f["outline-color"]), bg), selector).toBeGreaterThanOrEqual(3);
    }
  });

  test("botão desabilitado tem borda tracejada além da cor", async ({ page }) => {
    await page.goto("/index.html");
    await mountControls(page);
    const d = await style(page, "#probe-disabled", ["border-top-style", "cursor"]);
    expect(d["border-top-style"]).toBe("dashed");
    expect(d.cursor).toBe("not-allowed");
  });

  test("etiqueta de categoria mostra o nome escrito", async ({ page }) => {
    await page.goto("/index.html");
    await mountProbeCards(page, 2);
    await expect(page.locator(".activity-card__category").first()).toHaveText("Cultura e Artes");
  });

  test("sem as fontes, o texto continua visível e sem sobreposição", async ({ page }) => {
    await page.route("**/fonts/**", (route) => route.abort());
    await page.goto("/index.html");
    const h1 = await style(page, "h1", ["opacity", "visibility"]);
    expect(h1.opacity).toBe("1");
    expect(h1.visibility).toBe("visible");
    const overlap = await page.evaluate(() => {
      const header = document.querySelector("header").getBoundingClientRect();
      const main = document.querySelector("main").getBoundingClientRect();
      return header.bottom > main.top + 1;
    });
    expect(overlap).toBe(false);
  });

  test("estados de região distinguem-se sem depender da cor", async ({ page }) => {
    await page.goto("/index.html");
    await page.evaluate(() => {
      const main = document.querySelector("main");
      for (const [cls, label] of [["error-state__message", "e"], ["region-state__loading", "l"], ["region-state__empty", "v"]]) {
        const p = document.createElement("p");
        p.className = cls;
        p.id = `probe-${label}`;
        p.textContent = label;
        main.append(p);
      }
    });
    const sig = async (id) => {
      const s = await style(page, id, ["border-top-style", "border-left-style", "border-left-width"]);
      return `${s["border-top-style"]}|${s["border-left-style"]}|${s["border-left-width"]}`;
    };
    const signatures = [await sig("#probe-e"), await sig("#probe-l"), await sig("#probe-v")];
    expect(new Set(signatures).size).toBe(3);
  });
});
