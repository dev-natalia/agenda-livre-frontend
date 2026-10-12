import { expect, test } from "@playwright/test";

const send = (page) => page.getByRole("button", { name: "Enviar mensagem" }).click();

test.describe("contato: validação", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/contato.html");
  });

  test("formulário vazio mostra os quatro erros, o resumo e foca o Nome", async ({ page }) => {
    await send(page);
    await expect(page.locator(".field-error")).toHaveCount(4);
    await expect(page.locator("#name-error")).toHaveText(/Informe seu nome\./);
    await expect(page.locator("#contact-summary")).toHaveText("4 campos precisam de correção.");
    await expect(page.getByLabel("Nome")).toBeFocused();
  });

  test("erros específicos por campo, texto colado mantido e erro some ao corrigir", async ({ page }) => {
    const long = "x".repeat(1001);
    await page.getByLabel("Nome").fill("Maria Silva");
    await page.getByLabel("E-mail").fill("abc");
    await page.getByLabel("Assunto").fill("ab");
    await page.getByLabel("Mensagem").fill(long);
    await send(page);

    await expect(page.locator("#email-error")).toContainText("e-mail válido");
    await expect(page.locator("#subject-error")).toContainText("pelo menos 3 caracteres");
    await expect(page.locator("#message-error")).toContainText("no máximo 1000 caracteres");
    await expect(page.locator("#name-error")).toHaveCount(0);
    await expect(page.getByLabel("Mensagem")).toHaveValue(long);
    await expect(page.getByLabel("E-mail")).toBeFocused();
    await expect(page.getByLabel("Nome")).toHaveValue("Maria Silva");

    await page.getByLabel("E-mail").fill("maria@exemplo.com");
    await expect(page.locator("#email-error")).toHaveCount(0);
    await expect(page.locator("#subject-error")).toHaveCount(1);
  });

  test("campos inválidos têm aria-invalid, descrição associada e indício além da cor", async ({ page }) => {
    await send(page);
    const field = page.getByLabel("E-mail");
    await expect(field).toHaveAttribute("aria-invalid", "true");
    await expect(field).toHaveAttribute("aria-describedby", "email-hint email-error");
    expect(await field.evaluate((el) => getComputedStyle(el).borderStyle)).toBe("dashed");
    await expect(page.locator("#email-error")).toBeVisible();
  });

  test("Tab percorre os demais campos inválidos", async ({ page }) => {
    await send(page);
    await expect(page.getByLabel("Nome")).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByLabel("E-mail")).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByLabel("Assunto")).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByLabel("Mensagem")).toBeFocused();
  });

  test("não aparece balão nativo e nenhum erro surge antes do envio", async ({ page }) => {
    await expect(page.locator(".field-error")).toHaveCount(0);
    await page.getByLabel("E-mail").fill("abc");
    await page.getByLabel("Nome").focus();
    await expect(page.locator(".field-error")).toHaveCount(0);
    await send(page);
    expect(await page.getByLabel("E-mail").evaluate((el) => el.validationMessage.length > 0)).toBe(true);
    await expect(page.locator("#email-error")).toContainText("Informe um e-mail válido");
  });
});

test.describe("contato: teclado", () => {
  test("percorre e envia só com o teclado, e Enter em Mensagem quebra a linha", async ({ page }) => {
    await page.goto("/contato.html");
    await page.keyboard.press("Tab"); // pular ao conteúdo
    for (let i = 0; i < 12; i += 1) {
      await page.keyboard.press("Tab");
      if (await page.getByLabel("Nome").evaluate((el) => el === document.activeElement)) break;
    }
    await expect(page.getByLabel("Nome")).toBeFocused();
    await page.keyboard.type("Maria Silva");
    await page.keyboard.press("Tab");
    await expect(page.getByLabel("E-mail")).toBeFocused();
    await page.keyboard.type("maria@exemplo.com");
    await page.keyboard.press("Tab");
    await expect(page.getByLabel("Assunto")).toBeFocused();
    await page.keyboard.type("Dúvida");
    await page.keyboard.press("Tab");
    await expect(page.getByLabel("Mensagem")).toBeFocused();
    await page.keyboard.type("Primeira linha da mensagem");
    await page.keyboard.press("Enter");
    await page.keyboard.type("segunda linha");
    await expect(page.locator("#contact-confirmation")).toBeHidden();
    expect(await page.getByLabel("Mensagem").inputValue()).toContain("\n");
    await page.keyboard.press("Tab");
    const submit = page.getByRole("button", { name: "Enviar mensagem" });
    await expect(submit).toBeFocused();
    expect(await submit.evaluate((el) => getComputedStyle(el).outlineStyle)).not.toBe("none");
    await page.keyboard.press("Space");
    await expect(page.locator("#contact-confirmation")).toBeVisible();
  });

  test("Enter em campo de uma linha envia o formulário com a mesma validação", async ({ page }) => {
    await page.goto("/contato.html");
    await page.getByLabel("Nome").fill("M");
    await page.getByLabel("Nome").press("Enter");
    await expect(page.locator(".field-error")).toHaveCount(4);
    await expect(page.locator("#name-error")).toContainText("pelo menos 2 caracteres");
  });
});
