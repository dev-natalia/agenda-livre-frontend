// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { renderDetails, renderNotFound } from "../../js/details/render.js";

const full = (over = {}) => ({
  id: "550e8400-e29b-41d4-a716-446655440001",
  title: "Oficina de dança",
  summary: "Aprenda os primeiros passos.",
  description: "Descrição completa.\nSegunda linha.",
  target_audience_notes: "Iniciantes são bem-vindos.",
  unit: { id: "u1", name: "CEU Navegantes", address: "Rua das Flores, 100", neighborhood: "Grajaú" },
  category: { id: "c1", name: "Cultura e Artes", slug: "cultura-e-artes" },
  target_audiences: [{ id: "a1", name: "Adultos" }, { id: "a2", name: "Idosos" }],
  external_registration_url: null,
  schedules: [
    {
      id: "s1",
      schedule_type: "RECURRING",
      start_date: "2026-11-01",
      end_date: "2026-12-31",
      start_time: "14:00",
      end_time: "15:00",
      weekdays: [2, 4],
      weekday_names: ["Terça-feira", "Quinta-feira"],
    },
  ],
  next_occurrences: [{ date: "2026-11-03", start_time: "14:00", end_time: "15:00" }],
  ...over,
});

let host;
const render = (data) => {
  host.replaceChildren(...renderDetails(data));
  return host;
};
const sectionTitles = () => [...host.querySelectorAll("h2")].map((h) => h.textContent);

beforeEach(() => {
  document.body.innerHTML = "<div id='host'></div>";
  host = document.getElementById("host");
});

describe("renderDetails — conteúdo completo", () => {
  it("mostra um único h1 com o título, categoria, resumo e unidade", () => {
    render(full());
    const h1 = host.querySelectorAll("h1");
    expect(h1).toHaveLength(1);
    expect(h1[0].textContent).toBe("Oficina de dança");
    expect(host.textContent).toContain("Cultura e Artes");
    expect(host.textContent).toContain("Aprenda os primeiros passos.");
    expect(host.textContent).toContain("CEU Navegantes");
    expect(host.textContent).toContain("Rua das Flores, 100");
    expect(host.textContent).toContain("Grajaú");
  });

  it("mostra programações, próximas datas com <time>, público e descrição em seções h2", () => {
    render(full());
    expect(sectionTitles()).toEqual(["Quando", "Público", "Sobre a atividade", "Local"]);
    expect(host.textContent).toContain("Terça-feira e Quinta-feira");
    expect(host.textContent).toContain("14h00 às 15h00");
    expect(host.querySelector("time[datetime='2026-11-03T14:00']")).not.toBeNull();
    expect(host.textContent).toContain("Adultos");
    expect(host.textContent).toContain("Idosos");
    expect(host.textContent).toContain("Iniciantes são bem-vindos.");
    expect(host.querySelector(".activity-details__description").textContent).toBe(
      "Descrição completa.\nSegunda linha.",
    );
  });

  it("usa o visual de imagem ausente, decorativo e sem texto alternativo", () => {
    render(full());
    const media = host.querySelector(".image-fallback");
    expect(media).not.toBeNull();
    expect(media.getAttribute("aria-hidden")).toBe("true");
    expect(host.querySelector("img")).toBeNull();
  });
});

describe("renderDetails — campos ausentes", () => {
  it("omite seções e rótulos quando faltam dados", () => {
    render(
      full({
        summary: null,
        description: "   ",
        target_audience_notes: null,
        target_audiences: [],
        unit: null,
        category: null,
        schedules: [],
        next_occurrences: [],
      }),
    );
    expect(host.querySelector("h1").textContent).toBe("Oficina de dança");
    expect(sectionTitles()).toEqual(["Quando"]);
    expect(host.textContent).toContain("Sem data prevista");
    expect(host.textContent).not.toMatch(/undefined|null/);
    expect(host.querySelector(".activity-details__category")).toBeNull();
    expect(host.querySelector(".activity-details__summary")).toBeNull();
  });

  it("unidade só com nome não mostra endereço nem bairro vazios", () => {
    render(full({ unit: { name: "CEU X", address: null, neighborhood: "" } }));
    expect(host.textContent).toContain("CEU X");
    expect(host.textContent).not.toMatch(/undefined|null/);
  });

  it("sem público e sem observações, a seção Público não existe", () => {
    render(full({ target_audiences: null, target_audience_notes: "" }));
    expect(sectionTitles()).not.toContain("Público");
  });

  it("não mostra nenhum link externo sem URL", () => {
    render(full());
    expect(host.querySelector("a")).toBeNull();
  });
});

