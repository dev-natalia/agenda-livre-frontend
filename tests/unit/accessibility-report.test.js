import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// O registro de acessibilidade não pode afirmar mais do que a evidência comporta
// (specs/009-transversal-accessibility/contracts/accessibility-report.md, FR-034 e FR-035).
const report = readFileSync("docs/17-registro-de-acessibilidade.md", "utf-8");
const matrix = readFileSync("specs/009-transversal-accessibility/contracts/audit-matrix.md", "utf-8");

const NOTICE =
  "Este registro documenta as verificações feitas na data indicada. Resultados de ferramentas automáticas e de testes manuais contribuem para a avaliação, mas não equivalem a certificação nem a declaração de conformidade integral com a WCAG 2.2 AA, que depende do conteúdo real, dos estados dinâmicos e de avaliação continuada.";

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
    .slice(1) // cabeçalho
    .map((line) => line.split("|").slice(1, -1).map((cell) => cell.trim()));

describe("estrutura do registro", () => {
  it.each([
    "1. Escopo e data",
    "2. Ambiente",
    "3. Resumo",
    "4. Verificações",
    "5. Problemas",
    "6. Exceções",
    "7. Limitações conhecidas",
    "8. Aviso",
  ])("tem a seção %s", (title) => {
    expect(section(title), title).not.toBeNull();
  });

  it("traz o aviso obrigatório, literal", () => {
    expect(report.replace(/\s+/g, " ")).toContain(NOTICE);
  });

  it("não afirma conformidade integral fora do aviso", () => {
    const withoutNotice = report.replace(NOTICE, "");
    expect(withoutNotice).not.toMatch(/totalmente conforme|100% conforme|plenamente conforme|conformidade integral com a WCAG 2\.2 AA\b(?! ,)/i);
    expect(withoutNotice).not.toMatch(/certificad[oa]\b/i);
  });
});

describe("verificações", () => {
  const rows = tableRows(section("4. Verificações"));
  const RESULTS = ["conforme", "nao-conforme", "nao-aplicavel", "nao-verificado"];

  it("há verificações e todas têm um resultado conhecido", () => {
    expect(rows.length).toBeGreaterThan(20);
    for (const row of rows) expect(RESULTS, row.join(" | ")).toContain(row[4]);
  });

  it("todo critério da matriz aparece no registro, com a forma automática ou manual prevista", () => {
    const criteria = [...matrix.matchAll(/^\| ((?:\d|DP )[^|]+?) \| [^|]+ \| [^|]+ \| (A\+M|A|M) \|/gm)].map((m) => [m[1].trim(), m[2]]);
    expect(criteria.length).toBeGreaterThan(15);
    for (const [criterion, form] of criteria) {
      const forms = rows.filter((r) => r[0] === criterion).map((r) => r[1]);
      expect(forms.length, `critério ausente no registro: ${criterion}`).toBeGreaterThan(0);
      if (form.includes("A")) expect(forms, criterion).toContain("automática");
      if (form.includes("M")) expect(forms, criterion).toContain("manual");
    }
  });

  it("resultado conforme sempre cita a evidência executada", () => {
    for (const row of rows.filter((r) => r[4] === "conforme")) {
      expect(row[5], row[0]).toMatch(/`[^`]+\.(spec|test)\.js`/);
    }
  });

  it("nao-verificado e nao-conforme sempre trazem o motivo", () => {
    for (const row of rows.filter((r) => ["nao-verificado", "nao-conforme"].includes(r[4]))) {
      expect(row[5].length, row[0]).toBeGreaterThan(20);
    }
  });

  it("verificação manual nunca é conforme sem identificar ambiente (leitor de tela ou navegador) na evidência", () => {
    for (const row of rows.filter((r) => r[1] === "manual" && r[4] === "conforme")) {
      expect(row[5], row[0]).toMatch(/NVDA|VoiceOver|JAWS|Talkback|Chrome|Firefox|Safari|Edge/i);
    }
  });

  it("os resultados da matriz não contradizem os do registro", () => {
    const text = (criterion) => matrix.split("\n").find((l) => l.startsWith(`| ${criterion} |`)) ?? "";
    for (const row of rows) {
      const line = text(row[0]);
      const word = row[1] === "automática" ? "automática: " : "manual: ";
      const expected = row[4] === "conforme" ? "conforme" : row[4] === "nao-verificado" ? "não verificado" : row[4];
      expect(line, `${row[0]} (${row[1]})`).toContain(`${word}${expected}`);
    }
  });
});

describe("problemas e exceções", () => {
  const problems = section("5. Problemas");
  const blocks = problems.split(/\n### /).slice(1);

  it("cada problema traz critério, onde, descrição, gravidade, situação e correção ou justificativa", () => {
    for (const block of blocks) {
      for (const field of ["Critérios", "Onde", "Descrição", "Gravidade", "Situação"]) {
        expect(block, `${block.slice(0, 12)} sem ${field}`).toContain(`**${field}:**`);
      }
      expect(block).toMatch(/\*\*(Correção|Justificativa)/);
    }
  });

  it("problema pendente tem justificativa e mitigação", () => {
    for (const block of blocks.filter((b) => /\*\*Situação:\*\* (pendente|exceção)/.test(b))) {
      expect(block).toContain("**Justificativa:**");
      expect(block).toContain("**Mitigação:**");
    }
  });

  it("exceções listadas têm regra, escopo, razão e mitigação", () => {
    const exceptions = section("6. Exceções");
    if (/Nenhuma/.test(exceptions)) return;
    for (const field of ["Regra", "Escopo", "Razão", "Mitigação"]) expect(exceptions).toContain(`**${field}:**`);
  });
});

describe("limitações", () => {
  const limits = section("7. Limitações conhecidas");

  it("registra o que não foi verificado e as dependências da API", () => {
    expect(limits).toMatch(/leitor de tela/i);
    expect(limits).toMatch(/imagem/i);
    expect(limits).toMatch(/quantidade de resultados|total de resultados/i);
    expect(limits).toMatch(/inexistente e indispon/i);
  });
});
