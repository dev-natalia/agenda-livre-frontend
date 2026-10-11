// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { initSearchForm } from "../../js/explore/search-form.js";
import { ApiError } from "../../js/api/errors.js";
import { mountExploreDom } from "./helpers/dom.js";

let dom;
const list = (results) => ({ count: results.length, next: null, previous: null, results });
const UNITS = list([
  { id: "u1", name: "CEU Navegantes" },
  { id: "u2", name: "CEU Parelheiros" },
]);
const CATEGORIES = list([{ id: "c1", name: "Esportes" }]);
const fail = () => Promise.reject(new ApiError("server", { status: 500 }));
const DEFAULTS = { term: "", unit: "", category: "", period: "any" };

function make(options = {}) {
  const handlers = { onApply: vi.fn(), onClear: vi.fn() };
  const getUnits = vi.fn(async () => UNITS);
  const getCategories = vi.fn(async () => CATEGORIES);
  const form = initSearchForm({
    form: dom.form,
    termInput: dom.term,
    unitSelect: dom.unit,
    categorySelect: dom.category,
    periodSelect: dom.period,
    clearButton: dom.clear,
    noticeEl: dom.optionsStatus,
    getUnits,
    getCategories,
    ...handlers,
    ...options,
  });
  return { form, getUnits, getCategories, ...handlers };
}

beforeEach(() => {
  dom = mountExploreDom();
});

describe("rascunho e aplicação", () => {
  it("digitar e alterar selects não aciona nada", async () => {
    const { onApply, onClear } = make();
    dom.term.value = "dança";
    dom.term.dispatchEvent(new Event("input", { bubbles: true }));
    dom.period.value = "week";
    dom.period.dispatchEvent(new Event("change", { bubbles: true }));
    expect(onApply).not.toHaveBeenCalled();
    expect(onClear).not.toHaveBeenCalled();
  });

  it("enviar o formulário aplica o rascunho normalizado uma única vez", async () => {
    const { form, onApply } = make();
    await form.loadOptions();
    dom.term.value = "  oficina  ";
    dom.unit.value = "u2";
    dom.category.value = "c1";
    dom.period.value = "month";
    const event = new Event("submit", { bubbles: true, cancelable: true });
    dom.form.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(onApply).toHaveBeenCalledTimes(1);
    expect(onApply).toHaveBeenCalledWith({ term: "oficina", unit: "u2", category: "c1", period: "month" });
  });

  it("só espaços vira vazio e período inválido cai em any", () => {
    const { form } = make();
    dom.term.value = "    ";
    dom.period.innerHTML += '<option value="x">x</option>';
    dom.period.value = "x";
    expect(form.getDraft()).toEqual(DEFAULTS);
  });

  it("limpar chama onClear sem ler o rascunho", () => {
    const { onClear, onApply } = make();
    dom.term.value = "x";
    dom.clear.click();
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(onApply).not.toHaveBeenCalled();
  });
});

describe("setCriteria", () => {
  it("preenche campo, período e, depois das opções, unidade e categoria", async () => {
    const { form } = make();
    form.setCriteria({ term: "teatro", unit: "u2", category: "c1", period: "week" });
    expect(dom.term.value).toBe("teatro");
    expect(dom.period.value).toBe("week");
    await form.loadOptions();
    expect(dom.unit.value).toBe("u2");
    expect(dom.category.value).toBe("c1");
    expect(form.getDraft()).toEqual({ term: "teatro", unit: "u2", category: "c1", period: "week" });
  });

  it("restaurar critérios padrão limpa os campos", async () => {
    const { form } = make();
    await form.loadOptions();
    form.setCriteria({ term: "a", unit: "u1", category: "c1", period: "today" });
    form.setCriteria(DEFAULTS);
    expect(form.getDraft()).toEqual(DEFAULTS);
    expect(dom.term.value).toBe("");
  });
});

describe("opções de filtro", () => {
  it("critério ausente nas opções carregadas é descartado, com aviso", async () => {
    const { form } = make();
    form.setCriteria({ term: "", unit: "removida", category: "c1", period: "any" });
    const result = await form.loadOptions();
    expect(result.dropped).toEqual({ unit: true, category: false });
    expect(dom.unit.value).toBe("");
    expect(dom.category.value).toBe("c1");
    expect(dom.optionsStatus.textContent).toBe(
      "Um dos filtros do endereço não está mais disponível e foi desconsiderado.",
    );
  });

  it("falha nas opções mantém o critério do endereço, oferece só 'todas' e avisa", async () => {
    const { form } = make({ getUnits: fail });
    form.setCriteria({ term: "", unit: "u1", category: "", period: "any" });
    const result = await form.loadOptions();
    expect(result.failed.unit).toBe(true);
    expect(result.dropped.unit).toBe(false);
    expect(dom.unit.options).toHaveLength(1);
    expect(dom.optionsStatus.textContent).toBe("Não foi possível carregar as unidades.");
    expect(form.getDraft().unit).toBe("u1");
  });

  it("depois de mexer no select, o valor escolhido vale mesmo com falha", async () => {
    const { form } = make({ getUnits: fail });
    form.setCriteria({ term: "", unit: "u1", category: "", period: "any" });
    await form.loadOptions();
    dom.unit.dispatchEvent(new Event("change", { bubbles: true }));
    expect(form.getDraft().unit).toBe("");
  });

  it("a pesquisa por texto continua funcionando quando as duas listas falham", async () => {
    const { form, onApply } = make({ getUnits: fail, getCategories: fail });
    await form.loadOptions();
    expect(dom.optionsStatus.textContent).toBe("Não foi possível carregar as unidades e as categorias.");
    dom.term.value = "yoga";
    dom.form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    expect(onApply).toHaveBeenCalledWith({ ...DEFAULTS, term: "yoga" });
  });
});
