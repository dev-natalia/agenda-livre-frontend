// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { showConfigNotice } from "../../js/components/config-notice.js";

const invalid = { status: "invalid", apiBaseUrl: null, message: "A configuração da API é inválida." };
const valid = { status: "valid", apiBaseUrl: "https://api.exemplo.org/api/v1", message: null };

describe("showConfigNotice", () => {
  beforeEach(() => {
    document.body.innerHTML = "<main><h1>Título</h1></main>";
  });

  it("insere um alerta no início de main quando a configuração não é válida", () => {
    showConfigNotice(invalid);
    const first = document.querySelector("main").firstElementChild;
    expect(first.getAttribute("role")).toBe("alert");
    expect(first.textContent).toBe(invalid.message);
  });

  it("não insere nada quando a configuração é válida", () => {
    showConfigNotice(valid);
    expect(document.querySelector("[role=alert]")).toBeNull();
  });

  it("não duplica o aviso em chamadas repetidas", () => {
    showConfigNotice(invalid);
    showConfigNotice(invalid);
    expect(document.querySelectorAll("[role=alert]")).toHaveLength(1);
  });

  it("não lança erro quando main não existe", () => {
    document.body.innerHTML = "<div></div>";
    expect(() => showConfigNotice(invalid)).not.toThrow();
  });
});
