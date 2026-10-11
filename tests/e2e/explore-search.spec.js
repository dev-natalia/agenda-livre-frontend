import { expect, test } from "@playwright/test";
import { CATEGORIES, UNITS, makeListing, mockApi } from "./helpers/mock-api.js";
import { addDays, lastDayOfMonth, todayInSaoPaulo } from "../../js/utils/dates.js";

const HOJE = todayInSaoPaulo();
const listingOf = (total) => (url) => ({
  body: makeListing(total, { page: Number(url.searchParams.get("page") ?? 1) }),
});

const cards = (page) => page.locator("#results-content .activity-card");
const activityRequests = (api) => api.requests.filter((r) => r.path.endsWith("/activities/"));
const params = (request) => Object.fromEntries(new URLSearchParams(request.search));

test.describe("pesquisa e filtros", () => {
  test("endereço com critérios preenche os campos e consulta uma vez", async ({ page }) => {
    const api = await mockApi(page, { activitiesResponder: listingOf(5) });
    await page.goto(
      `/explorar.html?q=oficina&unit=${UNITS[0].id}&category=${CATEGORIES[1].id}&date_from=${HOJE}&date_to=${addDays(HOJE, 6)}`,
    );
    await expect(cards(page)).toHaveCount(5);

    await expect(page.getByLabel("Buscar por nome da atividade")).toHaveValue("oficina");
    await expect(page.getByLabel("Unidade")).toHaveValue(UNITS[0].id);
    await expect(page.getByLabel("Categoria")).toHaveValue(CATEGORIES[1].id);
    await expect(page.getByLabel("Quando?")).toHaveValue("week");

    const requests = activityRequests(api);
    expect(requests).toHaveLength(1);
    expect(params(requests[0])).toEqual({
      q: "oficina",
      unit: UNITS[0].id,
      category: CATEGORIES[1].id,
      date_from: HOJE,
      date_to: addDays(HOJE, 6),
      page_size: "12",
    });
  });

  test("digitar e selecionar não consultam a API e os resultados atuais permanecem", async ({ page }) => {
    const api = await mockApi(page, { activitiesResponder: listingOf(5) });
    await page.goto("/explorar.html");
    await expect(cards(page)).toHaveCount(5);
    const before = api.requests.length;

    await page.getByLabel("Buscar por nome da atividade").pressSequentially("dança", { delay: 20 });
    await page.getByLabel("Unidade").selectOption(UNITS[1].id);
    await page.getByLabel("Categoria").selectOption(CATEGORIES[0].id);
    await page.getByLabel("Quando?").selectOption("month");

    expect(api.requests.length).toBe(before);
    await expect(cards(page)).toHaveCount(5);
    await expect(page.locator("#results-summary")).toHaveText("5 atividades encontradas");
  });

  test("'Filtrar' aplica: esqueletos, página 1, URL com critérios e consulta combinada", async ({ page }) => {
    const api = await mockApi(page, {
      activitiesResponder: (url) => ({
        body: makeListing(27, { page: Number(url.searchParams.get("page") ?? 1) }),
        delayMs: url.searchParams.get("q") ? 300 : 0,
      }),
    });
    await page.goto("/explorar.html?page=3");
    await expect(cards(page)).toHaveCount(3);

    await page.getByLabel("Buscar por nome da atividade").fill("oficina");
    await page.getByLabel("Unidade").selectOption(UNITS[0].id);
    await page.getByLabel("Quando?").selectOption("today");
    await page.getByRole("button", { name: "Filtrar" }).click();

    await expect(page.locator("#results-content .skeleton-card")).toHaveCount(12);
    await expect(page).toHaveURL(new RegExp(`explorar\\.html\\?q=oficina&unit=${UNITS[0].id}&date=${HOJE}$`));
    await expect(cards(page)).toHaveCount(12);

    const last = params(activityRequests(api).at(-1));
    expect(last).toEqual({ q: "oficina", unit: UNITS[0].id, date: HOJE, page_size: "12" });
  });

  test("Enter em um campo também aplica", async ({ page }) => {
    await mockApi(page, { activitiesResponder: listingOf(5) });
    await page.goto("/explorar.html");
    await page.getByLabel("Buscar por nome da atividade").fill("yoga");
    await page.getByLabel("Buscar por nome da atividade").press("Enter");
    await expect(page).toHaveURL(/explorar\.html\?q=yoga$/);
  });

  test("períodos week e month enviam date_from/date_to", async ({ page }) => {
    const api = await mockApi(page, { activitiesResponder: listingOf(5) });
    await page.goto("/explorar.html");
    await page.getByLabel("Quando?").selectOption("month");
    await page.getByRole("button", { name: "Filtrar" }).click();
    await expect(page).toHaveURL(/date_from=/);
    const last = params(activityRequests(api).at(-1));
    expect(last.date_from).toBe(HOJE);
    expect(last.date_to).toBe(lastDayOfMonth(HOJE));
    expect(last.date).toBeUndefined();
  });

  test("voltar/avançar restaura campos, endereço e listagem do ponto do histórico", async ({ page }) => {
    await mockApi(page, { activitiesResponder: listingOf(5) });
    await page.goto("/explorar.html");
    await page.getByLabel("Buscar por nome da atividade").fill("um");
    await page.getByRole("button", { name: "Filtrar" }).click();
    await expect(page).toHaveURL(/q=um$/);
    await page.getByLabel("Buscar por nome da atividade").fill("dois");
    await page.getByRole("button", { name: "Filtrar" }).click();
    await expect(page).toHaveURL(/q=dois$/);

    await page.goBack();
    await expect(page).toHaveURL(/q=um$/);
    await expect(page.getByLabel("Buscar por nome da atividade")).toHaveValue("um");
    await page.goBack();
    await expect(page).toHaveURL(/explorar\.html$/);
    await expect(page.getByLabel("Buscar por nome da atividade")).toHaveValue("");
    await page.goForward();
    await expect(page.getByLabel("Buscar por nome da atividade")).toHaveValue("um");
    await expect(cards(page)).toHaveCount(5);
  });

  test("?period=week (envio sem JavaScript) é reescrito para datas, sem nova entrada no histórico", async ({ page }) => {
    await mockApi(page, { activitiesResponder: listingOf(5) });
    await page.goto("/explorar.html?period=week");
    await expect(page).toHaveURL(new RegExp(`date_from=${HOJE}&date_to=${addDays(HOJE, 6)}$`));
    await expect(page.getByLabel("Quando?")).toHaveValue("week");
    await page.goBack();
    await expect(page).not.toHaveURL(/explorar\.html/);
  });

  test("parâmetros inválidos abrem a página normalizada, sem consulta recusável", async ({ page }) => {
    const api = await mockApi(page, { activitiesResponder: listingOf(5) });
    await page.goto(
      `/explorar.html?page=0&unit=xyz&q=${"a".repeat(150)}&date=${HOJE}&date_from=${HOJE}&foo=bar&category=1`,
    );
    await expect(cards(page)).toHaveCount(5);
    for (const request of activityRequests(api)) {
      const sent = params(request);
      expect(sent.unit).toBeUndefined();
      expect(sent.category).toBeUndefined();
      expect(sent.page).toBeUndefined();
      expect(sent.foo).toBeUndefined();
      expect(sent.q).toHaveLength(100);
      expect(Boolean(sent.date) && Boolean(sent.date_from)).toBe(false);
    }
    expect(page.url()).not.toContain("foo=bar");
    expect(page.url()).not.toContain("unit=xyz");
  });

  test("caracteres especiais chegam íntegros à API e ao endereço", async ({ page }) => {
    const api = await mockApi(page, { activitiesResponder: listingOf(5) });
    await page.goto("/explorar.html");
    const term = 'a & b #c "d" 100%';
    await page.getByLabel("Buscar por nome da atividade").fill(term);
    await page.getByRole("button", { name: "Filtrar" }).click();
    await expect(cards(page)).toHaveCount(5);
    expect(new URL(page.url()).searchParams.get("q")).toBe(term);
    expect(params(activityRequests(api).at(-1)).q).toBe(term);
  });

  test("duas pesquisas em sequência mostram só o resultado da última", async ({ page }) => {
    await mockApi(page, {
      activitiesResponder: (url) => {
        const slow = url.searchParams.get("q") === "lenta";
        return { body: makeListing(slow ? 1 : 2), delayMs: slow ? 800 : 0 };
      },
    });
    await page.goto("/explorar.html");
    await expect(cards(page)).toHaveCount(2);
    await page.getByLabel("Buscar por nome da atividade").fill("lenta");
    await page.getByRole("button", { name: "Filtrar" }).click();
    await page.getByLabel("Buscar por nome da atividade").fill("rapida");
    await page.getByRole("button", { name: "Filtrar" }).click();
    await expect(cards(page)).toHaveCount(2);
    await page.waitForTimeout(1000);
    await expect(cards(page)).toHaveCount(2);
    await expect(page.locator("#results-summary")).toHaveText("2 atividades encontradas");
  });

  test("unidade inexistente no endereço cai no padrão, com aviso", async ({ page }) => {
    await mockApi(page, { activitiesResponder: listingOf(5) });
    await page.goto("/explorar.html?unit=99999999-9999-4999-8999-999999999999");
    await expect(page.locator("#filter-options-status")).toContainText("desconsiderado");
    await expect(page.getByLabel("Unidade")).toHaveValue("");
    await expect(page).toHaveURL(/explorar\.html$/);
    await expect(cards(page)).toHaveCount(5);
  });

  test("falha nas unidades e categorias: só 'todas', aviso, e a pesquisa por texto funciona", async ({ page }) => {
    const api = await mockApi(page, {
      activitiesResponder: listingOf(5),
      failUnits: "network",
      failCategories: 500,
    });
    await page.goto("/explorar.html");
    await expect(page.locator("#filter-options-status")).toContainText("unidades e as categorias");
    await expect(page.getByLabel("Unidade").locator("option")).toHaveCount(1);
    await page.getByLabel("Buscar por nome da atividade").fill("yoga");
    await page.getByRole("button", { name: "Filtrar" }).click();
    await expect(page).toHaveURL(/q=yoga$/);
    expect(params(activityRequests(api).at(-1)).q).toBe("yoga");
  });
});

