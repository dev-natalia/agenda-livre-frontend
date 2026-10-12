import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// A verificação automática encontra só parte dos problemas: não prova conformidade com a WCAG.
// Teclado, leitor de tela, zoom e reflow continuam sendo verificados à mão (quickstart.md).
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const pages = ["index.html", "explorar.html", "atividade.html", "sobre.html", "contato.html"];

async function scan(page) {
  // Aguarda o fim das transições de cor (150 ms): o axe lê cores intermediárias, por exemplo
  // no botão de envio de contato, habilitado pelo script depois do carregamento.
  await page.waitForTimeout(300);
  const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  return violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`);
}

async function overrideConfig(page) {
  await page.route("**/js/config.js", async (route) => {
    const response = await route.fetch();
    const body = (await response.text()).replace(
      /apiBaseUrl: "[^"]*"/,
      'apiBaseUrl: "http://localhost:8000/api/v1"',
    );
    await route.fulfill({ response, body });
  });
}

for (const path of pages) {
  test(`${path}: sem violações (desktop)`, async ({ page }) => {
    await overrideConfig(page);
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`/${path}`);
    expect(await scan(page)).toEqual([]);
  });

  test(`${path}: sem violações (320 px, menu fechado e aberto)`, async ({ page }) => {
    await overrideConfig(page);
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto(`/${path}`);
    expect(await scan(page)).toEqual([]);
    await page.getByRole("button", { name: "Menu" }).click();
    // Aguarda o fim da transição de cor (150 ms): o axe lê cores intermediárias.
    await page.waitForTimeout(300);
    expect(await scan(page)).toEqual([]);
  });
}

test("estados da região e cards: sem violações", async ({ page }) => {
  await overrideConfig(page);
  await page.goto("/index.html");
  await page.evaluate(async () => {
    const { createRegionState } = await import("/js/components/region-state.js");
    const { createActivityCard } = await import("/js/components/activity-card.js");
    const { ApiError } = await import("/js/api/errors.js");

    const main = document.querySelector("main");
    const make = (id) => {
      const section = document.createElement("section");
      section.setAttribute("aria-label", id);
      const status = document.createElement("p");
      status.className = "visually-hidden";
      status.setAttribute("role", "status");
      const content = document.createElement("div");
      section.append(status, content);
      main.append(section);
      return createRegionState({ content, status });
    };

    make("Carregando").showLoading();
    make("Erro").showError(new ApiError("server"), { onRetry() {} });
    make("Vazio").showEmpty({ hint: "Altere ou limpe os filtros." });

    const grid = document.createElement("div");
    grid.className = "card-grid";
    grid.append(
      createActivityCard(
        {
          id: "1",
          title: "Oficina de dança",
          category: { name: "Cultura e Artes" },
          unit: { name: "CEU Navegantes", neighborhood: "Grajaú" },
          next_occurrence: { date: "2026-11-20", start_time: "14:00", end_time: "15:00" },
        },
        { headingLevel: 2 },
      ),
      createActivityCard({ id: "2", title: "Roda de leitura" }, { headingLevel: 2 }),
    );
    make("Sucesso").showSuccess(grid);
  });
  expect(await scan(page)).toEqual([]);
});
