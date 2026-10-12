import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// A verificação de contrato é opcional e somente leitura (contracts/contract-check.md).
const contract = readFileSync("tests/contract/api-contract.test.js", "utf-8");
const pkg = JSON.parse(readFileSync("package.json", "utf-8"));
const vitestConfig = readFileSync("vitest.config.js", "utf-8");

describe("verificação de contrato com a API real", () => {
  it("só faz GET e nunca grava na API", () => {
    expect(contract).not.toMatch(/method\s*:\s*["'`](POST|PUT|PATCH|DELETE)/i);
    expect(contract).toMatch(/method:\s*"GET"/);
  });

  it("só acessa a rede quando API_BASE_URL é informada", () => {
    expect(contract).toContain("process.env.API_BASE_URL");
    expect(contract).toMatch(/describe\.skipIf\(!API\)/);
    expect(contract).toContain("API_BASE_URL não informada; verificação de contrato não executada");
  });

  it("fica fora da suíte padrão e do comando único", () => {
    expect(vitestConfig).toContain("tests/unit/**");
    expect(vitestConfig).not.toContain("tests/contract");
    expect(pkg.scripts["test:contract"]).toContain("vitest.contract.config.js");
    expect(pkg.scripts["test:all"]).not.toContain("contract");
    expect(pkg.scripts.test).not.toContain("contract");
  });

  it("o comando único roda as duas suítes e falha se uma falhar", () => {
    expect(pkg.scripts["test:all"]).toBe("vitest run && playwright test");
  });
});