describe("renderDetails — segurança", () => {
  it("HTML e scripts em textos da API aparecem como texto literal", () => {
    const evil = "<img src=x onerror=alert(1)><script>alert(2)</script>";
    render(
      full({
        title: evil,
        summary: evil,
        description: evil,
        target_audience_notes: evil,
        unit: { name: evil, address: evil, neighborhood: evil },
        category: { name: evil },
        target_audiences: [{ id: "a", name: evil }],
      }),
    );
    expect(host.querySelector("script")).toBeNull();
    expect(host.querySelector("img")).toBeNull();
    expect(host.querySelector("h1").textContent).toBe(evil);
    expect(host.querySelector(".activity-details__description").textContent).toBe(evil);
  });
});

describe("renderDetails — dados inválidos", () => {
  it.each([[null], [undefined], [{}], [{ id: "x" }], [{ title: "Sem id" }], [{ id: "x", title: 5 }], [{ id: "x", title: "  " }]])(
    "lança invalid_response para %j",
    (data) => {
      expect(() => renderDetails(data)).toThrowError(expect.objectContaining({ category: "invalid_response" }));
    },
  );
});

describe("renderDetails — link externo", () => {
  it("cria o link seguro, em nova aba, com indicação textual", () => {
    render(full({ external_registration_url: "https://exemplo.org/inscricao" }));
    const link = host.querySelector("a.external-link");
    expect(link).not.toBeNull();
    expect(link.getAttribute("href")).toBe("https://exemplo.org/inscricao");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    expect(link.classList.contains("button")).toBe(true);
    expect(link.textContent).toMatch(/site externo/i);
    expect(link.textContent).toMatch(/nova aba/i);
    expect(link.textContent).not.toMatch(/agenda livre/i);
    link.querySelectorAll("svg").forEach((svg) => expect(svg.getAttribute("aria-hidden")).toBe("true"));
  });

  it.each([["javascript:alert(1)"], ["data:text/html,x"], ["/relativa"], ["//x.org"], [""], ["não é url"], [42]])(
    "não cria link para %j",
    (url) => {
      render(full({ external_registration_url: url }));
      expect(host.querySelector("a")).toBeNull();
    },
  );
});

describe("renderNotFound", () => {
  it("mostra título, explicação e os dois caminhos de saída", () => {
    host.replaceChildren(...renderNotFound());
    expect(host.querySelector("h1").textContent).toBe("Atividade não encontrada ou não disponível");
    const links = [...host.querySelectorAll("a")];
    expect(links.map((a) => [a.textContent, a.getAttribute("href")])).toEqual([
      ["Explorar outras atividades", "explorar.html"],
      ["Voltar ao Início", "index.html"],
    ]);
    expect(host.querySelector("p").textContent.length).toBeGreaterThan(10);
  });
});

describe("renderDetails — cor por categoria e ícones (feature 011)", () => {
  it("grava data-category com o slug válido e mantém o nome escrito", () => {
    render(full({ category: { name: "Esporte", slug: "esporte-e-atividade-fisica" } }));
    const tag = host.querySelector(".activity-details__category");
    expect(tag.getAttribute("data-category")).toBe("esporte-e-atividade-fisica");
    expect(tag.textContent).toBe("Esporte");
  });

  it.each(["Esporte", 'a"b', "<img src=x>", "a b", ""])("não grava data-category para o slug %j", (slug) => {
    render(full({ category: { name: "Qualquer", slug } }));
    const tag = host.querySelector(".activity-details__category");
    expect(tag.hasAttribute("data-category")).toBe(false);
    expect(tag.textContent).toBe("Qualquer");
  });

  it("os ícones dos metadados são decorativos e não mudam o texto", () => {
    render(full());
    const icons = [...host.querySelectorAll("svg.meta-icon")];
    expect(icons.length).toBeGreaterThan(0);
    for (const icon of icons) {
      expect(icon.getAttribute("aria-hidden")).toBe("true");
      expect(icon.getAttribute("focusable")).toBe("false");
    }
    expect(host.querySelector(".activity-details__unit").textContent).toBe("CEU Navegantes");
  });
});
