import { expect, test } from "@playwright/test";
import { focusOrder } from "./helpers/a11y-checks.js";
import { PAGES, WIDTHS, scenarios, settle } from "./helpers/a11y-matrix.js";

// Teclado (FE-035, FE-036): link de pular, ordem de foco, menu e ausência de armadilhas.
// Cenários "carregada": a página no estado em que a pessoa a encontra ao chegar.
const loaded = scenarios({ states: ["carregada"] });

for (const scenario of loaded) {
  test.describe(scenario.name, () => {
    test("o primeiro Tab vai ao link de pular, visível, e acioná-lo leva ao conteúdo principal", async ({ page }) => {
      await scenario.open(page);
      await page.evaluate(() => document.activeElement?.blur?.());
      await page.keyboard.press("Tab");
      const skip = page.getByRole("link", { name: "Pular para o conteúdo principal" });
      await expect(skip).toBeFocused();
      const box = await skip.boundingBox();
      const viewport = page.viewportSize();
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
      expect(box.x).toBeGreaterThanOrEqual(0);

      await page.keyboard.press("Enter");
      await expect(page.locator("main")).toBeFocused();
      // O próximo Tab segue para dentro do conteúdo, não de volta ao cabeçalho.
      await page.keyboard.press("Tab");
      const where = await page.evaluate(() => ({
        inMain: Boolean(document.activeElement.closest("main")),
        inHeader: Boolean(document.activeElement.closest("header")),
      }));
      expect(where).toEqual({ inMain: true, inHeader: false });
    });

    test("a ordem de foco é a visual, sem itens ocultos e sem armadilha", async ({ page }) => {
      await scenario.open(page);
      const { visited, left, stuck } = await focusOrder(page, 200);
      expect(stuck, "foco preso").toBeFalsy();
      expect(left, "o foco sai da página ao fim do ciclo").toBe(true);
      expect(visited.length).toBeGreaterThan(3);

      const hidden = visited.filter((v) => v.hidden).map((v) => `${v.tag}#${v.id} ${v.text}`);
      expect(hidden, "elementos ocultos na ordem de foco").toEqual([]);

      if (scenario.width === 320) {
        // Menu fechado: os links de navegação não entram na ordem (só o botão "Menu").
        expect(visited.filter((v) => v.inNav)).toEqual([]);
      }

      // Ordem visual: de cima para baixo (tolerância de 2 px); na mesma linha, da esquerda para a direita.
      // O link de pular (fora da tela, no topo) e itens empilhados sobrepostos (cartão esticado) não contam.
      const rows = visited.filter((v) => v.box.width > 0 && v.box.height > 0);
      for (let i = 1; i < rows.length; i += 1) {
        const a = rows[i - 1].box;
        const b = rows[i].box;
        const sameRow = Math.abs(a.top - b.top) <= 2 || (b.top < a.top + a.height && a.top < b.top + b.height);
        const ok = b.top >= a.top - 2 || (sameRow && b.left >= a.left - 2);
        expect(ok, `${rows[i - 1].tag} "${rows[i - 1].text}" → ${rows[i].tag} "${rows[i].text}"`).toBe(true);
      }
    });
  });
}

test.describe("menu móvel (320 px)", () => {
  for (const page of PAGES) {
    test(`${page}: abre por teclado, entra na ordem de foco e fecha com Escape devolvendo o foco ao botão`, async ({ page: p }) => {
      const scenario = scenarios({ states: ["carregada"], pages: [page], widths: [320] })[0];
      await scenario.open(p);
      const toggle = p.getByRole("button", { name: "Menu" });
      await toggle.focus();
      await expect(toggle).toHaveAttribute("aria-expanded", "false");
      await p.keyboard.press("Enter");
      await expect(toggle).toHaveAttribute("aria-expanded", "true");

      await p.keyboard.press("Tab");
      const first = p.locator("#site-nav-list a").first();
      await expect(first).toBeFocused();
      const names = [];
      for (let i = 0; i < 4; i += 1) {
        names.push(await p.evaluate(() => document.activeElement.textContent.trim()));
        await p.keyboard.press("Tab");
      }
      expect(names).toEqual(["Início", "Explorar atividades", "Sobre", "Contato"]);

      await p.locator("#site-nav-list a").nth(1).focus();
      await p.keyboard.press("Escape");
      await expect(toggle).toHaveAttribute("aria-expanded", "false");
      await expect(toggle).toBeFocused();
      await settle(p);
      // Fechado, os links saem da ordem de foco.
      await p.keyboard.press("Tab");
      const insideNav = await p.evaluate(() => Boolean(document.activeElement.closest("#site-nav-list")));
      expect(insideNav).toBe(false);
    });
  }
});

test("ao redimensionar com o menu aberto, a navegação continua acessível em largura de desktop", async ({ page }) => {
  const scenario = scenarios({ states: ["carregada"], pages: ["index.html"], widths: [320] })[0];
  await scenario.open(page);
  await page.getByRole("button", { name: "Menu" }).click();
  await page.setViewportSize({ width: WIDTHS[0], height: 800 });
  await settle(page);
  for (const name of ["Início", "Explorar atividades", "Sobre", "Contato"]) {
    await expect(page.getByRole("navigation", { name: "Navegação principal" }).getByRole("link", { name })).toBeVisible();
  }
  await expect(page.getByRole("button", { name: "Menu" })).toBeHidden();
});
