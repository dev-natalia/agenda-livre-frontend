import { expect, test } from "@playwright/test";
import { makeListing, mockApi } from "./helpers/mock-api.js";

const cards = (page) => page.locator("#results-content .activity-card");
const listActivities = (api) => api.requests.filter((r) => r.path.endsWith("/activities/"));

test.describe("vazio, erro e página inexistente", () => {
  test("pesquisa sem resultado: mensagem própria, orientação e campos editáveis", async ({ page }) => {
    await mockApi(page, { activitiesResponder: () => ({ body: makeListing(0) }) });
    await page.goto("/explorar.html?q=nada");
    const empty = page.locator(".region-state__empty");
    await expect(empty).toContainText("Nenhuma atividade encontrada");
    await expect(empty).toContainText("Altere ou limpe os filtros");
    await expect(page.locator(".error-state__message")).toHaveCount(0);
    await expect(page.locator("#results-pagination")).toBeHidden();
    await expect(page.locator("#results-summary")).toHaveText("");
    await expect(page.locator("#results-status")).toContainText("Nenhuma atividade encontrada");

    await expect(page.getByLabel("Buscar por nome da atividade")).toBeEditable();
    await expect(page.getByLabel("Unidade")).toBeEnabled();
    await expect(page.getByRole("button", { name: "Limpar filtros" })).toBeEnabled();
  });

  for (const [name, fail] of [
    ["rede", "network"],
    ["servidor (500)", 500],
    ["limite de requisições (429)", 429],
  ]) {
    test(`falha por ${name}: erro amigável, 'Tentar novamente' e foco preservado`, async ({ page }) => {
      const api = await mockApi(page, { failActivities: fail, activitiesResponder: undefined });
      await page.goto("/explorar.html");
      const message = page.locator("#results-content .error-state__message");
      await expect(message).toBeVisible();
      await expect(message).not.toContainText(/500|429|http|undefined/i);
      await expect(page.getByRole("button", { name: "Tentar novamente" })).toBeVisible();
      await expect(page.locator("#results-summary")).toHaveText("");
      await expect(page.locator("#results-status")).toContainText(await message.innerText());
      expect(listActivities(api)).toHaveLength(1);
    });
  }

  test("retry com a API de volta mostra os cards; nova falha restaura o erro", async ({ page }) => {
    const api = await mockApi(page, { failActivities: 500 });
    await page.goto("/explorar.html");
    const retry = page.getByRole("button", { name: "Tentar novamente" });
    await expect(retry).toBeVisible();

    await retry.click();
    await expect(retry).toBeVisible();
    expect(listActivities(api)).toHaveLength(2);

    api.state.failActivities = null;
    await retry.click();
    await expect(cards(page)).toHaveCount(3);
    await expect(page.locator(".error-state__message")).toHaveCount(0);
  });

  test("durante o retry aparecem esqueletos no lugar da mensagem", async ({ page }) => {
    const api = await mockApi(page, { failActivities: 500, delayMs: 400 });
    await page.goto("/explorar.html");
    const retry = page.getByRole("button", { name: "Tentar novamente" });
    await expect(retry).toBeVisible();
    api.state.failActivities = null;
    await retry.click();
    await expect(page.locator("#results-content .skeleton-card")).toHaveCount(12);
    await expect(page.locator(".error-state__message")).toHaveCount(0);
    await expect(cards(page)).toHaveCount(3);
  });

  test("a falha da listagem não impede o uso dos filtros", async ({ page }) => {
    const api = await mockApi(page, { failActivities: 500 });
    await page.goto("/explorar.html");
    await expect(page.locator(".error-state__message")).toBeVisible();
    api.state.failActivities = null;
    await page.getByLabel("Buscar por nome da atividade").fill("yoga");
    await page.getByRole("button", { name: "Filtrar" }).click();
    await expect(cards(page)).toHaveCount(3);
  });

  test("?page=999 com 400 e erro em page volta à página 1 sem erro técnico", async ({ page }) => {
    const api = await mockApi(page, {
      activitiesResponder: (url) =>
        url.searchParams.get("page") === "999"
          ? { status: 400, body: { detail: "Parâmetros inválidos.", errors: { page: ["Informe uma página válida."] } } }
          : { body: makeListing(27) },
    });
    await page.goto("/explorar.html?q=oficina&page=999");
    await expect(cards(page)).toHaveCount(12);
    await expect(page).toHaveURL(/explorar\.html\?q=oficina$/);
    await expect(page.locator(".error-state__message")).toHaveCount(0);
    expect(listActivities(api)).toHaveLength(2);
    await expect(page.locator("#results-pagination [aria-current='page']")).toHaveText("1");
  });

  test("página fora do intervalo com 404 também volta à página 1", async ({ page }) => {
    await mockApi(page, {
      activitiesResponder: (url) =>
        url.searchParams.get("page") === "5" ? { status: 404, body: { detail: "Não encontrado." } } : { body: makeListing(27) },
    });
    await page.goto("/explorar.html?page=5");
    await expect(cards(page)).toHaveCount(12);
    await expect(page).toHaveURL(/explorar\.html$/);
  });

  test("endereço da API inválido: aviso de configuração e sem esqueleto indefinido", async ({ page }) => {
    await page.route("**/js/config.js", async (route) => {
      const response = await route.fetch();
      const body = (await response.text()).replace(/apiBaseUrl: "[^"]*"/, 'apiBaseUrl: ""');
      await route.fulfill({ response, body });
    });
    await page.goto("/explorar.html");
    await expect(page.locator(".config-notice, [data-config-notice]").first()).toBeVisible();
    await expect(page.locator("#results-content .skeleton-card")).toHaveCount(0);
    await expect(page.locator("#results-content .error-state__message")).toBeVisible();
  });

  test("o HTML traz a mensagem para quem está sem JavaScript", async ({ page }) => {
    await page.goto("/explorar.html");
    const html = await (await page.request.get("/explorar.html")).text();
    expect(html).toContain("<noscript>");
    expect(html).toContain("ative o JavaScript");
  });
});
