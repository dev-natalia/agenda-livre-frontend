// Captura de telas para a revisão visual (feature 011, contracts/visual-review-record.md).
// Uso: npm run capture -- before|after|redesign   (grava em docs/visual-review/<before|after>/)
// Usa a API simulada das fixtures, sem rede externa. Não faz parte de `npm test`.
import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
import { DETAILS_ID, makeActivity, makeDetails, mockApi, withImage } from "../e2e/helpers/mock-api.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const PORT = 5500;
const BASE = `http://localhost:${PORT}`;
const mode = process.argv[2];

if (!["before", "after", "redesign"].includes(mode)) {
  console.error("Uso: npm run capture -- before|after|redesign");
  process.exit(1);
}

const OUT = join(ROOT, "docs", "visual-review", mode);
mkdirSync(OUT, { recursive: true });

const SLUGS = [
  ["Cultura e Artes", "cultura-e-artes"],
  ["Esporte e Atividade Física", "esporte-e-atividade-fisica"],
  ["Cursos e Formação", "cursos-e-formacao"],
  ["Eventos e Encontros", "eventos-e-encontros"],
  ["Saúde e Bem-Estar", "saude-e-bem-estar"],
  ["Lazer e Recreação", "lazer-e-recreacao"],
];

// Atividades variadas: categorias diferentes, com e sem imagem, título longo.
function sampleActivities(count) {
  return Array.from({ length: count }, (_, i) => {
    const [name, slug] = SLUGS[i % SLUGS.length];
    const base = makeActivity(i + 1, {
      title: i === 4 ? "Oficina de criação coletiva de histórias em quadrinhos e narrativas visuais" : `Atividade de teste ${i + 1}`,
      category: { id: `c${i}`, name, slug },
    });
    return i % 3 === 1 ? withImage(base, { url: `${BASE}/images/hero-culture.svg`, alt: "Ilustração de atividades culturais" }) : base;
  });
}

const WIDTHS_ALL = [320, 768, 1440];
const WIDTHS_WIDE = [320, 375, 768, 1024, 1440];

async function serverUp() {
  try {
    return (await fetch(`${BASE}/index.html`)).ok;
  } catch {
    return false;
  }
}

async function shot(browser, { page: name, state, widths, url, api = {}, act }) {
  for (const width of widths) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    await mockApi(page, api);
    await page.goto(`${BASE}/${url}`);
    await page.waitForLoadState("networkidle");
    if (act) await act(page);
    await page.waitForTimeout(150);
    await page.screenshot({ path: join(OUT, `${name}-${state}-${width}.png`), fullPage: true });
    await context.close();
  }
}

const withResults = { activities: sampleActivities(6) };
const empty = { activities: [] };
const failing = { failActivities: 500 };

const jobs = [
  { page: "inicio", state: "resultados", widths: WIDTHS_WIDE, url: "index.html", api: { activities: sampleActivities(3) } },
  { page: "inicio", state: "vazio", widths: WIDTHS_ALL, url: "index.html", api: empty },
  { page: "inicio", state: "erro", widths: WIDTHS_ALL, url: "index.html", api: failing },
  { page: "explorar", state: "resultados", widths: WIDTHS_WIDE, url: "explorar.html", api: withResults },
  { page: "explorar", state: "vazio", widths: WIDTHS_ALL, url: "explorar.html", api: empty },
  { page: "explorar", state: "erro", widths: WIDTHS_ALL, url: "explorar.html", api: failing },
  {
    page: "detalhes",
    state: "resultados",
    widths: WIDTHS_ALL,
    url: `atividade.html?id=${DETAILS_ID}`,
    api: { detailsResponder: () => ({ body: makeDetails() }) },
  },
  { page: "detalhes", state: "nao-encontrada", widths: WIDTHS_ALL, url: `atividade.html?id=${DETAILS_ID}`, api: {} },
  { page: "sobre", state: "resultados", widths: WIDTHS_ALL, url: "sobre.html" },
  { page: "contato", state: "resultados", widths: WIDTHS_ALL, url: "contato.html" },
  {
    page: "contato",
    state: "confirmacao",
    widths: WIDTHS_ALL,
    url: "contato.html",
    act: async (page) => {
      await page.fill("#contact-name", "Maria Exemplo");
      await page.fill("#contact-email", "maria@exemplo.com");
      await page.fill("#contact-subject", "Dúvida sobre atividades");
      await page.fill("#contact-message", "Mensagem de teste para a captura de telas.");
      await page.click("#contact-form button[type=submit]");
      await page.waitForSelector("#contact-confirmation:not([hidden])");
    },
  },
];

let server = null;
if (!(await serverUp())) {
  server = spawn("python", ["tests/static-server.py", String(PORT)], { cwd: ROOT, stdio: "ignore" });
  for (let i = 0; i < 50 && !(await serverUp()); i += 1) await new Promise((r) => setTimeout(r, 200));
}

const browser = await chromium.launch();
try {
  for (const job of jobs) await shot(browser, job);
  console.log(`Capturas gravadas em ${OUT}`);
} finally {
  await browser.close();
  server?.kill();
}
