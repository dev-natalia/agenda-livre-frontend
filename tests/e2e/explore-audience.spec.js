import { expect, test } from "@playwright/test";
import { AUDIENCES, CATEGORIES, UNITS, makeActivity, makeListing, mockApi } from "./helpers/mock-api.js";

const ADULTS = AUDIENCES[0];
const KIDS = AUDIENCES[1];

const listingOf = (total) => (url) => ({
  body: makeListing(total, { page: Number(url.searchParams.get("page") ?? 1) }),
});
const cards = (page) => page.locator("#results-content .activity-card");
const activityRequests = (api) => api.requests.filter((r) => r.path.endsWith("/activities/"));
const params = (request) => Object.fromEntries(new URLSearchParams(request.search));
const audienceField = (page) => page.getByLabel("Público-alvo");

test.describe("filtro por público-alvo", () => {
  test("as opções vêm da API, com 'Todos os públicos' primeiro", async ({ page }) => {
    const api = await mockApi(page, { activitiesResponder: listingOf(3) });
    await page.goto("/explorar.html");
    await expect(cards(page)).toHaveCount(3);

    const labels = await audienceField(page).locator("option").allTextContents();
    expect(labels).toEqual(["Todos os públicos", ...AUDIENCES.map((a) => a.name)]);
    expect(api.count("/audiences/")).toBe(1);
  });

  test("endereço com audience preenche o campo e consulta uma vez com o parâmetro", async ({ page }) => {
    const api = await mockApi(page, { activitiesResponder: listingOf(4) });
    await page.goto(`/explorar.html?unit=${UNITS[0].id}&category=${CATEGORIES[0].id}&audience=${ADULTS.id}`);
    await expect(cards(page)).toHaveCount(4);
    await expect(audienceField(page)).toHaveValue(ADULTS.id);

    const requests = activityRequests(api);
    expect(requests).toHaveLength(1);
    expect(params(requests[0])).toEqual({
      unit: UNITS[0].id,
      category: CATEGORIES[0].id,
      audience: ADULTS.id,
      page_size: "12",
    });
  });

  test("escolher não consulta; Filtrar combina critérios, volta à página 1 e grava o endereço", async ({ page }) => {
    const api = await mockApi(page, { activitiesResponder: listingOf(27) });
    await page.goto("/explorar.html?page=2");
    await expect(cards(page)).toHaveCount(12);
    const before = activityRequests(api).length;

    await audienceField(page).selectOption(KIDS.id);
    await page.getByLabel("Buscar por nome da atividade").fill("oficina");
    expect(activityRequests(api)).toHaveLength(before);

    await page.getByRole("button", { name: "Filtrar" }).click();
    await expect(page).toHaveURL(new RegExp(`explorar\\.html\\?q=oficina&audience=${KIDS.id}$`));
    await expect.poll(() => activityRequests(api).length).toBe(before + 1);
    expect(params(activityRequests(api).at(-1))).toEqual({ q: "oficina", audience: KIDS.id, page_size: "12" });
  });

  test("a paginação preserva o público", async ({ page }) => {
    await mockApi(page, { activitiesResponder: listingOf(27) });
    await page.goto(`/explorar.html?audience=${ADULTS.id}`);
    await expect(cards(page)).toHaveCount(12);
    await page.getByRole("link", { name: "Ir para a página 2" }).click();
    await expect(page).toHaveURL(new RegExp(`audience=${ADULTS.id}&page=2$`));
  });

  test("audience malformado é ignorado, o endereço é reescrito e nada inválido é enviado", async ({ page }) => {
    const api = await mockApi(page, { activitiesResponder: listingOf(3) });
    await page.goto("/explorar.html?audience=abc");
    await expect(cards(page)).toHaveCount(3);
    await expect(page).toHaveURL(/explorar\.html$/);
    await expect(audienceField(page)).toHaveValue("");
    expect(params(activityRequests(api)[0])).toEqual({ page_size: "12" });
  });

  test("público que não está mais no catálogo é descartado com aviso e a lista é refeita", async ({ page }) => {
    const api = await mockApi(page, { activitiesResponder: listingOf(3) });
    await page.goto("/explorar.html?audience=99999999-9999-4999-8999-999999999999");
    await expect(page.locator("#filter-options-status")).toHaveText(/não está mais disponível/);
    await expect(audienceField(page)).toHaveValue("");
    await expect.poll(() => activityRequests(api).length).toBe(2);
    expect(params(activityRequests(api).at(-1))).toEqual({ page_size: "12" });
  });

  test("lista vazia para o público mostra o estado vazio padrão", async ({ page }) => {
    await mockApi(page, {
      activitiesResponder: () => ({ body: { count: 0, next: null, previous: null, results: [] } }),
    });
    await page.goto(`/explorar.html?audience=${KIDS.id}`);
    await expect(page.locator(".region-state__title")).toHaveText("Nenhuma atividade encontrada.");
    await expect(page.locator(".region-state__title")).toBeVisible();
    await expect(page.getByRole("button", { name: "Limpar filtros" })).toBeVisible();
  });

  test("falha em /audiences/: só 'Todos os públicos', aviso e demais filtros funcionando", async ({ page }) => {
    const api = await mockApi(page, { failAudiences: 500, activitiesResponder: listingOf(3) });
    await page.goto("/explorar.html");
    await expect(cards(page)).toHaveCount(3);
    await expect(page.locator("#filter-options-status")).toHaveText("Não foi possível carregar os públicos-alvo.");
    await expect(audienceField(page).locator("option")).toHaveCount(1);

    await page.getByLabel("Unidade").selectOption(UNITS[1].id);
    await page.getByRole("button", { name: "Filtrar" }).click();
    await expect.poll(() => activityRequests(api).length).toBe(2);
    expect(params(activityRequests(api).at(-1))).toEqual({ unit: UNITS[1].id, page_size: "12" });
  });
});

