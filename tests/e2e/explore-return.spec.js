import { expect, test } from "@playwright/test";
import { UNITS, makeListing, mockApi } from "./helpers/mock-api.js";

const listingOf = (total) => (url) => ({
  body: makeListing(total, { page: Number(url.searchParams.get("page") ?? 1) }),
});
const cards = (page) => page.locator("#results-content .activity-card");
const listActivities = (api) => api.requests.filter((r) => r.path.endsWith("/activities/"));

async function openSecondPageAndFirstCard(page) {
  await page.goto(`/explorar.html?q=oficina&unit=${UNITS[0].id}`);
  await expect(cards(page)).toHaveCount(12);
  await page.getByRole("link", { name: "Ir para a página 2" }).click();
  await expect(page).toHaveURL(/page=2$/);
  await expect(cards(page)).toHaveCount(12);
}

test.describe("voltar dos detalhes", () => {
  test("restaura campos, página e resultados sem nova consulta, e a rolagem", async ({ page }) => {
    const api = await mockApi(page, { activitiesResponder: listingOf(27) });
    await openSecondPageAndFirstCard(page);
    const before = listActivities(api).length;

    // O Playwright rola até o alvo antes de clicar: medir a rolagem já com o card à vista.
    const link = cards(page).nth(8).getByRole("link");
    await link.scrollIntoViewIfNeeded();
    const scrolled = await page.evaluate(() => window.scrollY);
    expect(scrolled).toBeGreaterThan(0);

    await link.click();
    await expect(page).toHaveURL(/atividade\.html\?id=/);
    await page.goBack();

    await expect(page).toHaveURL(/explorar\.html\?q=oficina&unit=.*&page=2$/);
    await expect(cards(page)).toHaveCount(12);
    await expect(page.getByLabel("Buscar por nome da atividade")).toHaveValue("oficina");
    await expect(page.getByLabel("Unidade")).toHaveValue(UNITS[0].id);
    await expect(page.locator("#results-pagination [aria-current='page']")).toHaveText("2");
    await expect(page.locator("#results-content .skeleton-card")).toHaveCount(0);
    expect(listActivities(api).length).toBe(before);

    const restored = await page.evaluate(() => window.scrollY);
    expect(Math.abs(restored - scrolled)).toBeLessThan(80);
  });

  test("sem cópia (armazenamento limpo): reconstrói a listagem pelo endereço", async ({ page }) => {
    const api = await mockApi(page, { activitiesResponder: listingOf(27) });
    await openSecondPageAndFirstCard(page);
    await cards(page).first().getByRole("link").click();
    await expect(page).toHaveURL(/atividade\.html/);
    await page.evaluate(() => sessionStorage.clear());
    const before = listActivities(api).length;

    await page.goBack();
    await expect(cards(page)).toHaveCount(12);
    await expect(page.getByLabel("Buscar por nome da atividade")).toHaveValue("oficina");
    expect(listActivities(api).length).toBeGreaterThan(before);
  });

  test("cópia vencida (mais de 5 minutos) não é usada", async ({ page }) => {
    const api = await mockApi(page, { activitiesResponder: listingOf(27) });
    await openSecondPageAndFirstCard(page);
    await cards(page).first().getByRole("link").click();
    await expect(page).toHaveURL(/atividade\.html/);
    await page.evaluate(() => {
      for (const key of Object.keys(sessionStorage)) {
        if (!key.startsWith("agenda-livre:explore:") || key.endsWith("__index")) continue;
        const entry = JSON.parse(sessionStorage.getItem(key));
        entry.savedAt -= 6 * 60 * 1000;
        sessionStorage.setItem(key, JSON.stringify(entry));
      }
    });
    const before = listActivities(api).length;

    await page.goBack();
    await expect(cards(page)).toHaveCount(12);
    expect(listActivities(api).length).toBeGreaterThan(before);
  });

  test("popstate dentro da página com cópia válida não consulta de novo", async ({ page }) => {
    const api = await mockApi(page, { activitiesResponder: listingOf(27) });
    await page.goto("/explorar.html");
    await expect(cards(page)).toHaveCount(12);
    await page.getByRole("link", { name: "Ir para a página 2" }).click();
    await expect(page).toHaveURL(/page=2$/);
    await expect(cards(page)).toHaveCount(12);
    const before = listActivities(api).length;

    await page.goBack();
    await expect(page).toHaveURL(/explorar\.html$/);
    await expect(page.locator("#results-pagination [aria-current='page']")).toHaveText("1");
    await expect(cards(page)).toHaveCount(12);
    expect(listActivities(api).length).toBe(before);
  });

  test("armazenamento indisponível não quebra a página", async ({ page }) => {
    await mockApi(page, { activitiesResponder: listingOf(27) });
    await page.addInitScript(() => {
      Object.defineProperty(window, "sessionStorage", {
        get() {
          throw new Error("bloqueado");
        },
      });
    });
    await page.goto("/explorar.html");
    await expect(cards(page)).toHaveCount(12);
    await page.getByRole("link", { name: "Ir para a página 2" }).click();
    await expect(cards(page)).toHaveCount(12);
  });

  test("detalhes abertos direto oferecem caminho para Explorar atividades", async ({ page }) => {
    await mockApi(page);
    await page.goto("/atividade.html?id=550e8400-e29b-41d4-a716-446655440001");
    await expect(page.getByRole("navigation", { name: "Navegação principal" }).getByRole("link", { name: "Explorar atividades" })).toHaveAttribute(
      "href",
      "explorar.html",
    );
  });
});
