import { expect, test } from "@playwright/test";
import { CATEGORIES, UNITS, mockApi } from "./helpers/mock-api.js";

const submit = (page) => page.getByRole("button", { name: "Explorar" });

test.describe("pesquisa por nome", () => {
  test("campo com rótulo acessível e limite de 100 caracteres", async ({ page }) => {
    await mockApi(page);
    await page.goto("/index.html");
    const field = page.getByLabel("Buscar por nome da atividade");
    await expect(field).toBeVisible();
    await expect(field).toHaveAttribute("maxlength", "100");
    await field.fill("a".repeat(150));
    expect(await field.inputValue()).toHaveLength(100);
  });

  test("digitar e escolher não consulta a API; Enter navega com o termo", async ({ page }) => {
    const api = await mockApi(page);
    await page.goto("/index.html");
    await expect(page.locator("#upcoming-content article")).toHaveCount(3);
    const before = api.requests.length;

    await page.getByLabel("Buscar por nome da atividade").pressSequentially("dança", { delay: 20 });
    await page.getByLabel("Unidade").selectOption(UNITS[0].id);
    await page.getByLabel("Quando?").selectOption("week");
    expect(api.requests.length).toBe(before);

    await page.getByLabel("Buscar por nome da atividade").press("Enter");
    await expect(page).toHaveURL(/explorar\.html\?q=dan%C3%A7a&unit=/);
  });

  test("clique em 'Explorar' navega; sem termo abre a listagem geral", async ({ page }) => {
    await mockApi(page);
    await page.goto("/index.html");
    await page.getByLabel("Buscar por nome da atividade").fill("oficina");
    await submit(page).click();
    await expect(page).toHaveURL(/explorar\.html\?q=oficina$/);

    await page.goto("/index.html");
    await submit(page).click();
    await expect(page).toHaveURL(/\/explorar\.html$/);
  });

  test("termo só com espaços é tratado como vazio", async ({ page }) => {
    await mockApi(page);
    await page.goto("/index.html");
    await page.getByLabel("Buscar por nome da atividade").fill("    ");
    await submit(page).click();
    await expect(page).toHaveURL(/\/explorar\.html$/);
  });

  test("caracteres especiais chegam íntegros", async ({ page }) => {
    await mockApi(page);
    await page.goto("/index.html");
    const term = 'a & b #c "d" 100%';
    await page.getByLabel("Buscar por nome da atividade").fill(term);
    await submit(page).click();
    await page.waitForURL(/explorar\.html/);
    expect(new URL(page.url()).searchParams.get("q")).toBe(term);
  });

  test("duplo clique resulta em uma única navegação", async ({ page }) => {
    await mockApi(page);
    await page.goto("/index.html");
    await page.getByLabel("Buscar por nome da atividade").fill("x");
    let navigations = 0;
    page.on("framenavigated", (frame) => {
      if (frame === page.mainFrame() && frame.url().includes("explorar.html")) navigations += 1;
    });
    await submit(page).dblclick();
    await page.waitForURL(/explorar\.html/);
    expect(navigations).toBe(1);
  });

  test("sem JavaScript o envio nativo chega a explorar.html", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/index.html");
    await page.getByLabel("Buscar por nome da atividade").fill("teatro");
    await submit(page).click();
    await expect(page).toHaveURL(/explorar\.html\?q=teatro/);
    await context.close();
  });
});

