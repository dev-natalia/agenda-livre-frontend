// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../js/config.js", () => ({
  getConfigStatus: () => ({ status: "valid", apiBaseUrl: "https://api.exemplo.org/api/v1", message: null }),
  getApiBaseUrl: () => "https://api.exemplo.org/api/v1",
  getRequestTimeoutMs: () => 15000,
}));

import { initListing } from "../../js/explore/listing.js";
import { ApiError } from "../../js/api/errors.js";
import { mountExploreDom } from "./helpers/dom.js";

const CRITERIA = { term: "", unit: "", category: "", period: "any" };
let dom;
let listing;

const activity = (n) => ({
  id: `id-${n}`,
  title: `Atividade ${n}`,
  unit: { name: "CEU Navegantes", neighborhood: "Grajaú" },
  category: { name: "Cultura e Artes", slug: "cultura-e-artes" },
  next_occurrence: { date: "2026-11-20", start_time: "14:00", end_time: "15:00" },
});
const listOf = (total, shown = Math.min(total, 12)) => ({
  count: total,
  next: null,
  previous: null,
  results: Array.from({ length: shown }, (_, i) => activity(i + 1)),
});

function deferred() {
  let resolve;
  const promise = new Promise((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

function make(fetchActivities, options = {}) {
  listing = initListing({
    content: dom.content,
    status: dom.status,
    summary: dom.summary,
    nav: dom.nav,
    fetchActivities,
    ...options,
  });
  return listing;
}

const failing = (error) => async () => {
  throw error;
};

beforeEach(() => {
  dom = mountExploreDom();
});
afterEach(() => {
  listing?.destroy();
  vi.useRealTimers();
});

describe("quantidade de resultados (US4)", () => {
  it.each([
    [1, "1 atividade encontrada"],
    [12, "12 atividades encontradas"],
    [27, "27 atividades encontradas"],
  ])("count %i mostra o resumo e anuncia uma vez", async (total, label) => {
    await make(async () => listOf(total)).load({ criteria: CRITERIA, page: 1 });
    expect(dom.summary.textContent).toBe(label);
    expect(dom.status.textContent).toBe(`${label}.`);
  });

  it("na página 2 e na última o resumo continua sendo o total geral", async () => {
    await make(async () => listOf(27, 12)).load({ criteria: CRITERIA, page: 2 });
    expect(dom.summary.textContent).toBe("27 atividades encontradas");
    listing.destroy();
    await make(async () => listOf(27, 3)).load({ criteria: CRITERIA, page: 3 });
    expect(dom.summary.textContent).toBe("27 atividades encontradas");
  });

  it.each([undefined, null, -1, 1.5, "27"])("count inválido (%s): sem resumo, cards exibidos", async (count) => {
    const data = { ...listOf(3), count, next: "http://x/?page=2" };
    await make(async () => data).load({ criteria: CRITERIA, page: 1 });
    expect(dom.summary.textContent).toBe("");
    expect(dom.content.querySelectorAll(".activity-card")).toHaveLength(3);
    expect([...dom.nav.querySelectorAll("a")].map((a) => a.textContent)).toEqual(["Próxima"]);
  });

  it("durante o carregamento o resumo anterior some e só o carregamento é anunciado", async () => {
    await make(async () => listOf(27)).load({ criteria: CRITERIA, page: 1 });
    expect(dom.summary.textContent).not.toBe("");
    listing.destroy();
    vi.useFakeTimers();
    make(() => deferred().promise).load({ criteria: CRITERIA, page: 2 });
    expect(dom.summary.textContent).toBe("");
    vi.advanceTimersByTime(400);
    expect(dom.status.textContent).toBe("Carregando atividades…");
  });

  it("o resumo visível não está em região viva (sem anúncio duplicado)", async () => {
    await make(async () => listOf(5)).load({ criteria: CRITERIA, page: 1 });
    expect(dom.summary.closest("[aria-live], [role='status']")).toBeNull();
  });
});

describe("vazio, erro e página inexistente (US5)", () => {
  it("count 0 mostra mensagem própria com orientação, sem resumo nem paginação", async () => {
    await make(async () => listOf(0)).load({ criteria: CRITERIA, page: 1 });
    expect(dom.content.querySelector(".region-state__empty").textContent).toContain("Nenhuma atividade encontrada.");
    expect(dom.content.textContent).toContain("Altere ou limpe os filtros");
    expect(dom.content.querySelector(".error-state__message")).toBeNull();
    expect(dom.summary.textContent).toBe("");
    expect(dom.nav.hidden).toBe(true);
    expect(dom.status.textContent).toContain("Nenhuma atividade encontrada.");
  });

  it("count positivo sem nenhum item válido é resposta incoerente (erro)", async () => {
    await make(async () => listOf(5, 0)).load({ criteria: CRITERIA, page: 1 });
    expect(dom.content.querySelector(".error-state__message")).not.toBeNull();
    expect(dom.content.querySelector(".region-state__empty")).toBeNull();
  });

  it.each([
    ["rede", new ApiError("network")],
    ["tempo esgotado", new ApiError("timeout")],
    ["429", new ApiError("rate_limited", { status: 429 })],
    ["500", new ApiError("server", { status: 500 })],
    ["json inválido", new ApiError("invalid_response")],
  ])("falha por %s: mensagem amigável e 'Tentar novamente'", async (_name, error) => {
    await make(failing(error)).load({ criteria: CRITERIA, page: 1 });
    expect(dom.content.querySelector(".error-state__message").textContent).toBe(error.userMessage);
    // "Tentar novamente" só aparece quando o erro é recuperável (contracts/api-usage.md).
    expect(Boolean(dom.content.querySelector(".error-state__retry"))).toBe(error.retryable);
    expect(dom.content.textContent).not.toMatch(/500|429|http|undefined/i);
    expect(dom.summary.textContent).toBe("");
    expect(dom.nav.hidden).toBe(true);
  });

  it("erro não recuperável (400 de outro campo) não oferece tentar novamente", async () => {
    const error = new ApiError("bad_request", { status: 400, fieldErrors: { q: ["x"] } });
    await make(failing(error)).load({ criteria: CRITERIA, page: 1 });
    expect(dom.content.querySelector(".error-state__message")).not.toBeNull();
    expect(dom.content.querySelector(".error-state__retry")).toBeNull();
  });

  it("erro não mostra resultados anteriores como atuais", async () => {
    await make(async () => listOf(5)).load({ criteria: CRITERIA, page: 1 });
    listing.destroy();
    await make(failing(new ApiError("server", { status: 500 }))).load({ criteria: CRITERIA, page: 2 });
    expect(dom.content.querySelectorAll(".activity-card")).toHaveLength(0);
  });

  it("'Tentar novamente' refaz a mesma consulta; nova falha restaura o erro; sucesso mostra os cards", async () => {
    const serverError = () => Promise.reject(new ApiError("server", { status: 500 }));
    const responses = [serverError, serverError, () => Promise.resolve(listOf(3))];
    const fetchActivities = vi.fn(() => responses.shift()());
    await make(fetchActivities).load({ criteria: { ...CRITERIA, term: "x" }, page: 2 });

    dom.content.querySelector(".error-state__retry").click();
    expect(dom.content.querySelectorAll(".skeleton-card").length).toBeGreaterThan(0);
    await vi.waitFor(() => expect(dom.content.querySelector(".error-state__retry")).not.toBeNull());
    expect(fetchActivities).toHaveBeenCalledTimes(2);
    expect(fetchActivities.mock.calls[1][0]).toMatchObject({ criteria: { term: "x" }, page: 2 });

    dom.content.querySelector(".error-state__retry").click();
    await vi.waitFor(() => expect(dom.content.querySelectorAll(".activity-card")).toHaveLength(3));
  });

  it("acionamentos repetidos da mesma consulta em andamento não geram consultas redundantes", async () => {
    const pending = deferred();
    const fetchActivities = vi.fn(() => pending.promise);
    make(fetchActivities);
    const a = listing.load({ criteria: CRITERIA, page: 1 });
    const b = listing.load({ criteria: CRITERIA, page: 1 });
    expect(fetchActivities).toHaveBeenCalledTimes(1);
    pending.resolve(listOf(2));
    await Promise.all([a, b]);
    expect(dom.content.querySelectorAll(".activity-card")).toHaveLength(2);
  });

  it.each([
    ["400 com erro em page", new ApiError("bad_request", { status: 400, fieldErrors: { page: ["Informe uma página válida."] } })],
    ["404", new ApiError("not_found", { status: 404 })],
  ])("%s na página 2 chama onPageOutOfRange e não mostra erro", async (_name, error) => {
    const onPageOutOfRange = vi.fn();
    await make(failing(error), { onPageOutOfRange }).load({ criteria: CRITERIA, page: 2 });
    expect(onPageOutOfRange).toHaveBeenCalledTimes(1);
    expect(onPageOutOfRange).toHaveBeenCalledWith({ criteria: CRITERIA, page: 2 });
    expect(dom.content.querySelector(".error-state__message")).toBeNull();
  });

  it("404 na página 1 é erro comum", async () => {
    const onPageOutOfRange = vi.fn();
    await make(failing(new ApiError("not_found", { status: 404 })), { onPageOutOfRange }).load({
      criteria: CRITERIA,
      page: 1,
    });
    expect(onPageOutOfRange).not.toHaveBeenCalled();
    expect(dom.content.querySelector(".error-state__message")).not.toBeNull();
  });

  it("falha de configuração mostra o erro e não fica em esqueleto", async () => {
    await make(failing(new ApiError("config"))).load({ criteria: CRITERIA, page: 1 });
    expect(dom.content.querySelectorAll(".skeleton-card")).toHaveLength(0);
    expect(dom.content.querySelector(".error-state__message")).not.toBeNull();
  });
});