test.describe("limpar filtros", () => {
  test("restaura o padrão, volta à página 1 e consulta a listagem geral sem novo clique", async ({ page }) => {
    const api = await mockApi(page, { activitiesResponder: listingOf(27) });
    await page.goto(`/explorar.html?q=oficina&unit=${UNITS[0].id}&page=2`);
    await expect(cards(page)).toHaveCount(12);

    await page.getByLabel("Buscar por nome da atividade").fill("outro");
    await page.getByRole("button", { name: "Limpar filtros" }).click();

    await expect(page).toHaveURL(/explorar\.html$/);
    await expect(page.getByLabel("Buscar por nome da atividade")).toHaveValue("");
    await expect(page.getByLabel("Unidade")).toHaveValue("");
    await expect(page.getByLabel("Quando?")).toHaveValue("any");
    await expect(cards(page)).toHaveCount(12);
    await expect(page.locator("#results-pagination [aria-current='page']")).toHaveText("1");
    expect(activityRequests(api).at(-1).search).toBe("?page_size=12");
    await expect(page.getByRole("button", { name: "Limpar filtros" })).toBeFocused();
  });

  test("sem critérios: não quebra", async ({ page }) => {
    await mockApi(page, { activitiesResponder: listingOf(5) });
    await page.goto("/explorar.html");
    await expect(cards(page)).toHaveCount(5);
    await page.getByRole("button", { name: "Limpar filtros" }).click();
    await expect(cards(page)).toHaveCount(5);
    await expect(page).toHaveURL(/explorar\.html$/);
  });

  test("após a limpeza, o vazio é tratado como nas demais consultas", async ({ page }) => {
    await mockApi(page, {
      activitiesResponder: (url) => ({ body: makeListing(url.searchParams.get("q") ? 5 : 0) }),
    });
    await page.goto("/explorar.html?q=algo");
    await expect(cards(page)).toHaveCount(5);
    await page.getByRole("button", { name: "Limpar filtros" }).click();
    await expect(page.locator(".region-state__empty")).toContainText("Nenhuma atividade encontrada");
  });
});
