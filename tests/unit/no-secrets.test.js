import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PUBLIC_CONFIG } from "../../js/config.js";
import * as fixtures from "../fixtures/activities.js";

// DOC-14 §11: nenhum segredo embutido nos arquivos publicados; configuração só com a URL base.
const PAGES = ["index.html", "explorar.html", "atividade.html", "sobre.html", "contato.html"];

function filesUnder(dir, extension) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? filesUnder(path, extension) : path.endsWith(extension) ? [path] : [];
  });
}

const published = [...PAGES, ...filesUnder("css", ".css"), ...filesUnder("js", ".js")];

// Palavras que indicam credencial. Exceções entram aqui, com motivo, nunca por afrouxar o padrão.
const SUSPICIOUS = [
  /\bpassword\b/i,
  /\bsenha\b/i,
  /\bsecret\b/i,
  /api[_-]?key/i,
  /private[_-]?key/i,
  /\bauthorization\b/i,
  /\bbearer\s/i,
  /\baccess[_-]?token\b/i,
];
// Cadeia longa sem separador que lembra chave (ids em UUID têm hifens e ficam de fora).
const LONG_KEY = /\b[A-Za-z0-9_]{40,}\b/;

describe("arquivos publicados", () => {
  it("há arquivos para varrer", () => {
    expect(published.length).toBeGreaterThan(20);
  });

  it.each(published)("%s não contém segredo nem credencial", (path) => {
    // Exceção justificada: `url.password` em js/details/external-link.js é a propriedade de URL
    // que a função usa para REJEITAR endereços com credenciais, não uma senha.
    const text = readFileSync(path, "utf-8").replaceAll("url.password", "");
    for (const pattern of SUSPICIOUS) {
      const match = pattern.exec(text);
      // Campos de formulário não são segredo, mas nenhum existe com esses nomes hoje.
      expect(match, `${path}: ${pattern}`).toBeNull();
    }
    expect(LONG_KEY.exec(text), `${path}: cadeia longa que lembra chave`).toBeNull();
  });
});

describe("configuração pública", () => {
  it("tem somente a URL base e o tempo limite", () => {
    expect(Object.keys(PUBLIC_CONFIG).sort()).toEqual(["apiBaseUrl", "requestTimeoutMs"]);
  });

  it("a URL base não carrega usuário, senha, token nem query", () => {
    const url = new URL(PUBLIC_CONFIG.apiBaseUrl);
    expect(url.username).toBe("");
    expect(url.password).toBe("");
    expect(url.search).toBe("");
    expect(url.hash).toBe("");
  });
});

describe("fixtures de teste", () => {
  it("não têm e-mail nem telefone reais", () => {
    const text = JSON.stringify(
      Object.values(fixtures).map((value) => (typeof value === "function" ? safe(value) : value)),
    );
    const emails = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/g) ?? [];
    for (const email of emails) expect(email, email).toMatch(/@example\.(com|org)$/);
    expect(text).not.toMatch(/\(\d{2}\)\s?9?\d{4}-\d{4}|\d{2}\s9?\d{4}-\d{4}/);
  });
});

function safe(factory) {
  try {
    return factory(1);
  } catch {
    return null;
  }
}
