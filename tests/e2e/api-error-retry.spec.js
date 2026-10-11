import { expect, test } from "@playwright/test";

const EMPTY_LIST = { count: 0, next: null, previous: null, results: [] };

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

// Monta uma região de status e conecta cliente + componente, como as páginas futuras farão.
async function mountProbe(page) {
  await page.evaluate(async () => {
    const region = document.createElement("div");
    region.id = "probe-region";
    region.setAttribute("role", "status");
    region.setAttribute("aria-live", "polite");
    document.querySelector("main").append(region);

    const { createRequestScope } = await import("/js/api/client.js");
    const { isCancelled } = await import("/js/api/errors.js");
    const { renderErrorState, clearErrorState } = await import("/js/components/error-state.js");
    const scope = createRequestScope();

    async function load() {
      clearErrorState(region);
      region.dataset.state = "loading";
      try {
        const data = await scope.run("/activities/");
        region.dataset.state = data.count === 0 ? "empty" : "ok";
        region.textContent = data.count === 0 ? "Nenhuma atividade encontrada" : "ok";
      } catch (error) {
        if (isCancelled(error)) return;
        region.dataset.state = "error";
        renderErrorState(region, error, { onRetry: load });
      }
    }
    window.__load = load;
    load();
  });
}

test("falha de servidor mostra erro, e Tentar novamente recupera sem recarregar", async ({ page }) => {
  await overrideConfig(page);
  let calls = 0;
  await page.route("**/api/v1/activities/**", (route) => {
    calls += 1;
    if (calls === 1) {
      return route.fulfill({ status: 503, contentType: "application/json", body: '{"detail":"interno"}' });
    }
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(EMPTY_LIST) });
  });

  await page.goto("/explorar.html");
  await page.evaluate(() => (window.__marker = "mesma-pagina"));
  await mountProbe(page);

  const region = page.locator("#probe-region");
  await expect(region).toContainText("O serviço está indisponível");
  await expect(region).not.toContainText("503");
  await expect(region).not.toContainText("interno");

  const retry = region.getByRole("button", { name: "Tentar novamente" });
  await retry.focus();
  await retry.click();

  await expect(region).toContainText("Nenhuma atividade encontrada");
  await expect(region.getByRole("button")).toHaveCount(0);
  expect(await page.evaluate(() => window.__marker)).toBe("mesma-pagina");
  expect(calls).toBe(2);
});

test("lista vazia com sucesso não é apresentada como erro", async ({ page }) => {
  await overrideConfig(page);
  await page.route("**/api/v1/activities/**", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(EMPTY_LIST) }),
  );
  await page.goto("/explorar.html");
  await mountProbe(page);
  await expect(page.locator("#probe-region")).toHaveAttribute("data-state", "empty");
  await expect(page.locator(".error-state__message")).toHaveCount(0);
});

test("falha de rede é erro com nova tentativa; 400 não oferece o botão", async ({ page }) => {
  await overrideConfig(page);
  await page.route("**/api/v1/activities/**", (route) => route.abort("connectionrefused"));
  await page.goto("/explorar.html");
  await mountProbe(page);
  const region = page.locator("#probe-region");
  await expect(region).toContainText("Não foi possível conectar");
  await expect(region.getByRole("button", { name: "Tentar novamente" })).toBeVisible();

  await page.unroute("**/api/v1/activities/**");
  await page.route("**/api/v1/activities/**", (route) =>
    route.fulfill({
      status: 400,
      contentType: "application/json",
      body: '{"detail":"Parâmetros inválidos.","errors":{"q":["x"]}}',
    }),
  );
  await page.evaluate(() => window.__load());
  await expect(region).toContainText("Revise os filtros");
  await expect(region.getByRole("button")).toHaveCount(0);
});
