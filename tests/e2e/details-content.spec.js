import { expect, test } from "@playwright/test";
import { DETAILS_ID, makeDetails, makeListing, mockApi } from "./helpers/mock-api.js";

const open = (page, id = DETAILS_ID) => page.goto(`/atividade.html?id=${id}`);
const found = (over = {}) => (id) => ({ body: makeDetails({ id, ...over }) });

test.describe("conteúdo dos detalhes", () => {
  test("atividade completa mostra todas as informações e o título do documento", async ({ page }) => {
    await mockApi(page, { detailsResponder: found() });
    await open(page);

    await expect(page.locator("h1")).toHaveText("Oficina de dança");
    await expect(page).toHaveTitle("Oficina de dança — Agenda Livre");
    const article = page.locator(".activity-details__article");
    await expect(article).toContainText("Cultura e Artes");
    await expect(article).toContainText("CEU Navegantes");
    await expect(article).toContainText("Rua das Flores, 100");
    await expect(article).toContainText("20 de novembro de 2026");
    await expect(article).toContainText("Terça-feira e Quinta-feira");
    await expect(article).toContainText("14h00 às 15h00");
    await expect(article.locator("time")).toHaveCount(2);
    await expect(article).toContainText("Adultos");
    await expect(article).toContainText("Iniciantes são bem-vindos.");
    await expect(page.locator(".activity-details__description")).toHaveText(/Descrição completa\.\s+Segunda linha\./);
    await expect(page.locator("main h2")).toHaveText(["Quando", "Público", "Sobre a atividade", "Local"]);
  });

  test("a descrição preserva a quebra de linha", async ({ page }) => {
    await mockApi(page, { detailsResponder: found() });
    await open(page);
    const height = await page
      .locator(".activity-details__description")
      .evaluate((el) => el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight));
    expect(height).toBeGreaterThan(1.5);
  });

  test("poucos campos: sem rótulos nem seções vazias, e 'Sem data prevista'", async ({ page }) => {
    await mockApi(page, {
      detailsResponder: found({
        summary: null,
        description: null,
        target_audience_notes: null,
        target_audiences: [],
        unit: { id: "u", name: "CEU X", address: null, neighborhood: null },
        category: null,
        schedules: [],
        next_occurrences: [],
      }),
    });
    await open(page);
    await expect(page.locator("h1")).toHaveText("Oficina de dança");
    await expect(page.locator("main h2")).toHaveText(["Quando"]);
    await expect(page.locator(".activity-details__article")).toContainText("Sem data prevista");
    await expect(page.locator("main")).not.toContainText(/undefined|null/);
  });

  test("abrir o endereço direto em contexto novo funciona", async ({ browser }) => {
    const context = await browser.newContext({ baseURL: "http://localhost:5500" });
    const page = await context.newPage();
    await mockApi(page, { detailsResponder: found() });
    await open(page);
    await expect(page.locator("h1")).toHaveText("Oficina de dança");
    await context.close();
  });

  test("HTML na descrição aparece como texto", async ({ page }) => {
    await mockApi(page, { detailsResponder: found({ description: "<b>negrito</b><script>window.__x=1</script>" }) });
    await open(page);
    await expect(page.locator(".activity-details__description")).toHaveText("<b>negrito</b><script>window.__x=1</script>");
    expect(await page.evaluate(() => window.__x)).toBeUndefined();
  });

  test("esqueleto visível e oculto da tecnologia assistiva durante a espera", async ({ page }) => {
    await mockApi(page, { detailsResponder: (id) => ({ body: makeDetails({ id }), delayMs: 1500 }) });
    await open(page);
    const skeleton = page.locator("#details-content .skeleton-card");
    await expect(skeleton.first()).toBeVisible();
    const hidden = await skeleton.evaluateAll((els) => els.every((el) => el.getAttribute("aria-hidden") === "true"));
    expect(hidden).toBe(true);
    await expect(page.locator("h1")).toHaveText("Oficina de dança");
    await expect(skeleton).toHaveCount(0);
  });

  test("fez exatamente uma requisição ao detalhe", async ({ page }) => {
    const api = await mockApi(page, { detailsResponder: found() });
    await open(page);
    await expect(page.locator("h1")).toHaveText("Oficina de dança");
    expect(api.requests.filter((r) => r.path.endsWith(`/activities/${DETAILS_ID}/`))).toHaveLength(1);
  });

  test("clicar em um card da Explorar abre os detalhes dessa atividade", async ({ page }) => {
    await mockApi(page, {
      activitiesResponder: () => ({ body: makeListing(3) }),
      detailsResponder: found(),
    });
    await page.goto("/explorar.html");
    await page.locator("#results-content .activity-card").first().getByRole("link").click();
    await expect(page).toHaveURL(new RegExp(`atividade\\.html\\?id=${DETAILS_ID}`));
    await expect(page.locator("h1")).toHaveText("Oficina de dança");
  });

  test("clicar em um card da Início abre os detalhes", async ({ page }) => {
    await mockApi(page, { detailsResponder: found() });
    await page.goto("/index.html");
    await page.locator(".activity-card").first().getByRole("link").click();
    await expect(page).toHaveURL(/atividade\.html\?id=/);
    await expect(page.locator("h1")).toHaveText("Oficina de dança");
  });
});
