import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const configState = vi.hoisted(() => ({
  current: { status: "valid", apiBaseUrl: "https://api.exemplo.org/api/v1", message: null },
}));

vi.mock("../../js/config.js", () => ({
  getConfigStatus: () => configState.current,
  getApiBaseUrl: (state = configState.current) => state.apiBaseUrl,
  getRequestTimeoutMs: () => 15000,
}));

import { request } from "../../js/api/client.js";
import { ApiError } from "../../js/api/errors.js";
import { jsonResponse, pendingFetch, textResponse } from "./helpers/fake-fetch.js";

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  delete globalThis.location;
});

describe("request — classificação de falhas", () => {
  it("falha de rede vira network (retryable)", async () => {
    const error = await request("/x/", { fetchImpl: async () => Promise.reject(new TypeError("Failed to fetch")) }).catch((e) => e);
    expect(error.category).toBe("network");
    expect(error.retryable).toBe(true);
    expect(error.status).toBeNull();
  });

  it("estouro do tempo limite vira timeout e aborta a requisição", async () => {
    vi.useFakeTimers();
    const { fetchImpl, calls } = pendingFetch();
    const promise = request("/x/", { fetchImpl, timeoutMs: 1000 }).catch((e) => e);
    await vi.advanceTimersByTimeAsync(1000);
    const error = await promise;
    expect(error.category).toBe("timeout");
    expect(error.retryable).toBe(true);
    expect(calls[0].init.signal.aborted).toBe(true);
  });

  it("abort externo vira cancelled, não network", async () => {
    const { fetchImpl } = pendingFetch();
    const controller = new AbortController();
    const promise = request("/x/", { fetchImpl, signal: controller.signal }).catch((e) => e);
    controller.abort();
    expect((await promise).category).toBe("cancelled");
  });

  it("400 expõe fieldErrors da API", async () => {
    const errors = { date_from: ["Informe uma data no formato AAAA-MM-DD."] };
    const error = await request("/x/", {
      fetchImpl: async () => jsonResponse({ detail: "Parâmetros inválidos.", errors }, { status: 400 }),
    }).catch((e) => e);
    expect(error.category).toBe("bad_request");
    expect(error.status).toBe(400);
    expect(error.retryable).toBe(false);
    expect(error.fieldErrors).toEqual(errors);
    expect(error.userMessage).not.toContain("Parâmetros inválidos");
  });

  it.each([
    [404, "not_found", false],
    [429, "rate_limited", true],
    [500, "server", true],
    [503, "server", true],
    [403, "http", false],
    [405, "http", false],
  ])("status %i vira %s", async (status, category, retryable) => {
    const error = await request("/x/", {
      fetchImpl: async () => jsonResponse({ detail: "Segredo interno do servidor" }, { status }),
    }).catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.category).toBe(category);
    expect(error.retryable).toBe(retryable);
    expect(error.userMessage).not.toContain("Segredo");
    expect(error.userMessage).not.toMatch(/\d{3}/);
  });

  it.each([[""], ["<html>Traceback (most recent call last)</html>"], ["texto qualquer"]])(
    "corpo de erro não padronizado (%j) classifica só pelo status",
    async (text) => {
      const error = await request("/x/", { fetchImpl: async () => textResponse(text, { status: 500 }) }).catch((e) => e);
      expect(error.category).toBe("server");
      expect(error.fieldErrors).toBeNull();
      expect(error.userMessage).not.toContain("Traceback");
    },
  );
});

describe("request — registro técnico", () => {
  beforeEach(() => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  it.each(["localhost", "127.0.0.1", "[::1]"])("registra no console em host local (%s) sem query nem corpo", async (hostname) => {
    globalThis.location = { hostname };
    await request("/activities/", {
      params: { q: "termo-secreto" },
      fetchImpl: async () => jsonResponse({ detail: "corpo-secreto" }, { status: 500 }),
    }).catch(() => {});
    expect(console.warn).toHaveBeenCalledTimes(1);
    const logged = JSON.stringify(console.warn.mock.calls);
    expect(logged).toContain("server");
    expect(logged).toContain("500");
    expect(logged).toContain("/activities/");
    expect(logged).not.toContain("termo-secreto");
    expect(logged).not.toContain("corpo-secreto");
  });

  it("não registra em host publicado", async () => {
    globalThis.location = { hostname: "site.exemplo.org" };
    await request("/x/", { fetchImpl: async () => jsonResponse({}, { status: 500 }) }).catch(() => {});
    expect(console.warn).not.toHaveBeenCalled();
  });

  it("não registra cancelamentos", async () => {
    globalThis.location = { hostname: "localhost" };
    const { fetchImpl } = pendingFetch();
    const controller = new AbortController();
    const promise = request("/x/", { fetchImpl, signal: controller.signal }).catch(() => {});
    controller.abort();
    await promise;
    expect(console.warn).not.toHaveBeenCalled();
  });
});
