import { expect, test } from "@playwright/test";

const ACTIVITIES = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    title: "Oficina de dança",
    unit: { name: "CEU Navegantes", neighborhood: "Grajaú" },
    category: { name: "Cultura e Artes", slug: "cultura-e-artes" },
    next_occurrence: { date: "2026-11-20", start_time: "14:00", end_time: "15:00" },
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    title: "Roda de leitura",
    unit: { name: "CEU Jaçanã" },
    category: { name: "Educação" },
    next_occurrence: null,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    title: "X".repeat(200),
    unit: null,
    category: null,
    next_occurrence: null,
  },
];

async function mountCards(page) {
  await page.evaluate(async (activities) => {
    const { createActivityCard } = await import("/js/components/activity-card.js");
    const grid = document.createElement("div");
    grid.className = "card-grid";
    grid.id = "probe-grid";
    grid.append(...activities.map((a) => createActivityCard(a, { headingLevel: 2 })));
    document.querySelector("main").append(grid);
  }, ACTIVITIES);
}

test.describe("card de atividade", () => {
  test.use({ viewport: { width: 320, height: 640 } });

  test("uma parada de foco por card, com foco visível e sem rolagem horizontal", async ({ page }) => {
    await page.goto("/explorar.html");
    await mountCards(page);

    const links = page.locator("#probe-grid a");
    await expect(links).toHaveCount(3);
    await links.first().focus();
    const outline = await links.first().evaluate((el) => {
      const card = el.closest(".activity-card");
      const own = getComputedStyle(el);
      const outer = getComputedStyle(card);
      return { own: own.outlineStyle, outer: outer.outlineStyle };
    });
    expect(outline.own !== "none" || outline.outer !== "none").toBe(true);

    await page.keyboard.press("Tab");
    await expect(links.nth(1)).toBeFocused();

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
  });

  test("sem imagem quebrada: o fallback ocupa o espaço da imagem", async ({ page }) => {
    await page.goto("/explorar.html");
    await mountCards(page);
    await expect(page.locator("#probe-grid img")).toHaveCount(0);
    const media = page.locator("#probe-grid .activity-card__media").first();
    const box = await media.boundingBox();
    expect(box.height).toBeGreaterThan(40);
    await expect(media).toHaveAttribute("aria-hidden", "true");
  });

  test("clicar no card abre os detalhes na mesma aba", async ({ page }) => {
    await page.goto("/explorar.html");
    await mountCards(page);
    const card = page.locator("#probe-grid .activity-card").first();
    await card.scrollIntoViewIfNeeded();
    const box = await card.boundingBox();
    await page.mouse.click(box.x + box.width / 2, box.y + 10);
    await expect(page).toHaveURL(/atividade\.html\?id=550e8400-e29b-41d4-a716-446655440001$/);
  });
});

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

// Região de teste ligada ao cliente da API, como as páginas dos próximos épicos farão.
async function mountRegion(page) {
  await page.evaluate(async () => {
    const field = document.createElement("input");
    field.id = "probe-field";
    field.setAttribute("aria-label", "Campo de teste");
    const status = document.createElement("p");
    status.id = "probe-status";
    status.className = "visually-hidden";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    const content = document.createElement("div");
    content.id = "probe-content";
    document.querySelector("main").append(field, status, content);

    const { createRegionState } = await import("/js/components/region-state.js");
    const { createActivityCard } = await import("/js/components/activity-card.js");
    const { createRequestScope } = await import("/js/api/client.js");
    const { isCancelled } = await import("/js/api/errors.js");

    const region = createRegionState({ content, status });
    const scope = createRequestScope();
    window.__announcements = [];
    new MutationObserver(() => {
      if (status.textContent) window.__announcements.push(status.textContent);
    }).observe(status, { childList: true, characterData: true, subtree: true });

    async function load() {
      region.showLoading({ announce: "Carregando atividades…" });
      try {
        const data = await scope.run("/activities/");
        if (data.count === 0) {
          region.showEmpty();
          return;
        }
        const grid = document.createElement("div");
        grid.className = "card-grid";
        grid.append(...data.results.map((a) => createActivityCard(a, { headingLevel: 2 })));
        region.showSuccess(grid, { announce: `${data.count} atividades encontradas.` });
      } catch (error) {
        if (isCancelled(error)) return;
        region.showError(error, { onRetry: load });
      }
    }
    window.__load = load;
  });
}

test.describe("estados da região", () => {
  test("erro, nova tentativa e sucesso, sem mover o foco do campo", async ({ page }) => {
    await overrideConfig(page);
    let calls = 0;
    await page.route("**/api/v1/activities/", async (route) => {
      calls += 1;
      if (calls === 1) return route.fulfill({ status: 503, contentType: "application/json", body: "{}" });
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ count: 1, next: null, previous: null, results: [ACTIVITIES[0]] }),
      });
    });
    await page.goto("/explorar.html");
    await mountRegion(page);

    await page.locator("#probe-field").focus();
    await page.evaluate(() => window.__load());

    await expect(page.locator("#probe-content .skeleton-card")).toHaveCount(0);
    await expect(page.locator("#probe-content .error-state__message")).toBeVisible();
    await expect(page.getByRole("button", { name: "Tentar novamente" })).toBeVisible();
    await expect(page.locator("#probe-field")).toBeFocused();
    await expect(page.locator("#probe-status")).not.toHaveText("");

    await page.getByRole("button", { name: "Tentar novamente" }).click();
    await expect(page.locator("#probe-content .activity-card")).toHaveCount(1);
    await expect(page.locator("#probe-status")).toHaveText("1 atividades encontradas.");
    expect(calls).toBe(2);
  });

  test("lista vazia mostra a mensagem de vazio, não a de erro", async ({ page }) => {
    await overrideConfig(page);
    await page.route("**/api/v1/activities/", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ count: 0, next: null, previous: null, results: [] }),
      }),
    );
    await page.goto("/explorar.html");
    await mountRegion(page);
    await page.evaluate(() => window.__load());

    await expect(page.locator("#probe-content .region-state__empty")).toContainText(
      "Nenhuma atividade encontrada",
    );
    await expect(page.locator("#probe-content .error-state__message")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Tentar novamente" })).toHaveCount(0);
  });

  test("carregamento: esqueletos ocultos da tecnologia assistiva e estáticos", async ({ page }) => {
    await overrideConfig(page);
    await page.route("**/api/v1/activities/", () => {}); // nunca responde
    await page.goto("/explorar.html");
    await mountRegion(page);
    await page.evaluate(() => {
      window.__load(); // sem await: a consulta nunca termina
    });

    const skeletons = page.locator("#probe-content .skeleton-card");
    await expect(skeletons).toHaveCount(3);
    await expect(skeletons.first()).toHaveAttribute("aria-hidden", "true");
    const animation = await skeletons.first().evaluate((el) => getComputedStyle(el).animationName);
    expect(animation).toBe("none");
    await expect(page.locator("#probe-status")).toHaveText("Carregando atividades…");
  });

  test("resposta rápida: só o resultado é anunciado", async ({ page }) => {
    await overrideConfig(page);
    await page.route("**/api/v1/activities/", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ count: 1, next: null, previous: null, results: [ACTIVITIES[0]] }),
      }),
    );
    await page.goto("/explorar.html");
    await mountRegion(page);
    await page.evaluate(() => window.__load());
    await expect(page.locator("#probe-content .activity-card")).toHaveCount(1);
    await page.waitForTimeout(500);
    const announcements = await page.evaluate(() => window.__announcements);
    expect(announcements).toEqual(["1 atividades encontradas."]);
  });
});
