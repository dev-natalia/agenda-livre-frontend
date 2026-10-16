// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { createActivityCard } from "../../js/components/activity-card.js";

const FULL = {
  id: "550e8400-e29b-41d4-a716-446655440001",
  title: "Oficina de dança",
  slug: "oficina-de-danca",
  summary: "Atividade aberta à comunidade.",
  unit: { id: "u1", name: "CEU Navegantes", slug: "ceu-navegantes", neighborhood: "Grajaú" },
  category: { id: "c1", name: "Cultura e Artes", slug: "cultura-e-artes" },
  next_occurrence: { date: "2026-11-20", start_time: "14:00", end_time: "15:00" },
};

const text = (el) => el.textContent;

describe("createActivityCard", () => {
  it("monta o card completo", () => {
    const card = createActivityCard(FULL);
    expect(card.tagName).toBe("ARTICLE");
    expect(card.classList.contains("activity-card")).toBe(true);
    expect(text(card.querySelector(".activity-card__category"))).toBe("Cultura e Artes");

    const heading = card.querySelector("h3.activity-card__title");
    const link = heading.querySelector("a");
    expect(link.textContent).toBe("Oficina de dança");
    expect(link.getAttribute("href")).toBe("atividade.html?id=550e8400-e29b-41d4-a716-446655440001");
    expect(link.hasAttribute("target")).toBe(false);

    expect(text(card.querySelector(".activity-card__unit"))).toBe("CEU Navegantes · Grajaú");
    const time = card.querySelector(".activity-card__when time");
    expect(time.getAttribute("datetime")).toBe("2026-11-20T14:00");
    expect(time.textContent).toBe("sex., 20 de nov. · 14h00 às 15h00");
  });

  it.each([2, 3, 4, 5, 6])("usa h%i quando headingLevel=%i", (level) => {
    const card = createActivityCard(FULL, { headingLevel: level });
    expect(card.querySelector(`h${level}.activity-card__title`)).not.toBeNull();
  });

  it("mostra texto neutro sem próxima ocorrência", () => {
    const card = createActivityCard({ ...FULL, next_occurrence: null });
    expect(card.querySelector("time")).toBeNull();
    expect(text(card.querySelector(".activity-card__when"))).toBe("Sem data prevista");
  });

  it("usa o texto neutro quando a data é inválida", () => {
    const card = createActivityCard({ ...FULL, next_occurrence: { date: "xx" } });
    expect(text(card.querySelector(".activity-card__when"))).toBe("Sem data prevista");
  });

  it("omite só a unidade ou a categoria ausentes", () => {
    const noUnit = createActivityCard({ ...FULL, unit: undefined });
    expect(noUnit.querySelector(".activity-card__unit")).toBeNull();
    expect(noUnit.querySelector(".activity-card__category")).not.toBeNull();

    const noCategory = createActivityCard({ ...FULL, category: null });
    expect(noCategory.querySelector(".activity-card__category")).toBeNull();
    expect(noCategory.querySelector(".activity-card__unit")).not.toBeNull();
  });

  it("mostra só o nome da unidade quando não há bairro", () => {
    const card = createActivityCard({ ...FULL, unit: { name: "CEU Navegantes", neighborhood: null } });
    expect(text(card.querySelector(".activity-card__unit"))).toBe("CEU Navegantes");
  });

  it.each([
    ["só id e título", { id: "1", title: "A" }],
    ["tudo nulo", { ...FULL, unit: null, category: null, next_occurrence: null, summary: null }],
    ["unidade sem nome", { ...FULL, unit: { name: "", neighborhood: "Grajaú" } }],
  ])("nunca escreve undefined/null (%s)", (_name, activity) => {
    const card = createActivityCard(activity);
    expect(card.textContent).not.toMatch(/undefined|null/);
  });

  it.each([[{ title: "Sem id" }], [{ id: "1" }], [{ id: "1", title: "  " }], [null], [undefined]])(
    "devolve null sem id ou título válidos (%#)",
    (activity) => {
      expect(createActivityCard(activity)).toBeNull();
    },
  );

  it("trata HTML nos textos como texto literal", () => {
    const card = createActivityCard({
      ...FULL,
      title: '<img src=x onerror="alert(1)"> & "aspas"',
      unit: { name: "<b>CEU</b>" },
      category: { name: "<i>Arte</i>" },
    });
    expect(card.querySelector("img")).toBeNull();
    expect(card.querySelector("b, i")).toBeNull();
    expect(card.querySelector("a").textContent).toBe('<img src=x onerror="alert(1)"> & "aspas"');
  });

  it("tem fallback decorativo oculto da tecnologia assistiva", () => {
    const card = createActivityCard(FULL);
    const media = card.querySelector(".activity-card__media");
    expect(media.classList.contains("image-fallback")).toBe(true);
    expect(media.getAttribute("aria-hidden")).toBe("true");
    const svg = media.querySelector("svg");
    expect(svg.getAttribute("aria-hidden")).toBe("true");
    expect(svg.getAttribute("focusable")).toBe("false");
    expect(card.querySelector("img")).toBeNull();
  });

  it("tem uma única parada de foco", () => {
    const card = createActivityCard(FULL);
    expect(card.querySelectorAll("a, button, input, select, textarea, [tabindex]")).toHaveLength(1);
  });

  it("dá nomes distintos aos links de atividades diferentes", () => {
    const names = ["A", "B", "C"].map((title, i) =>
      createActivityCard({ ...FULL, id: `id-${i}`, title }).querySelector("a").textContent,
    );
    expect(new Set(names).size).toBe(3);
  });

  it("não repete o título como texto alternativo de imagem", () => {
    const withAlt = createActivityCard({ ...FULL, image: { url: "https://x.test/a.jpg", alt: "Aula de dança" } });
    const img = withAlt.querySelector("img");
    expect(img.getAttribute("alt")).toBe("Aula de dança");
    expect(withAlt.querySelector(".activity-card__media").hasAttribute("aria-hidden")).toBe(false);

    const withoutAlt = createActivityCard({ ...FULL, image: { url: "https://x.test/a.jpg" } });
    expect(withoutAlt.querySelector("img").getAttribute("alt")).toBe("");
  });

  it("volta ao fallback quando a imagem falha", () => {
    const card = createActivityCard({ ...FULL, image: { url: "https://x.test/quebrada.jpg" } });
    card.querySelector("img").dispatchEvent(new Event("error"));
    expect(card.querySelector("img")).toBeNull();
    const media = card.querySelector(".activity-card__media");
    expect(media.classList.contains("image-fallback")).toBe(true);
    expect(media.getAttribute("aria-hidden")).toBe("true");
  });

  it("ignora imagem com endereço que não seja http(s)", () => {
    const card = createActivityCard({ ...FULL, image: { url: "javascript:alert(1)" } });
    expect(card.querySelector("img")).toBeNull();
  });

  it("aplica ícone por categoria quando informado", () => {
    const icon = () => {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("data-icon", "arte");
      return svg;
    };
    const card = createActivityCard(FULL, { categoryIcons: { "cultura-e-artes": icon } });
    const svg = card.querySelector(".activity-card__media svg");
    expect(svg.getAttribute("data-icon")).toBe("arte");
    expect(svg.getAttribute("aria-hidden")).toBe("true");
  });
});

