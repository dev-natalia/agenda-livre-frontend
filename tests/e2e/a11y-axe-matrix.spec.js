import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { scenarios } from "./helpers/a11y-matrix.js";

// Axe em toda a matriz do DOC-14 §9.1: cinco páginas × estados × larguras (specs/009, contracts/audit-matrix.md).
// A verificação automática encontra só parte dos problemas: não prova conformidade com a WCAG.
// Teclado, leitor de tela, zoom e espaçamento continuam sendo verificados à mão (quickstart.md).
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

// Exceções aceitas, cada uma com escopo, razão e mitigação (também listadas em contracts/audit-matrix.md).
// Nenhuma regra é desativada: uma exceção só dispensa o seletor indicado, naquela regra.
export const EXCEPTIONS = [];

test("toda exceção tem regra, seletor, razão e mitigação", () => {
  for (const exception of EXCEPTIONS) {
    for (const field of ["rule", "selector", "reason", "mitigation"]) {
      expect(exception[field], `${field} de ${JSON.stringify(exception)}`).toBeTruthy();
    }
  }
});

const isExcepted = (violationId, node) =>
  EXCEPTIONS.some((e) => e.rule === violationId && node.target.some((t) => String(t).includes(e.selector)));

for (const scenario of scenarios()) {
  test(scenario.name, async ({ page }) => {
    await scenario.open(page);
    const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
    const remaining = violations
      .map((v) => ({ ...v, nodes: v.nodes.filter((n) => !isExcepted(v.id, n)) }))
      .filter((v) => v.nodes.length > 0)
      .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`);
    expect(remaining).toEqual([]);
  });
}
