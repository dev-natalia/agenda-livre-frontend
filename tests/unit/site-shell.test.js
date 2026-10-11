// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const PAGES = {
  "index.html": "index.html",
  "explorar.html": "explorar.html",
  "atividade.html": null,
  "sobre.html": "sobre.html",
  "contato.html": "contato.html",
};

const NAV_LINKS = [
  ["Início", "index.html"],
  ["Explorar atividades", "explorar.html"],
  ["Sobre", "sobre.html"],
  ["Contato", "contato.html"],
];

function load(file) {
  const doc = new DOMParser().parseFromString(readFileSync(file, "utf-8"), "text/html");
  return doc;
}

function shellHtml(doc) {
  const clone = doc.cloneNode(true);
  clone.querySelectorAll("[aria-current]").forEach((el) => el.removeAttribute("aria-current"));
  const normalize = (el) => el.outerHTML.replace(/\s+/g, " ").trim();
  return {
    skip: normalize(clone.querySelector(".skip-link")),
    header: normalize(clone.querySelector("header.site-header")),
    footer: normalize(clone.querySelector("footer.site-footer")),
  };
}

describe.each(Object.entries(PAGES))("%s", (file, currentHref) => {
  const doc = load(file);

  it("declara o idioma e tem um único h1 dentro do conteúdo principal", () => {
    expect(doc.documentElement.lang).toBe("pt-BR");
    expect(doc.querySelectorAll("h1")).toHaveLength(1);
    expect(doc.querySelector("main h1")).not.toBeNull();
  });

  it("tem o link de pular como primeiro elemento focável do body", () => {
    const first = doc.body.querySelector("a[href], button:not([hidden]), input, select, textarea");
    expect(first.classList.contains("skip-link")).toBe(true);
    expect(first.getAttribute("href")).toBe("#main-content");
    expect(first.textContent.trim()).toBe("Pular para o conteúdo principal");
  });

  it("tem main#main-content único e focável por programa", () => {
    const mains = doc.querySelectorAll("main");
    expect(mains).toHaveLength(1);
    expect(mains[0].id).toBe("main-content");
    expect(mains[0].getAttribute("tabindex")).toBe("-1");
  });

  it("tem a navegação principal com os quatro destinos", () => {
    const nav = doc.querySelector('header.site-header nav[aria-label="Navegação principal"]');
    const links = [...nav.querySelectorAll("a")].map((a) => [a.textContent.trim(), a.getAttribute("href")]);
    expect(links).toEqual(NAV_LINKS);
  });

  it("tem o botão do menu oculto por padrão e ligado à lista", () => {
    const button = doc.querySelector("header.site-header button.site-header__toggle");
    expect(button.hasAttribute("hidden")).toBe(true);
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(button.getAttribute("aria-controls")).toBe("site-nav-list");
    expect(doc.getElementById("site-nav-list")).not.toBeNull();
  });

  it("identifica a página atual de forma única e correta", () => {
    const current = [...doc.querySelectorAll('[aria-current]')];
    if (currentHref === null) {
      expect(current).toHaveLength(0);
    } else {
      expect(current).toHaveLength(1);
      expect(current[0].getAttribute("aria-current")).toBe("page");
      expect(current[0].getAttribute("href")).toBe(currentHref);
      expect(current[0].closest("nav").getAttribute("aria-label")).toBe("Navegação principal");
    }
  });

  it("tem rodapé com links para Sobre e Contato e sem links externos", () => {
    const footer = doc.querySelector("footer.site-footer");
    const links = [...footer.querySelectorAll('nav[aria-label="Rodapé"] a')].map((a) => a.getAttribute("href"));
    expect(links).toEqual(["sobre.html", "contato.html"]);
    expect([...footer.querySelectorAll("a")].every((a) => !/^[a-z]+:\/\//i.test(a.getAttribute("href")))).toBe(true);
  });
});

describe("consistência entre as páginas", () => {
  it("mantém link de pular, cabeçalho e rodapé idênticos (exceto aria-current)", () => {
    const [first, ...others] = Object.keys(PAGES).map((file) => shellHtml(load(file)));
    for (const other of others) expect(other).toEqual(first);
  });
});
