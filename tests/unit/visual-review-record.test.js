import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// O registro de revisão visual não pode afirmar mais do que a evidência comporta
// (specs/011-visual-refinement/contracts/visual-review-record.md).
const report = readFileSync("docs/21-registro-de-revisao-visual.md", "utf-8");

const SECTIONS = [
  "1. Identificação",
  "2. Ambiente",
  "3. Resultados",
  "4. Testes atualizados",
  "5. Revisão entre páginas (VIS-021)",
  "6. Responsividade (VIS-022)",
  "7. Acessibilidade (VIS-023)",
  "8. Antes e depois (VIS-024)",
  "9. Problemas",
  "10. Decisões",
  "11. Limites",
];

describe("estrutura do registro de revisão visual", () => {
  it.each(SECTIONS)("tem a seção %s", (title) => {
    expect(report).toContain(`## ${title}`);
  });

  it("não afirma conformidade WCAG integral nem ausência de defeitos", () => {
    expect(report).not.toMatch(/totalmente conforme|100% conforme|plenamente conforme|certificad[oa]\b/i);
    expect(report).not.toMatch(/sem (nenhum )?defeitos?\b(?! encontrad)/i);
  });

  it("diz que passar nas verificações automáticas não prova conformidade e separa o que é manual", () => {
    expect(report.replace(/\s+/g, " ")).toMatch(/não prov[ae]/i);
    expect(report).toMatch(/Manual — NÃO realizado|Manual — realizado/);
  });
});

describe("evidências citadas", () => {
  const cited = [...new Set([...report.matchAll(/`([^`\s]+)`/g)].map((match) => match[1]))].filter((path) =>
    /^(tests\/|docs\/|specs\/|js\/|css\/|images\/)[\w./-]+\.\w+$/.test(path),
  );

  it("cita capturas e arquivos", () => {
    expect(cited.some((path) => path.startsWith("docs/visual-review/before/"))).toBe(true);
    expect(cited.some((path) => path.startsWith("docs/visual-review/after/"))).toBe(true);
    expect(cited.length).toBeGreaterThan(5);
  });

  it.each(cited)("o arquivo citado %s existe", (path) => {
    expect(existsSync(path), path).toBe(true);
  });

  it("cada captura 'antes' tem a correspondente 'depois'", () => {
    const before = cited.filter((path) => path.startsWith("docs/visual-review/before/"));
    for (const path of before) {
      expect(existsSync(path.replace("/before/", "/after/")), path).toBe(true);
    }
  });
});
