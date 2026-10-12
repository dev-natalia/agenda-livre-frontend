import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { WIDTHS } from "./helpers/viewports.js";
import { mockApi } from "./helpers/mock-api.js";

// A verificação automática encontra só parte dos problemas; teclado e leitor de tela ficam no quickstart.md.
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

async function scan(page) {
  const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  return violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`);
}

test.describe("estrutura", () => {
  test("um único h1, h2 de seção, h3 nos cards e ordem hero → pesquisa → próximas", async ({ page }) => {
    await mockApi(page);
    await page.goto("/index.html");
    await expect(page.locator("#upcoming-content article")).toHaveCount(3);

    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("main h2")).toHaveText(["O que você procura?", "Próximas atividades"]);
    await expect(page.locator("main h3")).toHaveCount(3);

    const order = await page.evaluate(() =>
      [".hero", ".quick-search", ".upcoming"].map((s) => document.querySelector(s).getBoundingClientRect().top),
    );
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  test("ilustração decorativa: alt vazio, fora da árvore de acessibilidade e sem ícone quebrado", async ({ page }) => {
    await mockApi(page);
    await page.route("**/images/hero-culture.svg", (route) => route.abort());
    await page.goto("/index.html");
    const image = page.locator(".hero__image");
    await expect(image).toHaveAttribute("alt", "");
    // Feature 011: o logo do cabeçalho é a única imagem exposta (nome acessível "Agenda Livre").
    await expect(page.getByRole("img")).toHaveCount(1);
    await expect(page.getByRole("img", { name: "Agenda Livre" })).toHaveCount(1);
    expect(await image.getAttribute("width")).not.toBeNull();
    expect(await image.getAttribute("height")).not.toBeNull();
  });

  for (const width of WIDTHS) {
    test(`sem rolagem horizontal em ${width}px (carregado e com erro)`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      const api = await mockApi(page);
      await page.goto("/index.html");
      await expect(page.locator("#upcoming-content article")).toHaveCount(3);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

      api.state.failActivities = 500;
      await page.reload();
      await expect(page.locator("#upcoming-content .error-state__message")).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    });
  }

  test("texto a 200% em 320px: nada é cortado e 'Explorar' segue operável", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await mockApi(page);
    await page.goto("/index.html");
    await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
    await expect(page.locator("#upcoming-content article")).toHaveCount(3);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const button = page.getByRole("button", { name: "Explorar" });
    await button.scrollIntoViewIfNeeded();
    await expect(button).toBeVisible();
    const box = await button.boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(320);
  });
});

test.describe("axe", () => {
  test("carregando", async ({ page }) => {
    await mockApi(page, { delayMs: 3000 });
    await page.goto("/index.html");
    await expect(page.locator("#upcoming-content .skeleton-card")).toHaveCount(3);
    expect(await scan(page)).toEqual([]);
  });

  test("com resultados", async ({ page }) => {
    await mockApi(page);
    await page.goto("/index.html");
    await expect(page.locator("#upcoming-content article")).toHaveCount(3);
    expect(await scan(page)).toEqual([]);
  });

  test("vazio", async ({ page }) => {
    await mockApi(page, { activities: [] });
    await page.goto("/index.html");
    await expect(page.locator("#upcoming-content")).toContainText("Não há atividades próximas");
    expect(await scan(page)).toEqual([]);
  });

  test("erro, com aviso de opções de filtro", async ({ page }) => {
    await mockApi(page, { failActivities: 500, failUnits: 500 });
    await page.goto("/index.html");
    await expect(page.locator("#upcoming-content .error-state__message")).toBeVisible();
    await expect(page.locator("#filter-options-status")).toContainText("Não foi possível carregar");
    expect(await scan(page)).toEqual([]);
  });
});

test.describe("teclado e console", () => {
  test("ordem de foco: skip link → menu → campo → filtros → Explorar → cards → Ver todas, sempre visível", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await mockApi(page);
    await page.goto("/index.html");
    await expect(page.locator("#upcoming-content article")).toHaveCount(3);

    const seen = [];
    for (let i = 0; i < 20; i += 1) {
      await page.keyboard.press("Tab");
      const info = await page.evaluate(() => {
        const el = document.activeElement;
        const cs = getComputedStyle(el);
        return {
          text: (el.id || el.getAttribute("aria-label") || el.textContent || el.name || "").trim().slice(0, 40),
          outline: cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0,
          shadow: cs.boxShadow !== "none",
          tag: el.tagName,
        };
      });
      seen.push(info);
      if (info.text === "Ver todas") break;
    }
    const names = seen.map((s) => s.text);
    const idx = (text) => names.findIndex((n) => n === text);
    expect(names[0]).toContain("Pular");
    expect(names.indexOf("search-q")).toBeGreaterThan(0);
    expect(names.indexOf("filter-unit")).toBeGreaterThan(names.indexOf("search-q"));
    expect(names.indexOf("filter-category")).toBeGreaterThan(names.indexOf("filter-unit"));
    expect(names.indexOf("filter-period")).toBeGreaterThan(names.indexOf("filter-category"));
    expect(idx("Explorar")).toBeGreaterThan(names.indexOf("filter-period"));
    expect(idx("Ver todas")).toBeGreaterThan(idx("Explorar"));
    for (const s of seen) expect(s.outline || s.shadow).toBe(true);
  });

  test("sem console.error em sucesso nem em falha", async ({ page }) => {
    const errors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error" && !/Failed to load resource/.test(msg.text())) errors.push(msg.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));
    const api = await mockApi(page);
    await page.goto("/index.html");
    await expect(page.locator("#upcoming-content article")).toHaveCount(3);
    api.state.failActivities = 500;
    await page.reload();
    await expect(page.locator("#upcoming-content .error-state__message")).toBeVisible();
    expect(errors).toEqual([]);
  });
});
