import { expect, test } from "@playwright/test";
import { PAGES, mountProbeCards } from "./helpers/viewports.js";

const PROBES = ["button", "input", ".activity-card", ".site-header__toggle", ".skeleton-card"];

async function mountProbes(page) {
  await mountProbeCards(page, 1);
  await page.evaluate(() => {
    const main = document.querySelector("main");
    main.insertAdjacentHTML(
      "beforeend",
      '<button class="button button--primary" type="button">B</button><input aria-label="c"><div class="skeleton-card"></div>',
    );
  });
}

const read = (page) =>
  page.evaluate((selectors) => {
    const out = {};
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      const cs = getComputedStyle(el);
      out[sel] = {
        duration: Math.max(...cs.transitionDuration.split(",").map((d) => parseFloat(d) * (d.includes("ms") ? 1 : 1000))),
      };
    }
    out.scroll = getComputedStyle(document.documentElement).scrollBehavior;
    return out;
  }, PROBES);

test.describe("movimento reduzido", () => {
  test.use({ viewport: { width: 320, height: 800 } });

  test("com a preferência ativa, transições ≈ 0 e rolagem imediata", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/index.html");
    await mountProbes(page);
    const s = await read(page);
    for (const sel of PROBES) expect(s[sel].duration, sel).toBeLessThanOrEqual(0.01);
    expect(s.scroll).toBe("auto");
  });

  test("sem a preferência, transições ≤ 300 ms e menu operável por teclado", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/index.html");
    await mountProbes(page);
    const s = await read(page);
    for (const sel of PROBES.filter((p) => p !== ".skeleton-card")) {
      expect(s[sel].duration, sel).toBeGreaterThan(0);
      expect(s[sel].duration, sel).toBeLessThanOrEqual(300);
    }
    expect(s.scroll).toBe("smooth");
    const toggle = page.locator(".site-header__toggle");
    await toggle.focus();
    await page.keyboard.press("Enter");
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  test("alternar a preferência com a página aberta muda os valores sem recarregar", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/index.html");
    await mountProbes(page);
    expect((await read(page))["button"].duration).toBeGreaterThan(0);
    await page.emulateMedia({ reducedMotion: "reduce" });
    expect((await read(page))["button"].duration).toBeLessThanOrEqual(0.01);
  });

  test("menu abre e fecha sem deslocamento com a preferência ativa", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/index.html");
    const list = page.locator("#site-nav-list");
    await page.locator(".site-header__toggle").click();
    const first = await list.boundingBox();
    await page.waitForTimeout(50);
    const second = await list.boundingBox();
    expect(second.y).toBe(first.y);
    await expect(list).toBeVisible();
  });

  test("nenhuma animação ativa nem carrossel nas cinco páginas", async ({ page }) => {
    for (const path of PAGES) {
      await page.goto(`/${path}`);
      const found = await page.evaluate(() => {
        const animated = [...document.querySelectorAll("*")].filter((el) => {
          const cs = getComputedStyle(el);
          return cs.animationName !== "none" && parseFloat(cs.animationDuration) > 0;
        });
        return { animated: animated.length, marquee: document.querySelectorAll("marquee, [data-carousel]").length };
      });
      expect(found, path).toEqual({ animated: 0, marquee: 0 });
    }
  });
});
