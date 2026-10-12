const API = "**/api/v1";
const CORS = { "access-control-allow-origin": "*" };

export function makeActivity(n, overrides = {}) {
  return {
    id: `550e8400-e29b-41d4-a716-44665544${String(n).padStart(4, "0")}`,
    title: `Atividade de teste ${n}`,
    slug: `atividade-de-teste-${n}`,
    summary: "Resumo.",
    unit: { id: "u1", name: "CEU Navegantes", slug: "ceu-navegantes", neighborhood: "Grajaú" },
    category: { id: "c1", name: "Cultura e Artes", slug: "cultura-e-artes" },
    next_occurrence: { date: "2026-11-20", start_time: "14:00", end_time: "15:00" },
    ...overrides,
  };
}

export const UNITS = [
  { id: "11111111-1111-4111-8111-111111111111", name: "CEU Navegantes", slug: "ceu-navegantes" },
  { id: "22222222-2222-4222-8222-222222222222", name: "CEU Parelheiros", slug: "ceu-parelheiros" },
];
export const CATEGORIES = [
  { id: "33333333-3333-4333-8333-333333333333", name: "Cultura e Artes", slug: "cultura-e-artes" },
  { id: "44444444-4444-4444-8444-444444444444", name: "Esportes", slug: "esportes" },
];

// Resposta paginada de `total` atividades, no recorte da página pedida (padrão da API: 12 por página).
export function makeListing(total, { page = 1, pageSize = 12, base = "http://localhost:8000/api/v1/activities/" } = {}) {
  const start = (page - 1) * pageSize;
  const results = [];
  for (let n = start + 1; n <= Math.min(total, start + pageSize); n += 1) results.push(makeActivity(n));
  return {
    count: total,
    next: start + pageSize < total ? `${base}?page=${page + 1}` : null,
    previous: page > 1 && results.length ? `${base}?page=${page - 1}` : null,
    results,
  };
}

export const DETAILS_ID = "550e8400-e29b-41d4-a716-446655440001";

// Corpo de `GET /activities/{id}/` (contrato do backend, public-api.md).
export function makeDetails(overrides = {}) {
  return {
    id: DETAILS_ID,
    title: "Oficina de dança",
    slug: "oficina-de-danca",
    summary: "Aprenda os primeiros passos.",
    description: "Descrição completa.\nSegunda linha.",
    target_audience_notes: "Iniciantes são bem-vindos.",
    unit: {
      id: "11111111-1111-4111-8111-111111111111",
      name: "CEU Navegantes",
      slug: "ceu-navegantes",
      address: "Rua das Flores, 100",
      neighborhood: "Grajaú",
    },
    category: { id: "33333333-3333-4333-8333-333333333333", name: "Cultura e Artes", slug: "cultura-e-artes" },
    target_audiences: [{ id: "a1", name: "Adultos" }],
    external_registration_url: null,
    schedules: [
      {
        id: "s1",
        schedule_type: "ONE_TIME",
        start_date: "2026-11-20",
        end_date: "2026-11-20",
        start_time: "10:00",
        end_time: "11:00",
        weekdays: [],
        weekday_names: [],
      },
      {
        id: "s2",
        schedule_type: "RECURRING",
        start_date: "2026-11-01",
        end_date: "2026-12-31",
        start_time: "14:00",
        end_time: "15:00",
        weekdays: [2, 4],
        weekday_names: ["Terça-feira", "Quinta-feira"],
      },
    ],
    next_occurrences: [
      { date: "2026-11-03", start_time: "14:00", end_time: "15:00" },
      { date: "2026-11-05", start_time: "14:00", end_time: "15:00" },
    ],
    ...overrides,
  };
}

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
