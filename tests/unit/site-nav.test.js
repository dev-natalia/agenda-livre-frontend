// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { initSiteNav } from "../../js/components/site-nav.js";

let narrow;
let listeners;
let control;

function mockMatchMedia(isNarrow) {
  narrow = isNarrow;
  listeners = new Set();
  window.matchMedia = () => ({
    get matches() {
      return narrow;
    },
    addEventListener: (_type, fn) => listeners.add(fn),
    removeEventListener: (_type, fn) => listeners.delete(fn),
  });
}

function setNarrow(value) {
  narrow = value;
  listeners.forEach((fn) => fn({ matches: value }));
}

function load() {
  const html = readFileSync("index.html", "utf-8");
  const parsed = new DOMParser().parseFromString(html, "text/html");
  document.body.innerHTML = parsed.body.innerHTML;
}

const button = () => document.querySelector(".site-header__toggle");
const list = () => document.getElementById("site-nav-list");

beforeEach(() => {
  load();
  mockMatchMedia(true);
});

afterEach(() => {
  control?.destroy();
  control = null;
});

describe("initSiteNav", () => {
  it("retorna null quando a página não tem o invólucro", () => {
    document.body.innerHTML = "<main></main>";
    expect(initSiteNav()).toBeNull();
  });

  it("em tela estreita revela o botão e recolhe a lista", () => {
    control = initSiteNav();
    expect(button().hidden).toBe(false);
    expect(button().getAttribute("aria-expanded")).toBe("false");
    expect(list().hidden).toBe(true);
  });

  it("o clique abre e fecha, atualizando aria-expanded", () => {
    control = initSiteNav();
    button().click();
    expect(button().getAttribute("aria-expanded")).toBe("true");
    expect(list().hidden).toBe(false);
    button().click();
    expect(button().getAttribute("aria-expanded")).toBe("false");
    expect(list().hidden).toBe(true);
  });

  it("Esc com o menu aberto fecha e devolve o foco ao botão", () => {
    control = initSiteNav();
    button().click();
    list().querySelector("a").focus();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(list().hidden).toBe(true);
    expect(button().getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(button());
  });

  it("Esc com o menu fechado não faz nada", () => {
    control = initSiteNav();
    const outside = document.querySelector("main");
    outside.focus();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(document.activeElement).toBe(outside);
    expect(list().hidden).toBe(true);
  });

  it("em tela larga mostra a lista e esconde o botão", () => {
    mockMatchMedia(false);
    control = initSiteNav();
    expect(list().hidden).toBe(false);
    expect(button().hidden).toBe(true);
  });

  it("alternar entre larga e estreita reinicia o menu fechado", () => {
    control = initSiteNav();
    button().click();
    setNarrow(false);
    expect(list().hidden).toBe(false);
    expect(button().hidden).toBe(true);
    setNarrow(true);
    expect(list().hidden).toBe(true);
    expect(button().hidden).toBe(false);
    expect(button().getAttribute("aria-expanded")).toBe("false");
  });

  it("não usa papel de menu de aplicação", () => {
    control = initSiteNav();
    expect(document.querySelector('[role="menu"], [role="menuitem"], [aria-haspopup]')).toBeNull();
  });

  it("segunda chamada não duplica ouvintes", () => {
    control = initSiteNav();
    expect(initSiteNav()).toBe(control);
    button().click();
    expect(button().getAttribute("aria-expanded")).toBe("true");
  });

  it("destroy remove os ouvintes", () => {
    control = initSiteNav();
    control.destroy();
    control = null;
    button().click();
    expect(button().getAttribute("aria-expanded")).toBe("false");
  });
});
