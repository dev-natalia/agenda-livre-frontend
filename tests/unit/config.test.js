import { describe, expect, it } from "vitest";
import { getApiBaseUrl, resolveConfig } from "../../js/config.js";

const local = { hostname: "localhost" };
const published = { hostname: "site.exemplo.org" };

describe("resolveConfig", () => {
  it("aceita URL válida com e sem barra final, com resultado igual", () => {
    const withSlash = resolveConfig("http://localhost:8000/api/v1/", local);
    const withoutSlash = resolveConfig("http://localhost:8000/api/v1", local);
    expect(withSlash.status).toBe("valid");
    expect(withSlash.apiBaseUrl).toBe("http://localhost:8000/api/v1");
    expect(withoutSlash.apiBaseUrl).toBe(withSlash.apiBaseUrl);
    expect(withSlash.message).toBeNull();
  });

  it.each([undefined, null, "", "   "])("trata %j como configuração ausente", (raw) => {
    const result = resolveConfig(raw, local);
    expect(result.status).toBe("missing");
    expect(result.apiBaseUrl).toBeNull();
    expect(result.message).toMatch(/configura/i);
  });

  it("trata texto que não é URL como inválido", () => {
    const result = resolveConfig("abc", local);
    expect(result.status).toBe("invalid");
    expect(result.apiBaseUrl).toBeNull();
  });

  it.each(["javascript:alert(1)", "file:///etc/passwd", "ftp://exemplo.org/api"])(
    "rejeita o esquema não permitido em %s",
    (raw) => {
      const result = resolveConfig(raw, published);
      expect(result.status).toBe("invalid");
      expect(result.apiBaseUrl).toBeNull();
    },
  );

  it.each(["localhost", "127.0.0.1", "[::1]"])("permite HTTP em %s", (hostname) => {
    const result = resolveConfig("http://api.local/api/v1", { hostname });
    expect(result.status).toBe("valid");
  });

  it("sinaliza HTTP fora do ambiente local como inadequado, com URL normalizada", () => {
    const result = resolveConfig("http://api.exemplo.org/api/v1/", published);
    expect(result.status).toBe("insecure");
    expect(result.apiBaseUrl).toBe("http://api.exemplo.org/api/v1");
    expect(result.message).toBeTruthy();
  });

  it("aceita HTTPS em qualquer host", () => {
    const result = resolveConfig("https://api.exemplo.org/api/v1", published);
    expect(result.status).toBe("valid");
    expect(result.apiBaseUrl).toBe("https://api.exemplo.org/api/v1");
  });

  it("não expõe detalhes técnicos nas mensagens", () => {
    for (const raw of [undefined, "abc", "javascript:alert(1)"]) {
      const { message } = resolveConfig(raw, local);
      expect(message).not.toMatch(/TypeError|Invalid URL|stack|undefined/i);
    }
  });
});

describe("getApiBaseUrl", () => {
  it("lança erro compreensível quando a configuração não é válida", () => {
    const state = resolveConfig("abc", local);
    expect(() => getApiBaseUrl(state)).toThrow(state.message);
  });

  it("retorna a URL quando a configuração é válida", () => {
    const state = resolveConfig("https://api.exemplo.org/api/v1/", published);
    expect(getApiBaseUrl(state)).toBe("https://api.exemplo.org/api/v1");
  });
});

describe("getRequestTimeoutMs", () => {
  it("devolve o tempo limite público padrão de 15 segundos", async () => {
    const { getRequestTimeoutMs } = await import("../../js/config.js");
    expect(getRequestTimeoutMs()).toBe(15000);
  });
});
