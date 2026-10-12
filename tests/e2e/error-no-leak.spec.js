import { expect, test } from "@playwright/test";
import { DETAILS_ID, HOSTILE_TEXT, makeListing, mockApi } from "./helpers/mock-api.js";

// DOC-14 §11: falhas reais não mostram pilha, endereço interno, token nem corpo bruto da resposta.
const HOSTILE_BODY =
  'Traceback (most recent call last): File "/srv/app/views.py", line 10 OperationalError at ' +
  "http://localhost:8000/api/v1/activities/ Bearer abc123SECRET <script>window.__pwned=1</script>";

const FORBIDDEN = [/Traceback/, /\.py/, /OperationalError/, /Bearer/, /abc123SECRET/, /8000/, /<script/i];

async function expectScreenClean(page) {
  const text = await page.evaluate(() => document.body.innerText);
  for (const pattern of FORBIDDEN) expect(text, String(pattern)).not.toMatch(pattern);
  expect(await page.evaluate(() => window.__pwned)).toBeUndefined();
}

const hostileFailure = (status) => () => ({ status, body: HOSTILE_BODY });

for (const status of [500, 503, 429]) {
  test.describe(`resposta ${status} com corpo hostil`, () => {
    test("Início: mensagem amigável e nada interno na tela", async ({ page }) => {
      await mockApi(page, { activitiesResponder: hostileFailure(status) });
      await page.goto("/index.html");
      await expect(page.locator(".error-state__message").first()).toBeVisible();
      await expectScreenClean(page);
    });

    test("Explorar: mensagem amigável e nada interno na tela", async ({ page }) => {
      await mockApi(page, { activitiesResponder: hostileFailure(status) });
      await page.goto("/explorar.html");
      await expect(page.locator("#results-content .error-state__message")).toBeVisible();
      await expectScreenClean(page);
    });

    test("Detalhes: mensagem amigável e nada interno na tela", async ({ page }) => {
      await mockApi(page, { detailsResponder: hostileFailure(status) });
      await page.goto(`/atividade.html?id=${DETAILS_ID}`);
      await expect(page.locator(".error-state__message")).toBeVisible();
      await expectScreenClean(page);
    });
  });
}

test("resposta 200 que não é JSON: erro amigável sem o corpo", async ({ page }) => {
  await mockApi(page, {});
  await page.route("**/api/v1/activities/**", (route) =>
    route.fulfill({
      status: 200,
      headers: { "access-control-allow-origin": "*" },
      contentType: "text/html",
      body: `<html><body>${HOSTILE_BODY}</body></html>`,
    }),
  );
  await page.goto("/explorar.html");
  await expect(page.locator("#results-content .error-state__message")).toBeVisible();
  await expectScreenClean(page);
});

test("falha de rede: mensagem amigável e nada interno na tela", async ({ page }) => {
  await mockApi(page, { failActivities: "network" });
  await page.goto("/explorar.html");
  await expect(page.locator("#results-content .error-state__message")).toBeVisible();
  await expectScreenClean(page);
});

test("texto hostil nos dados da API aparece como texto e não executa", async ({ page }) => {
  const dialogs = [];
  page.on("dialog", (dialog) => {
    dialogs.push(dialog.message());
    dialog.dismiss();
  });
  const listing = makeListing(1);
  listing.results[0].title = HOSTILE_TEXT;
  listing.results[0].unit.name = HOSTILE_TEXT;
  await mockApi(page, { activitiesResponder: () => ({ body: listing }) });
  await page.goto("/explorar.html");
  await expect(page.locator("#results-content .activity-card")).toHaveCount(1);
  await expect(page.locator(".activity-card__title")).toContainText("<script>window.__pwned=1</script>");
  expect(await page.evaluate(() => window.__pwned)).toBeUndefined();
  expect(dialogs).toEqual([]);
  await expect(page.locator("#results-content script")).toHaveCount(0);
});
