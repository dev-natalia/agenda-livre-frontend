import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { focusOrder } from "./helpers/a11y-checks.js";
import { scenarios } from "./helpers/a11y-matrix.js";

// Prova de que a suíte percebe regressão (SC-011): estraga a página de Contato no navegador, nunca no
// código do site, e confere que a verificação certa dispara. Se um destes testes falhar, a suíte de
// acessibilidade deixou de proteger o que diz proteger.
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const [contact] = scenarios({ states: ["carregada"], pages: ["contato.html"], widths: [1280] });

const violationsOf = async (page) =>
  (await new AxeBuilder({ page }).withTags(TAGS).analyze()).violations.map((v) => v.id);

test.beforeEach(async ({ page }) => {
  await contact.open(page);
  // Ponto de partida: a página limpa não tem violações.
  expect(await violationsOf(page)).toEqual([]);
});

test("remover o rótulo de um campo é detectado", async ({ page }) => {
  await page.evaluate(() => document.querySelector('label[for="contact-name"]').remove());
  expect(await violationsOf(page)).toContain("label");
});

test("uma imagem sem texto alternativo é detectada", async ({ page }) => {
  await page.evaluate(() => {
    const img = document.createElement("img");
    img.src = "images/hero-culture.svg";
    document.querySelector("main").append(img);
  });
  expect(await violationsOf(page)).toContain("image-alt");
});

test("texto com contraste baixo é detectado", async ({ page }) => {
  await page.evaluate(() => {
    document.querySelector("main h1").style.color = "#bbbbbb";
  });
  expect(await violationsOf(page)).toContain("color-contrast");
});

test("esconder o link de pular tira-o da ordem de foco", async ({ page }) => {
  await page.evaluate(() => {
    document.querySelector(".skip-link").hidden = true;
  });
  const { visited } = await focusOrder(page, 3);
  expect(visited[0].text).not.toBe("Pular para o conteúdo principal");
});

test("um botão sem nome é detectado", async ({ page }) => {
  await page.evaluate(() => {
    const button = document.createElement("button");
    document.querySelector("main").append(button);
  });
  expect(await violationsOf(page)).toContain("button-name");
});

test("pular um nível de título é detectado na leitura da hierarquia", async ({ page }) => {
  await page.evaluate(() => {
    const h4 = document.createElement("h4");
    h4.textContent = "Salto de nível";
    document.querySelector("main").append(h4);
  });
  const levels = await page.evaluate(() => [...document.querySelectorAll("h1, h2, h3, h4")].map((h) => Number(h.tagName[1])));
  const skips = levels.some((level, i) => i > 0 && level > levels[i - 1] + 1);
  expect(skips).toBe(true);
});