test.describe("limpar e histórico com o público", () => {
  test("Limpar filtros zera o público, o endereço e consulta a listagem geral", async ({ page }) => {
    const api = await mockApi(page, { activitiesResponder: listingOf(27) });
    await page.goto(`/explorar.html?unit=${UNITS[0].id}&audience=${ADULTS.id}&page=2`);
    await expect(cards(page)).toHaveCount(12);

    await page.getByRole("button", { name: "Limpar filtros" }).click();
    await expect(page).toHaveURL(/explorar\.html$/);
    await expect(audienceField(page)).toHaveValue("");
    await expect(page.getByLabel("Unidade")).toHaveValue("");
    await expect.poll(() => activityRequests(api).length).toBe(2);
    expect(params(activityRequests(api).at(-1))).toEqual({ page_size: "12" });
  });

  test("voltar e avançar restauram campo, endereço e listagem", async ({ page }) => {
    const api = await mockApi(page, { activitiesResponder: listingOf(5) });
    await page.goto("/explorar.html");
    await expect(cards(page)).toHaveCount(5);

    await audienceField(page).selectOption(ADULTS.id);
    await page.getByRole("button", { name: "Filtrar" }).click();
    await expect(page).toHaveURL(new RegExp(`audience=${ADULTS.id}$`));

    await page.goBack();
    await expect(page).toHaveURL(/explorar\.html$/);
    await expect(audienceField(page)).toHaveValue("");

    await page.goForward();
    await expect(page).toHaveURL(new RegExp(`audience=${ADULTS.id}$`));
    await expect(audienceField(page)).toHaveValue(ADULTS.id);
    expect(activityRequests(api).length).toBeGreaterThanOrEqual(2);
  });

  test("ida aos detalhes e volta restaura o público e a listagem", async ({ page }) => {
    await mockApi(page, { activitiesResponder: listingOf(5) });
    await page.goto(`/explorar.html?audience=${ADULTS.id}`);
    await expect(cards(page)).toHaveCount(5);

    await cards(page).first().getByRole("link").click();
    await expect(page).toHaveURL(/atividade\.html\?id=/);
    await page.goBack();

    await expect(page).toHaveURL(new RegExp(`audience=${ADULTS.id}$`));
    await expect(audienceField(page)).toHaveValue(ADULTS.id);
    await expect(cards(page)).toHaveCount(5);
  });
});

