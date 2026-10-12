// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Estrutura estática das cinco páginas (FE-034, FE-035; WCAG 1.3.1, 2.4.1, 2.4.2, 3.1.1, 4.1.2).
// Detalhes gera o h1 por script (só há um h1 no <noscript>); a hierarquia final é testada no navegador.
const PAGES = {
  "index.html": { title: "Início — Agenda Livre", staticH1: true },
  "explorar.html": { title: "Explorar atividades — Agenda Livre", staticH1: true },
  "atividade.html": { title: "Detalhes da atividade — Agenda Livre", staticH1: false },
  "sobre.html": { title: "Sobre — Agenda Livre", staticH1: true },
  "contato.html": { title: "Contato — Agenda Livre", staticH1: true },
};

const docs = Object.fromEntries(
  Object.keys(PAGES).map((file) => [file, new DOMParser().parseFromString(readFileSync(file, "utf-8"), "text/html")]),
);

const FOCUSABLE = 'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';

describe.each(Object.entries(PAGES))("%s", (file, expected) => {
  const doc = docs[file];

  it("declara português do Brasil e tem título de documento próprio", () => {
    expect(doc.documentElement.getAttribute("lang")).toBe("pt-BR");
    expect(doc.title).toBe(expected.title);
  });

  it("tem um único h1 e não pula níveis de título", () => {
    const h1 = [...doc.querySelectorAll("main h1")].filter((h) => !h.closest("noscript"));
    // O conteúdo de <noscript> é texto no DOM do analisador; contar o h1 dele separadamente.
    const inNoscript = (doc.querySelector("noscript")?.textContent.match(/<h1/g) ?? []).length;
    if (expected.staticH1) expect(h1).toHaveLength(1);
    else expect(h1.length + inNoscript).toBeLessThanOrEqual(1);

    let previous = 0;
    for (const heading of doc.querySelectorAll("h1, h2, h3, h4, h5, h6")) {
      const level = Number(heading.tagName[1]);
      expect(level, `${heading.tagName} "${heading.textContent.trim()}" pula de h${previous}`).toBeLessThanOrEqual(previous + 1);
      previous = level;
    }
  });

  it("usa as regiões pela função: cabeçalho, navegação nomeada, um main, rodapé", () => {
    expect(doc.querySelectorAll("body > header")).toHaveLength(1);
    expect(doc.querySelectorAll("body > footer")).toHaveLength(1);
    const mains = doc.querySelectorAll("main");
    expect(mains).toHaveLength(1);
    expect(mains[0].id).toBe("main-content");
    for (const nav of doc.querySelectorAll("nav")) {
      expect(nav.getAttribute("aria-label"), "nav sem nome").toBeTruthy();
    }
    const labels = [...doc.querySelectorAll("nav")].map((nav) => nav.getAttribute("aria-label"));
    expect(new Set(labels).size, "navegações com o mesmo nome").toBe(labels.length);
  });

  it("começa pelo link de pular, que aponta para um id existente", () => {
    const first = doc.body.querySelector(FOCUSABLE);
    expect(first.matches("a.skip-link")).toBe(true);
    expect(first.textContent.trim()).toBe("Pular para o conteúdo principal");
    expect(first.getAttribute("href")).toBe("#main-content");
    for (const anchor of doc.querySelectorAll('a[href^="#"]')) {
      expect(doc.getElementById(anchor.getAttribute("href").slice(1)), anchor.getAttribute("href")).not.toBeNull();
    }
  });

  it("usa controles nativos: nenhum div ou span faz papel de botão ou link", () => {
    const fake = doc.querySelectorAll('div[onclick], span[onclick], div[role="button"], span[role="button"], div[role="link"], span[role="link"]');
    expect(fake).toHaveLength(0);
  });

  it("todo campo de formulário tem rótulo associado", () => {
    for (const field of doc.querySelectorAll("input:not([type=hidden]):not([type=submit]), select, textarea")) {
      const labelled =
        (field.id && doc.querySelector(`label[for="${field.id}"]`)) || field.closest("label") || field.getAttribute("aria-label") || field.getAttribute("aria-labelledby");
      expect(labelled, `${field.tagName.toLowerCase()}#${field.id}`).toBeTruthy();
    }
  });

  it("todo botão e link tem texto ou nome acessível", () => {
    for (const el of doc.querySelectorAll("a[href], button")) {
      const name = el.getAttribute("aria-label") || el.textContent.trim() || el.querySelector("img[alt]:not([alt=''])");
      expect(name, `${el.tagName.toLowerCase()} ${el.outerHTML.slice(0, 80)}`).toBeTruthy();
    }
  });

  it("imagens têm alt (vazio quando decorativas)", () => {
    for (const img of doc.querySelectorAll("img")) expect(img.hasAttribute("alt"), img.outerHTML).toBe(true);
  });
});

describe("conjunto das páginas", () => {
  it("os títulos de documento são todos diferentes", () => {
    const titles = Object.keys(PAGES).map((file) => docs[file].title);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it("a navegação principal e o rodapé são iguais em texto e destino nas cinco páginas", () => {
    const read = (doc) => [...doc.querySelectorAll("nav[aria-label='Navegação principal'] a")].map((a) => `${a.textContent.trim()}→${a.getAttribute("href")}`);
    const [first, ...rest] = Object.keys(PAGES).map((file) => read(docs[file]));
    for (const list of rest) expect(list).toEqual(first);
  });

  it("exatamente um item da navegação principal marca a página atual (exceto Detalhes)", () => {
    for (const file of Object.keys(PAGES).filter((f) => f !== "atividade.html")) {
      const current = docs[file].querySelectorAll("nav[aria-label='Navegação principal'] [aria-current='page']");
      expect(current, file).toHaveLength(1);
    }
  });
});
