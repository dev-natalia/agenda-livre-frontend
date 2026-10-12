import { expect, test } from "@playwright/test";
import { scenarios } from "./helpers/a11y-matrix.js";

// Movimento reduzido nos estados reais (FE-040, FR-030): com a preferência ativa, nenhuma transição ou
// animação passa de 0,01 ms nem a rolagem é animada, e as funções seguem iguais. Complementa reduced-motion.spec.js.
const targets = scenarios({
  states: ["carregada", "resultados", "vazio", "erro-api", "form-erros", "confirmacao", "menu-aberto"],
  widths: [1280, 320],
});

const motion = (page) =>
  page.evaluate(() => {
    const ms = (value) => Math.max(0, ...value.split(",").map((d) => parseFloat(d) * (d.includes("ms") ? 1 : 1000)));
    const moving = [...document.querySelectorAll("*")]
      .filter((el) => {
        const cs = getComputedStyle(el);
        return ms(cs.transitionDuration) > 0.01 || (cs.animationName !== "none" && ms(cs.animationDuration) > 0.01);
      })
      .map((el) => `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ""}.${String(el.className).split(" ")[0]}`);
    return { moving, scroll: getComputedStyle(document.documentElement).scrollBehavior };
  });

for (const scenario of targets) {
  test(`${scenario.name}: sem transições, animações nem rolagem animada`, async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await scenario.open(page);
    expect(await motion(page)).toEqual({ moving: [], scroll: "auto" });
    await context.close();
  });
}

test("o menu e o painel de confirmação funcionam do mesmo jeito com movimento reduzido", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 320, height: 640 } });
  const page = await context.newPage();
  const [menu] = scenarios({ states: ["carregada"], pages: ["sobre.html"], widths: [320] });
  await menu.open(page);
  const toggle = page.getByRole("button", { name: "Menu" });
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#site-nav-list a").first()).toBeVisible();
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");

  const [confirmation] = scenarios({ states: ["confirmacao"], widths: [320] });
  await confirmation.open(page);
  await expect(page.locator("#contact-confirmation")).toBeVisible();
  await expect(page.locator("#contact-form")).toBeHidden();
  await context.close();
});

test("a preferência alterada durante o uso passa a valer sem recarregar", async ({ page }) => {
  const [scenario] = scenarios({ states: ["carregada"], pages: ["explorar.html"], widths: [1280] });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await scenario.open(page);
  expect((await motion(page)).moving.length).toBeGreaterThan(0);
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(await motion(page)).toEqual({ moving: [], scroll: "auto" });
});
