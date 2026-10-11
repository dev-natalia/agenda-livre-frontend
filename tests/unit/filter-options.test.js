// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fillSelect, initFilterOptions } from "../../js/home/filter-options.js";
import { ApiError } from "../../js/api/errors.js";
import { mountHomeDom } from "./helpers/dom.js";

let dom;
const list = (results) => ({ count: results.length, next: null, previous: null, results });
const UNITS = list([
  { id: "u1", name: "CEU Navegantes" },
  { id: "u2", name: "CEU Parelheiros" },
]);
const CATEGORIES = list([{ id: "c1", name: "Esportes" }]);
const fail = () => Promise.reject(new ApiError("server", { status: 500 }));

function run(getUnits, getCategories) {
  return initFilterOptions({
    unitSelect: dom.unit,
    categorySelect: dom.category,
    statusEl: dom.optionsStatus,
    getUnits,
    getCategories,
  });
}

beforeEach(() => {
  dom = mountHomeDom();
});

describe("fillSelect", () => {
  it("mantém 'todas' primeiro e usa id como valor e nome como texto", () => {
    fillSelect(dom.unit, [{ id: "u1", name: "CEU A" }]);
    const options = [...dom.unit.options];
    expect(options.map((o) => o.textContent)).toEqual(["Todas as unidades", "CEU A"]);
    expect(options[0].value).toBe("");
    expect(options[1].value).toBe("u1");
  });

  it("não interpreta HTML no nome", () => {
    fillSelect(dom.unit, [{ id: "u1", name: "<b>CEU</b>" }]);
    expect(dom.unit.options[1].textContent).toBe("<b>CEU</b>");
    expect(dom.unit.querySelector("b")).toBeNull();
  });

  it("não duplica opções em chamadas repetidas", () => {
    fillSelect(dom.unit, [{ id: "u1", name: "A" }]);
    fillSelect(dom.unit, [{ id: "u1", name: "A" }]);
    expect(dom.unit.options).toHaveLength(2);
  });
});

describe("initFilterOptions", () => {
  it("preenche as duas listas e não mostra aviso", async () => {
    await run(async () => UNITS, async () => CATEGORIES);
    expect([...dom.unit.options].map((o) => o.textContent)).toEqual([
      "Todas as unidades",
      "CEU Navegantes",
      "CEU Parelheiros",
    ]);
    expect([...dom.category.options].map((o) => o.textContent)).toEqual(["Todas as categorias", "Esportes"]);
    expect(dom.optionsStatus.textContent).toBe("");
  });

  it("falha só em unidades: unidades com 'todas' e aviso; categorias normais", async () => {
    await run(fail, async () => CATEGORIES);
    expect(dom.unit.options).toHaveLength(1);
    expect(dom.category.options).toHaveLength(2);
    expect(dom.optionsStatus.textContent).toBe("Não foi possível carregar as unidades.");
  });

  it("falha nas duas: aviso para ambas", async () => {
    await run(fail, fail);
    expect(dom.unit.options).toHaveLength(1);
    expect(dom.category.options).toHaveLength(1);
    expect(dom.optionsStatus.textContent).toBe("Não foi possível carregar as unidades e as categorias.");
  });

  it("lista vazia: só 'todas' e sem aviso", async () => {
    await run(async () => list([]), async () => list([]));
    expect(dom.unit.options).toHaveLength(1);
    expect(dom.optionsStatus.textContent).toBe("");
  });

  it("ignora itens sem id ou nome e aceita mais de 50 como vieram", async () => {
    const many = list(Array.from({ length: 60 }, (_, i) => ({ id: `u${i}`, name: `Unidade ${i}` })));
    many.results.push({ id: "", name: "x" }, { id: "z" }, null);
    await run(async () => many, async () => CATEGORIES);
    expect(dom.unit.options).toHaveLength(61);
  });

  it("não move o foco", async () => {
    dom.term.focus();
    await run(async () => UNITS, fail);
    expect(document.activeElement).toBe(dom.term);
  });

  it("não dispara consulta ao escolher uma opção", async () => {
    const getUnits = vi.fn(async () => UNITS);
    await run(getUnits, async () => CATEGORIES);
    dom.unit.value = "u1";
    dom.unit.dispatchEvent(new Event("change", { bubbles: true }));
    expect(getUnits).toHaveBeenCalledTimes(1);
  });
});
