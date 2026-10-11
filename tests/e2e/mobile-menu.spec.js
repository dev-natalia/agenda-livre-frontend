import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 320, height: 640 } });

const button = (page) => page.getByRole("button", { name: "Menu" });
const navLinks = (page) => page.locator("#site-nav-list a");

test("menu inicia recolhido e os links não recebem foco", async ({ page }) => {
  await page.goto("/index.html");
  await expect(button(page)).toBeVisible();
  await expect(button(page)).toHaveAttribute("aria-expanded", "false");
  await expect(navLinks(page).first()).toBeHidden();

  await page.keyboard.press("Tab"); // pular
  await page.keyboard.press("Tab"); // marca
  await page.keyboard.press("Tab"); // botão
  await expect(button(page)).toBeFocused();
  await page.keyboard.press("Tab"); // próximo: conteúdo, não links
  await expect(page.locator("#site-nav-list a:focus")).toHaveCount(0);
});

test("Enter abre, Tab percorre os links, Esc fecha e devolve o foco", async ({ page }) => {
  await page.goto("/index.html");
  await button(page).focus();
  await page.keyboard.press("Enter");
  await expect(button(page)).toHaveAttribute("aria-expanded", "true");
  await expect(navLinks(page)).toHaveCount(4);
  await expect(navLinks(page).first()).toBeVisible();

  await page.keyboard.press("Tab");
  await expect(navLinks(page).first()).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(button(page)).toHaveAttribute("aria-expanded", "false");
  await expect(button(page)).toBeFocused();
  await expect(navLinks(page).first()).toBeHidden();
});

test("Espaço também abre e fecha", async ({ page }) => {
  await page.goto("/index.html");
  await button(page).focus();
  await page.keyboard.press("Space");
  await expect(button(page)).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Space");
  await expect(button(page)).toHaveAttribute("aria-expanded", "false");
});

test("ativar um link abre a página destino com o menu recolhido", async ({ page }) => {
  await page.goto("/index.html");
  await button(page).click();
  await page.locator("#site-nav-list a", { hasText: "Sobre" }).click();
  await expect(page).toHaveURL(/sobre\.html$/);
  await expect(button(page)).toHaveAttribute("aria-expanded", "false");
  await expect(navLinks(page).first()).toBeHidden();
});

test("sem rolagem horizontal a 320 px, com o menu aberto", async ({ page }) => {
  await page.goto("/index.html");
  await button(page).click();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);
});

test("o ponto de troca é 768 px", async ({ page }) => {
  await page.goto("/index.html");
  await page.setViewportSize({ width: 767, height: 640 });
  await expect(button(page)).toBeVisible();
  await page.setViewportSize({ width: 768, height: 640 });
  await expect(button(page)).toBeHidden();
  await expect(navLinks(page).first()).toBeVisible();
  await page.setViewportSize({ width: 767, height: 640 });
  await expect(button(page)).toHaveAttribute("aria-expanded", "false");
  await expect(navLinks(page).first()).toBeHidden();
});
