import { expect, test } from "@playwright/test";
import { accessibleName, headingOutline, landmarks } from "./helpers/a11y-checks.js";
import { scenarios } from "./helpers/a11y-matrix.js";

// Estrutura no DOM final, nomes acessíveis, página atual, imagens e links externos (FE-034, FE-037).
const targets = scenarios({ states: ["carregada", "resultados", "form-erros", "confirmacao"], widths: [1280] });
const VAGUE = /^(clique aqui|aqui|saiba mais|ver mais|mais|leia mais|clique|link)\.?$/i;

for (const scenario of targets) {
  test.describe(scenario.name, () => {
    test("títulos: um h1, sem salto de nível, nenhum vazio", async ({ page }) => {
      await scenario.open(page);
      const outline = await headingOutline(page);
      expect(outline.filter((h) => h.level === 1), "h1").toHaveLength(1);
      expect(outline.filter((h) => !h.text), "títulos vazios").toEqual([]);
      let previous = 0;
      for (const heading of outline) {
        expect(heading.level, `"${heading.text}" (h${heading.level}) depois de h${previous}`).toBeLessThanOrEqual(previous + 1);
        previous = heading.level;
      }
    });

    test("regiões: um banner, um main, um contentinfo e navegações nomeadas", async ({ page }) => {
      await scenario.open(page);
      const regions = await landmarks(page);
      expect(regions.banner).toBe(1);
      expect(regions.main).toBe(1);
      expect(regions.contentinfo).toBe(1);
      expect(regions.navigation.length).toBeGreaterThanOrEqual(2);
      expect(regions.navigation.filter((name) => !name)).toEqual([]);
    });

    test("todo link e botão visível tem nome claro e nada de nome vago", async ({ page }) => {
      await scenario.open(page);
      const controls = page.locator("a[href]:visible, button:visible");
      const total = await controls.count();
      expect(total).toBeGreaterThan(3);
      const problems = [];
      for (let i = 0; i < total; i += 1) {
        const control = controls.nth(i);
        const name = await accessibleName(control);
        if (!name) problems.push(`sem nome: ${await control.evaluate((el) => el.outerHTML.slice(0, 80))}`);
        else if (VAGUE.test(name)) problems.push(`nome vago: "${name}"`);
      }
      expect(problems).toEqual([]);
    });

    test("a página atual é marcada com aria-current em um único item da navegação principal", async ({ page }) => {
      await scenario.open(page);
      const current = page.locator("nav[aria-label='Navegação principal'] [aria-current='page']");
      if (scenario.page === "atividade.html") await expect(current).toHaveCount(0);
      else await expect(current).toHaveCount(1);
    });

    test("imagens: alt presente, nenhuma quebrada e ícones decorativos ocultos", async ({ page }) => {
      await scenario.open(page);
      const report = await page.evaluate(() => {
        const out = { noAlt: [], broken: [], svgExposed: [] };
        for (const img of document.querySelectorAll("img")) {
          if (!img.hasAttribute("alt")) out.noAlt.push(img.src);
          if (img.getAttribute("alt") !== "" && img.complete && img.naturalWidth === 0) out.broken.push(img.src);
        }
        for (const svg of document.querySelectorAll("svg")) {
          const named = svg.getAttribute("aria-label") || svg.querySelector("title");
          const hidden = svg.closest("[aria-hidden='true']");
          if (!named && !hidden) out.svgExposed.push(svg.outerHTML.slice(0, 60));
        }
        return out;
      });
      expect(report).toEqual({ noAlt: [], broken: [], svgExposed: [] });
    });
  });
}

test.describe("cartões e fallback", () => {
  test("cartões sem imagem usam fallback oculto, sem img e com link nomeado pelo título", async ({ page }) => {
    const [scenario] = scenarios({ states: ["resultados"], pages: ["explorar.html"], widths: [1280] });
    await scenario.open(page);
    const cards = page.locator(".activity-card");
    const count = await cards.count();
    expect(count).toBeGreaterThan(1);
    for (let i = 0; i < count; i += 1) {
      const card = cards.nth(i);
      await expect(card.locator("img")).toHaveCount(0);
      await expect(card.locator(".activity-card__media")).toHaveAttribute("aria-hidden", "true");
      const title = (await card.locator(".activity-card__title").innerText()).trim();
      expect(await accessibleName(card.locator("a"))).toContain(title);
    }
  });

  test("Detalhes sem imagem: o fallback não é anunciado", async ({ page }) => {
    const [scenario] = scenarios({ states: ["carregada"], pages: ["atividade.html"], widths: [1280] });
    await scenario.open(page);
    const media = page.locator(".activity-details__media");
    await expect(media).toHaveCount(1);
    await expect(media).toHaveAttribute("aria-hidden", "true");
  });
});

test("link externo: nova aba com rel seguro e aviso no nome", async ({ page }) => {
  const [scenario] = scenarios({ states: ["resultados"], pages: ["atividade.html"], widths: [1280] });
  await scenario.open(page);
  const external = page.locator("a[target=_blank]");
  await expect(external).toHaveCount(1);
  expect(await external.getAttribute("rel")).toMatch(/noopener/);
  expect(await accessibleName(external)).toMatch(/nova aba/i);
});
