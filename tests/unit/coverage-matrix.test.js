import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// A matriz liga cada verificação do DOC-14 ao teste que a cumpre (specs/010-testing-quality/contracts/coverage-matrix.md).
const MATRIX = "specs/010-testing-quality/contracts/coverage-matrix.md";
const matrix = readFileSync(MATRIX, "utf-8");
const SITUATIONS = ["coberto", "coberto-parcial", "lacuna-declarada"];

const rows = matrix
  .split("\n")
  .map((line) => line.trim())
  .filter((line) => line.startsWith("|") && !/^\|[-| :]+\|$/.test(line))
  .map((line) => line.split("|").slice(1, -1).map((cell) => cell.trim()))
  .filter((cells) => cells.length === 5 && cells[0] !== "Item");

const referencedPaths = [...new Set([...matrix.matchAll(/`([^`\s]+)`/g)].map((m) => m[1]))].filter((path) =>
  /^(tests\/|docs\/|\.github\/|package\.json$|README\.md$|playwright\.config\.js$)/.test(path),
);

describe("matriz de cobertura do DOC-14", () => {
  it("tem linhas para auditar", () => {
    expect(rows.length).toBeGreaterThan(30);
  });

  it.each(rows.map((cells) => [cells[0], cells]))("%s tem situação válida", (_item, cells) => {
    expect(SITUATIONS, cells[3]).toContain(cells[3]);
  });

  it("toda lacuna e todo item parcial explica o motivo", () => {
    for (const [item, , , situation, reason] of rows) {
      if (situation !== "coberto") expect(reason, item).not.toBe("");
    }
  });

  it("toda linha cita ao menos uma evidência", () => {
    for (const [item, , evidence] of rows) expect(evidence, item).toMatch(/`[^`]+`/);
  });

  it.each(referencedPaths)("o arquivo citado existe: %s", (path) => {
    expect(existsSync(path), path).toBe(true);
  });
});

// DOC-14 §13: nenhum teste é desativado para obter resultado verde.
function testFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return testFiles(path);
    return /\.(test|spec)\.js$/.test(name) || path.includes("helpers") ? [path] : [];
  });
}

const SELF = "tests/unit/coverage-matrix.test.js";
const files = testFiles("tests").filter((path) => path.replaceAll("\\", "/") !== SELF);

describe("suíte sem atalhos", () => {
  it("há arquivos de teste para varrer", () => {
    expect(files.length).toBeGreaterThan(60);
  });

  it("não usa .only", () => {
    for (const path of files) expect(readFileSync(path, "utf-8"), path).not.toMatch(/\b(test|it|describe)\.only\(/);
  });

  it("não usa retries no Playwright", () => {
    const config = readFileSync("playwright.config.js", "utf-8");
    expect(config).not.toMatch(/retries\s*:\s*[1-9]/);
  });

  it("todo .skip tem motivo escrito", () => {
    for (const path of files) {
      const text = readFileSync(path, "utf-8");
      for (const match of text.matchAll(/\b(?:test|it|describe)\.skip\(([\s\S]*?)\);/g)) {
        expect(match[1].trim(), `${path}: ${match[0].slice(0, 60)}`).toMatch(/,\s*(["'`])[^"'`]{5,}\1\s*$/);
      }
      expect(text, path).not.toMatch(/\b(?:test|it|describe)\.fixme\(/);
    }
  });
});
