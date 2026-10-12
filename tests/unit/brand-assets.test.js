// @vitest-environment jsdom
// Ativos de marca (feature 011, contracts/brand-assets.md): arquivos, uso nas cinco páginas, acessibilidade.
import { readFileSync, statSync } from "node:fs";
import { describe, expect, it } from "vitest";

const SVGS = ["images/brand/logo.svg", "images/brand/icon.svg"];
const PAGES = ["index.html", "explorar.html", "atividade.html", "sobre.html", "contato.html"];
const MAX_SVG_BYTES = 10 * 1024;

describe("arquivos de marca", () => {
  it.each(SVGS)("%s é SVG bem formado, leve e sem script, texto ou referência externa", (file) => {
    const source = readFileSync(file, "utf8");
    expect(statSync(file).size).toBeLessThan(MAX_SVG_BYTES);
    const doc = new DOMParser().parseFromString(source, "image/svg+xml");
    expect(doc.querySelector("parsererror")).toBeNull();
    expect(doc.documentElement.localName).toBe("svg");
    expect(doc.querySelector("script, text, foreignObject, image")).toBeNull();
    expect(source).not.toMatch(/href\s*=\s*["'](?!#)/i);
    expect(source).not.toMatch(/\son\w+\s*=/i);
  });

  it("apple-touch-icon.png é um PNG de 180x180", () => {
    const png = readFileSync("images/brand/apple-touch-icon.png");
    expect(png.subarray(1, 4).toString("ascii")).toBe("PNG");
    expect(png.readUInt32BE(16)).toBe(180);
    expect(png.readUInt32BE(20)).toBe(180);
  });
});

describe.each(PAGES)("%s", (file) => {
  const doc = new DOMParser().parseFromString(readFileSync(file, "utf8"), "text/html");

  it("declara o ícone da aba e o apple-touch-icon da marca", () => {
    expect(doc.querySelector('link[rel="icon"]')?.getAttribute("href")).toBe("images/brand/icon.svg");
    expect(doc.querySelector('link[rel="icon"]')?.getAttribute("type")).toBe("image/svg+xml");
    expect(doc.querySelector('link[rel="apple-touch-icon"]')?.getAttribute("href")).toBe(
      "images/brand/apple-touch-icon.png",
    );
  });

  it("mostra o logo como link para o Início, com o nome acessível 'Agenda Livre'", () => {
    const brand = doc.querySelectorAll(".site-header__brand");
    expect(brand).toHaveLength(1);
    expect(brand[0].getAttribute("href")).toBe("index.html");
    const images = brand[0].querySelectorAll("img");
    expect(images).toHaveLength(1);
    expect(images[0].getAttribute("src")).toBe("images/brand/logo.svg");
    expect(images[0].getAttribute("alt")).toBe("Agenda Livre");
    expect(images[0].getAttribute("width")).toBeTruthy();
    expect(images[0].getAttribute("height")).toBeTruthy();
  });
});
