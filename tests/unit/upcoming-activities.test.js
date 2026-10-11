// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../js/config.js", () => ({
  getConfigStatus: () => ({ status: "valid", apiBaseUrl: "https://api.exemplo.org/api/v1", message: null }),
  getApiBaseUrl: () => "https://api.exemplo.org/api/v1",
  getRequestTimeoutMs: () => 15000,
}));

import { initUpcoming } from "../../js/home/upcoming-activities.js";
import { ApiError } from "../../js/api/errors.js";
import { mountHomeDom } from "./helpers/dom.js";

let dom;
let upcoming;

const activity = (n, extra = {}) => ({
  id: `id-${n}`,
  title: `Atividade ${n}`,
  unit: { name: "CEU Navegantes", neighborhood: "Grajaú" },
  category: { name: "Cultura e Artes", slug: "cultura-e-artes" },
  next_occurrence: { date: "2026-11-20", start_time: "14:00", end_time: "15:00" },
  ...extra,
});
const list = (results) => ({ count: results.length, next: null, previous: null, results });

// Promessa controlável para simular resposta lenta.
function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function start(fetchUpcoming) {
  upcoming = initUpcoming({ content: dom.content, status: dom.status, fetchUpcoming });
  return upcoming.load();
}

beforeEach(() => {
  vi.useFakeTimers();
  dom = mountHomeDom();
});

afterEach(() => {
  upcoming?.destroy();
  vi.useRealTimers();
});

describe("sucesso e vazio", () => {
  it("mostra 3 cards na ordem recebida, com h3, link direto e fallback de imagem", async () => {
    await start(async () => list([activity(1), activity(2), activity(3)]));
    const cards = dom.content.querySelectorAll("article.activity-card");
    expect([...cards].map((c) => c.querySelector("h3").textContent)).toEqual([
      "Atividade 1",
      "Atividade 2",
      "Atividade 3",
    ]);
    expect(cards[0].querySelector("a").getAttribute("href")).toBe("atividade.html?id=id-1");
    expect(cards[0].querySelector(".image-fallback")).not.toBeNull();
    expect(dom.content.querySelector(".skeleton-card")).toBeNull();
  });

  it("com 2 itens mostra só 2 cards, sem espaços reservados", async () => {
    await start(async () => list([activity(1), activity(2)]));
    expect(dom.content.children).toHaveLength(2);
    expect(dom.status.textContent).toBe("2 próximas atividades carregadas.");
  });

  it("singular na conclusão", async () => {
    await start(async () => list([activity(1)]));
    expect(dom.status.textContent).toBe("1 próxima atividade carregada.");
  });

  it("ignora itens inválidos e anuncia a contagem dos cards válidos", async () => {
    await start(async () => list([activity(1), { id: "x" }, { title: "sem id" }, null]));
    expect(dom.content.querySelectorAll("article")).toHaveLength(1);
    expect(dom.status.textContent).toBe("1 próxima atividade carregada.");
  });

  it.each([[[]], [[{ id: "x" }]]])("sem cards válidos mostra o estado vazio (não erro)", async (results) => {
    await start(async () => list(results));
    expect(dom.content.textContent).toContain("Não há atividades próximas no momento.");
    expect(dom.content.textContent).toContain("Veja todas as atividades.");
    expect(dom.content.querySelector("button")).toBeNull();
    expect(dom.content.querySelector(".error-state__message")).toBeNull();
  });

  it("item sem próxima ocorrência mostra 'Sem data prevista'", async () => {
    await start(async () => list([activity(1, { next_occurrence: null })]));
    expect(dom.content.textContent).toContain("Sem data prevista");
  });

  it("não interpreta HTML vindo da API", async () => {
    await start(async () => list([activity(1, { title: "<img src=x onerror=alert(1)>" })]));
    expect(dom.content.querySelector("img[src='x']")).toBeNull();
    expect(dom.content.querySelector("h3").textContent).toBe("<img src=x onerror=alert(1)>");
  });

  it("corpo sem results é tratado como erro de resposta inválida", async () => {
    await start(async () => ({ count: 0 }));
    expect(dom.content.querySelector(".error-state__message")).not.toBeNull();
  });
});

