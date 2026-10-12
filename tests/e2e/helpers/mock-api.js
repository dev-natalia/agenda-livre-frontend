// As fixtures vivem em tests/fixtures/activities.js; são reexportadas aqui para os testes de navegador.
import { makeActivity, UNITS, CATEGORIES } from "../../fixtures/activities.js";
export * from "../../fixtures/activities.js";

const API = "**/api/v1";
const CORS = { "access-control-allow-origin": "*" };

const DETAIL_PATH = /\/activities\/[0-9a-f-]{36}\/?$/i;

const envelope = (results) => JSON.stringify({ count: results.length, next: null, previous: null, results });

// Aponta o frontend para a API simulada (mesmo padrão de api-error-retry.spec.js).
export async function overrideConfig(page) {
  await page.route("**/js/config.js", async (route) => {
    try {
      const response = await route.fetch();
      const body = (await response.text()).replace(
        /apiBaseUrl: "[^"]*"/,
        'apiBaseUrl: "http://localhost:8000/api/v1"',
      );
      await route.fulfill({ response, body });
    } catch {
      // A página pode navegar embora (ex.: para explorar.html) antes de a resposta chegar.
    }
  });
}

// failActivities / failUnits / failCategories: status HTTP, ou "network" para abortar a conexão.
export async function mockApi(
  page,
  {
    activities = [makeActivity(1), makeActivity(2), makeActivity(3)],
    units = UNITS,
    categories = CATEGORIES,
    delayMs = 0,
    failActivities = null,
    failUnits = null,
    failCategories = null,
    activitiesResponder = null,
    detailsResponder = null,
  } = {},
) {
  const requests = [];
  const state = { failActivities, failUnits, failCategories };

  // `activitiesResponder(url)` devolve { status = 200, body, delayMs } e substitui a lista fixa.
  async function handleActivities(route) {
    const url = new URL(route.request().url());
    requests.push({ path: url.pathname, search: url.search });
    const answer = (await activitiesResponder(url)) ?? {};
    if (answer.delayMs) await new Promise((resolve) => setTimeout(resolve, answer.delayMs));
    if (answer.network) return route.abort("connectionrefused");
    return route.fulfill({
      status: answer.status ?? 200,
      headers: CORS,
      contentType: "application/json",
      body: JSON.stringify(answer.body ?? {}),
    });
  }

  // `detailsResponder(id, url)` devolve { status = 200, body, delayMs, network }; padrão: 404 do contrato.
  async function handleDetails(route) {
    const url = new URL(route.request().url());
    requests.push({ path: url.pathname, search: url.search });
    const id = url.pathname.split("/").filter(Boolean).pop();
    const answer = (detailsResponder ? await detailsResponder(id, url) : null) ?? {
      status: 404,
      body: { detail: "Não encontrado." },
    };
    if (answer.delayMs) await new Promise((resolve) => setTimeout(resolve, answer.delayMs));
    if (answer.network) return route.abort("connectionrefused");
    return route.fulfill({
      status: answer.status ?? 200,
      headers: CORS,
      contentType: "application/json",
      body: JSON.stringify(answer.body ?? {}),
    });
  }

  async function handle(route, key, results) {
    const url = new URL(route.request().url());
    requests.push({ path: url.pathname, search: url.search });
    if (delayMs) await new Promise((resolve) => setTimeout(resolve, delayMs));
    const fail = state[key];
    if (fail === "network") return route.abort("connectionrefused");
    if (fail) {
      return route.fulfill({ status: fail, headers: CORS, contentType: "application/json", body: '{"detail":"x"}' });
    }
    return route.fulfill({ status: 200, headers: CORS, contentType: "application/json", body: envelope(results) });
  }

  await overrideConfig(page);
  await page.route(`${API}/activities/**`, (route) =>
    DETAIL_PATH.test(new URL(route.request().url()).pathname)
      ? handleDetails(route)
      : activitiesResponder ? handleActivities(route) : handle(route, "failActivities", activities),
  );
  await page.route(`${API}/units/**`, (route) => handle(route, "failUnits", units));
  await page.route(`${API}/categories/**`, (route) => handle(route, "failCategories", categories));

  return {
    requests,
    state,
    count: (path) => requests.filter((r) => r.path.endsWith(path)).length,
  };
}
