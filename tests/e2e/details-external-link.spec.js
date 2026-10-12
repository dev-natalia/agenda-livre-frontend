import { expect, test } from "@playwright/test";
import { DETAILS_ID, makeDetails, mockApi } from "./helpers/mock-api.js";

const withUrl = (url) => (id) => ({ body: makeDetails({ id, external_registration_url: url }) });
const open = (page) => page.goto(`/atividade.html?id=${DETAILS_ID}`);

test.describe("link externo", () => {
  test("URL https: botão em nova aba, seguro e com indicação", async ({ page, context }) => {
    await context.route("https://exemplo.org/**", (route) =>
      route.fulfill({ status: 200, contentType: "text/html", body: "<h1>Externo</h1>" }),
    );
    await mockApi(page, { detailsResponder: withUrl("https://exemplo.org/inscricao") });
    await open(page);

    const link = page.getByRole("link", { name: /site externo.*nova aba/i });
    await expect(link).toHaveCount(1);
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", /noopener/);
    await expect(link).toHaveAttribute("rel", /noreferrer/);
    await expect(link).toHaveAttribute("href", "https://exemplo.org/inscricao");

    const [popup] = await Promise.all([context.waitForEvent("page"), link.click()]);
    await expect(popup).toHaveURL("https://exemplo.org/inscricao");
    await expect(page).toHaveURL(/atividade\.html\?id=/);
    await expect(page.locator("h1")).toHaveText("Oficina de dança");
  });

  test("sem URL não há botão", async ({ page }) => {
    await mockApi(page, { detailsResponder: withUrl(null) });
    await open(page);
    await expect(page.locator("h1")).toHaveText("Oficina de dança");
    await expect(page.locator(".external-link")).toHaveCount(0);
    await expect(page.locator(".activity-details__actions")).toHaveCount(0);
  });

  for (const url of ["javascript:window.__pwned=1", "data:text/html,<script>window.__pwned=1</script>", "/relativa", "//exemplo.org"]) {
    test(`URL ${url} não gera botão nem executa código`, async ({ page }) => {
      let dialogs = 0;
      page.on("dialog", () => {
        dialogs += 1;
      });
      await mockApi(page, { detailsResponder: withUrl(url) });
      await open(page);
      await expect(page.locator("h1")).toHaveText("Oficina de dança");
      await expect(page.locator(".external-link")).toHaveCount(0);
      expect(await page.evaluate(() => window.__pwned)).toBeUndefined();
      expect(dialogs).toBe(0);
    });
  }

  test("o botão é alcançável por teclado e o nome acessível informa saída do site", async ({ page }) => {
    await mockApi(page, { detailsResponder: withUrl("https://exemplo.org/inscricao") });
    await open(page);
    const link = page.locator(".external-link");
    await link.focus();
    await expect(link).toBeFocused();
    const name = await link.evaluate((el) => el.textContent);
    expect(name).toMatch(/site externo/i);
    expect(name).toMatch(/nova aba/i);
  });
});
