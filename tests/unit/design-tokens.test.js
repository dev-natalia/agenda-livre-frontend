import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { contrast, cssFiles, mediaConditions, readCss, rootTokens, stripComments } from "./helpers/css.js";

const t = rootTokens();
const hex = (name) => {
  const v = t[name];
  if (!v || !/^#[0-9a-f]{6}$/i.test(v)) throw new Error(`token ${name} ausente ou não hexadecimal: ${v}`);
  return v;
};

// [texto/elemento, fundo, mínimo] — tabela de contracts/design-tokens.md
const PAIRS = [
  ["--color-text", "--color-background", 4.5],
  ["--color-text", "--color-surface", 4.5],
  ["--color-link", "--color-surface", 4.5],
  ["--color-link", "--color-background", 4.5],
  ["--color-brand-contrast", "--color-action", 4.5],
  ["--color-brand-contrast", "--color-action-hover", 4.5],
  ["--color-brand-contrast", "--color-primary", 4.5],
  ["--color-text", "--color-accent", 4.5],
  ["--color-text", "--color-highlight", 4.5],
  ["--color-brand-contrast", "--color-accent-strong", 4.5],
  ["--color-tag-text", "--color-tag-background", 4.5],
  ["--color-text", "--color-notice-background", 4.5],
  ["--color-text-muted", "--color-surface", 4.5],
  ["--color-text-muted", "--color-background", 4.5],
  ["--color-border", "--color-surface", 3],
  ["--color-border", "--color-background", 3],
  ["--color-empty-border", "--color-surface", 3],
  ["--focus-color", "--color-surface", 3],
  ["--focus-color", "--color-background", 3],
];

describe("contraste dos tokens", () => {
  it("todos os pares declarados atingem o mínimo", () => {
    const failures = PAIRS.map(([fg, bg, min]) => ({ fg, bg, min, ratio: contrast(hex(fg), hex(bg)) }))
      .filter((p) => p.ratio < p.min)
      .map((p) => `${p.fg} sobre ${p.bg}: ${p.ratio.toFixed(2)} < ${p.min}`);
    expect(failures).toEqual([]);
  });
});

describe("tokens centralizados", () => {
  it.each(["base.css", "layout.css", "components.css"])("%s não tem cor, fonte ou duração literais", (file) => {
    const offenders = [];
    // Blocos @font-face declaram as famílias por nome; o restante só pode usar tokens.
    const css = stripComments(readCss(file)).replace(/@font-face\s*\{[^}]*\}/g, (m) => m.replace(/[^\n]/g, ""));
    css.split("\n").forEach((line, i) => {
      const where = `${file}:${i + 1}: ${line.trim()}`;
      if (/#[0-9a-fA-F]{3,8}\b/.test(line)) offenders.push(`cor literal ${where}`);
      if (/rgba?\(/.test(line)) offenders.push(`rgb literal ${where}`);
      if (/font-family\s*:/.test(line) && !line.includes("var(--")) offenders.push(`fonte literal ${where}`);
      if (/(transition|animation)[^;]*\b\d+(\.\d+)?m?s\b/.test(line) && !/0\.01ms !important/.test(line)) {
        offenders.push(`duração literal ${where}`);
      }
    });
    expect(offenders).toEqual([]);
  });
});

describe("pontos de quebra", () => {
  const ALLOWED = new Set(["(min-width: 40rem)", "(min-width: 48rem)", "(min-width: 64rem)"]);
  const OTHER = /prefers-reduced-motion|^print$|forced-colors|prefers-contrast/;

  it("só existem 40, 48 e 64 rem (além de movimento, impressão e cores forçadas)", () => {
    const offenders = [];
    for (const file of cssFiles()) {
      for (const cond of mediaConditions(readCss(file))) {
        if (!OTHER.test(cond) && !ALLOWED.has(cond)) offenders.push(`${file}: ${cond}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("o ponto de troca do menu (48rem) coincide com site-nav.js", () => {
    const js = readFileSync(new URL("../../js/components/site-nav.js", import.meta.url), "utf8");
    expect(js).toContain('"(max-width: 47.99rem)"');
    expect(stripComments(readCss("layout.css"))).toContain("(min-width: 48rem)");
  });

  it("contêineres não fixam width/height em px", () => {
    const offenders = [];
    for (const file of ["layout.css", "components.css", "base.css"]) {
      stripComments(readCss(file)).split("\n").forEach((line, i) => {
        if (/^\s*(width|height)\s*:\s*\d+(\.\d+)?px/.test(line) && !/:\s*1px/.test(line)) {
          offenders.push(`${file}:${i + 1} ${line.trim()}`);
        }
      });
    }
    expect(offenders).toEqual([]);
  });
});
