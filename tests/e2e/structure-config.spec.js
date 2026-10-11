import { expect, test } from "@playwright/test";

const pages = ["index.html", "explorar.html", "atividade.html", "sobre.html", "contato.html"];

async function overrideConfig(page, apiBaseUrl) {
  // Reaproveita o config.js real, trocando apenas o valor público.
  await page.route("**/js/config.js", async (route) => {
    const response = await route.fetch();
    const body = (await response.text()).replace(
      /apiBaseUrl: "[^"]*"/,
      `apiBaseUrl: ${JSON.stringify(apiBaseUrl)}`,
    );
    await route.fulfill({ response, body });
  });
}

function collectProblems(page) {
  const problems = [];
  page.on("pageerror", (error) => problems.push(`pageerror: ${error.message}`));
  page.on("console", (msg) => {
    if (msg.type() === "error") problems.push(`console: ${msg.text()}`);
  });
  page.on("requestfailed", (req) => problems.push(`requestfailed: ${req.url()}`));
  return problems;
}

for (const path of pages) {
  test(`abre ${path} diretamente sem erros e com a API configurada`, async ({ page }) => {
    const problems = collectProblems(page);
    const response = await page.goto(`/${path}`);
    expect(response.status()).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
    await expect(page).toHaveTitle(/Agenda Livre/);
    await expect(page.locator("main h1")).toBeVisible();
    await expect(page.locator("[role=alert]")).toHaveCount(0);
    const bodyColor = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
    expect(bodyColor).toContain("system-ui"); // estilos aplicados
    expect(problems).toEqual([]);
  });
}

test("títulos das páginas são distintos", async ({ page }) => {
  const titles = [];
  for (const path of pages) {
    await page.goto(`/${path}`);
    titles.push(await page.title());
  }
  expect(new Set(titles).size).toBe(pages.length);
});

test("detalhes sem parâmetro de atividade carrega sem erro de script", async ({ page }) => {
  const problems = collectProblems(page);
  await page.goto("/atividade.html");
  await expect(page.locator("main h1")).toBeVisible();
  expect(problems).toEqual([]);
});

for (const [label, value, text] of [
  ["ausente", "", /ausente/],
  ["malformada", "abc", /inválida/],
  ["com esquema não permitido", "javascript:alert(1)", /inválida/],
  ["com esquema file", "file:///etc/passwd", /inválida/],
]) {
  test(`configuração ${label} mostra aviso e não faz requisição à API`, async ({ page }) => {
    const apiRequests = [];
    page.on("request", (req) => {
      if (/\/api\/v1|localhost:8000/.test(req.url())) apiRequests.push(req.url());
    });
    const problems = collectProblems(page);
    await overrideConfig(page, value);
    for (const path of pages) {
      await page.goto(`/${path}`);
      const alert = page.locator("main > [role=alert]").first();
      await expect(alert).toBeVisible();
      await expect(alert).toHaveText(text);
      await expect(alert).not.toContainText(/TypeError|Invalid URL|undefined/);
      await expect(page.locator("main h1")).toBeVisible();
    }
    expect(apiRequests).toEqual([]);
    expect(problems).toEqual([]);
  });
}

test("trocar só o valor da config para outra URL válida remove o aviso", async ({ page }) => {
  await overrideConfig(page, "https://api.exemplo.org/api/v1/");
  await page.goto("/index.html");
  await expect(page.locator("[role=alert]")).toHaveCount(0);
});

test("conteúdo estático continua visível sem JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  for (const path of pages) {
    await page.goto(`/${path}`);
    await expect(page.locator("main h1")).toBeVisible();
  }
  await context.close();
});

test("módulo de script que falha ao carregar não esconde o conteúdo estático", async ({ page }) => {
  await page.route("**/js/pages/home.js", (route) => route.abort());
  await page.goto("/index.html");
  await expect(page.locator("main h1")).toBeVisible();
});
