import { beforeEach, describe, expect, it, vi } from "vitest";

const configState = vi.hoisted(() => ({
  current: { status: "valid", apiBaseUrl: "https://api.exemplo.org/api/v1", message: null },
}));

vi.mock("../../js/config.js", () => ({
  getConfigStatus: () => configState.current,
  getApiBaseUrl: (state = configState.current) => {
    if (state.status !== "valid") throw new Error(state.message);
    return state.apiBaseUrl;
  },
  getRequestTimeoutMs: () => 15000,
}));

import { buildUrl, request } from "../../js/api/client.js";
import { ApiError } from "../../js/api/errors.js";
import { jsonResponse, textResponse } from "./helpers/fake-fetch.js";

const BASE = "https://api.exemplo.org/api/v1";

beforeEach(() => {
  configState.current = { status: "valid", apiBaseUrl: BASE, message: null };
});

describe("buildUrl", () => {
  it.each([
    [BASE, "/activities/"],
    [`${BASE}/`, "/activities/"],
    [BASE, "activities/"],
    [`${BASE}/`, "activities/"],
  ])("junta %s e %s sem barras duplicadas", (base, path) => {
    expect(buildUrl(base, path).href).toBe(`${BASE}/activities/`);
  });

  it("omite valores nulos, indefinidos e vazios, e aceita string, número e boolean", () => {
    const url = buildUrl(BASE, "/activities/", { q: "", unit: null, category: undefined, page: 2, flag: true, t: "x" });
    expect([...url.searchParams.entries()]).toEqual([
      ["page", "2"],
      ["flag", "true"],
      ["t", "x"],
    ]);
  });

  it("codifica texto com acentos e caracteres especiais sem afetar outros parâmetros", () => {
    const url = buildUrl(BASE, "/activities/", { q: "café & chá=1#x", page: 1 });
    expect(url.searchParams.get("q")).toBe("café & chá=1#x");
    expect(url.searchParams.get("page")).toBe("1");
    expect(url.hash).toBe("");
    expect([...url.searchParams.keys()]).toEqual(["q", "page"]);
  });

  it.each([[{ a: 1 }], [[1, 2]], [() => 1]])("recusa valor de tipo não suportado (%j)", (value) => {
    expect(() => buildUrl(BASE, "/activities/", { q: value })).toThrow(TypeError);
  });
});

describe("request — sucesso", () => {
  it("resolve com o JSON e envia GET sem credenciais", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ count: 1, results: [{ id: "a" }] }));
    const data = await request("/activities/", { params: { q: "dança" }, fetchImpl });
    expect(data).toEqual({ count: 1, results: [{ id: "a" }] });
    const [url, init] = fetchImpl.mock.calls[0];
    expect(String(url)).toBe(`${BASE}/activities/?q=dan%C3%A7a`);
    expect(init.method).toBe("GET");
    expect(init.credentials).toBe("omit");
    expect(init.headers.Accept).toBe("application/json");
  });

  it("trata lista vazia como sucesso", async () => {
    const empty = { count: 0, next: null, previous: null, results: [] };
    const data = await request("/activities/", { fetchImpl: async () => jsonResponse(empty) });
    expect(data).toEqual(empty);
  });

  it("resolve null para corpo vazio somente com allowEmpty", async () => {
    const empty = () => new Response(null, { status: 204 });
    await expect(request("/x/", { fetchImpl: async () => empty(), allowEmpty: true })).resolves.toBeNull();
    await expect(request("/x/", { fetchImpl: async () => empty() })).rejects.toMatchObject({
      category: "invalid_response",
    });
  });

  it.each([["<html>proxy</html>"], ["{ não é json"]])("rejeita corpo inválido (%s) como invalid_response", async (text) => {
    const error = await request("/x/", { fetchImpl: async () => textResponse(text) }).catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.category).toBe("invalid_response");
    expect(error.userMessage).not.toContain("proxy");
  });
});

describe("request — configuração", () => {
  it.each(["missing", "invalid", "insecure"])("config %s rejeita com config sem chamar a rede", async (status) => {
    configState.current = { status, apiBaseUrl: null, message: "Configuração com problema." };
    const fetchImpl = vi.fn();
    const error = await request("/x/", { fetchImpl }).catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.category).toBe("config");
    expect(error.userMessage).toBe("Configuração com problema.");
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
