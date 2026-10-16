import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../../js/config.js", () => ({
  getConfigStatus: () => ({ status: "valid", apiBaseUrl: "https://api.exemplo.org/api/v1", message: null }),
  getApiBaseUrl: () => "https://api.exemplo.org/api/v1",
  getRequestTimeoutMs: () => 15000,
}));

import { createRequestScope } from "../../js/api/client.js";
import { PAGE_SIZE, fetchActivities, fetchActivityDetails, fetchAudiences, fetchCategories, fetchUnits, fetchUpcomingActivities } from "../../js/api/public.js";
import { todayInSaoPaulo } from "../../js/utils/dates.js";
import { jsonResponse } from "./helpers/fake-fetch.js";

const LIST = { count: 0, next: null, previous: null, results: [] };

function fetchReturning(response) {
  return vi.fn(async () => (typeof response === "function" ? response() : response));
}

afterEach(() => vi.useRealTimers());

describe("todayInSaoPaulo", () => {
  it("usa o dia de São Paulo (UTC−3), não o do relógio UTC", () => {
    expect(todayInSaoPaulo(new Date("2026-10-11T02:30:00Z"))).toBe("2026-10-10");
    expect(todayInSaoPaulo(new Date("2026-10-11T12:00:00Z"))).toBe("2026-10-11");
    expect(todayInSaoPaulo(new Date("2027-01-01T02:59:00Z"))).toBe("2026-12-31");
  });
});

describe("fetchUpcomingActivities", () => {
  it("pede 3 atividades a partir de hoje", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-10-11T02:30:00Z"));
    const fetchImpl = fetchReturning(() => jsonResponse(LIST));
    await fetchUpcomingActivities({ fetchImpl });
    const url = new URL(String(fetchImpl.mock.calls[0][0]));
    expect(url.pathname).toBe("/api/v1/activities/");
    expect(Object.fromEntries(url.searchParams)).toEqual({ date_from: "2026-10-10", page_size: "3" });
  });

  it("usa o escopo de requisição quando fornecido", async () => {
    const scope = createRequestScope();
    const run = vi.spyOn(scope, "run");
    await fetchUpcomingActivities({ scope, fetchImpl: fetchReturning(() => jsonResponse(LIST)) });
    expect(run).toHaveBeenCalledOnce();
    expect(run.mock.calls[0][0]).toBe("/activities/");
  });
});

describe.each([
  ["fetchUnits", fetchUnits, "/api/v1/units/"],
  ["fetchCategories", fetchCategories, "/api/v1/categories/"],
  ["fetchAudiences", fetchAudiences, "/api/v1/audiences/"],
])("%s", (_name, fn, path) => {
  it("pede até 50 itens", async () => {
    const fetchImpl = fetchReturning(() => jsonResponse(LIST));
    await fn({ fetchImpl });
    const url = new URL(String(fetchImpl.mock.calls[0][0]));
    expect(url.pathname).toBe(path);
    expect(Object.fromEntries(url.searchParams)).toEqual({ page_size: "50" });
  });
});

describe("propagação de erros", () => {
  it.each([
    [404, "not_found"],
    [429, "rate_limited"],
    [500, "server"],
  ])("status %i vira ApiError %s", async (status, category) => {
    const fetchImpl = fetchReturning(() => jsonResponse({ detail: "x" }, { status }));
    await expect(fetchUpcomingActivities({ fetchImpl })).rejects.toMatchObject({ category });
  });

  it("rede e JSON inválido", async () => {
    await expect(
      fetchUnits({ fetchImpl: vi.fn(async () => Promise.reject(new TypeError("fail"))) }),
    ).rejects.toMatchObject({ category: "network" });
    await expect(
      fetchCategories({ fetchImpl: fetchReturning(() => new Response("<html>", { status: 200 })) }),
    ).rejects.toMatchObject({ category: "invalid_response" });
  });
});

