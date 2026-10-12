import { expect, test } from "@playwright/test";

async function fillValid(page) {
  await page.getByLabel("Nome").fill("Maria Silva");
  await page.getByLabel("E-mail").fill("maria@exemplo.com");
  await page.getByLabel("Assunto").fill("Dúvida");
  await page.getByLabel("Mensagem").fill("Gostaria de saber mais sobre as atividades.");
}

const send = (page) => page.getByRole("button", { name: "Enviar mensagem" }).click();
const fits = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);

test.describe("contato: confirmação demonstrativa", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/contato.html");
  });

  test("troca o formulário pelo painel, foca o título e não recarrega", async ({ page }) => {
    await page.evaluate(() => (window.__marker = "mesma-pagina"));
    await fillValid(page);
    await send(page);
    const panel = page.locator("#contact-confirmation");
    await expect(panel).toBeVisible();
    await expect(page.locator("#contact-form")).toBeHidden();
    await expect(panel.getByRole("heading", { name: "Formulário demonstrativo" })).toBeFocused();
    await expect(panel.getByText("Nenhuma mensagem foi enviada")).toBeVisible();
    await expect(page).toHaveURL(/contato\.html$/);
    expect(await page.evaluate(() => window.__marker)).toBe("mesma-pagina");
  });

  test("nenhum texto sugere envio ou recebimento", async ({ page }) => {
    await fillValid(page);
    await send(page);
    const text = await page.locator("main").innerText();
    expect(text).not.toMatch(/recebida|recebemos|enviada com sucesso|entregue|retornaremos|responderemos/i);
  });

  test("voltar preserva os valores, foca o Nome; limpar esvazia", async ({ page }) => {
    await fillValid(page);
    await send(page);
    await page.getByRole("button", { name: "Voltar ao formulário" }).click();
    await expect(page.locator("#contact-form")).toBeVisible();
    await expect(page.locator("#contact-confirmation")).toBeHidden();
    await expect(page.getByLabel("Nome")).toBeFocused();
    await expect(page.getByLabel("Nome")).toHaveValue("Maria Silva");
    await expect(page.getByLabel("Mensagem")).toHaveValue("Gostaria de saber mais sobre as atividades.");
    await page.getByRole("button", { name: "Limpar campos" }).click();
    await expect(page.getByLabel("Nome")).toHaveValue("");
    await expect(page.getByLabel("Mensagem")).toHaveValue("");
  });

  test("sem animação de entrada com movimento reduzido", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await fillValid(page);
    await send(page);
    const style = await page.locator("#contact-confirmation").evaluate((el) => {
      const cs = getComputedStyle(el);
      return { t: parseFloat(cs.transitionDuration), a: parseFloat(cs.animationDuration) };
    });
    expect(style.t).toBeLessThanOrEqual(0.01);
    expect(style.a).toBeLessThanOrEqual(0.01);
  });

  for (const [width, zoom] of [
    [320, false],
    [320, true],
  ]) {
    test(`formulário, erros e painel em ${width}px${zoom ? " com texto a 200%" : ""} sem rolagem horizontal`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/contato.html");
      if (zoom) await page.addStyleTag({ content: "html { font-size: 200%; }" });
      expect(await fits(page)).toBe(true);
      await send(page);
      expect(await fits(page)).toBe(true);
      await expect(page.locator("#name-error")).toBeVisible();
      await fillValid(page);
      await send(page);
      expect(await fits(page)).toBe(true);
      await expect(page.getByRole("button", { name: "Voltar ao formulário" })).toBeVisible();
    });
  }
});
