import { expect, test } from "@playwright/test";
import { PAGES, WIDTHS, columnsOf, mountProbeCards } from "./helpers/viewports.js";

const noHorizontalScroll = (page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);

test.describe("reflow nas larguras de referência", () => {
  for (const path of PAGES) {
    for (const width of WIDTHS) {
      test(`${path} em ${width}px não rola na horizontal`, async ({ page }) => {
        await page.setViewportSize({ width, height: 800 });
        await page.goto(`/${path}`);
        await mountProbeCards(page, 3);
        expect(await noHorizontalScroll(page)).toBe(true);
      });
    }
  }

  for (const width of [320, 768]) {
    test(`texto a 200% em ${width}px mantém conteúdo sem rolagem horizontal nem sobreposição`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      for (const path of PAGES) {
        await page.goto(`/${path}`);
        await page.addStyleTag({ content: "html { font-size: 200%; }" });
        await mountProbeCards(page, 2);
        const toggle = page.locator(".site-header__toggle");
        if (await toggle.isVisible()) await toggle.click();
        expect(await noHorizontalScroll(page), path).toBe(true);
        const overlap = await page.evaluate(() => {
          const header = document.querySelector("header").getBoundingClientRect();
          const main = document.querySelector("main").getBoundingClientRect();
          return header.bottom > main.top + 1;
        });
        expect(overlap, path).toBe(false);
      }
    });
  }

  test("o viewport não bloqueia o zoom", async ({ page }) => {
    for (const path of PAGES) {
      await page.goto(`/${path}`);
      const content = await page.locator('meta[name="viewport"]').getAttribute("content");
      expect(content).not.toMatch(/maximum-scale|user-scalable\s*=\s*(no|0)/);
    }
  });
});

test.describe("grade de cards e alvos", () => {
  for (const [width, columns] of [[375, 1], [768, 2], [1280, 3]]) {
    test(`${width}px mostra ${columns} coluna(s) com áreas de imagem iguais`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/index.html");
      await mountProbeCards(page, 6);
      expect(await columnsOf(page)).toBe(columns);
      const heights = await page.evaluate(() =>
        [...document.querySelectorAll(".activity-card__media")].map((m) => Math.round(m.getBoundingClientRect().height)),
      );
      expect(new Set(heights).size).toBe(1);
    });
  }

  test("alvos de toque ≥ 44px de altura e sem sobreposição; título longo não estoura em 320px", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto("/index.html");
    await mountProbeCards(page, 2);
    await page.locator(".site-header__toggle").click();
    const sizes = await page.evaluate(() =>
      [...document.querySelectorAll(".site-header__toggle, .site-nav a, .site-header__brand")].map((el) => {
        const r = el.getBoundingClientRect();
        return { w: r.width, h: r.height, top: r.top, bottom: r.bottom, left: r.left, right: r.right };
      }),
    );
    for (const s of sizes) {
      expect(s.h).toBeGreaterThanOrEqual(44);
      expect(s.w).toBeGreaterThanOrEqual(24);
    }
    for (let i = 0; i < sizes.length; i++) {
      for (let j = i + 1; j < sizes.length; j++) {
        const a = sizes[i];
        const b = sizes[j];
        const overlap = a.left < b.right && b.left < a.right && a.top < b.bottom - 1 && b.top < a.bottom - 1;
        expect(overlap).toBe(false);
      }
    }
    expect(await noHorizontalScroll(page)).toBe(true);
    const cardOverflow = await page.evaluate(() => {
      const card = document.querySelector(".activity-card").getBoundingClientRect();
      const title = document.querySelector(".activity-card__title").getBoundingClientRect();
      return title.right > card.right + 1;
    });
    expect(cardOverflow).toBe(false);
  });
});

test.describe("pontos de quebra e orientação", () => {
  for (const width of [639, 640, 767, 768, 1023, 1024]) {
    test(`${width}px: nunca há duas navegações nem nenhuma`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/index.html");
      const state = await page.evaluate(() => {
        const toggle = document.querySelector(".site-header__toggle");
        const list = document.querySelector("#site-nav-list");
        const toggleVisible = toggle.getBoundingClientRect().width > 0;
        const listVisible = list.getBoundingClientRect().height > 0;
        return { toggleVisible, listVisible };
      });
      // Estreito: botão visível e lista recolhida; largo: lista visível e sem botão.
      expect(state.toggleVisible).toBe(width < 768);
      expect(state.listVisible).toBe(width >= 768);
    });
  }

  for (const [width, height] of [[390, 844], [844, 390]]) {
    test(`orientação ${width}x${height} sem rolagem horizontal`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      for (const path of PAGES) {
        await page.goto(`/${path}`);
        expect(await noHorizontalScroll(page), path).toBe(true);
      }
    });
  }
});