test.describe("público-alvo no card", () => {
  test("mostra os públicos e omite a linha quando não há", async ({ page }) => {
    await mockApi(page, {
      activitiesResponder: () => ({
        body: {
          count: 3,
          next: null,
          previous: null,
          results: [
            makeActivity(1, { target_audiences: [{ id: "a", name: "Adolescentes" }, { id: "b", name: "Adultos" }] }),
            makeActivity(2, { target_audiences: [] }),
            (({ target_audiences: _omit, ...legacy }) => legacy)(makeActivity(3)),
          ],
        },
      }),
    });
    await page.goto("/explorar.html");
    await expect(cards(page)).toHaveCount(3);
    await expect(cards(page).nth(0).locator(".activity-card__audience")).toHaveText("Adolescentes, Adultos");
    await expect(cards(page).nth(1).locator(".activity-card__audience")).toHaveCount(0);
    await expect(cards(page).nth(2).locator(".activity-card__audience")).toHaveCount(0);
  });

  test("nomes longos não geram rolagem horizontal em 320px", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await mockApi(page, {
      activitiesResponder: () => ({
        body: {
          count: 1,
          next: null,
          previous: null,
          results: [makeActivity(1, { target_audiences: [{ id: "a", name: "P".repeat(90) }, { id: "b", name: "Adultos" }] })],
        },
      }),
    });
    await page.goto("/explorar.html");
    await expect(cards(page)).toHaveCount(1);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("a Início continua exibindo os cards", async ({ page }) => {
    await mockApi(page);
    await page.goto("/index.html");
    await expect(page.locator(".activity-card")).toHaveCount(3);
  });
});

test.describe("filtro de público na Início", () => {
  test("as opções vêm da API e escolher não consulta atividades", async ({ page }) => {
    const api = await mockApi(page);
    await page.goto("/index.html");
    await expect(page.locator("#upcoming-content article")).toHaveCount(3);
    await expect(audienceField(page).locator("option")).toHaveCount(AUDIENCES.length + 1);
    expect(api.count("/audiences/")).toBe(1);

    const before = api.requests.length;
    await audienceField(page).selectOption(ADULTS.id);
    expect(api.requests.length).toBe(before);
  });

  test("Explorar leva o público para a página Explorar, que o preenche", async ({ page }) => {
    await mockApi(page, { activitiesResponder: listingOf(3) });
    await page.goto("/index.html");
    await expect(audienceField(page).locator("option")).toHaveCount(AUDIENCES.length + 1);
    await audienceField(page).selectOption(KIDS.id);
    await page.getByRole("button", { name: "Explorar" }).click();
    await expect(page).toHaveURL(new RegExp(`explorar\\.html\\?audience=${KIDS.id}$`));
    await expect(audienceField(page)).toHaveValue(KIDS.id);
  });

  test("falha em /audiences/ avisa e a busca continua funcionando", async ({ page }) => {
    await mockApi(page, { failAudiences: 500 });
    await page.goto("/index.html");
    await expect(page.locator("#filter-options-status")).toHaveText("Não foi possível carregar os públicos-alvo.");
    await page.getByLabel("Buscar por nome da atividade").fill("yoga");
    await page.getByLabel("Buscar por nome da atividade").press("Enter");
    await expect(page).toHaveURL(/explorar\.html\?q=yoga$/);
  });
});
