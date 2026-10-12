// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { createActivityCard } from "../../js/components/activity-card.js";
import { renderDetails } from "../../js/details/render.js";
import { HOSTILE_TEXT, makeActivity, makeDetails, withImage, withNullImage } from "../fixtures/activities.js";

// Tratamento do campo `image` da API ({ url, alt, decorative } ou null) no cartão e nos detalhes
// (specs/010-testing-quality/contracts/api-image-contract.md).
const URL_OK = "https://imagens.example.com/atividade.webp";

const renderers = {
  cartão: (image) => {
    const activity = image === undefined ? makeActivity(1) : { ...makeActivity(1), image };
    return createActivityCard(activity, { headingLevel: 2 });
  },
  detalhes: (image) => {
    const data = image === undefined ? makeDetails() : { ...makeDetails(), image };
    const [article] = renderDetails(data);
    return article;
  },
};

const mediaOf = (root) => root.querySelector(".activity-card__media, .activity-details__media");

describe.each(Object.entries(renderers))("campo image em %s", (_name, render) => {
  it("imagem informativa: <img> com o alt da API e visível para tecnologia assistiva", () => {
    const root = render({ url: URL_OK, alt: "Turma em aula de dança", decorative: false });
    const img = root.querySelector("img");
    expect(img.getAttribute("src")).toBe(URL_OK);
    expect(img.getAttribute("alt")).toBe("Turma em aula de dança");
    expect(mediaOf(root).getAttribute("aria-hidden")).not.toBe("true");
    expect(root.querySelector(".image-fallback")).toBeNull();
  });

  it("imagem decorativa: alt vazio, contêiner oculto e o alt da API é ignorado", () => {
    const root = render({ url: URL_OK, alt: "Texto que não deve ser lido", decorative: true });
    const img = root.querySelector("img");
    expect(img.getAttribute("alt")).toBe("");
    expect(mediaOf(root).getAttribute("aria-hidden")).toBe("true");
    expect(root.textContent).not.toContain("Texto que não deve ser lido");
  });

  it.each([
    ["image: null", null],
    ["campo ausente", undefined],
  ])("%s: fallback visual decorativo, sem <img>", (_label, value) => {
    const root = render(value);
    expect(root.querySelector("img")).toBeNull();
    const fallback = root.querySelector(".image-fallback");
    expect(fallback).not.toBeNull();
    expect(fallback.getAttribute("aria-hidden")).toBe("true");
  });

  it.each([
    ["url ausente", { alt: "x", decorative: false }],
    ["url vazia", { url: "", alt: "x", decorative: false }],
    ["url malformada", { url: "não é url", alt: "x", decorative: false }],
    ["javascript:", { url: "javascript:alert(1)", alt: "x", decorative: false }],
    ["data:", { url: "data:text/html,<script>alert(1)</script>", alt: "x", decorative: false }],
    ["url relativa", { url: "/img/a.png", alt: "x", decorative: false }],
  ])("%s: usa o fallback", (_label, image) => {
    const root = render(image);
    expect(root.querySelector("img")).toBeNull();
    expect(root.querySelector(".image-fallback")).not.toBeNull();
  });

  it("alt ausente em imagem não decorativa vira alt vazio, sem inventar texto", () => {
    const root = render({ url: URL_OK, decorative: false });
    expect(root.querySelector("img").getAttribute("alt")).toBe("");
  });

  it("falha ao carregar a imagem troca para o fallback", () => {
    const root = render({ url: URL_OK, alt: "x", decorative: false });
    root.querySelector("img").dispatchEvent(new Event("error"));
    expect(root.querySelector("img")).toBeNull();
    expect(root.querySelector(".image-fallback")).not.toBeNull();
  });

  it("texto hostil no alt é só atributo: nenhum elemento novo e nada executado", () => {
    const root = render({ url: URL_OK, alt: HOSTILE_TEXT, decorative: false });
    expect(root.querySelectorAll("img")).toHaveLength(1);
    expect(root.querySelector("script")).toBeNull();
    expect(root.querySelector("img").getAttribute("alt")).toBe(HOSTILE_TEXT);
    expect(root.querySelector("img").hasAttribute("onerror")).toBe(false);
  });
});

describe("fixtures de imagem", () => {
  it("withImage e withNullImage seguem o formato do backend", () => {
    expect(withImage(makeActivity(1)).image).toEqual({
      url: expect.stringMatching(/^https:\/\//),
      alt: expect.any(String),
      decorative: false,
    });
    expect(withImage(makeActivity(1), { decorative: true }).image).toMatchObject({ alt: "", decorative: true });
    expect(withNullImage(makeActivity(1)).image).toBeNull();
  });
});