describe("fetchActivities", () => {
  const base = { term: "", unit: "", category: "", period: "any" };
  const UNIT = "11111111-1111-4111-8111-111111111111";
  const call = async (criteria, page) => {
    const fetchImpl = fetchReturning(() => jsonResponse(LIST));
    await fetchActivities({ criteria: { ...base, ...criteria }, page, fetchImpl });
    return new URL(String(fetchImpl.mock.calls[0][0]));
  };

  it("pede 12 por página e omite page na primeira", async () => {
    expect(PAGE_SIZE).toBe(12);
    const url = await call({}, 1);
    expect(url.pathname).toBe("/api/v1/activities/");
    expect(Object.fromEntries(url.searchParams)).toEqual({ page_size: "12" });
  });

  it("envia page para páginas a partir da 2", async () => {
    expect((await call({}, 3)).searchParams.get("page")).toBe("3");
  });

  it("envia só os critérios presentes", async () => {
    const url = await call({ term: "dança", unit: UNIT }, 1);
    expect(Object.fromEntries(url.searchParams)).toEqual({ q: "dança", unit: UNIT, page_size: "12" });
  });

  it("período today envia só date; week e month enviam date_from/date_to (fuso de São Paulo)", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-10-11T02:30:00Z"));
    expect(Object.fromEntries((await call({ period: "today" }, 1)).searchParams)).toEqual({
      date: "2026-10-10",
      page_size: "12",
    });
    expect(Object.fromEntries((await call({ period: "week" }, 1)).searchParams)).toEqual({
      date_from: "2026-10-10",
      date_to: "2026-10-16",
      page_size: "12",
    });
    vi.setSystemTime(new Date("2026-10-11T12:00:00Z"));
    expect((await call({ period: "month" }, 1)).searchParams.get("date_to")).toBe("2026-10-31");
  });

  it("usa o escopo de requisição quando fornecido", async () => {
    const scope = createRequestScope();
    const run = vi.spyOn(scope, "run");
    await fetchActivities({ criteria: base, page: 1, scope, fetchImpl: fetchReturning(() => jsonResponse(LIST)) });
    expect(run).toHaveBeenCalledOnce();
  });

  it.each([
    [400, "bad_request"],
    [404, "not_found"],
    [429, "rate_limited"],
    [500, "server"],
  ])("propaga HTTP %i como %s", async (status, category) => {
    const fetchImpl = fetchReturning(() => jsonResponse({ detail: "x" }, { status }));
    await expect(fetchActivities({ criteria: base, page: 1, fetchImpl })).rejects.toMatchObject({ category });
  });

  it("propaga falha de rede e JSON inválido", async () => {
    await expect(
      fetchActivities({ criteria: base, page: 1, fetchImpl: vi.fn(async () => Promise.reject(new TypeError("x"))) }),
    ).rejects.toMatchObject({ category: "network" });
    await expect(
      fetchActivities({ criteria: base, page: 1, fetchImpl: fetchReturning(() => new Response("<html>")) }),
    ).rejects.toMatchObject({ category: "invalid_response" });
  });
});

describe("fetchActivityDetails", () => {
  const ID = "550e8400-e29b-41d4-a716-446655440001";

  it("consulta GET /activities/<id>/ sem parâmetros", async () => {
    const fetchImpl = fetchReturning(() => jsonResponse({ id: ID, title: "X" }));
    await fetchActivityDetails(ID, { fetchImpl });
    const url = new URL(String(fetchImpl.mock.calls[0][0]));
    expect(url.pathname).toBe(`/api/v1/activities/${ID}/`);
    expect(url.search).toBe("");
  });

  it("codifica o identificador no caminho", async () => {
    const fetchImpl = fetchReturning(() => jsonResponse({}));
    await fetchActivityDetails("a/b?c", { fetchImpl });
    const url = new URL(String(fetchImpl.mock.calls[0][0]));
    expect(url.pathname).toBe("/api/v1/activities/a%2Fb%3Fc/");
    expect(url.search).toBe("");
  });

  it("cancela a consulta anterior do mesmo escopo", async () => {
    const scope = createRequestScope();
    let calls = 0;
    const fetchImpl = vi.fn((url, init) => {
      calls += 1;
      if (calls === 1) {
        return new Promise((_, reject) =>
          init.signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError"))),
        );
      }
      return Promise.resolve(jsonResponse({ id: ID, title: "X" }));
    });
    const a = fetchActivityDetails(ID, { scope, fetchImpl });
    const b = fetchActivityDetails(ID, { scope, fetchImpl });
    await expect(a).rejects.toMatchObject({ category: "cancelled" });
    await expect(b).resolves.toMatchObject({ id: ID });
  });

  it.each([
    [404, "not_found"],
    [400, "bad_request"],
    [429, "rate_limited"],
    [500, "server"],
  ])("propaga ApiError para %i", async (status, category) => {
    const fetchImpl = fetchReturning(() => jsonResponse({ detail: "x" }, { status }));
    await expect(fetchActivityDetails(ID, { fetchImpl })).rejects.toMatchObject({ category });
  });

  it("propaga falha de rede e JSON inválido", async () => {
    await expect(
      fetchActivityDetails(ID, { fetchImpl: vi.fn(async () => Promise.reject(new TypeError("x"))) }),
    ).rejects.toMatchObject({ category: "network" });
    await expect(
      fetchActivityDetails(ID, { fetchImpl: fetchReturning(() => new Response("<html>", { status: 200 })) }),
    ).rejects.toMatchObject({ category: "invalid_response" });
  });

  it("propaga tempo esgotado", async () => {
    vi.useFakeTimers();
    const fetchImpl = vi.fn(
      (url, init) =>
        new Promise((_, reject) =>
          init.signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError"))),
        ),
    );
    const promise = fetchActivityDetails(ID, { fetchImpl });
    const assertion = expect(promise).rejects.toMatchObject({ category: "timeout" });
    await vi.advanceTimersByTimeAsync(15001);
    await assertion;
  });
});

describe("fetchActivities com público-alvo (feature 012)", () => {
  it("envia audience só quando escolhido", async () => {
    const AUDIENCE = "55555555-5555-4555-8555-555555555551";
    const withIt = fetchReturning(() => jsonResponse(LIST));
    await fetchActivities({ criteria: { audience: AUDIENCE }, fetchImpl: withIt });
    expect(new URL(String(withIt.mock.calls[0][0])).searchParams.get("audience")).toBe(AUDIENCE);

    const without = fetchReturning(() => jsonResponse(LIST));
    await fetchActivities({ criteria: { audience: "" }, fetchImpl: without });
    expect(new URL(String(without.mock.calls[0][0])).searchParams.has("audience")).toBe(false);
  });
});
