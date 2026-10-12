import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// A verificação automática encontra só parte dos problemas: não prova conformidade com a WCAG.
// Teclado, leitor de tela, zoom e reflow continuam sendo verificados à mão (quickstart.md).
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

async function scan(page) {
  const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  return violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`);
}

test("sobre.html não tem violações detectáveis", async ({ page }) => {
  await page.goto("/sobre.html");
  expect(await scan(page)).toEqual([]);
});

test.describe("contato.html", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/contato.html");
    // O botão de envio só é habilitado quando o script do formulário roda.
    const submit = page.getByRole("button", { name: "Enviar mensagem" });
    await expect(submit).toBeEnabled();
    // Espera o fim da transição de cor do estado desabilitado para o habilitado (#2563eb).
    await expect(submit).toHaveCSS("background-color", "rgb(37, 99, 235)");
  });

  test("estado inicial", async ({ page }) => {
    expect(await scan(page)).toEqual([]);
    for (const el of await page.locator("input, textarea").all()) {
      const name = await el.evaluate((node) => node.labels?.[0]?.textContent?.trim() ?? "");
      expect(name.length).toBeGreaterThan(0);
    }
  });

  test("com erros", async ({ page }) => {
    await page.getByRole("button", { name: "Enviar mensagem" }).click();
    expect(await scan(page)).toEqual([]);
    for (const el of await page.locator("[aria-invalid=true]").all()) {
      const ids = (await el.getAttribute("aria-describedby")).split(" ");
      for (const id of ids) await expect(page.locator(`#${id}`)).toHaveCount(1);
    }
  });

  test("confirmado e de volta ao formulário", async ({ page }) => {
    await page.getByLabel("Nome").fill("Maria Silva");
    await page.getByLabel("E-mail").fill("maria@exemplo.com");
    await page.getByLabel("Assunto").fill("Dúvida");
    await page.getByLabel("Mensagem").fill("Gostaria de saber mais sobre as atividades.");
    await page.getByRole("button", { name: "Enviar mensagem" }).click();
    expect(await scan(page)).toEqual([]);
    await page.getByRole("button", { name: "Voltar ao formulário" }).click();
    expect(await scan(page)).toEqual([]);
  });
});
