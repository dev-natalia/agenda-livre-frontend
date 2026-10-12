import { expect, test } from "@playwright/test";
import { DETAILS_ID, UNITS, makeDetails, makeListing, mockApi } from "./helpers/mock-api.js";

const listingOf = (total) => (url) => ({
  body: makeListing(total, { page: Number(url.searchParams.get("page") ?? 1) }),
});
const found = (id) => ({ body: makeDetails({ id }) });
const cards = (page) => page.locator("#results-content .activity-card");

async function openDetailsFromSecondPage(page) {
  await page.goto(`/explorar.html?q=oficina&unit=${UNITS[0].id}`);
  await expect(cards(page)).toHaveCount(12);
  await page.getByRole("link", { name: "Ir para a página 2" }).click();
  await expect(page).toHaveURL(/page=2$/);
  await expect(cards(page)).toHaveCount(12);
  const link = cards(page).nth(8).getByRole("link");
  await link.scrollIntoViewIfNeeded();
  await link.click();
  await expect(page).toHaveURL(/atividade\.html\?id=/);
}

function expectRestoredExplore(page) {
  return Promise.all([
    expect(page).toHaveURL(/explorar\.html\?q=oficina&unit=.*&page=2$/),
    expect(cards(page)).toHaveCount(12),
    expect(page.getByLabel("Buscar por nome da atividade")).toHaveValue("oficina"),
    expect(page.getByLabel("Unidade")).toHaveValue(UNITS[0].id),
    expect(page.locator("#results-pagination [aria-current='page']")).toHaveText("2"),
  ]);
}

test.describe("voltar para atividades", () => {
  test("vindo da Explorar, o link restaura termo, filtros e página", async ({ page }) => {
    await mockApi(page, { activitiesResponder: listingOf(27), detailsResponder: found });
    await openDetailsFromSecondPage(page);
    await expect(page.locator("h1")).not.toHaveCount(0);

    await page.getByRole("link", { name: "Voltar para atividades" }).click();
    await expectRestoredExplore(page);
  });

  test("o botão voltar do navegador também restaura a listagem", async ({ page }) => {
    await mockApi(page, { activitiesResponder: listingOf(27), detailsResponder: found });
    await openDetailsFromSecondPage(page);
    await page.goBack();
    await expectRestoredExplore(page);
  });

  test("aberta diretamente, o link leva à Explorar sem critérios", async ({ page }) => {
    await mockApi(page, { activitiesResponder: listingOf(27), detailsResponder: found });
    await page.goto(`/atividade.html?id=${DETAILS_ID}`);
    await expect(page.locator("h1")).toHaveText("Oficina de dança");
    await page.getByRole("link", { name: "Voltar para atividades" }).click();
    await expect(page).toHaveURL(/explorar\.html$/);
    await expect(page.getByLabel("Buscar por nome da atividade")).toHaveValue("");
  });

  test("Ctrl+clique segue o link normal e não usa o histórico", async ({ page, context }) => {
    await mockApi(page, { activitiesResponder: listingOf(27), detailsResponder: found });
    await openDetailsFromSecondPage(page);
    const detailsUrl = page.url();
    const [popup] = await Promise.all([
      context.waitForEvent("page"),
      page.getByRole("link", { name: "Voltar para atividades" }).click({ modifiers: ["Control"] }),
    ]);
    await popup.waitForLoadState();
    expect(popup.url()).toMatch(/explorar\.html$/);
    expect(page.url()).toBe(detailsUrl);
  });
});