test.describe("filtros rápidos", () => {
  test("rótulos visíveis, valores padrão e opções vindas da API", async ({ page }) => {
    await mockApi(page);
    await page.goto("/index.html");
    for (const label of ["Unidade", "Categoria", "Quando?"]) await expect(page.getByLabel(label)).toBeVisible();

    await expect(page.getByLabel("Unidade")).toHaveValue("");
    await expect(page.getByLabel("Categoria")).toHaveValue("");
    await expect(page.getByLabel("Quando?")).toHaveValue("any");

    await expect(page.getByLabel("Unidade").locator("option")).toHaveText(["Todas as unidades", ...UNITS.map((u) => u.name)]);
    await expect(page.getByLabel("Categoria").locator("option")).toHaveText([
      "Todas as categorias",
      ...CATEGORIES.map((c) => c.name),
    ]);
    await expect(page.getByLabel("Quando?").locator("option")).toHaveText([
      "Qualquer data",
      "Hoje",
      "Próximos 7 dias",
      "Este mês",
    ]);
  });

  test("combina termo, unidade, categoria e período no endereço", async ({ page }) => {
    await mockApi(page);
    await page.goto("/index.html");
    await expect(page.getByLabel("Unidade").locator("option")).toHaveCount(3);
    await page.getByLabel("Buscar por nome da atividade").fill("oficina");
    await page.getByLabel("Unidade").selectOption(UNITS[1].id);
    await page.getByLabel("Categoria").selectOption(CATEGORIES[1].id);
    await page.getByLabel("Quando?").selectOption("week");
    await submit(page).click();
    await page.waitForURL(/explorar\.html/);

    const params = new URL(page.url()).searchParams;
    expect([...params.keys()]).toEqual(["q", "unit", "category", "date_from", "date_to"]);
    expect(params.get("unit")).toBe(UNITS[1].id);
    expect(params.get("category")).toBe(CATEGORIES[1].id);
    const from = new Date(`${params.get("date_from")}T00:00:00Z`);
    const to = new Date(`${params.get("date_to")}T00:00:00Z`);
    expect((to - from) / 86400000).toBe(6);
  });

  test("'Hoje' usa só date; só categoria usa só category", async ({ page }) => {
    await mockApi(page);
    await page.goto("/index.html");
    await page.getByLabel("Quando?").selectOption("today");
    await submit(page).click();
    await page.waitForURL(/explorar\.html/);
    const today = new URL(page.url()).searchParams;
    expect([...today.keys()]).toEqual(["date"]);

    await page.goto("/index.html");
    await expect(page.getByLabel("Categoria").locator("option")).toHaveCount(3);
    await page.getByLabel("Categoria").selectOption(CATEGORIES[0].id);
    await submit(page).click();
    await page.waitForURL(/explorar\.html/);
    expect(page.url()).toContain(`explorar.html?category=${CATEGORIES[0].id}`);
  });

  test("'Hoje' usa a data de São Paulo, não a do fuso do dispositivo", async ({ browser }) => {
    const context = await browser.newContext({ timezoneId: "Pacific/Auckland" });
    const page = await context.newPage();
    await mockApi(page);
    await page.goto("/index.html");
    const expected = await page.evaluate(() =>
      new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date()),
    );
    await page.getByLabel("Quando?").selectOption("today");
    await submit(page).click();
    await page.waitForURL(/explorar\.html/);
    expect(new URL(page.url()).searchParams.get("date")).toBe(expected);
    await context.close();
  });

  test("falha em unidades: só 'todas', aviso anunciado e pesquisa por nome funciona", async ({ page }) => {
    await mockApi(page, { failUnits: 500 });
    await page.goto("/index.html");
    await expect(page.locator("#filter-options-status")).toHaveText("Não foi possível carregar as unidades.");
    await expect(page.getByLabel("Unidade").locator("option")).toHaveCount(1);
    await expect(page.getByLabel("Categoria").locator("option")).toHaveCount(3);

    await page.getByLabel("Buscar por nome da atividade").fill("dança");
    await submit(page).click();
    await expect(page).toHaveURL(/explorar\.html\?q=dan%C3%A7a$/);
  });

  test("só com teclado: percorre os campos e aciona 'Explorar'", async ({ page }) => {
    await mockApi(page);
    await page.goto("/index.html");
    await expect(page.getByLabel("Unidade").locator("option")).toHaveCount(3);
    await page.getByLabel("Buscar por nome da atividade").focus();
    await page.keyboard.type("yoga");
    await page.keyboard.press("Tab");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await expect(submit(page)).toBeFocused();
    await page.keyboard.press("Enter");
    await page.waitForURL(/explorar\.html/);
    const params = new URL(page.url()).searchParams;
    expect(params.get("q")).toBe("yoga");
    expect(params.get("unit")).toBe(UNITS[0].id);
  });
});
