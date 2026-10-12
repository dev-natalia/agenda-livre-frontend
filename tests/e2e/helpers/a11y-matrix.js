import { DETAILS_ID, makeDetails, makeListing, mockApi } from "./mock-api.js";

// Matriz de verificação de acessibilidade (specs/009-transversal-accessibility/data-model.md).
// Cada linha da matriz é uma página, um estado e uma largura; `open(page)` leva a página ao estado
// por interação real (API simulada e cliques), nunca por injeção de DOM.
export const PAGES = ["index.html", "explorar.html", "atividade.html", "sobre.html", "contato.html"];
export const WIDTHS = [1280, 320];

// Aguarda o fim das transições de cor (150 ms): o axe e a medição de contraste leem cores intermediárias.
export const settle = (page) => page.waitForTimeout(300);

const VALID_CONTACT = {
  "#contact-name": "Maria de Teste",
  "#contact-email": "maria@exemplo.com",
  "#contact-subject": "Dúvida sobre o site",
  "#contact-message": "Mensagem de teste com mais de dez caracteres.",
};

const LIST = {
  "index.html": { path: "/index.html", box: "#upcoming-content" },
  "explorar.html": { path: "/explorar.html", box: "#results-content" },
};

const found = () => ({ body: makeDetails() });
const empty = () => ({ body: makeListing(0) });

// Estados de listagem (Início e Explorar).
function listState(page, { api, ready }) {
  const { path, box } = LIST[page];
  return {
    async open(p) {
      await mockApi(p, api);
      await p.goto(path);
      await p.locator(`${box} ${ready}`).first().waitFor();
    },
  };
}

const STATES = {
  carregada: {
    // Página estática ou com dados prontos; é o estado de partida de todas as páginas.
    pages: PAGES,
    open: {
      "index.html": listState("index.html", { api: {}, ready: ".activity-card" }).open,
      "explorar.html": listState("explorar.html", { api: {}, ready: ".activity-card" }).open,
      "atividade.html": async (p) => {
        await mockApi(p, { detailsResponder: found });
        await p.goto(`/atividade.html?id=${DETAILS_ID}`);
        await p.locator("#details-content h1").waitFor();
      },
      "sobre.html": async (p) => {
        await p.goto("/sobre.html");
        await p.locator("h1").waitFor();
      },
      "contato.html": async (p) => {
        await p.goto("/contato.html");
        await p.locator("h1").waitFor();
      },
    },
  },
  resultados: {
    pages: ["index.html", "explorar.html", "atividade.html"],
    open: {
      "index.html": listState("index.html", { api: { activities: undefined }, ready: ".activity-card" }).open,
      "explorar.html": async (p) => {
        await mockApi(p, { activitiesResponder: (url) => ({ body: makeListing(30, { page: Number(url.searchParams.get("page") ?? 1) }) }) });
        await p.goto("/explorar.html");
        await p.locator("#results-content .activity-card").first().waitFor();
        await p.locator("#results-pagination").waitFor();
      },
      "atividade.html": async (p) => {
        await mockApi(p, { detailsResponder: () => ({ body: makeDetails({ external_registration_url: "https://exemplo.org/inscricao" }) }) });
        await p.goto(`/atividade.html?id=${DETAILS_ID}`);
        await p.locator("#details-content h1").waitFor();
      },
    },
  },
  vazio: {
    pages: ["index.html", "explorar.html"],
    open: {
      "index.html": async (p) => {
        await mockApi(p, { activitiesResponder: empty });
        await p.goto("/index.html");
        await p.locator("#upcoming-content .region-state__empty").waitFor();
      },
      "explorar.html": async (p) => {
        await mockApi(p, { activitiesResponder: empty });
        await p.goto("/explorar.html?q=nada");
        await p.locator("#results-content .region-state__empty").waitFor();
      },
    },
  },
  "erro-api": {
    pages: ["index.html", "explorar.html", "atividade.html"],
    open: {
      "index.html": async (p) => {
        await mockApi(p, { failActivities: 500 });
        await p.goto("/index.html");
        await p.locator("#upcoming-content .error-state__message").waitFor();
      },
      "explorar.html": async (p) => {
        await mockApi(p, { failActivities: 500 });
        await p.goto("/explorar.html");
        await p.locator("#results-content .error-state__message").waitFor();
      },
      "atividade.html": async (p) => {
        await mockApi(p, { detailsResponder: () => ({ status: 500, body: { detail: "x" } }) });
        await p.goto(`/atividade.html?id=${DETAILS_ID}`);
        await p.locator("#details-content .error-state__message").waitFor();
      },
    },
  },
  "form-erros": {
    pages: ["contato.html"],
    open: {
      "contato.html": async (p) => {
        await p.goto("/contato.html");
        const submit = p.getByRole("button", { name: "Enviar mensagem" });
        await submit.waitFor();
        await p.waitForFunction(() => !document.querySelector("#contact-form button[type=submit]").disabled);
        await submit.click();
        await p.locator(".field-error").first().waitFor();
      },
    },
  },
  confirmacao: {
    pages: ["contato.html"],
    open: {
      "contato.html": async (p) => {
        await p.goto("/contato.html");
        await p.waitForFunction(() => !document.querySelector("#contact-form button[type=submit]").disabled);
        for (const [selector, value] of Object.entries(VALID_CONTACT)) await p.locator(selector).fill(value);
        await p.getByRole("button", { name: "Enviar mensagem" }).click();
        await p.locator("#contact-confirmation").waitFor({ state: "visible" });
      },
    },
  },
  "menu-aberto": {
    pages: PAGES,
    widths: [320],
    open: null, // monta a partir de `carregada` e abre o menu (ver `scenarios`)
  },
};

export const STATE_IDS = Object.keys(STATES);

// Lista de cenários { name, page, state, width, open(page) }; `filter` restringe estados e/ou páginas.
export function scenarios({ states = STATE_IDS, pages = PAGES, widths = WIDTHS } = {}) {
  const out = [];
  for (const state of states) {
    const def = STATES[state];
    for (const page of def.pages.filter((name) => pages.includes(name))) {
      for (const width of (def.widths ?? widths).filter((w) => widths.includes(w))) {
        const base = state === "menu-aberto" ? STATES.carregada.open[page] : def.open[page];
        const open = async (p) => {
          await p.setViewportSize({ width, height: width >= 1000 ? 800 : 640 });
          await base(p);
          if (state === "menu-aberto") await p.getByRole("button", { name: "Menu" }).click();
          await settle(p);
        };
        out.push({ name: `${page} · ${state} · ${width}px`, page, state, width, open });
      }
    }
  }
  return out;
}
