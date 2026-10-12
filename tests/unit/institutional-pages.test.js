// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const config = vi.hoisted(() => ({
  status: { status: "invalid", apiBaseUrl: null, message: "A configuração da API é inválida." },
}));

vi.mock("../../js/config.js", () => ({
  getConfigStatus: () => config.status,
  getApiBaseUrl: () => "https://api.exemplo.org/api/v1",
  getRequestTimeoutMs: () => 15000,
}));

const read = (file) => readFileSync(file, "utf-8");

describe("Sobre e Contato não usam a API", () => {
  beforeEach(() => {
    window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
    document.body.innerHTML = `<header><button class="site-header__toggle"></button><nav><ul id="site-nav-list"></ul></nav></header><main><h1>Título</h1></main>`;
  });
  afterEach(() => {
    vi.resetModules();
  });

  it("about.js não insere aviso de configuração", async () => {
    const { init } = await import("../../js/pages/about.js");
    init();
    expect(document.querySelector("main [role=alert], main .config-notice")).toBeNull();
  });

  it("contact.js não insere aviso de configuração", async () => {
    const { init } = await import("../../js/pages/contact.js");
    init();
    expect(document.querySelector("main [role=alert], main .config-notice")).toBeNull();
  });

  it.each(["js/pages/about.js", "js/pages/contact.js"])("%s não importa API, config nem aviso", (file) => {
    expect(read(file)).not.toMatch(/from\s+["'][^"']*(\/api\/|config\.js|config-notice)/);
  });
});

describe("conteúdo de sobre.html", () => {
  const doc = new DOMParser().parseFromString(read("sobre.html"), "text/html");
  const main = doc.querySelector("main");

  it("tem um único h1 e os h2 esperados, em ordem", () => {
    const h1 = main.querySelectorAll("h1");
    expect(h1).toHaveLength(1);
    expect(h1[0].textContent).toBe("Sobre o Agenda Livre");
    expect([...main.querySelectorAll("h2")].map((h) => h.textContent)).toEqual([
      "O que é o projeto?",
      "Nosso objetivo",
      "Acesso à cultura e à educação",
      "O que o Agenda Livre não faz",
    ]);
    expect(main.querySelectorAll("h3, h4")).toHaveLength(0);
  });

  it("tem título do documento e chamada para Explorar", () => {
    expect(doc.title).toBe("Sobre — Agenda Livre");
    const link = [...main.querySelectorAll("a")].find((a) => a.textContent.trim() === "Explorar atividades");
    expect(link?.getAttribute("href")).toBe("explorar.html");
  });

  it("informa que não há inscrições e não inventa parcerias nem contatos", () => {
    const text = main.textContent;
    expect(text).toMatch(/não processa inscrições/i);
    expect(text).not.toMatch(/parceria|parceiros|convênio/i);
    expect(text).not.toMatch(/@|\(\d{2}\)|\d{4}-\d{4}/);
  });
});
