import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// O registro de qualidade não pode afirmar mais do que a evidência comporta
// (specs/010-testing-quality/contracts/quality-report.md).
const report = readFileSync("docs/20-registro-de-qualidade.md", "utf-8");
const a11yReport = readFileSync("docs/17-registro-de-acessibilidade.md", "utf-8");

const SECTIONS = [
  "1. Identificação",
  "2. Ambiente",
  "3. Resultados",
  "4. Ignorados",
  "5. Defeitos",
  "6. Exceções",
  "7. Critérios de aceite do DOC-14 §14",
  "8. Limitações conhecidas",
  "9. Referências",
];

const section = (title) => {
  const start = report.indexOf(`## ${title}`);
  if (start === -1) return null;
  const next = report.indexOf("\n## ", start + 3);
  return report.slice(start, next === -1 ? undefined : next);
};

const tableRows = (text) =>
  text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("|") && !/^\|[-| :]+\|$/.test(line))
    .slice(1)
    .map((line) => line.split("|").slice(1, -1).map((cell) => cell.trim()));

describe("estrutura do registro de qualidade", () => {
  it.each(SECTIONS)("tem a seção %s", (title) => {
    expect(section(title), title).not.toBeNull();
  });

  it("não afirma conformidade WCAG integral nem ausência de defeitos", () => {
    expect(report).not.toMatch(/totalmente conforme|100% conforme|plenamente conforme|certificad[oa]\b/i);
    expect(report).not.toMatch(/conformidade integral com a WCAG 2\.2 AA(?!\s*(,|\.|\)|e\b|nem|ou))/i);
    expect(report).not.toMatch(/sem (nenhum )?defeitos?\b(?! encontrad)/i);
  });

  it("diz que passar na suíte não prova conformidade", () => {
    expect(report.replace(/\s+/g, " ")).toMatch(/não prov[ae]|não equivale/i);
  });
});

describe("evidências citadas", () => {
  const cited = [...new Set([...report.matchAll(/`([^`\s]+)`/g)].map((match) => match[1]))].filter((path) =>
    /^(tests\/|docs\/|specs\/|\.github\/|js\/|css\/)[\w./-]+\.\w+$/.test(path),
  );

  it("cita arquivos", () => {
    expect(cited.length).toBeGreaterThan(3);
  });

  it.each(cited)("o arquivo citado existe: %s", (path) => {
    expect(existsSync(path), path).toBe(true);
  });
});

describe("critérios do DOC-14 §14", () => {
  const rows = tableRows(section("7. Critérios de aceite do DOC-14 §14") ?? "");
  const SITUATIONS = ["atendido", "atendido-com-ressalva", "nao-verificado"];

  it("lista os 11 critérios", () => {
    expect(rows).toHaveLength(11);
  });

  it("cada critério tem situação do vocabulário e uma evidência ou motivo", () => {
    for (const [criterion, situation, evidence] of rows) {
      expect(SITUATIONS, criterion).toContain(situation);
      expect(evidence, criterion).not.toBe("");
    }
  });

  it("atendido só aparece com evidência executável (teste, comando ou documento)", () => {
    for (const [criterion, situation, evidence] of rows) {
      if (situation === "atendido") expect(evidence, criterion).toMatch(/`[^`]+`/);
    }
  });

  it("verificações manuais não executadas não são dadas como atendidas", () => {
    const reader = rows.find(([criterion]) => /leitor de tela/i.test(criterion));
    expect(reader?.[1]).toBe("nao-verificado");
  });
});

describe("relação com o registro de acessibilidade", () => {
  it("referencia o DOC-17", () => {
    expect(report).toContain("docs/17-registro-de-acessibilidade.md");
  });

  it("não copia a contagem de verificações do DOC-17", () => {
    const summary = /Verificações automáticas: (\d+) critérios/.exec(a11yReport);
    if (summary) expect(report).not.toContain(`${summary[1]} critérios`);
  });
});
