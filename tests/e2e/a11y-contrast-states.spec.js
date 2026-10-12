import { expect, test } from "@playwright/test";
import { scenarios, settle } from "./helpers/a11y-matrix.js";

// Contraste medido no navegador, com os estilos computados dos elementos reais (FE-039; WCAG 1.4.3 e 1.4.11):
// texto contra o fundo efetivo (compondo fundos translúcidos até um fundo opaco) e, nos controles,
// o texto também em estado de passagem do mouse e de foco. Complementa os testes de tokens e de CSS.
const targets = scenarios({
  states: ["carregada", "resultados", "vazio", "erro-api", "form-erros", "confirmacao"],
  widths: [1280, 320],
});

// Corre dentro da página: devolve as medições e os elementos que não puderam ser medidos.
function measure(only = null) {
  const parse = (value) => {
    const m = value.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const [r, g, b, a = 1] = m[1].split(/[,\s/]+/).filter(Boolean).map(Number);
    return { r, g, b, a };
  };
  const over = (top, under) => ({
    r: top.r * top.a + under.r * (1 - top.a),
    g: top.g * top.a + under.g * (1 - top.a),
    b: top.b * top.a + under.b * (1 - top.a),
    a: 1,
  });
  const lum = ({ r, g, b }) => {
    const ch = (v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
  };
  const ratio = (a, b) => {
    const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
    return (x + 0.05) / (y + 0.05);
  };

  // Fundo efetivo: sobe pela árvore compondo fundos translúcidos; se achar imagem ou degradê, desiste.
  function backdrop(el) {
    const layers = [];
    for (let node = el; node; node = node.parentElement) {
      const style = getComputedStyle(node);
      if (style.backgroundImage !== "none") return { unknown: true };
      const color = parse(style.backgroundColor);
      if (color && color.a > 0) layers.push(color);
      if (color && color.a === 1) break;
    }
    let result = { r: 255, g: 255, b: 255, a: 1 };
    for (const layer of layers.reverse()) result = over(layer, result);
    return result;
  }

  const hasOwnText = (el) => [...el.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
  const visible = (el) => {
    const style = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none" && style.opacity !== "0";
  };
  const hiddenFromEveryone = (el) => Boolean(el.closest(".visually-hidden, [aria-hidden='true']"));

  const elements = only ? [only] : [...document.querySelectorAll("body *")].filter((el) => hasOwnText(el));
  const rows = [];
  const unknown = [];
  for (const el of elements) {
    if (!visible(el) || hiddenFromEveryone(el)) continue;
    const style = getComputedStyle(el);
    const fg = parse(style.color);
    const bg = backdrop(el);
    const name = `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ""}${el.className && typeof el.className === "string" ? `.${el.className.split(" ")[0]}` : ""} "${el.textContent.trim().slice(0, 30)}"`;
    if (bg.unknown || !fg) {
      unknown.push(name);
      continue;
    }
    const size = parseFloat(style.fontSize);
    const bold = Number(style.fontWeight) >= 700;
    const large = size >= 24 || (size >= 18.66 && bold);
    const textOnBackground = fg.a < 1 ? over(fg, bg) : fg;
    rows.push({ name, ratio: ratio(textOnBackground, bg), min: large ? 3 : 4.5, disabled: el.matches(":disabled") || el.closest("[aria-disabled=true]") !== null });
  }
  return { rows, unknown };
}

const failures = ({ rows }) => rows.filter((r) => r.ratio < r.min).map((r) => `${r.name}: ${r.ratio.toFixed(2)} < ${r.min}`);

for (const scenario of targets) {
  test.describe(scenario.name, () => {
    test("todo texto visível atinge o contraste mínimo", async ({ page }) => {
      await scenario.open(page);
      const result = await page.evaluate(measure);
      expect(result.rows.length).toBeGreaterThan(3);
      expect(failures(result)).toEqual([]);
    });

    test("texto de links e botões em passagem do mouse e em foco atinge o contraste mínimo", async ({ page }) => {
      // Largura única e poucos controles: a medição por estado é lenta (espera as transições de cor).
      test.skip(scenario.width !== 1280 || ["vazio", "erro-api"].includes(scenario.state), "coberto nos outros cenários");
      await scenario.open(page);
      const problems = [];
      // O link de pular só aparece com foco: medir nesse estado.
      await page.locator(".skip-link").focus();
      await page.waitForTimeout(200);
      for (const message of failures(await page.evaluate(measure, await page.locator(".skip-link").elementHandle()))) {
        problems.push(`foco: ${message}`);
      }
      await page.evaluate(() => document.activeElement.blur());
      const controls = page.locator("a[href]:visible:not(.skip-link), button:visible:not([disabled])");
      const total = Math.min(await controls.count(), 12);
      for (let i = 0; i < total; i += 1) {
        const control = controls.nth(i);
        for (const state of ["hover", "focus"]) {
          if (state === "hover") await control.hover();
          else await control.focus();
          await page.waitForTimeout(200);
          const handle = await control.elementHandle();
          const own = await page.evaluate(measure, handle);
          for (const message of failures(own)) problems.push(`${state}: ${message}`);
        }
      }
      await page.mouse.move(0, 0);
      expect(problems).toEqual([]);
    });
  });
}
