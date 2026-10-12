import { describe, expect, it } from "vitest";
import { contrast, cssFiles, readCss, rootTokens, ruleBlocks } from "./helpers/css.js";

// Contraste dos estados reais declarados no CSS (FE-039; WCAG 1.4.3, 1.4.11): complementa o teste dos
// tokens, que só vê as cores-base. Cada regra com texto e fundo conhecidos é medida; regras só com
// texto são medidas contra todas as superfícies em que o texto aparece. Pares que o analisador não
// resolve (gradientes, imagens, herança entre regras) são medidos no navegador (a11y-contrast-states).
const tokens = rootTokens();
const rules = cssFiles()
  .filter((file) => file !== "tokens.css")
  .flatMap((file) => ruleBlocks(readCss(file)).map((rule) => ({ ...rule, file })));

const HEX = /^#[0-9a-f]{6}$/i;
const resolve = (value) => {
  if (!value) return null;
  const match = value.match(/var\((--[\w-]+)\)/);
  const found = match ? tokens[match[1]] : value.trim();
  return HEX.test(found ?? "") ? found : null;
};
const background = (rule) => resolve(rule.declarations.background ?? rule.declarations["background-color"]);
const textColor = (rule) => resolve(rule.declarations.color);
const borderColor = (rule) => {
  const explicit = rule.declarations["border-color"] ?? rule.declarations["border-left"] ?? rule.declarations.border;
  return resolve(explicit?.split(/\s+/).find((part) => part.startsWith("var(") || part.startsWith("#")));
};

// Superfícies sobre as quais o texto aparece quando a regra não declara fundo.
const SURFACES = ["--color-background", "--color-surface"].map((name) => tokens[name]);
const label = (rule) => `${rule.file}: ${rule.selector}${rule.media ? ` @media ${rule.media}` : ""}`;

describe("texto e fundo declarados na mesma regra (mínimo 4,5:1)", () => {
  const pairs = rules.filter((r) => textColor(r) && background(r));

  it("há regras para medir", () => {
    expect(pairs.length).toBeGreaterThan(10);
  });

  it.each(pairs.map((r) => [label(r), r]))("%s", (_name, rule) => {
    expect(contrast(textColor(rule), background(rule))).toBeGreaterThanOrEqual(4.5);
  });
});

describe("texto sem fundo na regra: legível sobre as superfícies da página (mínimo 4,5:1)", () => {
  // Sem fundo próprio, a cor de texto herda o fundo do contêiner; o texto claro (brand-contrast) só
  // existe sobre fundos escuros declarados em outra regra (cabeçalho, botão), medidos no navegador.
  const bare = rules.filter((r) => textColor(r) && !background(r) && textColor(r) !== tokens["--color-brand-contrast"]);

  it.each(bare.map((r) => [label(r), r]))("%s", (_name, rule) => {
    for (const surface of SURFACES) {
      expect(contrast(textColor(rule), surface), `sobre ${surface}`).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe("bordas e contornos que identificam componentes (mínimo 3:1)", () => {
  const CONTROL = /(^|[\s,])(input|select|textarea|\.button|\.pagination__link|\.site-header__toggle)\b/;
  const borders = rules.filter((r) => CONTROL.test(r.selector) && borderColor(r) && !/transparent/.test(JSON.stringify(r.declarations)));

  // A borda externa é o limite do componente contra a página. Quando ela tem a cor do preenchimento,
  // o limite visível é o próprio preenchimento.
  it.each(borders.map((r) => [label(r), r]))("%s", (_name, rule) => {
    const edge = borderColor(rule) === background(rule) ? background(rule) : borderColor(rule);
    for (const surface of SURFACES) {
      expect(contrast(edge, surface), `sobre ${surface}`).toBeGreaterThanOrEqual(3);
    }
  });

  it("o contorno de foco tem 3:1 contra cada superfície da página e contra o fundo dos botões", () => {
    const focus = tokens["--focus-color"];
    for (const surface of [...SURFACES, tokens["--color-tag-background"], tokens["--color-notice-background"]]) {
      expect(contrast(focus, surface), `sobre ${surface}`).toBeGreaterThanOrEqual(3);
    }
  });
});

describe("estados que precisam de indício além da cor (1.4.1)", () => {
  const hasNonColorCue = (rule) =>
    ["text-decoration", "font-weight", "border-style", "border-width", "border-left-width", "box-shadow", "outline"].some(
      (prop) => rule.declarations[prop] !== undefined,
    ) || /border:\s*[^;]*(dashed|dotted|double)/.test(JSON.stringify(rule.declarations));

  it.each([
    ["[aria-current]", /aria-current/],
    ["página atual da paginação", /pagination__link--current/],
    ["desabilitado", /disabled/],
    ["[aria-invalid]", /aria-invalid/],
  ])("%s muda forma, peso ou borda", (_name, pattern) => {
    const matching = rules.filter((r) => pattern.test(r.selector));
    expect(matching.length).toBeGreaterThan(0);
    expect(matching.some(hasNonColorCue), matching.map(label).join(" | ")).toBe(true);
  });
});
