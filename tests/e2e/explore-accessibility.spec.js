import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { WIDTHS } from "./helpers/viewports.js";
import { makeListing, mockApi } from "./helpers/mock-api.js";

// A verificação automática encontra só parte dos problemas; teclado e leitor de tela ficam no quickstart.md.
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

const listingOf = (total) => (url) => ({
  body: makeListing(total, { page: Number(url.searchParams.get("page") ?? 1) }),
});
const cards = (page) => page.locator("#results-content .activity-card");
const noHorizontalScroll = (page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);

async function scan(page) {
  const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  return violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`);
}

test.describe("estrutura", () => {
  test("um único h1, h2 de resultados, h3 nos cards e ordem filtros → resultados → paginação", async ({ page }) => {
    await mockApi(page, { activitiesResponder: listingOf(27) });
    await page.goto("/explorar.html");
    await expect(cards(page)).toHaveCount(12);

    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("main h2")).toHaveText(["Resultados"]);
    await expect(page.locator("main h3")).toHaveCount(12);
    await expect(page.getByRole("search", { name: "Pesquisar atividades" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Explorar atividades" }).first()).toHaveAttribute("aria-current", "page");

    const order = await page.evaluate(() =>
      ["#explore-form", "#results-heading", "#results-content", "#results-pagination"].map(
        (s) => document.querySelector(s).getBoundingClientRect().top,
      ),
    );
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  test("rótulos visíveis associados a todos os campos", async ({ page }) => {
    await mockApi(page, { activitiesResponder: listingOf(5) });
    await page.goto("/explorar.html");
    for (const label of ["Buscar por nome da atividade", "Unidade", "Categoria", "Público-alvo", "Quando?"]) {
      await expect(page.getByLabel(label)).toBeVisible();
      await expect(page.locator("label", { hasText: label })).toBeVisible();
    }
  });

  test("os esqueletos ficam ocultos das tecnologias assistivas e há uma única região de status", async ({ page }) => {
    await mockApi(page, { activitiesResponder: (url) => ({ body: makeListing(5), delayMs: 1500 }) });
    await page.goto("/explorar.html");
    await expect(page.locator("#results-content .skeleton-card")).toHaveCount(12);
    const hidden = await page
      .locator("#results-content .skeleton-card")
      .evaluateAll((els) => els.every((el) => el.getAttribute("aria-hidden") === "true"));
    expect(hidden).toBe(true);
    await expect(page.locator("main [aria-live='polite']")).toHaveCount(1);
  });

  test("o total é anunciado na região de status, sem mover o foco", async ({ page }) => {
    await mockApi(page, { activitiesResponder: listingOf(27) });
    await page.goto("/explorar.html");
    await expect(cards(page)).toHaveCount(12);
    await page.getByLabel("Buscar por nome da atividade").focus();
    await page.getByLabel("Buscar por nome da atividade").fill("oficina");
    await page.getByRole("button", { name: "Filtrar" }).focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#results-status")).toHaveText("27 atividades encontradas.");
    await expect(page.getByRole("button", { name: "Filtrar" })).toBeFocused();
  });

  for (const width of WIDTHS) {
    test(`sem rolagem horizontal em ${width}px (resultados, vazio e erro)`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await mockApi(page, {
        activitiesResponder: (url) =>
          url.searchParams.get("q") === "erro"
            ? { status: 500, body: { detail: "x" } }
            : { body: makeListing(url.searchParams.get("q") === "nada" ? 0 : 240, { page: Number(url.searchParams.get("page") ?? 1) }) },
      });
      await page.goto("/explorar.html?page=10");
      await expect(cards(page)).toHaveCount(12);
      expect(await noHorizontalScroll(page)).toBe(true);

      await page.goto("/explorar.html?q=nada");
      await expect(page.locator(".region-state__empty")).toBeVisible();
      expect(await noHorizontalScroll(page)).toBe(true);

      await page.goto("/explorar.html?q=erro");
      await expect(page.locator("#results-content .error-state__message")).toBeVisible();
      expect(await noHorizontalScroll(page)).toBe(true);
    });
  }

  test("texto a 200% em 320px: nada é cortado e 'Filtrar' e a paginação seguem operáveis", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await mockApi(page, { activitiesResponder: listingOf(240) });
    await page.goto("/explorar.html?page=10");
    await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
    await expect(cards(page)).toHaveCount(12);
    expect(await noHorizontalScroll(page)).toBe(true);

    for (const name of ["Filtrar", "Limpar filtros"]) {
      const button = page.getByRole("button", { name });
      await button.scrollIntoViewIfNeeded();
      const box = await button.boundingBox();
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(320);
    }
    const nav = page.getByRole("navigation", { name: "Paginação" });
    await nav.scrollIntoViewIfNeeded();
    const links = await nav.locator("a").evaluateAll((els) =>
      els.map((el) => {
        const r = el.getBoundingClientRect();
        return r.left >= 0 && r.right <= window.innerWidth;
      }),
    );
    expect(links.every(Boolean)).toBe(true);
  });
});

test.describe("axe", () => {
  test("carregando", async ({ page }) => {
    await mockApi(page, { activitiesResponder: () => ({ body: makeListing(27), delayMs: 3000 }) });
    await page.goto("/explorar.html");
    await expect(page.locator("#results-content .skeleton-card")).toHaveCount(12);
    expect(await scan(page)).toEqual([]);
  });

  test("com resultados e paginação", async ({ page }) => {
    await mockApi(page, { activitiesResponder: listingOf(240) });
    await page.goto("/explorar.html?page=5");
    await expect(cards(page)).toHaveCount(12);
    expect(await scan(page)).toEqual([]);
  });

  test("vazio", async ({ page }) => {
    await mockApi(page, { activitiesResponder: () => ({ body: makeListing(0) }) });
    await page.goto("/explorar.html?q=nada");
    await expect(page.locator(".region-state__empty")).toBeVisible();
    expect(await scan(page)).toEqual([]);
  });

  test("erro, com aviso de opções de filtro", async ({ page }) => {
    await mockApi(page, { failActivities: 500, failUnits: 500 });
    await page.goto("/explorar.html");
    await expect(page.locator("#results-content .error-state__message")).toBeVisible();
    await expect(page.locator("#filter-options-status")).toContainText("Não foi possível carregar");
    expect(await scan(page)).toEqual([]);
  });
});

test.describe("teclado, movimento e console", () => {
  test("ordem de foco: skip link → menu → busca → filtros → botões → cards → paginação, sempre visível", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await mockApi(page, { activitiesResponder: listingOf(27) });
    await page.goto("/explorar.html");
    await expect(cards(page)).toHaveCount(12);

    const seen = [];
    for (let i = 0; i < 60; i += 1) {
      await page.keyboard.press("Tab");
      const info = await page.evaluate(() => {
        const el = document.activeElement;
        // O indicador de foco do link do card é desenhado no próprio card (:focus-within).
        const cs = getComputedStyle(el.closest(".activity-card") ?? el);
        return {
          text: (el.id || el.getAttribute("aria-label") || el.textContent || el.name || "").trim().slice(0, 40),
          outline: cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0,
          shadow: cs.boxShadow !== "none",
        };
      });
      seen.push(info);
      if (info.text.startsWith("Próxima")) break;
    }
    const names = seen.map((s) => s.text);
    const at = (text) => names.findIndex((n) => n === text);
    expect(names[0]).toContain("Pular");
    expect(at("search-q")).toBeGreaterThan(0);
    expect(at("filter-unit")).toBeGreaterThan(at("search-q"));
    expect(at("filter-category")).toBeGreaterThan(at("filter-unit"));
    expect(at("filter-audience")).toBeGreaterThan(at("filter-category"));
    expect(at("filter-period")).toBeGreaterThan(at("filter-audience"));
    expect(at("explore-submit")).toBeGreaterThan(at("filter-period"));
    expect(at("explore-clear")).toBeGreaterThan(at("explore-submit"));
    expect(names.findIndex((n) => n.startsWith("Atividade de teste"))).toBeGreaterThan(at("explore-clear"));
    expect(names.findIndex((n) => n.startsWith("Próxima"))).toBeGreaterThan(at("explore-clear"));
    expect(seen.filter((s) => !(s.outline || s.shadow)).map((s) => s.text)).toEqual([]);
  });

  test("filtros e paginação funcionam só com o teclado", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await mockApi(page, { activitiesResponder: listingOf(27) });
    await page.goto("/explorar.html");
    await expect(cards(page)).toHaveCount(12);

    await page.getByLabel("Quando?").focus();
    await page.keyboard.press("ArrowDown");
    await page.getByRole("button", { name: "Filtrar" }).focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/date=/);

    await page.getByRole("link", { name: "Ir para a página 2" }).focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/page=2$/);
    await expect(cards(page)).toHaveCount(12);
  });

  test("movimento reduzido: esqueletos sem animação", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await mockApi(page, { activitiesResponder: () => ({ body: makeListing(5), delayMs: 1500 }) });
    await page.goto("/explorar.html");
    const skeleton = page.locator("#results-content .skeleton-card").first();
    await expect(skeleton).toBeVisible();
    const animation = await skeleton.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { name: cs.animationName, duration: parseFloat(cs.animationDuration) };
    });
    expect(animation.name === "none" || animation.duration === 0 || animation.duration < 0.01).toBe(true);
  });

  test("sem console.error em sucesso, vazio nem falha", async ({ page }) => {
    const errors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error" && !/Failed to load resource/.test(msg.text())) errors.push(msg.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));
    await mockApi(page, {
      activitiesResponder: (url) =>
        url.searchParams.get("q") === "erro"
          ? { status: 500, body: { detail: "x" } }
          : { body: makeListing(url.searchParams.get("q") === "nada" ? 0 : 27) },
    });
    await page.goto("/explorar.html");
    await expect(cards(page)).toHaveCount(12);
    await page.goto("/explorar.html?q=nada");
    await expect(page.locator(".region-state__empty")).toBeVisible();
    await page.goto("/explorar.html?q=erro");
    await expect(page.locator(".error-state__message")).toBeVisible();
    expect(errors).toEqual([]);
  });
});
