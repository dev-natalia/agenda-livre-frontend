// Cor por categoria (feature 011, contracts/design-tokens-delta.md): por slug da API, texto branco
// sobre fundo sólido com contraste >= 4,5; categoria sem entrada usa o tratamento neutro.
import { describe, expect, it } from "vitest";
import { contrast, readCss, rootTokens, ruleBlocks } from "./helpers/css.js";

const tokens = rootTokens();
const rules = ruleBlocks(readCss("components.css"));

// slug do backend (apps/core seed_demo) -> token de cor
const CATEGORIES = {
  "cultura-e-artes": "--color-category-culture",
  "esporte-e-atividade-fisica": "--color-category-sport",
  "cursos-e-formacao": "--color-category-courses",
  "eventos-e-encontros": "--color-category-events",
  "saude-e-bem-estar": "--color-category-health",
  "lazer-e-recreacao": "--color-category-leisure",
  "educacao-e-meio-ambiente": "--color-category-education",
};

const BASE_SELECTORS = [".activity-card__category", ".activity-details__category"];

function ruleFor(slug, base) {
  return rules.find((r) => r.selector.split(",").map((s) => s.trim()).includes(`${base}[data-category="${slug}"]`));
}

describe.each(Object.entries(CATEGORIES))("categoria %s", (slug, token) => {
  it.each(BASE_SELECTORS)("%s usa o token de cor e o texto de contraste", (base) => {
    const rule = ruleFor(slug, base);
    expect(rule, `regra ${base}[data-category="${slug}"]`).toBeDefined();
    expect(rule.declarations.background).toBe(`var(${token})`);
    expect(rule.declarations.color).toBe("var(--color-brand-contrast)");
  });

  it("o contraste do texto sobre o fundo atinge 4,5:1", () => {
    expect(contrast(tokens["--color-brand-contrast"], tokens[token])).toBeGreaterThanOrEqual(4.5);
  });
});

describe("categoria sem cor definida", () => {
  it("a regra base da etiqueta continua neutra", () => {
    const base = rules.find((r) => r.selector.split(",").map((x) => x.trim()).includes(".activity-card__category"));
    expect(base.declarations.background).toBe("var(--color-tag-background)");
    expect(base.declarations.color).toBe("var(--color-tag-text)");
  });

  it("não existe regra para slug fora da lista", () => {
    const mapped = rules.filter((r) => /\[data-category=/.test(r.selector));
    const slugs = new Set(mapped.flatMap((r) => [...r.selector.matchAll(/data-category="([^"]+)"/g)].map((m) => m[1])));
    expect([...slugs].sort()).toEqual(Object.keys(CATEGORIES).sort());
  });
});
