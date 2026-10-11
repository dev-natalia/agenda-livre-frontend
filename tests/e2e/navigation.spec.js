import { expect, test } from "@playwright/test";

const pages = [
  { path: "index.html", current: "Início" },
  { path: "explorar.html", current: "Explorar atividades" },
  { path: "atividade.html", current: null },
  { path: "sobre.html", current: "Sobre" },
  { path: "contato.html", current: "Contato" },
];

for (const { path, current } of pages) {
  test(`${path}: navegação, página atual e ordem de foco`, async ({ page }) => {
    await page.goto(`/${path}`);

    const links = page.locator('header nav[aria-label="Navegação principal"] a');
    await expect(links).toHaveText(["Início", "Explorar atividades", "Sobre", "Contato"]);

    const marked = page.locator('header nav [aria-current="page"]');
    if (current) await expect(marked).toHaveText(current);
    else await expect(marked).toHaveCount(0);

    await page.keyboard.press("Tab");
    await expect(page.locator(".skip-link")).toBeFocused();
    await expect(page.locator(".skip-link")).toBeVisible();
    await page.keyboard.press("Tab");
    await expect(page.locator(".site-header__brand")).toBeFocused();
    for (const name of ["Início", "Explorar atividades", "Sobre", "Contato"]) {
      await page.keyboard.press("Tab");
      await expect(page.locator("header nav a", { hasText: name })).toBeFocused();
    }
  });

  test(`${path}: o link de pular leva o foco ao conteúdo principal`, async ({ page }) => {
    await page.goto(`/${path}`);
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");
    await expect(page.locator("#main-content")).toBeFocused();
  });
}

test("o link de pular fica fora da tela até receber foco", async ({ page }) => {
  await page.goto("/index.html");
  const box = await page.locator(".skip-link").boundingBox();
  expect(box.y + box.height).toBeLessThanOrEqual(0);
});

test("o link atual não depende apenas de cor", async ({ page }) => {
  await page.goto("/sobre.html");
  const current = page.locator('header nav [aria-current="page"]');
  const other = page.locator("header nav a", { hasText: "Contato" });
  const style = async (loc) =>
    loc.evaluate((el) => {
      const s = getComputedStyle(el);
      return { decoration: s.textDecorationLine, weight: s.fontWeight };
    });
  expect(await style(current)).not.toEqual(await style(other));
});

test.describe("sem JavaScript", () => {
  test.use({ javaScriptEnabled: false, viewport: { width: 320, height: 640 } });

  for (const { path } of pages) {
    test(`${path}: links de navegação visíveis e funcionais`, async ({ page }) => {
      await page.goto(`/${path}`);
      await expect(page.locator("header nav a")).toHaveCount(4);
      await expect(page.locator("header nav a").first()).toBeVisible();
      await expect(page.locator(".site-header__toggle")).toBeHidden();
      await page.locator("header nav a", { hasText: "Sobre" }).click();
      await expect(page).toHaveURL(/sobre\.html$/);
    });
  }
});
