import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const FILES = ["js/contact/validation.js", "js/contact/form.js", "js/pages/contact.js", "js/pages/about.js"];
const FORBIDDEN = [
  /fetch\s*\(/,
  /XMLHttpRequest/,
  /sendBeacon/,
  /localStorage/,
  /sessionStorage/,
  /document\.cookie/,
  /innerHTML/,
  /from\s+["'][^"']*\/api\//,
  /from\s+["'][^"']*config\.js/,
];

describe("contracts/no-network.md", () => {
  it.each(FILES)("%s não usa rede, armazenamento nem innerHTML", (file) => {
    const code = readFileSync(file, "utf-8").replace(/\/\/.*$/gm, "");
    for (const pattern of FORBIDDEN) expect(code, `${file} ${pattern}`).not.toMatch(pattern);
  });
});
