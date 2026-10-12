// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const config = vi.hoisted(() => ({
  status: { status: "valid", apiBaseUrl: "https://api.exemplo.org/api/v1", message: null },
}));

vi.mock("../../js/config.js", () => ({
  getConfigStatus: () => config.status,
  getApiBaseUrl: () => "https://api.exemplo.org/api/v1",
  getRequestTimeoutMs: () => 15000,
}));

import { ApiError } from "../../js/api/errors.js";
import { init } from "../../js/pages/activity-details.js";
import { mountDetailsDom } from "./helpers/dom.js";

const ID = "550e8400-e29b-41d4-a716-446655440001";
const DEFAULT_TITLE = "Detalhes da atividade — Agenda Livre";

const details = (over = {}) => ({
  id: ID,
  title: "Oficina de dança",
  description: "Descrição.",
  unit: { name: "CEU Navegantes" },
  category: { name: "Cultura e Artes" },
  schedules: [],
  next_occurrences: [],
  ...over,
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

let dom;
let page;

function start(fetchDetails, options = {}) {
  page = init({ search: `?id=${ID}`, fetchDetails, ...options });
  return page;
}

beforeEach(() => {
  vi.useFakeTimers();
  config.status = { status: "valid", apiBaseUrl: "https://api.exemplo.org/api/v1", message: null };
  document.title = DEFAULT_TITLE;
  dom = mountDetailsDom();
});

afterEach(() => {
  page?.destroy?.();
  page = null;
  vi.useRealTimers();
});

const flush = () => vi.advanceTimersByTimeAsync(0);

describe("init", () => {
  it("sem o contêiner de conteúdo não faz nada", () => {
    document.body.innerHTML = "<main></main>";
    expect(() => init({ search: `?id=${ID}`, fetchDetails: vi.fn() })).not.toThrow();
  });

  it("com configuração inválida mostra o aviso e não deixa esqueleto indefinido", async () => {
    config.status = { status: "invalid", apiBaseUrl: null, message: "Endereço da API não configurado." };
    const fetchDetails = vi.fn(async () => {
      throw new ApiError("config", { userMessage: "Endereço da API não configurado." });
    });
    start(fetchDetails);
    await flush();
    expect(document.querySelector("[data-config-notice], .config-notice")).not.toBeNull();
    expect(dom.content.querySelector(".skeleton-card")).toBeNull();
    expect(dom.content.textContent).toContain("Endereço da API não configurado.");
  });
});

describe("sucesso", () => {
  it("faz uma única requisição e mostra esqueleto oculto durante a espera", async () => {
    const wait = deferred();
    const fetchDetails = vi.fn(() => wait.promise);
    start(fetchDetails);
    expect(fetchDetails).toHaveBeenCalledTimes(1);
    expect(fetchDetails.mock.calls[0][0]).toBe(ID);
    const skeletons = dom.content.querySelectorAll(".skeleton-card");
    expect(skeletons.length).toBeGreaterThan(0);
    skeletons.forEach((el) => expect(el.getAttribute("aria-hidden")).toBe("true"));
    await vi.advanceTimersByTimeAsync(400);
    expect(dom.status.textContent).toMatch(/Carregando/);
  });

  it("troca o esqueleto pelo conteúdo, anuncia e define o título do documento", async () => {
    start(vi.fn(async () => details()));
    await flush();
    expect(dom.content.querySelector(".skeleton-card")).toBeNull();
    expect(dom.content.querySelector("h1").textContent).toBe("Oficina de dança");
    expect(dom.status.textContent).not.toBe("");
    expect(document.title).toBe("Oficina de dança — Agenda Livre");
  });

  it("não move o foco para fora de um elemento operável", async () => {
    const outside = document.createElement("button");
    document.body.append(outside);
    outside.focus();
    start(vi.fn(async () => details()));
    await flush();
    expect(document.activeElement).toBe(outside);
  });

  it("resposta atrasada de uma consulta anterior não sobrescreve a mais recente", async () => {
    const first = deferred();
    const second = deferred();
    const fetchDetails = vi.fn().mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    start(fetchDetails);
    page.reload();
    second.resolve(details({ title: "Nova" }));
    await flush();
    first.resolve(details({ title: "Antiga" }));
    await flush();
    expect(dom.content.querySelector("h1").textContent).toBe("Nova");
    expect(document.title).toBe("Nova — Agenda Livre");
  });

  it.each([[{ id: ID }], [{ id: ID, title: "" }], [null]])("resposta incoerente %j vira erro com nova tentativa", async (body) => {
    start(vi.fn(async () => body));
    await flush();
    expect(dom.content.querySelector("h1")).toBeNull();
    expect(dom.content.querySelector(".error-state__retry")).not.toBeNull();
    expect(document.title).toBe("Erro ao carregar a atividade — Agenda Livre");
  });
});

describe("não encontrada", () => {
  it("404 mostra o estado de não encontrada, anuncia e ajusta o título", async () => {
    start(vi.fn(async () => Promise.reject(new ApiError("not_found", { status: 404 }))));
    await flush();
    expect(dom.content.querySelector("h1").textContent).toBe("Atividade não encontrada ou não disponível");
    expect(dom.content.querySelector(".error-state__retry")).toBeNull();
    expect(dom.status.textContent).toMatch(/não encontrada/i);
    expect(document.title).toBe("Atividade não encontrada — Agenda Livre");
  });

  it.each([[""], ["?id="], ["?id=abc"], ["?id=123"], ["?outro=1"]])("search %j mostra não encontrada sem chamar a API", async (search) => {
    const fetchDetails = vi.fn();
    start(fetchDetails, { search });
    await flush();
    expect(fetchDetails).not.toHaveBeenCalled();
    expect(dom.content.querySelector("h1").textContent).toBe("Atividade não encontrada ou não disponível");
    expect(dom.content.querySelector(".skeleton-card")).toBeNull();
  });
});

describe("erro de comunicação", () => {
  it.each([
    ["network", undefined],
    ["timeout", undefined],
    ["server", 500],
    ["rate_limited", 429],
  ])("%s mostra mensagem amigável e 'Tentar novamente', distinta de não encontrada", async (category, status) => {
    start(vi.fn(async () => Promise.reject(new ApiError(category, { status }))));
    await flush();
    expect(dom.content.querySelector(".error-state__message").textContent.length).toBeGreaterThan(5);
    expect(dom.content.querySelector(".error-state__retry").textContent).toBe("Tentar novamente");
    expect(dom.content.textContent).not.toMatch(/não encontrada/i);
    expect(document.title).toBe("Erro ao carregar a atividade — Agenda Livre");
  });

  it("400 mostra erro sem botão de nova tentativa", async () => {
    start(vi.fn(async () => Promise.reject(new ApiError("bad_request", { status: 400 }))));
    await flush();
    expect(dom.content.querySelector(".error-state__message")).not.toBeNull();
    expect(dom.content.querySelector(".error-state__retry")).toBeNull();
  });

  it("'Tentar novamente' refaz a consulta com esqueleto e mostra o conteúdo", async () => {
    const retry = deferred();
    const fetchDetails = vi
      .fn()
      .mockRejectedValueOnce(new ApiError("server", { status: 500 }))
      .mockReturnValueOnce(retry.promise);
    start(fetchDetails);
    await flush();
    dom.content.querySelector(".error-state__retry").click();
    expect(fetchDetails).toHaveBeenCalledTimes(2);
    expect(dom.content.querySelector(".skeleton-card")).not.toBeNull();
    retry.resolve(details());
    await flush();
    expect(dom.content.querySelector("h1").textContent).toBe("Oficina de dança");
  });

  it("cliques repetidos em 'Tentar novamente' geram uma única requisição", async () => {
    const fetchDetails = vi
      .fn()
      .mockRejectedValueOnce(new ApiError("network"))
      .mockReturnValue(new Promise(() => {}));
    start(fetchDetails);
    await flush();
    const button = dom.content.querySelector(".error-state__retry");
    button.click();
    button.click();
    button.click();
    expect(fetchDetails).toHaveBeenCalledTimes(2);
  });

  it("nova falha restaura a mensagem e o botão", async () => {
    const fetchDetails = vi.fn().mockRejectedValue(new ApiError("network"));
    start(fetchDetails);
    await flush();
    dom.content.querySelector(".error-state__retry").click();
    await flush();
    expect(dom.content.querySelector(".error-state__retry")).not.toBeNull();
    expect(fetchDetails).toHaveBeenCalledTimes(2);
  });

  it("consulta cancelada não gera mensagem de erro", async () => {
    start(vi.fn(async () => Promise.reject(new ApiError("cancelled"))));
    await flush();
    expect(dom.content.querySelector(".error-state__message")).toBeNull();
  });

  it("destroy cancela a consulta em andamento sem erro visível", async () => {
    const wait = deferred();
    start(vi.fn(() => wait.promise));
    page.destroy();
    wait.reject(new ApiError("cancelled"));
    await flush();
    expect(dom.content.querySelector(".error-state__message")).toBeNull();
  });
});