describe("cor por categoria e ícones (feature 011)", () => {
  it("grava data-category com o slug da API e mantém o nome escrito", () => {
    const tag = createActivityCard(FULL).querySelector(".activity-card__category");
    expect(tag.getAttribute("data-category")).toBe("cultura-e-artes");
    expect(tag.textContent).toBe("Cultura e Artes");
  });

  it.each(["Cultura", "a b", 'x"y', "<script>", "", "a/b", "ÁÉ"])("não grava data-category para o slug %j", (slug) => {
    const card = createActivityCard({ ...FULL, category: { name: "Qualquer", slug } });
    const tag = card.querySelector(".activity-card__category");
    expect(tag.hasAttribute("data-category")).toBe(false);
    expect(tag.textContent).toBe("Qualquer");
  });

  it("não grava data-category sem slug", () => {
    const card = createActivityCard({ ...FULL, category: { name: "Sem slug" } });
    expect(card.querySelector(".activity-card__category").hasAttribute("data-category")).toBe(false);
  });

  it("os ícones de local e data são decorativos e não entram no texto da linha", () => {
    const card = createActivityCard(FULL);
    for (const selector of [".activity-card__unit", ".activity-card__when"]) {
      const line = card.querySelector(selector);
      const icon = line.querySelector("svg");
      expect(icon, selector).not.toBeNull();
      expect(icon.getAttribute("aria-hidden")).toBe("true");
      expect(icon.getAttribute("focusable")).toBe("false");
    }
    expect(card.querySelector(".activity-card__unit").textContent).toBe("CEU Navegantes · Grajaú");
    expect(card.querySelector("a").textContent).toBe("Oficina de dança");
  });

  it("o texto sem data também tem o ícone de calendário", () => {
    const card = createActivityCard({ ...FULL, next_occurrence: null });
    expect(card.querySelector(".activity-card__when svg")).not.toBeNull();
    expect(card.querySelector(".activity-card__when").textContent).toBe("Sem data prevista");
  });
});


describe("público-alvo no card (feature 012)", () => {
  const audience = (card) => card.querySelector(".activity-card__audience");

  it("mostra os nomes na ordem recebida, separados por vírgula", () => {
    const card = createActivityCard({
      ...FULL,
      target_audiences: [
        { id: "a1", name: "Adolescentes" },
        { id: "a2", name: "Adultos" },
      ],
    });
    expect(text(audience(card))).toBe("Adolescentes, Adultos");
  });

  it.each([
    ["ausente", undefined],
    ["nulo", null],
    ["vazio", []],
    ["sem nomes", [{ id: "x" }, { id: "y", name: "  " }, null]],
  ])("não cria a linha quando o campo é %s", (_label, value) => {
    const card = createActivityCard({ ...FULL, target_audiences: value });
    expect(audience(card)).toBeNull();
  });

  it("trata HTML no nome como texto literal", () => {
    const card = createActivityCard({ ...FULL, target_audiences: [{ id: "a", name: "<b>Todos</b>" }] });
    expect(text(audience(card))).toBe("<b>Todos</b>");
    expect(audience(card).querySelector("b")).toBeNull();
  });
});
