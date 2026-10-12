import { describe, expect, it } from "vitest";
import { ruleBlocks } from "./helpers/css.js";

describe("ruleBlocks", () => {
  it("lê regras simples, agrupadas e dentro de @media, ignorando comentários e @font-face", () => {
    const rules = ruleBlocks(`
      /* a { color: red; } */
      @font-face { font-family: X; src: url(x.woff2); }
      a, b:hover { color: var(--c); outline: none; }
      @media (prefers-reduced-motion: reduce) { * { transition-duration: 0.01ms !important; } }
    `);
    expect(rules).toEqual([
      { selector: "a, b:hover", declarations: { color: "var(--c)", outline: "none" }, media: null },
      {
        selector: "*",
        declarations: { "transition-duration": "0.01ms !important" },
        media: "(prefers-reduced-motion: reduce)",
      },
    ]);
  });
});
