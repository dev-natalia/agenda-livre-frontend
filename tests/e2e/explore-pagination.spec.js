import { expect, test } from "@playwright/test";
import { makeListing, mockApi } from "./helpers/mock-api.js";

const listingOf = (total, extra = {}) => (url) => {
  const page = Number(url.searchParams.get("page") ?? 1);
  return { body: makeListing(total, { page }), ...extra };
};

const cards = (page) => page.locator("#results-content .activity-card");

test.describe("listagem e paginação", () => {
  test("abre com 12 cards, total e paginação; página 1 sem 'Anterior'", async ({ page }) => {
    const api = await mockApi(page, { activitiesResponder: listingOf(27) });
    await page.goto("/explorar.html");

    await expect(cards(page)).toHaveCount(12);
    await expect(page.locator("#results-summary")).toHaveText("27 atividades encontradas");
    const nav = page.getByRole("navigation", { name: "Paginação" });
    await expect(nav).toBeVisible();
    await expect(nav.locator('[aria-current="page"]')).toHaveText("1");
    await expect(nav.getByText("Anterior")).toHaveAttribute("aria-disabled", "true");
    expect(api.requests.filter((r) => r.path.endsWith("/activities/"))).toHaveLength(1);
    expect(api.requests.find((r) => r.path.endsWith("/activities/")).search).toBe("?page_size=12");
  });

  test("ordem recebida da API é preservada", async ({ page }) => {
    await mockApi(page, { activitiesResponder: listingOf(5) });
    await page.goto("/explorar.html");
    const titles = await page.locator("#results-content .activity-card__title").allTextContents();
    expect(titles).toEqual([1, 2, 3, 4, 5].map((n) => `Atividade de teste ${n}`));
  });

  test("trocar de página atualiza a URL, mostra esqueletos e leva o foco ao título", async ({ page }) => {
    await mockApi(page, {
      activitiesResponder: (url) => ({
        body: makeListing(27, { page: Number(url.searchParams.get("page") ?? 1) }),
        delayMs: url.searchParams.get("page") ? 300 : 0,
      }),
    });
    await page.goto("/explorar.html");
    await expect(cards(page)).toHaveCount(12);

    await page.getByRole("link", { name: "Ir para a página 2" }).click();
    await expect(page.locator("#results-content .skeleton-card")).toHaveCount(12);
    await expect(page).toHaveURL(/explorar\.html\?page=2$/);
    await expect(cards(page)).toHaveCount(12);
    await expect(page.locator("#results-pagination [aria-current='page']")).toHaveText("2");
    await expect(page.locator("#results-heading")).toBeFocused();

    await page.getByRole("link", { name: "Ir para a página 3" }).click();
    await expect(cards(page)).toHaveCount(3);
    await expect(page.getByRole("navigation", { name: "Paginação" }).getByText("Próxima")).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  test("mantém critérios ao trocar de página", async ({ page }) => {
    const api = await mockApi(page, { activitiesResponder: listingOf(27) });
    await page.goto("/explorar.html?q=oficina");
    await expect(cards(page)).toHaveCount(12);
    await page.getByRole("link", { name: "Próxima (página 2)" }).click();
    await expect(page).toHaveURL(/explorar\.html\?q=oficina&page=2$/);
    await expect(cards(page)).toHaveCount(12);
    const last = api.requests.filter((r) => r.path.endsWith("/activities/")).at(-1);
    expect(new URLSearchParams(last.search).get("q")).toBe("oficina");
    expect(new URLSearchParams(last.search).get("page")).toBe("2");
  });

  test("abrir ?page=2 direto já mostra a página 2", async ({ page }) => {
    await mockApi(page, { activitiesResponder: listingOf(27) });
    await page.goto("/explorar.html?page=2");
    await expect(page.locator("#results-pagination [aria-current='page']")).toHaveText("2");
    await expect(cards(page)).toHaveCount(12);
  });

  test("os links de página são URLs reais (abrir em outra aba carrega a mesma página)", async ({ page }) => {
    await mockApi(page, { activitiesResponder: listingOf(27) });
    await page.goto("/explorar.html");
    const href = await page.getByRole("link", { name: "Ir para a página 3" }).getAttribute("href");
    expect(href).toBe("explorar.html?page=3");
    await page.goto(`/${href}`);
    await expect(cards(page)).toHaveCount(3);
  });

  test("uma página só não mostra paginação", async ({ page }) => {
    await mockApi(page, { activitiesResponder: listingOf(5) });
    await page.goto("/explorar.html");
    await expect(cards(page)).toHaveCount(5);
    await expect(page.locator("#results-pagination")).toBeHidden();
    await expect(page.locator("#results-summary")).toHaveText("5 atividades encontradas");
  });

  test("cada card abre os detalhes na mesma aba", async ({ page }) => {
    await mockApi(page, { activitiesResponder: listingOf(5) });
    await page.goto("/explorar.html");
    await page.getByRole("link", { name: "Atividade de teste 2" }).click();
    await expect(page).toHaveURL(/atividade\.html\?id=/);
  });
});
