import { expect, test } from "@playwright/test";

test.describe("página Sobre", () => {
  test("mostra o conteúdo institucional sem consultar a API", async ({ page }) => {
    const apiRequests = [];
    page.on("request", (req) => {
      if (/\/api\/v1|localhost:8000/.test(req.url())) apiRequests.push(req.url());
    });
    await page.goto("/sobre.html");
    await expect(page).toHaveTitle("Sobre — Agenda Livre");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Sobre o Agenda Livre");
    await expect(page.getByRole("heading", { level: 2 })).toHaveCount(4);
    await expect(page.getByText("não processa inscrições")).toBeVisible();
    expect(apiRequests).toEqual([]);
  });

  test("navegação compartilhada: página atual, link de pular e chamada para Explorar", async ({ page }) => {
    await page.goto("/sobre.html");
    await expect(page.locator('nav[aria-label="Navegação principal"] a[aria-current="page"]')).toHaveText("Sobre");
    await page.keyboard.press("Tab");
    const skip = page.locator(".skip-link");
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main-content$/);
    await page.getByRole("link", { name: "Explorar atividades" }).last().click();
    await expect(page).toHaveURL(/explorar\.html$/);
  });

  for (const [label, width, zoom] of [
    ["320 px", 320, false],
    ["320 px com texto a 200%", 320, true],
  ]) {
    test(`legível sem rolagem horizontal em ${label}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/sobre.html");
      if (zoom) await page.addStyleTag({ content: "html { font-size: 200%; }" });
      const fits = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
      expect(fits).toBe(true);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.locator("main").getByRole("link", { name: "Explorar atividades" })).toBeVisible();
    });
  }

  test("o conteúdo continua legível sem JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/sobre.html");
    await expect(page.getByText("não processa inscrições")).toBeVisible();
    await context.close();
  });
});
