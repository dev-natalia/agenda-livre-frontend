import { describe, expect, it } from "vitest";
import { cssFiles, readCss, rootTokens, stripComments } from "./helpers/css.js";

describe("regra central de movimento reduzido", () => {
  const base = stripComments(readCss("base.css"));

  it("existe o bloco de redução em base.css com a rede de segurança", () => {
    const start = base.indexOf("@media (prefers-reduced-motion: reduce)");
    expect(start).toBeGreaterThanOrEqual(0);
    const block = base.slice(start, base.indexOf("@media", start + 10) === -1 ? undefined : base.indexOf("@media", start + 10));
    expect(block).toMatch(/--motion-duration:\s*0s/);
    expect(block).toMatch(/animation-duration:\s*0\.01ms\s*!important/);
    expect(block).toMatch(/transition-duration:\s*0\.01ms\s*!important/);
    expect(block).toMatch(/scroll-behavior:\s*auto\s*!important/);
  });

  it("rolagem suave só sob no-preference", () => {
    expect([...base.matchAll(/scroll-behavior:\s*smooth/g)]).toHaveLength(1);
    expect(base).toMatch(/@media \(prefers-reduced-motion: no-preference\)\s*\{[^}]*scroll-behavior:\s*smooth/);
  });

  it("--motion-duration é positiva em tokens.css", () => {
    expect(rootTokens()["--motion-duration"]).toMatch(/^[1-9]\d*ms$/);
  });

  it("nenhum CSS fora de tokens declara duração literal em transition/animation", () => {
    const offenders = [];
    for (const file of cssFiles().filter((f) => f !== "tokens.css")) {
      stripComments(readCss(file)).split("\n").forEach((line, i) => {
        if (/(transition|animation)[^;]*\b\d+(\.\d+)?m?s\b/.test(line) && !/0\.01ms !important/.test(line)) {
          offenders.push(`${file}:${i + 1} ${line.trim()}`);
        }
      });
    }
    expect(offenders).toEqual([]);
  });
});