describe("carregamento", () => {
  it("mostra 3 esqueletos ocultos e anuncia uma vez após o atraso", async () => {
    const d = deferred();
    const done = start(() => d.promise);
    expect(dom.content.querySelectorAll(".skeleton-card[aria-hidden='true']")).toHaveLength(3);
    expect(dom.status.textContent).toBe("");
    vi.advanceTimersByTime(300);
    expect(dom.status.textContent).toBe("Carregando próximas atividades…");
    d.resolve(list([activity(1), activity(2), activity(3)]));
    await done;
    expect(dom.status.textContent).toBe("3 próximas atividades carregadas.");
    expect(dom.content.querySelector(".skeleton-card")).toBeNull();
  });

  it("resposta rápida não anuncia o carregamento", async () => {
    const d = deferred();
    const done = start(() => d.promise);
    d.resolve(list([activity(1)]));
    await done;
    vi.advanceTimersByTime(1000);
    expect(dom.status.textContent).toBe("1 próxima atividade carregada.");
  });

  it("não move o foco em nenhuma transição", async () => {
    dom.term.focus();
    const d = deferred();
    const done = start(() => d.promise);
    expect(document.activeElement).toBe(dom.term);
    vi.advanceTimersByTime(300);
    d.resolve(list([activity(1)]));
    await done;
    expect(document.activeElement).toBe(dom.term);
  });

  it("duas cargas seguidas: a resposta da antiga não sobrescreve a recente", async () => {
    const pending = [];
    const fetchImpl = vi.fn(
      () =>
        new Promise((resolve) => {
          pending.push(resolve);
        }),
    );
    const respond = (resolve, results) => resolve(new Response(JSON.stringify(list(results))));
    upcoming = initUpcoming({
      content: dom.content,
      status: dom.status,
      fetchUpcoming: ({ scope }) => scope.run("/activities/", { fetchImpl }),
    });
    const a = upcoming.load();
    const b = upcoming.load();
    respond(pending[1], [activity(2)]);
    await b;
    respond(pending[0], [activity(1)]);
    await a;
    expect([...dom.content.querySelectorAll("h3")].map((h) => h.textContent)).toEqual(["Atividade 2"]);
  });
});

describe("falha e nova tentativa", () => {
  it.each(["network", "timeout", "server", "rate_limited"])("%s: mensagem amigável e botão", async (category) => {
    await start(() => Promise.reject(new ApiError(category)));
    expect(dom.content.querySelector(".error-state__message").textContent).toBe(new ApiError(category).userMessage);
    expect(dom.content.querySelector("button").textContent).toBe("Tentar novamente");
    expect(dom.status.textContent).toBe(new ApiError(category).userMessage);
    expect(dom.content.querySelector("article")).toBeNull();
  });

  it("configuração inválida: mensagem sem botão e sem esqueleto", async () => {
    await start(() => Promise.reject(new ApiError("config", { userMessage: "Configuração inválida." })));
    expect(dom.content.textContent).toContain("Configuração inválida.");
    expect(dom.content.querySelector("button")).toBeNull();
    expect(dom.content.querySelector(".skeleton-card")).toBeNull();
  });

  it("o erro não move o foco", async () => {
    dom.term.focus();
    await start(() => Promise.reject(new ApiError("server")));
    expect(document.activeElement).toBe(dom.term);
  });

  it("Tentar novamente volta ao esqueleto, refaz a consulta e recupera", async () => {
    const d = deferred();
    const fetchUpcoming = vi
      .fn()
      .mockRejectedValueOnce(new ApiError("server"))
      .mockImplementationOnce(() => d.promise);
    await start(fetchUpcoming);
    dom.content.querySelector("button").click();
    expect(dom.content.querySelectorAll(".skeleton-card")).toHaveLength(3);
    expect(dom.content.querySelector("button")).toBeNull();
    expect(fetchUpcoming).toHaveBeenCalledTimes(2);
    d.resolve(list([activity(1), activity(2), activity(3)]));
    await vi.advanceTimersByTimeAsync(0);
    expect(dom.content.querySelectorAll("article")).toHaveLength(3);
    expect(dom.status.textContent).toBe("3 próximas atividades carregadas.");
  });

  it("nova falha restaura a mensagem e o botão", async () => {
    const fetchUpcoming = vi.fn().mockRejectedValue(new ApiError("network"));
    await start(fetchUpcoming);
    dom.content.querySelector("button").click();
    await vi.advanceTimersByTimeAsync(0);
    expect(dom.content.querySelector(".error-state__message")).not.toBeNull();
    expect(dom.content.querySelector("button")).not.toBeNull();
    expect(fetchUpcoming).toHaveBeenCalledTimes(2);
  });

  it("cliques repetidos geram uma única consulta", async () => {
    const d = deferred();
    const fetchUpcoming = vi.fn().mockRejectedValueOnce(new ApiError("server")).mockImplementation(() => d.promise);
    await start(fetchUpcoming);
    const button = dom.content.querySelector("button");
    button.click();
    button.click();
    button.click();
    expect(fetchUpcoming).toHaveBeenCalledTimes(2);
  });

  it("consulta cancelada não altera a tela", async () => {
    await start(() => Promise.reject(new ApiError("cancelled")));
    expect(dom.content.querySelector(".error-state__message")).toBeNull();
  });
});
