import { expect, test } from "@playwright/test";
import { makeActivity, mockApi } from "./helpers/mock-api.js";

const cards = (page) => page.locator("#upcoming-content article.activity-card");

test.describe("sucesso", () => {
  test("mostra 3 cards em ordem, com links diretos e 'Ver todas'", async ({ page }) => {
    const api = await mockApi(page);
    await page.goto("/index.html");

    await expect(cards(page)).toHaveCount(3);
    await expect(cards(page).locator("h3")).toHaveText(["Atividade de teste 1", "Atividade de teste 2", "Atividade de teste 3"]);
    await expect(cards(page).first().locator(".image-fallback")).toBeVisible();

    const first = cards(page).first().getByRole("link", { name: "Atividade de teste 1" });
    await expect(first).toHaveAttribute("href", /^atividade\.html\?id=/);
    await expect(page.getByRole("link", { name: "Ver todas" })).toHaveAttribute("href", "explorar.html");

    const upcoming = api.requests.find((r) => r.path.endsWith("/activities/"));
    const params = new URLSearchParams(upcoming.search);
    expect(params.get("page_size")).toBe("3");
    expect(params.get("date_from")).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(api.count("/activities/")).toBe(1);
    expect(api.count("/units/")).toBe(1);
    expect(api.count("/categories/")).toBe(1);
  });

  test("clicar no card e ativá-lo por teclado abre os detalhes na mesma aba", async ({ page }) => {
    await mockApi(page);
    await page.goto("/index.html");
    const link = cards(page).first().getByRole("link");
    await link.click();
    await expect(page).toHaveURL(/atividade\.html\?id=550e8400-e29b-41d4-a716-446655440001$/);

    await page.goBack();
    await cards(page).first().getByRole("link").focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/atividade\.html\?id=/);
  });

  test("'Ver todas' abre a Explorar sem parâmetros", async ({ page }) => {
    await mockApi(page);
    await page.goto("/index.html");
    await page.getByRole("link", { name: "Ver todas" }).click();
    await expect(page).toHaveURL(/\/explorar\.html$/);
  });

  test("sem atividades próximas: mensagem de vazio, sem botão de erro", async ({ page }) => {
    await mockApi(page, { activities: [] });
    await page.goto("/index.html");
    await expect(page.locator("#upcoming-content")).toContainText("Não há atividades próximas no momento.");
    await expect(page.getByRole("button", { name: "Tentar novamente" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Ver todas" })).toBeVisible();
  });

  test("item sem próxima ocorrência não quebra o card", async ({ page }) => {
    await mockApi(page, { activities: [makeActivity(1, { next_occurrence: null })] });
    await page.goto("/index.html");
    await expect(cards(page)).toHaveCount(1);
    await expect(cards(page).first()).toContainText("Sem data prevista");
  });
});

test.describe("carregamento", () => {
  test("esqueletos visíveis e ocultos da tecnologia assistiva; anúncios e foco", async ({ page }) => {
    await mockApi(page, { delayMs: 1500 });
    await page.goto("/index.html");

    const skeletons = page.locator("#upcoming-content .skeleton-card");
    await expect(skeletons).toHaveCount(3);
    for (const el of await skeletons.all()) await expect(el).toHaveAttribute("aria-hidden", "true");

    await page.locator("#search-q").focus();
    await expect(page.locator("#upcoming-status")).toHaveText("Carregando próximas atividades…");
    await expect(cards(page)).toHaveCount(3);
    await expect(page.locator("#upcoming-status")).toHaveText("3 próximas atividades carregadas.");
    expect(await page.evaluate(() => document.activeElement.id)).toBe("search-q");
  });

  test("movimento reduzido: esqueletos sem animação", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await mockApi(page, { delayMs: 1500 });
    await page.goto("/index.html");
    const skeleton = page.locator("#upcoming-content .skeleton-card").first();
    await expect(skeleton).toBeVisible();
    const animation = await skeleton.evaluate((el) => getComputedStyle(el).animationName);
    expect(animation).toBe("none");
    await context.close();
  });
});

test.describe("falha", () => {
  test("500: mensagem amigável, anúncio, botão; a pesquisa segue utilizável", async ({ page }) => {
    await mockApi(page, { failActivities: 500 });
    await page.goto("/index.html");

    const content = page.locator("#upcoming-content");
    await expect(content).toContainText("O serviço está indisponível");
    await expect(content).not.toContainText("500");
    await expect(page.locator("#upcoming-status")).toContainText("O serviço está indisponível");
    await expect(content.getByRole("button", { name: "Tentar novamente" })).toBeVisible();

    await page.locator("#search-q").fill("dança");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/explorar\.html\?q=dan%C3%A7a$/);
  });

  test("recupera sem recarregar quando a API volta; nova falha restaura a mensagem", async ({ page }) => {
    const api = await mockApi(page, { failActivities: 500 });
    await page.goto("/index.html");
    await page.evaluate(() => (window.__marker = "mesma-pagina"));

    const retry = page.getByRole("button", { name: "Tentar novamente" });
    await retry.click();
    await expect(page.locator("#upcoming-content")).toContainText("O serviço está indisponível");
    await expect(retry).toBeVisible();

    api.state.failActivities = null;
    await retry.click();
    await expect(cards(page)).toHaveCount(3);
    expect(await page.evaluate(() => window.__marker)).toBe("mesma-pagina");
    expect(api.count("/activities/")).toBe(3);
  });

  test("rede caída e 429 também oferecem nova tentativa", async ({ page }) => {
    const api = await mockApi(page, { failActivities: "network" });
    await page.goto("/index.html");
    await expect(page.locator("#upcoming-content")).toContainText("Não foi possível conectar");
    api.state.failActivities = 429;
    await page.getByRole("button", { name: "Tentar novamente" }).click();
    await expect(page.locator("#upcoming-content")).toContainText("Muitas consultas");
    await expect(page.getByRole("button", { name: "Tentar novamente" })).toBeVisible();
  });

  test("configuração inválida: aviso aparece e a seção não fica em esqueleto", async ({ page }) => {
    await page.route("**/js/config.js", async (route) => {
      const response = await route.fetch();
      const body = (await response.text()).replace(/apiBaseUrl: "[^"]*"/, 'apiBaseUrl: ""');
      await route.fulfill({ response, body });
    });
    await page.goto("/index.html");
    await expect(page.locator(".config-notice")).toBeVisible();
    await expect(page.locator("#upcoming-content .skeleton-card")).toHaveCount(0);
    await expect(page.locator("#upcoming-content .error-state__message")).toBeVisible();
  });

  test("o foco do teclado não é deslocado pelo erro", async ({ page }) => {
    await mockApi(page, { failActivities: 500, delayMs: 800 });
    await page.goto("/index.html");
    await page.locator("#search-q").focus();
    await expect(page.locator("#upcoming-content .error-state__message")).toBeVisible();
    expect(await page.evaluate(() => document.activeElement.id)).toBe("search-q");
  });
});
