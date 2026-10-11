import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const CSS_DIR = join(import.meta.dirname, "..", "..", "..", "css");

export function readCss(name) {
  return readFileSync(join(CSS_DIR, name), "utf8");
}

export function cssFiles() {
  return readdirSync(CSS_DIR).filter((f) => f.endsWith(".css"));
}

export function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

// Custom properties declaradas em tokens.css.
export function rootTokens(css = readCss("tokens.css")) {
  const tokens = {};
  for (const match of stripComments(css).matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    tokens[match[1]] = match[2].trim();
  }
  return tokens;
}

export function mediaConditions(css) {
  return [...stripComments(css).matchAll(/@media\s*([^{]+)\{/g)].map((m) => m[1].trim());
}

function channel(hex, i) {
  const v = parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) / 255;
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

function luminance(hex) {
  return 0.2126 * channel(hex, 0) + 0.7152 * channel(hex, 1) + 0.0722 * channel(hex, 2);
}

export function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}
