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

const activity = (n, extra = {}) => ({
  id: `id-${n}`,
  title: `Atividade ${n}`,
  unit: { name: "CEU Navegantes", neighborhood: "Grajaú" },
  category: { name: "Cultura e Artes", slug: "cultura-e-artes" },
  next_occurrence: { date: "2026-11-20", start_time: "14:00", end_time: "15:00" },
  ...extra,
});
const listOf = (total, shown = Math.min(total, 12), extra = {}) => ({
  count: total,
  next: null,
  previous: null,
  results: Array.from({ length: shown }, (_, i) => activity(i + 1)),
  ...extra,
});

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function make(fetchActivities, options = {}) {
  listing = initListing({
    content: dom.content,
    status: dom.status,
    summary: dom.summary,
    nav: dom.nav,
    heading: dom.heading,
    fetchActivities,
    ...options,
  });
  return listing;
}

beforeEach(() => {
  dom = mountExploreDom();
});
afterEach(() => listing?.destroy());

describe("listagem (US1)", () => {
  it("consulta uma vez com critérios e página e mostra esqueletos até a resposta", async () => {
    const pending = deferred();
    const fetchActivities = vi.fn(() => pending.promise);
    const done = make(fetchActivities).load({ criteria: CRITERIA, page: 2 });

    expect(fetchActivities).toHaveBeenCalledTimes(1);
    expect(fetchActivities.mock.calls[0][0]).toMatchObject({ criteria: CRITERIA, page: 2 });
    expect(dom.content.querySelectorAll(".skeleton-card")).toHaveLength(12);
    expect(dom.content.querySelector(".skeleton-card").getAttribute("aria-hidden")).toBe("true");

    pending.resolve(listOf(27));
    await done;
    expect(dom.content.querySelectorAll(".skeleton-card")).toHaveLength(0);
    expect(dom.content.querySelectorAll(".activity-card")).toHaveLength(12);
  });

  it("renderiza os cards na ordem recebida, sem reordenar", async () => {
    const data = listOf(3);
    data.results = [activity(3), activity(1), activity(2)];
    await make(async () => data).load({ criteria: CRITERIA, page: 1 });
    const titles = [...dom.content.querySelectorAll(".activity-card__title")].map((h) => h.textContent);
    expect(titles).toEqual(["Atividade 3", "Atividade 1", "Atividade 2"]);
  });

  it("ignora itens sem id ou título", async () => {
    const data = listOf(3);
    data.results = [activity(1), { id: "x" }, { title: "sem id" }];
    await make(async () => data).load({ criteria: CRITERIA, page: 1 });
    expect(dom.content.querySelectorAll(".activity-card")).toHaveLength(1);
  });

  it("atividade sem próxima ocorrência fica íntegra", async () => {
    const data = listOf(1);
    data.results = [activity(1, { next_occurrence: null })];
    await make(async () => data).load({ criteria: CRITERIA, page: 1 });
    const card = dom.content.querySelector(".activity-card");
    expect(card.textContent).toContain("Sem data prevista");
    expect(card.textContent).not.toMatch(/undefined|null/);
  });

  it("esconde a paginação com uma página e a mostra com várias, com links que mantêm os critérios", async () => {
    await make(async () => listOf(12)).load({ criteria: CRITERIA, page: 1 });
    expect(dom.nav.hidden).toBe(true);

    listing.destroy();
    const criteria = { ...CRITERIA, term: "dança" };
    await make(async () => listOf(27, 12)).load({ criteria, page: 2 });
    expect(dom.nav.hidden).toBe(false);
    const three = [...dom.nav.querySelectorAll("a")].find((a) => a.textContent === "3");
    expect(three.getAttribute("href")).toBe("explorar.html?q=dan%C3%A7a&page=3");
    const one = [...dom.nav.querySelectorAll("a")].find((a) => a.textContent === "1");
    expect(one.getAttribute("href")).toBe("explorar.html?q=dan%C3%A7a");
  });

  it("esconde a paginação durante o carregamento", async () => {
    await make(async () => listOf(27)).load({ criteria: CRITERIA, page: 1 });
    expect(dom.nav.hidden).toBe(false);
    const pending = deferred();
    listing.destroy();
    make(() => pending.promise).load({ criteria: CRITERIA, page: 2 });
    expect(dom.nav.hidden).toBe(true);
  });

  it("não move o foco ao carregar nem ao concluir", async () => {
    dom.term.focus();
    const done = make(async () => listOf(5)).load({ criteria: CRITERIA, page: 1 });
    expect(document.activeElement).toBe(dom.term);
    await done;
    expect(document.activeElement).toBe(dom.term);
  });

  it("resposta atrasada de uma consulta anterior não sobrescreve a mais recente", async () => {
    const first = deferred();
    const second = deferred();
    const queue = [first, second];
    make(() => queue.shift().promise);

    const a = listing.load({ criteria: CRITERIA, page: 1 });
    const b = listing.load({ criteria: { ...CRITERIA, term: "novo" }, page: 1 });

    second.resolve({ ...listOf(1), results: [activity(2)] });
    await b;
    first.resolve({ ...listOf(1), results: [activity(1)] });
    await a;

    const titles = [...dom.content.querySelectorAll(".activity-card__title")].map((h) => h.textContent);
    expect(titles).toEqual(["Atividade 2"]);
  });

  it("consulta cancelada é ignorada em silêncio", async () => {
    make(async () => {
      throw new ApiError("cancelled");
    });
    await listing.load({ criteria: CRITERIA, page: 1 });
    expect(dom.content.querySelector(".error-state__message")).toBeNull();
  });
});
