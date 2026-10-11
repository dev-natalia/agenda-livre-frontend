// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { renderPagination } from "../../js/components/pagination.js";
import { buildPaginationModel } from "../../js/explore/pagination-model.js";

let nav;
const hrefFor = (page) => (page > 1 ? `explorar.html?page=${page}` : "explorar.html");

beforeEach(() => {
  document.body.innerHTML = '<nav id="p" aria-label="Paginação" hidden></nav>';
  nav = document.getElementById("p");
});

describe("renderPagination", () => {
  it("mostra o nav, a lista e a página atual com aria-current", () => {
    renderPagination(nav, buildPaginationModel({ current: 2, count: 27 }), hrefFor);
    expect(nav.hidden).toBe(false);
    expect(nav.getAttribute("aria-label")).toBe("Paginação");
    const current = nav.querySelector('[aria-current="page"]');
    expect(current.textContent).toBe("2");
    expect(current.getAttribute("aria-label")).toBe("Página 2, atual");
    expect(nav.querySelectorAll('[aria-current="page"]')).toHaveLength(1);
  });

  it("páginas são links reais com nome acessível", () => {
    renderPagination(nav, buildPaginationModel({ current: 2, count: 27 }), hrefFor);
    const links = [...nav.querySelectorAll("a")];
    const three = links.find((a) => a.textContent === "3");
    expect(three.getAttribute("href")).toBe("explorar.html?page=3");
    expect(three.getAttribute("aria-label")).toBe("Ir para a página 3");
    const one = links.find((a) => a.textContent === "1");
    expect(one.getAttribute("href")).toBe("explorar.html");
  });

  it("anterior e próxima disponíveis são links; indisponíveis são texto com aria-disabled", () => {
    renderPagination(nav, buildPaginationModel({ current: 1, count: 27 }), hrefFor);
    const disabled = nav.querySelector('[aria-disabled="true"]');
    expect(disabled.tagName).toBe("SPAN");
    expect(disabled.textContent).toBe("Anterior");
    expect(disabled.hasAttribute("href")).toBe(false);
    expect(disabled.tabIndex).toBeLessThan(0);
    const next = [...nav.querySelectorAll("a")].find((a) => a.textContent === "Próxima");
    expect(next.getAttribute("href")).toBe("explorar.html?page=2");

    renderPagination(nav, buildPaginationModel({ current: 3, count: 27 }), hrefFor);
    expect(nav.querySelector('[aria-disabled="true"]').textContent).toBe("Próxima");
  });

  it("reticências ficam ocultas das tecnologias assistivas", () => {
    renderPagination(nav, buildPaginationModel({ current: 10, count: 240 }), hrefFor);
    const gaps = [...nav.querySelectorAll(".pagination__gap")];
    expect(gaps).toHaveLength(2);
    expect(gaps.every((el) => el.getAttribute("aria-hidden") === "true")).toBe(true);
  });

  it("modelo nulo esconde o nav e esvazia a lista", () => {
    renderPagination(nav, buildPaginationModel({ current: 2, count: 27 }), hrefFor);
    renderPagination(nav, null, hrefFor);
    expect(nav.hidden).toBe(true);
    expect(nav.children).toHaveLength(0);
  });

  it("modelo reduzido mostra só anterior e próxima", () => {
    renderPagination(nav, buildPaginationModel({ current: 2, count: null, hasPrevious: true, hasNext: true }), hrefFor);
    expect([...nav.querySelectorAll("a")].map((a) => a.textContent)).toEqual(["Anterior", "Próxima"]);
    expect(nav.querySelector('[aria-current="page"]')).toBeNull();
  });

  it("reconstruir não duplica itens", () => {
    const model = buildPaginationModel({ current: 1, count: 27 });
    renderPagination(nav, model, hrefFor);
    const first = nav.querySelectorAll("li").length;
    renderPagination(nav, model, hrefFor);
    expect(nav.querySelectorAll("li")).toHaveLength(first);
    expect(nav.querySelectorAll("ul")).toHaveLength(1);
  });
});
