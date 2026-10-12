import { expect, test } from "@playwright/test";
import { scenarios } from "./helpers/a11y-matrix.js";

// Estados sem depender só de cor (FE-036; WCAG 1.4.1): cada estado muda forma, texto ou borda.
// Mudanças de `color`, `background-color` e `border-color` sozinhas não contam.
const NON_COLOR = ["textDecorationLine", "fontWeight", "borderStyle", "borderTopWidth", "borderLeftWidth", "borderBottomWidth", "outlineStyle", "outlineWidth", "fontStyle"];

const readStyle = (locator) =>
  locator.evaluate((el, props) => {
    const s = getComputedStyle(el);
    return Object.fromEntries(props.map((p) => [p, s[p]]));
  }, NON_COLOR);

const differs = (a, b) => NON_COLOR.filter((p) => a[p] !== b[p]);

test("navegação: o item da página atual muda forma ou peso, não só a cor", async ({ page }) => {
  const [scenario] = scenarios({ states: ["carregada"], pages: ["explorar.html"], widths: [1280] });
  await scenario.open(page);
  const current = page.locator("#site-nav-list a[aria-current=page]");
  const other = page.locator("#site-nav-list a:not([aria-current])").first();
  const diff = differs(await readStyle(current), await readStyle(other));
  expect(diff, "propriedades não cromáticas que diferem").not.toEqual([]);
});

test("paginação: a página atual muda forma ou peso, não só a cor", async ({ page }) => {
  const [scenario] = scenarios({ states: ["resultados"], pages: ["explorar.html"], widths: [1280] });
  await scenario.open(page);
  const current = page.locator("#results-pagination [aria-current]").first();
  const other = page.locator("#results-pagination a:not([aria-current])").first();
  await expect(current).toBeVisible();
  const diff = differs(await readStyle(current), await readStyle(other));
  expect(diff, "propriedades não cromáticas que diferem").not.toEqual([]);
});

test("formulário: campo inválido tem borda diferente e mensagem em texto com o prefixo de erro", async ({ page }) => {
  const [scenario] = scenarios({ states: ["form-erros"], widths: [1280] });
  await scenario.open(page);
  const invalid = page.locator("#contact-name");
  await expect(invalid).toHaveAttribute("aria-invalid", "true");
  const valid = page.locator("#contact-name");
  await valid.fill("Maria de Teste");
  await page.locator("#contact-name").dispatchEvent("input");
  await expect(page.locator("#contact-name")).not.toHaveAttribute("aria-invalid", "true");
  const validStyle = await readStyle(valid);
  await page.getByRole("button", { name: "Limpar campos" }).click();
  await page.getByRole("button", { name: "Enviar mensagem" }).click();
  const invalidStyle = await readStyle(page.locator("#contact-name"));
  expect(differs(validStyle, invalidStyle), "propriedades não cromáticas que diferem").not.toEqual([]);
  // O prefixo "Erro:" vem do ::before da mensagem; o texto da mensagem é específico do problema.
  const message = page.locator("#name-error");
  await expect(message).toHaveText("Informe seu nome.");
  const prefix = await message.evaluate((el) => getComputedStyle(el, "::before").content);
  expect(prefix).toMatch(/Erro/);
});

test("botão desabilitado: borda ou estilo diferente do habilitado", async ({ page }) => {
  await page.goto("/contato.html");
  const submit = page.getByRole("button", { name: "Enviar mensagem" });
  await page.waitForFunction(() => !document.querySelector("#contact-form button[type=submit]").disabled);
  const enabled = await readStyle(submit);
  await submit.evaluate((el) => { el.disabled = true; });
  const disabled = await readStyle(submit);
  expect(differs(enabled, disabled), "propriedades não cromáticas que diferem").not.toEqual([]);
});
