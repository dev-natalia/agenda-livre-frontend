import { expect, test } from "@playwright/test";
import { DETAILS_ID, makeDetails, mockApi } from "./helpers/mock-api.js";

const NOT_FOUND = "Atividade não encontrada ou não disponível";
const found = (id) => ({ body: makeDetails({ id }) });
const detailRequests = (api) => api.requests.filter((r) => /\/activities\/[0-9a-f-]{36}\/$/.test(r.path));

test.describe("não encontrada", () => {
  test("UUID inexistente (404) mostra o estado com as duas saídas", async ({ page }) => {
    await mockApi(page, {});
    await page.goto(`/atividade.html?id=${DETAILS_ID}`);
    await expect(page.locator("h1")).toHaveText(NOT_FOUND);
    await expect(page).toHaveTitle("Atividade não encontrada — Agenda Livre");
    await expect(page.getByRole("link", { name: "Explorar outras atividades" })).toHaveAttribute("href", "explorar.html");
    await expect(page.getByRole("link", { name: "Voltar ao Início" })).toHaveAttribute("href", "index.html");
    await expect(page.getByRole("button", { name: "Tentar novamente" })).toHaveCount(0);
  });

  for (const search of ["", "?id=", "?id=abc", "?id=123", "?outro=1"]) {
    test(`'${search}' mostra o mesmo estado sem chamar a API`, async ({ page }) => {
      const api = await mockApi(page, { detailsResponder: found });
      await page.goto(`/atividade.html${search}`);
      await expect(page.locator("h1")).toHaveText(NOT_FOUND);
      await expect(page.locator("#details-content .skeleton-card")).toHaveCount(0);
      expect(detailRequests(api)).toHaveLength(0);
    });
  }

  test("os links de saída são operáveis por teclado e levam às páginas corretas", async ({ page }) => {
    await mockApi(page, {});
    await page.goto("/atividade.html?id=abc");
    const explore = page.getByRole("link", { name: "Explorar outras atividades" });
    await explore.focus();
    await expect(explore).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/explorar\.html$/);

    await page.goto("/atividade.html?id=abc");
    await page.getByRole("link", { name: "Voltar ao Início" }).click();
    await expect(page).toHaveURL(/index\.html$/);
  });

  test("a mudança de estado é anunciada pela região de status", async ({ page }) => {
    await mockApi(page, {});
    await page.goto(`/atividade.html?id=${DETAILS_ID}`);
    await expect(page.locator("#details-status")).toHaveText(/não encontrada/i);
  });
});

test.describe("erro de comunicação", () => {
  test("500 mostra mensagem amigável e, ao religar a API, 'Tentar novamente' mostra o conteúdo", async ({ page }) => {
    let fail = true;
    const api = await mockApi(page, {
      detailsResponder: (id) => (fail ? { status: 500, body: { detail: "x" } } : found(id)),
    });
    await page.goto(`/atividade.html?id=${DETAILS_ID}`);
    await expect(page.locator(".error-state__message")).toBeVisible();
    await expect(page.locator("h1")).toHaveCount(0);
    await expect(page.locator("main")).not.toContainText(NOT_FOUND);
    await expect(page).toHaveTitle("Erro ao carregar a atividade — Agenda Livre");

    fail = false;
    await page.getByRole("button", { name: "Tentar novamente" }).click();
    await expect(page.locator("h1")).toHaveText("Oficina de dança");
    expect(detailRequests(api)).toHaveLength(2);
  });

  test("falha de rede mostra a mensagem de conexão", async ({ page }) => {
    await mockApi(page, { detailsResponder: () => ({ network: true }) });
    await page.goto(`/atividade.html?id=${DETAILS_ID}`);
    await expect(page.locator(".error-state__message")).toContainText(/conectar/i);
  });

  test("cliques repetidos em 'Tentar novamente' geram uma requisição", async ({ page }) => {
    let calls = 0;
    const api = await mockApi(page, {
      detailsResponder: () => {
        calls += 1;
        return calls === 1 ? { status: 500, body: {} } : { status: 500, body: {}, delayMs: 800 };
      },
    });
    await page.goto(`/atividade.html?id=${DETAILS_ID}`);
    const button = page.getByRole("button", { name: "Tentar novamente" });
    await button.dblclick({ force: true }).catch(() => {});
    await expect(page.locator(".error-state__retry")).toBeVisible();
    expect(detailRequests(api).length).toBeLessThanOrEqual(2);
  });

  test("429 mostra a mensagem de limite de consultas", async ({ page }) => {
    await mockApi(page, { detailsResponder: () => ({ status: 429, body: {} }) });
    await page.goto(`/atividade.html?id=${DETAILS_ID}`);
    await expect(page.locator(".error-state__message")).toContainText(/Muitas consultas/);
    await expect(page.getByRole("button", { name: "Tentar novamente" })).toBeVisible();
  });
});

test.describe("configuração e JavaScript", () => {
  test("API não configurada mostra o aviso e não deixa esqueleto indefinido", async ({ page }) => {
    await page.route("**/js/config.js", async (route) => {
      const response = await route.fetch();
      const body = (await response.text()).replace(/apiBaseUrl: "[^"]*"/, 'apiBaseUrl: ""');
      await route.fulfill({ response, body });
    });
    await page.goto(`/atividade.html?id=${DETAILS_ID}`);
    await expect(page.locator(".config-notice")).toBeVisible();
    await expect(page.locator("#details-content .skeleton-card")).toHaveCount(0);
  });

  test("sem JavaScript, mostra a mensagem estática e a navegação continua", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, baseURL: "http://localhost:5500" });
    const page = await context.newPage();
    await page.goto(`/atividade.html?id=${DETAILS_ID}`);
    await expect(page.locator("main noscript p")).toContainText("ative o JavaScript no navegador");
    await expect(page.locator("main h1")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Detalhes da atividade");
    await expect(page.getByRole("navigation", { name: "Navegação principal" })).toBeVisible();
    await context.close();
  });
});
