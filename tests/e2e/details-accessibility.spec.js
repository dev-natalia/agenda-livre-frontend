import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { WIDTHS } from "./helpers/viewports.js";
import { DETAILS_ID, makeDetails, mockApi } from "./helpers/mock-api.js";

// A verificação automática encontra só parte dos problemas; teclado e leitor de tela ficam no quickstart.md.
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const URL = `/atividade.html?id=${DETAILS_ID}`;
const full = (id) => ({ body: makeDetails({ id, external_registration_url: "https://exemplo.org/x" }) });
const minimal = (id) => ({
  body: makeDetails({
    id,
    summary: null,
    description: null,
    target_audience_notes: null,
    target_audiences: [],
    unit: null,
    category: null,
    schedules: [],
    next_occurrences: [],
  }),
});
const noHorizontalScroll = (page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);

async function scan(page) {
  const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  return violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`);
}

test.describe("estrutura", () => {
  test("um único h1 e títulos de seção sem saltos de nível", async ({ page }) => {
    await mockApi(page, { detailsResponder: full });
    await page.goto(URL);
    await expect(page.locator("h1")).toHaveCount(1);
    const levels = await page.evaluate(() =>
      [...document.querySelectorAll("main h1, main h2, main h3")].map((h) => Number(h.tagName[1])),
    );
    for (let i = 1; i < levels.length; i += 1) expect(levels[i] - levels[i - 1]).toBeLessThanOrEqual(1);
    await expect(page.getByRole("link", { name: "Voltar para atividades" })).toBeVisible();
  });

  test("a imagem ausente é decorativa", async ({ page }) => {
    await mockApi(page, { detailsResponder: full });
    await page.goto(URL);
    await expect(page.locator(".activity-details__media")).toHaveAttribute("aria-hidden", "true");
    await expect(page.locator("main img")).toHaveCount(0);
  });

  test("há uma única região de status e o carregamento é anunciado sem mover o foco", async ({ page }) => {
    await mockApi(page, { detailsResponder: (id) => ({ body: makeDetails({ id }), delayMs: 1200 }) });
    await page.goto(URL);
    await page.getByRole("link", { name: "Voltar para atividades" }).focus();
    await expect(page.locator("#details-status")).toHaveText(/Carregando/);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("#details-status")).toHaveText(/carregados/);
    await expect(page.getByRole("link", { name: "Voltar para atividades" })).toBeFocused();
    await expect(page.locator("main [aria-live='polite']")).toHaveCount(1);
  });

  test("operação só por teclado: voltar, link externo e foco visível", async ({ page }) => {
    await mockApi(page, { detailsResponder: full });
    await page.goto(URL);
    await expect(page.locator("h1")).toBeVisible();
    await page.getByRole("link", { name: "Voltar para atividades" }).focus();
    await page.keyboard.press("Tab");
    await expect(page.locator(".external-link")).toBeFocused();
    const outline = await page.locator(".external-link").evaluate((el) => getComputedStyle(el).outlineStyle);
    expect(outline).not.toBe("none");
  });
});

test.describe("axe", () => {
  test("sem violações com conteúdo completo", async ({ page }) => {
    await mockApi(page, { detailsResponder: full });
    await page.goto(URL);
    await expect(page.locator("h1")).toBeVisible();
    expect(await scan(page)).toEqual([]);
  });

  test("sem violações com conteúdo mínimo", async ({ page }) => {
    await mockApi(page, { detailsResponder: minimal });
    await page.goto(URL);
    await expect(page.locator("h1")).toBeVisible();
    expect(await scan(page)).toEqual([]);
  });

  test("sem violações em 'não encontrada'", async ({ page }) => {
    await mockApi(page, {});
    await page.goto(URL);
    await expect(page.locator("h1")).toHaveText(/não encontrada/);
    expect(await scan(page)).toEqual([]);
  });

  test("sem violações no erro e no carregamento", async ({ page }) => {
    await mockApi(page, { detailsResponder: () => ({ status: 500, body: {}, delayMs: 600 }) });
    await page.goto(URL);
    await expect(page.locator("#details-content .skeleton-card").first()).toBeVisible();
    expect(await scan(page)).toEqual([]);
    await expect(page.locator(".error-state__retry")).toBeVisible();
    expect(await scan(page)).toEqual([]);
  });
});

test.describe("reflow e movimento", () => {
  for (const width of WIDTHS) {
    test(`sem rolagem horizontal em ${width}px (conteúdo longo, não encontrada e erro)`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      const long = "X".repeat(200);
      await mockApi(page, {
        detailsResponder: (id) => {
          if (id.endsWith("0001")) {
            return {
              body: makeDetails({
                id,
                title: long,
                description: `${long}\n${long}`,
                unit: { id: "u", name: long, address: long, neighborhood: long },
                external_registration_url: `https://exemplo.org/${long}`,
              }),
            };
          }
          if (id.endsWith("0002")) return { status: 500, body: {} };
          return null;
        },
      });
      for (const n of ["0001", "0002", "0003"]) {
        await page.goto(`/atividade.html?id=550e8400-e29b-41d4-a716-44665544${n}`);
        await expect(page.locator("#details-content > *")).not.toHaveCount(0);
        await expect(page.locator("#details-content .skeleton-card")).toHaveCount(0);
        expect(await noHorizontalScroll(page)).toBe(true);
      }
    });
  }

  test("texto ampliado a 200% mantém o conteúdo sem rolagem horizontal", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await mockApi(page, { detailsResponder: full });
    await page.goto(URL);
    await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
    await expect(page.locator("h1")).toBeVisible();
    expect(await noHorizontalScroll(page)).toBe(true);
  });

  test("com movimento reduzido os esqueletos não têm animação", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce", baseURL: "http://localhost:5500" });
    const page = await context.newPage();
    await mockApi(page, { detailsResponder: (id) => ({ body: makeDetails({ id }), delayMs: 1000 }) });
    await page.goto(URL);
    const skeleton = page.locator("#details-content .skeleton-card").first();
    await expect(skeleton).toBeVisible();
    expect(await skeleton.evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
    await context.close();
  });
});
