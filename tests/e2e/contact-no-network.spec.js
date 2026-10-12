import { expect, test } from "@playwright/test";

const SECRET = "valor-secreto-123";

test.describe("contato: sem rede", () => {
  test("nenhuma requisição além dos recursos estáticos em todo o fluxo", async ({ page }) => {
    const requests = [];
    page.on("request", (req) => requests.push({ url: req.url(), method: req.method(), body: req.postData() }));
    await page.goto("/contato.html");
    const baseline = requests.length;

    await page.getByRole("button", { name: "Enviar mensagem" }).click();
    await page.getByLabel("Nome").fill(SECRET);
    await page.getByLabel("E-mail").fill(`${SECRET}@exemplo.com`);
    await page.getByLabel("Assunto").fill(SECRET);
    await page.getByLabel("Mensagem").fill(`${SECRET} ${SECRET}`);
    await page.getByRole("button", { name: "Enviar mensagem" }).click();
    await page.getByRole("button", { name: "Voltar ao formulário" }).click();
    await page.getByRole("button", { name: "Limpar campos" }).click();

    expect(requests.slice(baseline)).toEqual([]);
    for (const r of requests) {
      expect(r.method).toBe("GET");
      expect(r.body).toBeNull();
      expect(r.url).not.toContain(SECRET);
      expect(r.url).not.toMatch(/\/api\/v1|localhost:8000/);
    }
  });

  test("recarregar mostra o formulário vazio e a URL não muda", async ({ page }) => {
    await page.goto("/contato.html");
    await page.getByLabel("Nome").fill("Maria Silva");
    await page.getByLabel("E-mail").fill("maria@exemplo.com");
    await page.getByLabel("Assunto").fill("Dúvida");
    await page.getByLabel("Mensagem").fill("Gostaria de saber mais sobre as atividades.");
    await page.getByRole("button", { name: "Enviar mensagem" }).click();
    await expect(page).toHaveURL(/contato\.html$/);
    await page.reload();
    for (const label of ["Nome", "E-mail", "Assunto", "Mensagem"]) await expect(page.getByLabel(label)).toHaveValue("");
    expect(await page.evaluate(() => localStorage.length + sessionStorage.length + document.cookie.length)).toBe(0);
  });

  test("funciona com a configuração da API inválida", async ({ page }) => {
    await page.route("**/js/config.js", async (route) => {
      const response = await route.fetch();
      const body = (await response.text()).replace(/apiBaseUrl: "[^"]*"/, 'apiBaseUrl: ""');
      await route.fulfill({ response, body });
    });
    await page.goto("/contato.html");
    await expect(page.locator("[role=alert]")).toHaveCount(0);
    await page.getByRole("button", { name: "Enviar mensagem" }).click();
    await expect(page.locator(".field-error")).toHaveCount(4);
  });

  test("sem JavaScript, o aviso demonstrativo continua visível", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/contato.html");
    await expect(page.getByText("Formulário demonstrativo:")).toBeVisible();
    // O Playwright ignora <noscript> nos seletores de texto; lê o conteúdo direto do DOM.
    expect(await page.evaluate(() => document.querySelector("main noscript").textContent)).toContain("nada é enviado");
    await expect(page.getByRole("button", { name: "Enviar mensagem" })).toBeDisabled();
    await expect(page.locator("#contact-confirmation")).toBeHidden();
    await context.close();
  });
});
