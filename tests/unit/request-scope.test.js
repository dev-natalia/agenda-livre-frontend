import { describe, expect, it, vi } from "vitest";

vi.mock("../../js/config.js", () => ({
  getConfigStatus: () => ({ status: "valid", apiBaseUrl: "https://api.exemplo.org/api/v1", message: null }),
  getApiBaseUrl: () => "https://api.exemplo.org/api/v1",
  getRequestTimeoutMs: () => 15000,
}));

import { createRequestScope } from "../../js/api/client.js";
import { isCancelled } from "../../js/api/errors.js";
import { jsonResponse, pendingFetch } from "./helpers/fake-fetch.js";

const ok = (id) => jsonResponse({ id });

describe("createRequestScope", () => {
  it("descarta a resposta antiga quando a recente chega primeiro", async () => {
    const { fetchImpl, calls } = pendingFetch();
    const scope = createRequestScope();
    const a = scope.run("/activities/", { params: { q: "a" }, fetchImpl }).catch((e) => e);
    const b = scope.run("/activities/", { params: { q: "b" }, fetchImpl });

    calls[1].resolve(ok("B"));
    await expect(b).resolves.toEqual({ id: "B" });

    calls[0].resolve(ok("A")); // tarde demais
    expect(isCancelled(await a)).toBe(true);
    expect(calls[0].init.signal.aborted).toBe(true);
  });

  it("falha tardia de consulta substituída vira cancelled, não erro real", async () => {
    const { fetchImpl, calls } = pendingFetch();
    const scope = createRequestScope();
    const a = scope.run("/x/", { fetchImpl }).catch((e) => e);
    const b = scope.run("/x/", { fetchImpl });
    calls[0].resolve(jsonResponse({ detail: "x" }, { status: 500 }));
    calls[1].resolve(ok("B"));
    const errorA = await a;
    expect(errorA.category).toBe("cancelled");
    await expect(b).resolves.toEqual({ id: "B" });
  });

  it("escopos distintos não se cancelam", async () => {
    const { fetchImpl, calls } = pendingFetch();
    const first = createRequestScope();
    const second = createRequestScope();
    const a = first.run("/units/", { fetchImpl });
    const b = second.run("/categories/", { fetchImpl });
    calls[0].resolve(ok("U"));
    calls[1].resolve(ok("C"));
    await expect(a).resolves.toEqual({ id: "U" });
    await expect(b).resolves.toEqual({ id: "C" });
  });

  it("cancel() cancela a consulta vigente com erro ignorável", async () => {
    const { fetchImpl } = pendingFetch();
    const scope = createRequestScope();
    const promise = scope.run("/x/", { fetchImpl }).catch((e) => e);
    scope.cancel();
    expect(isCancelled(await promise)).toBe(true);
  });

  it("descarta a resposta mesmo se o fetch ignorar o sinal de abort", async () => {
    const calls = [];
    const fetchImpl = vi.fn(
      (url) => new Promise((resolve) => calls.push({ url: String(url), resolve })),
    );
    const scope = createRequestScope();
    const a = scope.run("/x/", { fetchImpl }).catch((e) => e);
    const b = scope.run("/x/", { fetchImpl });
    calls[1].resolve(ok("B"));
    calls[0].resolve(ok("A"));
    expect(isCancelled(await a)).toBe(true);
    await expect(b).resolves.toEqual({ id: "B" });
  });

  it("com várias chamadas rápidas, só a última resolve", async () => {
    const { fetchImpl, calls } = pendingFetch();
    const scope = createRequestScope();
    const results = [1, 2, 3].map((n) => scope.run("/x/", { params: { n }, fetchImpl }).catch((e) => e));
    calls.forEach((call, i) => call.resolve(ok(i)));
    const [r1, r2, r3] = await Promise.all(results);
    expect(isCancelled(r1)).toBe(true);
    expect(isCancelled(r2)).toBe(true);
    expect(r3).toEqual({ id: 2 });
  });

  it("cancelamento nunca é classificado como network", async () => {
    const { fetchImpl } = pendingFetch();
    const scope = createRequestScope();
    const a = scope.run("/x/", { fetchImpl }).catch((e) => e);
    scope.run("/x/", { fetchImpl }).catch(() => {});
    expect((await a).category).toBe("cancelled");
  });
});
