import { describe, expect, it } from "vitest";
import { ApiError, ERROR_CATEGORIES, classifyStatus, isCancelled } from "../../js/api/errors.js";

describe("classifyStatus", () => {
  it.each([
    [400, "bad_request", false],
    [404, "not_found", false],
    [429, "rate_limited", true],
    [500, "server", true],
    [502, "server", true],
    [503, "server", true],
    [401, "http", false],
    [403, "http", false],
    [405, "http", false],
    [301, "http", false],
  ])("status %i vira %s (retryable=%s)", (status, category, retryable) => {
    expect(classifyStatus(status)).toEqual({ category, retryable });
  });
});

describe("ApiError", () => {
  it("expõe os campos do contrato", () => {
    const cause = new TypeError("x");
    const error = new ApiError("network", { cause });
    expect(error).toBeInstanceOf(Error);
    expect(error.category).toBe("network");
    expect(error.status).toBeNull();
    expect(error.retryable).toBe(true);
    expect(error.fieldErrors).toBeNull();
    expect(error.cause).toBe(cause);
    expect(typeof error.userMessage).toBe("string");
  });

  it("guarda fieldErrors apenas em bad_request", () => {
    const errors = { date_from: ["Informe uma data."] };
    expect(new ApiError("bad_request", { status: 400, fieldErrors: errors }).fieldErrors).toEqual(errors);
    expect(new ApiError("server", { status: 500, fieldErrors: errors }).fieldErrors).toBeNull();
  });

  it("marca retryable somente para network, timeout, server e rate_limited", () => {
    const retryable = Object.values(ERROR_CATEGORIES).filter((c) => new ApiError(c).retryable);
    expect(retryable.sort()).toEqual(["network", "rate_limited", "server", "timeout"]);
  });

  it("não vaza detalhes técnicos nas mensagens ao usuário", () => {
    for (const category of Object.values(ERROR_CATEGORIES)) {
      const { userMessage } = new ApiError(category, { status: 503 });
      expect(userMessage).not.toMatch(/\d{3}/);
      expect(userMessage).not.toMatch(/error|http|fetch|undefined|null/i);
    }
  });

  it("usa a mensagem de configuração quando fornecida", () => {
    const error = new ApiError("config", { userMessage: "A configuração é inválida." });
    expect(error.userMessage).toBe("A configuração é inválida.");
  });
});

describe("isCancelled", () => {
  it("identifica somente erros cancelled", () => {
    expect(isCancelled(new ApiError("cancelled"))).toBe(true);
    expect(isCancelled(new ApiError("network"))).toBe(false);
    expect(isCancelled(new Error("x"))).toBe(false);
  });
});
