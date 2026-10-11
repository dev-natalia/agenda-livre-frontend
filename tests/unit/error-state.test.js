// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearErrorState, renderErrorState } from "../../js/components/error-state.js";
import { ApiError } from "../../js/api/errors.js";

let container;

beforeEach(() => {
  document.body.innerHTML = '<main><div id="region" role="status" aria-live="polite"></div></main>';
  container = document.getElementById("region");
});

describe("renderErrorState", () => {
  it("por padrão define a região de status no contêiner", () => {
    container.removeAttribute("role");
    container.removeAttribute("aria-live");
    renderErrorState(container, new ApiError("network"));
    expect(container.getAttribute("role")).toBe("status");
    expect(container.getAttribute("aria-live")).toBe("polite");
  });

  it("com live: false não define role nem aria-live", () => {
    container.removeAttribute("role");
    container.removeAttribute("aria-live");
    renderErrorState(container, new ApiError("network"), { onRetry: vi.fn(), live: false });
    expect(container.hasAttribute("role")).toBe(false);
    expect(container.hasAttribute("aria-live")).toBe(false);
    expect(container.querySelector("button").textContent).toBe("Tentar novamente");
  });

  it("mostra a mensagem via textContent, sem interpretar HTML", () => {
    const error = new ApiError("server", { userMessage: '<img src=x onerror="alert(1)">Indisponível' });
    renderErrorState(container, error);
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector(".error-state__message").textContent).toContain("Indisponível");
  });

  it("oferece o botão apenas para erro retryable com onRetry", () => {
    renderErrorState(container, new ApiError("network"), { onRetry: vi.fn() });
    const button = container.querySelector("button");
    expect(button.type).toBe("button");
    expect(button.textContent).toBe("Tentar novamente");

    renderErrorState(container, new ApiError("network"));
    expect(container.querySelector("button")).toBeNull();
  });

  it.each(["bad_request", "not_found", "config", "invalid_response", "http"])(
    "não oferece o botão para %s",
    (category) => {
      renderErrorState(container, new ApiError(category), { onRetry: vi.fn() });
      expect(container.querySelector("button")).toBeNull();
    },
  );

  it("chama onRetry uma vez e desabilita o botão", () => {
    const onRetry = vi.fn();
    renderErrorState(container, new ApiError("timeout"), { onRetry });
    const button = container.querySelector("button");
    button.click();
    button.click();
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(button.disabled).toBe(true);
  });

  it("mantém a região de status e não move o foco ao renderizar", () => {
    const outside = document.createElement("button");
    document.body.append(outside);
    outside.focus();
    renderErrorState(container, new ApiError("server"), { onRetry: vi.fn() });
    expect(document.activeElement).toBe(outside);
    expect(container.getAttribute("role")).toBe("status");
    expect(container.getAttribute("aria-live")).toBe("polite");
  });

  it("garante role e aria-live quando o contêiner não os tem", () => {
    const bare = document.createElement("div");
    document.body.append(bare);
    renderErrorState(bare, new ApiError("server"));
    expect(bare.getAttribute("role")).toBe("status");
    expect(bare.getAttribute("aria-live")).toBe("polite");
  });

  it("devolve o foco ao contêiner quando o botão focado é acionado", () => {
    renderErrorState(container, new ApiError("server"), { onRetry: vi.fn() });
    const button = container.querySelector("button");
    button.focus();
    button.click();
    expect(container.getAttribute("tabindex")).toBe("-1");
    expect(document.activeElement).toBe(container);
  });

  it("não renderiza erro cancelado e limpa o anterior", () => {
    renderErrorState(container, new ApiError("server"));
    renderErrorState(container, new ApiError("cancelled"));
    expect(container.textContent).toBe("");
  });
});

describe("clearErrorState", () => {
  it("esvazia o contêiner", () => {
    renderErrorState(container, new ApiError("server"), { onRetry: vi.fn() });
    clearErrorState(container);
    expect(container.innerHTML).toBe("");
  });
});
