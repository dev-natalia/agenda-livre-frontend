import { describe, expect, it } from "vitest";
import { cssFiles, readCss, ruleBlocks } from "./helpers/css.js";

// Regras de CSS que sustentam foco visível, link de pular e movimento reduzido
// (specs/009-transversal-accessibility, FR-007, FR-011, FR-030).
const rules = cssFiles().flatMap((file) => ruleBlocks(readCss(file)).map((rule) => ({ ...rule, file })));
const removesOutline = (rule) => /^(none|0)\b/.test(rule.declarations.outline ?? "") || rule.declarations["outline-style"] === "none";
const hasFocusOutline = (rule) =>
  /solid/.test(rule.declarations.outline ?? "") && /focus-width/.test(rule.declarations.outline ?? "");

// Remoções de contorno permitidas, cada uma com o seletor que mostra o foco no lugar.
const OUTLINE_EXCEPTIONS = [
  // O foco programático em <main> não é alvo de teclado; o foco por Tab não passa por ele.
  { selector: 'main[tabindex="-1"]:focus', substitute: null },
  // O link do título do cartão é esticado sobre o cartão; o cartão inteiro mostra o contorno.
  { selector: ".activity-card__title a:focus-visible", substitute: ".activity-card:focus-within" },
];

describe("foco visível no CSS", () => {
  it("há um :focus-visible global com contorno da largura e da cor do token", () => {
    const global = rules.find((r) => r.selector === ":focus-visible");
    expect(global, "regra :focus-visible global").toBeDefined();
    expect(global.declarations.outline).toBe("var(--focus-width) solid var(--focus-color)");
  });

  it("toda remoção de contorno é uma exceção conhecida, com substituto que mostra o foco", () => {
    const removals = rules.filter(removesOutline).filter((r) => /:focus/.test(r.selector));
    const unknown = removals.filter((r) => !OUTLINE_EXCEPTIONS.some((e) => e.selector === r.selector));
    expect(unknown.map((r) => `${r.file}: ${r.selector}`)).toEqual([]);

    for (const exception of OUTLINE_EXCEPTIONS.filter((e) => e.substitute)) {
      const substitute = rules.find((r) => r.selector === exception.substitute);
      expect(substitute && hasFocusOutline(substitute), `substituto ${exception.substitute}`).toBe(true);
    }
  });

  it("nenhuma regra zera o contorno fora de :focus (ex.: *, a, button)", () => {
    const offenders = rules.filter(removesOutline).filter((r) => !/:focus/.test(r.selector));
    expect(offenders.map((r) => `${r.file}: ${r.selector}`)).toEqual([]);
  });

  it("o modo de cores forçadas não remove o contorno", () => {
    const forced = rules.filter((r) => /forced-colors/.test(r.media ?? ""));
    expect(forced.filter(removesOutline).map((r) => r.selector)).toEqual([]);
  });
});

describe("link de pular", () => {
  const skip = rules.find((r) => r.selector === ".skip-link");
  const skipFocus = rules.find((r) => r.selector === ".skip-link:focus");

  it("fica fora da tela até receber foco e então entra na tela", () => {
    expect(skip.declarations.transform).toMatch(/translateY\(-\d+%\)/);
    expect(skipFocus.declarations.transform).toBe("translateY(0)");
  });

  it("não usa display:none nem visibility:hidden (continua focável)", () => {
    expect(skip.declarations.display ?? "").not.toBe("none");
    expect(skip.declarations.visibility ?? "").not.toBe("hidden");
  });
});

describe("cabeçalho e foco não encoberto", () => {
  it("se algum elemento ficar fixo ou grudado, html tem scroll-padding-top", () => {
    const sticky = rules.filter((r) => /^(sticky|fixed)$/.test(r.declarations.position ?? ""));
    const stuck = sticky.filter((r) => !/skeleton|visually-hidden/.test(r.selector));
    if (stuck.length === 0) return;
    const root = rules.find((r) => r.selector === "html" && r.declarations["scroll-padding-top"]);
    expect(root, `scroll-padding-top em html por causa de ${stuck.map((r) => r.selector).join(", ")}`).toBeDefined();
  });
});

describe("movimento reduzido", () => {
  const reduce = rules.filter((r) => /prefers-reduced-motion:\s*reduce/.test(r.media ?? ""));

  it("zera transições, animações e rolagem animada", () => {
    const all = reduce.map((r) => JSON.stringify(r.declarations)).join(" ");
    expect(all).toMatch(/transition-duration/);
    expect(all).toMatch(/animation-duration/);
    expect(all).toMatch(/scroll-behavior/);
  });

  it("a rolagem suave só existe sob no-preference", () => {
    const smooth = rules.filter((r) => /smooth/.test(r.declarations["scroll-behavior"] ?? ""));
    expect(smooth.every((r) => /no-preference/.test(r.media ?? ""))).toBe(true);
  });
});
