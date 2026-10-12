import { expect, test } from "@playwright/test";
import { scenarios } from "./helpers/a11y-matrix.js";

// Foco visível e não encoberto (FE-036; WCAG 2.4.7 e 2.4.11) em páginas e estados com mais controles.
const targets = scenarios({
  states: ["carregada", "resultados", "form-erros", "erro-api"],
  widths: [1280, 320],
});

// Lê o que a pessoa vê ao focalizar o controle: contorno ou sombra, posição e cobertura.
const inspectFocus = (page) =>
  page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return null;
    const style = getComputedStyle(el);
    // Cartão esticado: o contorno aparece no cartão (ancestral), não no link do título.
    const card = el.closest(".activity-card");
    const cardStyle = card ? getComputedStyle(card) : null;
    const outlined = (s) => s.outlineStyle !== "none" && parseFloat(s.outlineWidth) >= 2;
    const shadowed = (s) => s.boxShadow !== "none";
    const rect = (card ?? el).getBoundingClientRect();
    const cx = Math.min(Math.max(rect.left + rect.width / 2, 0), innerWidth - 1);
    const cy = Math.min(Math.max(rect.top + rect.height / 2, 0), innerHeight - 1);
    const top = document.elementFromPoint(cx, cy);
    return {
      label: `${el.tagName.toLowerCase()}#${el.id} "${(el.textContent ?? "").trim().slice(0, 40)}"`,
      visibleIndicator: outlined(style) || shadowed(style) || (cardStyle && outlined(cardStyle)),
      inViewport: rect.bottom > 0 && rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth,
      covered: top !== null && !(card ?? el).contains(top) && !top.contains(el),
      coveredBy: top ? top.tagName.toLowerCase() + (top.className ? `.${String(top.className).split(" ")[0]}` : "") : null,
    };
  });

// A rolagem suave (sem preferência por movimento reduzido) ainda está andando logo após o Tab:
// espera a posição se estabilizar antes de medir.
const scrollSettled = (page) =>
  page.evaluate(
    () =>
      new Promise((resolve) => {
        let last = -1;
        let stable = 0;
        const tick = () => {
          stable = scrollY === last ? stable + 1 : 0;
          last = scrollY;
          if (stable >= 4) resolve();
          else requestAnimationFrame(tick);
        };
        tick();
      }),
  );

for (const scenario of targets) {
  test(`${scenario.name}: todo controle focado mostra indicador, está na tela e não fica encoberto`, async ({ page }) => {
    await scenario.open(page);
    await page.evaluate(() => document.activeElement?.blur?.());
    const failures = [];
    for (let step = 0; step < 80; step += 1) {
      await page.keyboard.press("Tab");
      await scrollSettled(page);
      const info = await inspectFocus(page);
      if (!info) break;
      // O link de pular é a primeira parada; os demais controles precisam do indicador.
      if (!info.visibleIndicator) failures.push(`${info.label}: sem indicador de foco`);
      if (!info.inViewport) failures.push(`${info.label}: fora da tela`);
      if (info.covered) failures.push(`${info.label}: encoberto por ${info.coveredBy}`);
    }
    expect(failures).toEqual([]);
  });
}
