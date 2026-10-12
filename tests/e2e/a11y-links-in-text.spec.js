import { expect, test } from "@playwright/test";
import { scenarios } from "./helpers/a11y-matrix.js";

// Links dentro de texto corrido se distinguem por mais de uma característica além da cor (WCAG 1.4.1).
const pages = scenarios({ states: ["carregada", "resultados", "confirmacao"], widths: [1280] });

for (const scenario of pages) {
  test(`${scenario.name}: links no meio de parágrafos têm sublinhado`, async ({ page }) => {
    await scenario.open(page);
    const links = await page.evaluate(() =>
      [...document.querySelectorAll("main p a[href], main li a[href], main dd a[href]")]
        .filter((a) => a.getClientRects().length > 0 && !a.classList.contains("button") && !a.closest("nav, .activity-card, .pagination"))
        .map((a) => ({
          text: a.textContent.trim().slice(0, 40),
          underline: getComputedStyle(a).textDecorationLine.includes("underline"),
          button: getComputedStyle(a).borderTopWidth !== "0px" && getComputedStyle(a).borderTopStyle !== "none",
        })),
    );
    for (const link of links) expect(link.underline || link.button, `link sem sublinhado nem forma: "${link.text}"`).toBe(true);
  });
}
