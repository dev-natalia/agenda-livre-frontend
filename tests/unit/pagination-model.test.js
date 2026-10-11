import { describe, expect, it } from "vitest";
import { buildPaginationModel, pageItems } from "../../js/explore/pagination-model.js";

const numbers = (items) => items.map((item) => (item.type === "gap" ? "…" : item.number));

describe("pageItems", () => {
  it("lista todas as páginas até 7", () => {
    expect(numbers(pageItems(1, 3))).toEqual([1, 2, 3]);
    expect(numbers(pageItems(4, 7))).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("usa reticências e nunca passa de 7 itens", () => {
    expect(numbers(pageItems(1, 20))).toEqual([1, 2, 3, 4, 5, "…", 20]);
    expect(numbers(pageItems(4, 20))).toEqual([1, 2, 3, 4, 5, "…", 20]);
    expect(numbers(pageItems(10, 20))).toEqual([1, "…", 9, 10, 11, "…", 20]);
    expect(numbers(pageItems(17, 20))).toEqual([1, "…", 16, 17, 18, 19, 20]);
    expect(numbers(pageItems(20, 20))).toEqual([1, "…", 16, 17, 18, 19, 20]);
    for (let current = 1; current <= 50; current += 1) {
      expect(pageItems(current, 50).length).toBeLessThanOrEqual(7);
    }
  });

  it("sempre inclui primeira, atual e última", () => {
    for (const current of [1, 2, 8, 19, 20]) {
      const list = numbers(pageItems(current, 20));
      expect(list).toContain(1);
      expect(list).toContain(current);
      expect(list).toContain(20);
    }
  });
});

describe("buildPaginationModel", () => {
  it("calcula o total de páginas por ceil(count / 12)", () => {
    const model = buildPaginationModel({ current: 1, count: 27 });
    expect(model.total).toBe(3);
    expect(model.previous).toBeNull();
    expect(model.next).toBe(2);
    expect(numbers(model.items)).toEqual([1, 2, 3]);
  });

  it("ponta final: próxima indisponível", () => {
    const model = buildPaginationModel({ current: 3, count: 27 });
    expect(model.previous).toBe(2);
    expect(model.next).toBeNull();
  });

  it.each([0, 1, 12])("count %i cabe em uma página: sem paginação", (count) => {
    expect(buildPaginationModel({ current: 1, count })).toBeNull();
  });

  it("13 resultados têm 2 páginas", () => {
    expect(buildPaginationModel({ current: 1, count: 13 }).total).toBe(2);
  });

  it.each([undefined, null, -1, 1.5, "27", NaN])("count inválido (%s) usa o modelo reduzido", (count) => {
    const model = buildPaginationModel({ current: 2, count, hasPrevious: true, hasNext: true });
    expect(model.total).toBeNull();
    expect(model.items).toEqual([]);
    expect(model.previous).toBe(1);
    expect(model.next).toBe(3);
  });

  it("count inválido sem anterior nem próxima: sem paginação", () => {
    expect(buildPaginationModel({ current: 1, count: undefined, hasPrevious: false, hasNext: false })).toBeNull();
  });

  it("count inválido na primeira página só oferece próxima", () => {
    const model = buildPaginationModel({ current: 1, count: null, hasPrevious: false, hasNext: true });
    expect(model.previous).toBeNull();
    expect(model.next).toBe(2);
  });
});
