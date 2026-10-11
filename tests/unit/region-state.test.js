// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createRegionState } from "../../js/components/region-state.js";
import { ApiError } from "../../js/api/errors.js";

let content;
let status;
let region;

beforeEach(() => {
  vi.useFakeTimers();
  document.body.innerHTML = `
    <main>
      <input id="field">
      <p id="status" class="visually-hidden" role="status" aria-live="polite"></p>
      <div id="content"></div>
    </main>`;
  content = document.getElementById("content");
  status = document.getElementById("status");
  region = createRegionState({ content, status });
});

afterEach(() => {
  region.destroy();
  vi.useRealTimers();
});

describe("showLoading", () => {
  it("mostra o texto visível e três esqueletos ocultos da tecnologia assistiva", () => {
    region.showLoading();
    expect(region.getState()).toBe("loading");
    expect(content.querySelector(".region-state__loading").textContent).toContain("Carregando");
    const skeletons = content.querySelectorAll(".skeleton-card");
    expect(skeletons).toHaveLength(3);
    skeletons.forEach((el) => expect(el.getAttribute("aria-hidden")).toBe("true"));
  });

  it("respeita skeletonCount e renderSkeleton da página", () => {
    const custom = createRegionState({
      content,
      status,
      skeletonCount: 2,
      renderSkeleton: (count) => {
        const nodes = [];
        for (let i = 0; i < count; i += 1) {
          const el = document.createElement("div");
          el.className = "custom-skeleton";
          el.setAttribute("aria-hidden", "true");
          nodes.push(el);
        }
        return nodes;
      },
    });
    custom.showLoading();
    expect(content.querySelectorAll(".custom-skeleton")).toHaveLength(2);
    custom.destroy();
  });

  it("só anuncia o carregamento após 300 ms", () => {
    region.showLoading({ announce: "Carregando atividades…" });
    expect(status.textContent).toBe("");
    vi.advanceTimersByTime(299);
    expect(status.textContent).toBe("");
    vi.advanceTimersByTime(1);
    expect(status.textContent).toBe("Carregando atividades…");
  });

  it("não anuncia o carregamento se o resultado chega antes de 300 ms", () => {
    region.showLoading({ announce: "Carregando atividades…" });
    vi.advanceTimersByTime(100);
    region.showSuccess(document.createElement("p"), { announce: "12 atividades encontradas." });
    vi.advanceTimersByTime(1000);
    expect(status.textContent).toBe("12 atividades encontradas.");
  });
});

describe("showSuccess", () => {
  it("substitui todo o conteúdo e anuncia a mensagem informada", () => {
    region.showLoading();
    const list = document.createElement("ul");
    region.showSuccess(list, { announce: "3 atividades encontradas." });
    expect(region.getState()).toBe("success");
    expect(content.children).toHaveLength(1);
    expect(content.firstElementChild).toBe(list);
    expect(content.querySelector(".skeleton-card")).toBeNull();
    expect(status.textContent).toBe("3 atividades encontradas.");
  });

  it("aceita vários nós", () => {
    region.showSuccess([document.createElement("p"), document.createElement("p")]);
    expect(content.children).toHaveLength(2);
  });
});

describe("showEmpty", () => {
  it("usa mensagem própria, distinta do erro", () => {
    region.showEmpty();
    expect(region.getState()).toBe("empty");
    expect(content.querySelector(".region-state__empty").textContent).toContain("Nenhuma atividade encontrada");
    expect(content.querySelector(".error-state__message")).toBeNull();
    expect(content.querySelector("button")).toBeNull();
    expect(status.textContent).toBe("Nenhuma atividade encontrada.");
  });

  it("mostra a dica só quando a página a fornece", () => {
    region.showEmpty();
    expect(content.querySelector(".region-state__hint")).toBeNull();
    region.showEmpty({ hint: "Altere ou limpe os filtros." });
    expect(content.querySelector(".region-state__hint").textContent).toBe("Altere ou limpe os filtros.");
  });
});

describe("showError", () => {
  it("mostra a mensagem amigável e o botão para erro que permite nova tentativa", () => {
    region.showError(new ApiError("server"), { onRetry: vi.fn() });
    expect(region.getState()).toBe("error");
    const error = new ApiError("server");
    expect(content.querySelector(".error-state__message").textContent).toBe(error.userMessage);
    expect(content.querySelector("button").textContent).toBe("Tentar novamente");
    expect(status.textContent).toBe(error.userMessage);
  });

  it.each(["bad_request", "config", "not_found"])("não oferece o botão para %s", (category) => {
    region.showError(new ApiError(category), { onRetry: vi.fn() });
    expect(content.querySelector("button")).toBeNull();
  });

  it("ignora erro de consulta cancelada", () => {
    region.showLoading();
    region.showError(new ApiError("cancelled"), { onRetry: vi.fn() });
    expect(region.getState()).toBe("loading");
    expect(content.querySelector(".error-state__message")).toBeNull();
  });

  it("o botão chama onRetry uma vez e o contêiner não vira região live", () => {
    const onRetry = vi.fn();
    region.showError(new ApiError("network"), { onRetry });
    expect(content.hasAttribute("role")).toBe(false);
    expect(content.hasAttribute("aria-live")).toBe(false);
    const button = content.querySelector("button");
    button.focus();
    button.click();
    button.click();
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(content);
  });

  it("trata HTML na mensagem como texto", () => {
    region.showError(new ApiError("server", { userMessage: "<img src=x onerror=alert(1)>" }), {});
    expect(content.querySelector("img")).toBeNull();
  });
});

describe("anúncios e foco", () => {
  it("escreve exatamente uma mensagem por troca e repete mensagens iguais", () => {
    region.showEmpty();
    expect(status.textContent).toBe("Nenhuma atividade encontrada.");
    const spy = vi.fn();
    new MutationObserver(spy).observe(status, { childList: true, characterData: true, subtree: true });
    region.showEmpty();
    expect(status.textContent).toBe("Nenhuma atividade encontrada.");
  });

  it("o contêiner de conteúdo não é uma região live", () => {
    region.showSuccess(document.createElement("p"), { announce: "ok" });
    expect(content.hasAttribute("aria-live")).toBe(false);
    expect(content.hasAttribute("role")).toBe(false);
  });

  it("nenhuma troca move o foco de um campo da página", () => {
    const field = document.getElementById("field");
    field.focus();
    region.showLoading();
    vi.advanceTimersByTime(500);
    region.showError(new ApiError("server"), { onRetry: vi.fn() });
    region.showLoading();
    region.showEmpty();
    region.showSuccess(document.createElement("p"));
    expect(document.activeElement).toBe(field);
  });

  it("destroy cancela o anúncio pendente", () => {
    region.showLoading({ announce: "Carregando atividades…" });
    region.destroy();
    vi.advanceTimersByTime(1000);
    expect(status.textContent).toBe("");
  });
});
