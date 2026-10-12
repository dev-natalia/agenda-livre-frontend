import { expect, test } from "@playwright/test";
import {
  DETAILS_ID,
  HOSTILE_TEXT,
  makeActivity,
  makeDetails,
  mockApi,
  withImage,
  withNullImage,
} from "./helpers/mock-api.js";

// Campo `image` da API ({ url, alt, decorative } ou null) em cartão e detalhes
// (specs/010-testing-quality/contracts/api-image-contract.md).
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);
const IMAGE_HOST = "**/imagens.example.com/**";

async function serveImages(page, { broken = false } = {}) {
  await page.route(IMAGE_HOST, (route) =>
    broken ? route.fulfill({ status: 404, body: "" }) : route.fulfill({ status: 200, contentType: "image/png", body: PNG }),
  );
}

const listing = (activity) => () => ({ body: { count: 1, next: null, previous: null, results: [activity] } });
const loaded = (img) => img.evaluate((node) => node.complete && node.naturalWidth > 0);

test.describe("cartão na Explorar", () => {
  test("imagem informativa: alt da API, visível para tecnologia assistiva", async ({ page }) => {
    await serveImages(page);
    await mockApi(page, {
      activitiesResponder: listing(withImage(makeActivity(1), { alt: "Turma em aula de dança" })),
    });
    await page.goto("/explorar.html");
    const img = page.locator(".activity-card__media img");
    await expect(img).toHaveAttribute("alt", "Turma em aula de dança");
    await expect(page.getByRole("img", { name: "Turma em aula de dança" })).toBeVisible();
    await expect.poll(() => loaded(img)).toBe(true);
  });

  test("imagem decorativa: alt vazio e fora da árvore de acessibilidade", async ({ page }) => {
    await serveImages(page);
    await mockApi(page, {
      activitiesResponder: listing(withImage(makeActivity(1), { decorative: true })),
    });
    await page.goto("/explorar.html");
    await expect(page.locator(".activity-card__media img")).toHaveAttribute("alt", "");
    await expect(page.locator(".activity-card__media")).toHaveAttribute("aria-hidden", "true");
    await expect(page.getByRole("img")).toHaveCount(0);
  });

  test("sem imagem (null): fallback sem ícone quebrado", async ({ page }) => {
    await mockApi(page, { activitiesResponder: listing(withNullImage(makeActivity(1))) });
    await page.goto("/explorar.html");
    await expect(page.locator(".activity-card__media.image-fallback")).toBeVisible();
    await expect(page.locator(".activity-card__media img")).toHaveCount(0);
  });

  test("imagem que não carrega cai no fallback", async ({ page }) => {
    await serveImages(page, { broken: true });
    await mockApi(page, { activitiesResponder: listing(withImage(makeActivity(1))) });
    await page.goto("/explorar.html");
    await expect(page.locator(".activity-card__media.image-fallback")).toBeVisible();
    await expect(page.locator(".activity-card__media img")).toHaveCount(0);
  });

  test("o alt não repete o título por padrão", async ({ page }) => {
    await serveImages(page);
    const activity = withImage(makeActivity(1, { title: "Oficina de dança" }), { alt: "Mãos erguidas em círculo" });
    await mockApi(page, { activitiesResponder: listing(activity) });
    await page.goto("/explorar.html");
    const alt = await page.locator(".activity-card__media img").getAttribute("alt");
    expect(alt).not.toBe("Oficina de dança");
  });
});

test.describe("detalhes", () => {
  const open = async (page, data, options) => {
    await serveImages(page, options);
    await mockApi(page, { detailsResponder: () => ({ body: data }) });
    await page.goto(`/atividade.html?id=${DETAILS_ID}`);
    await expect(page.locator("h1")).toBeVisible();
  };

  test("imagem informativa aparece com o alt da API", async ({ page }) => {
    await open(page, withImage(makeDetails(), { alt: "Turma em aula de dança" }));
    const img = page.locator(".activity-details__media img");
    await expect(img).toHaveAttribute("alt", "Turma em aula de dança");
    await expect.poll(() => loaded(img)).toBe(true);
    await expect(page.locator(".activity-details__media.image-fallback")).toHaveCount(0);
  });

  test("imagem decorativa não é anunciada", async ({ page }) => {
    await open(page, withImage(makeDetails(), { decorative: true }));
    await expect(page.locator(".activity-details__media img")).toHaveAttribute("alt", "");
    await expect(page.getByRole("img")).toHaveCount(0);
  });

  test("sem imagem mostra o fallback", async ({ page }) => {
    await open(page, withNullImage(makeDetails()));
    await expect(page.locator(".activity-details__media.image-fallback")).toBeVisible();
  });

  test("imagem quebrada cai no fallback", async ({ page }) => {
    await open(page, withImage(makeDetails()), { broken: true });
    await expect(page.locator(".activity-details__media.image-fallback")).toBeVisible();
    await expect(page.locator(".activity-details__media img")).toHaveCount(0);
  });

  test("a imagem não causa rolagem horizontal a 320 px", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await open(page, withImage(makeDetails()));
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow).toBe(false);
  });
});

test("alt e título hostis não executam código", async ({ page }) => {
  const dialogs = [];
  page.on("dialog", (dialog) => {
    dialogs.push(dialog.message());
    dialog.dismiss();
  });
  await serveImages(page);
  const activity = withImage(makeActivity(1, { title: HOSTILE_TEXT }), { alt: HOSTILE_TEXT });
  await mockApi(page, { activitiesResponder: listing(activity) });
  await page.goto("/explorar.html");
  await expect(page.locator(".activity-card")).toHaveCount(1);
  expect(await page.evaluate(() => window.__pwned)).toBeUndefined();
  expect(dialogs).toEqual([]);
});
