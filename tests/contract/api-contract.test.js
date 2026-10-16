import { describe, expect, it } from "vitest";

// Verificação OPCIONAL do contrato com a API real (specs/010-testing-quality/contracts/contract-check.md).
// Somente GET, nada é gravado, nenhum dado pessoal é usado. Uso:
//   API_BASE_URL=http://localhost:8000/api/v1 npm run test:contract
// Divergências devem ser registradas em docs/PENDENCIAS-BACKEND.md.
const API = (process.env.API_BASE_URL ?? "").replace(/\/+$/, "");

async function get(path) {
  const response = await fetch(`${API}${path}`, { method: "GET", headers: { Accept: "application/json" } });
  const text = await response.text();
  let body = null;
  try {
    body = JSON.parse(text);
  } catch {
    // corpo não JSON: o teste que depende dele falha com a mensagem "esperado X, observado Y"
  }
  return { status: response.status, body };
}

const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

function expectEnvelope(body) {
  expect(isObject(body), `esperado envelope paginado, observado ${JSON.stringify(body)?.slice(0, 80)}`).toBe(true);
  for (const key of ["count", "next", "previous", "results"]) {
    expect(body, `envelope sem "${key}"`).toHaveProperty(key);
  }
  expect(typeof body.count).toBe("number");
  expect(Array.isArray(body.results)).toBe(true);
}

function expectImageField(item, where) {
  if (!("image" in item) || item.image === null) return; // backend sem a feature de imagens, ou atividade sem imagem
  const { url, alt, decorative } = item.image;
  expect(() => new URL(url), `${where}: image.url deve ser absoluta`).not.toThrow();
  expect(["http:", "https:"], `${where}: image.url deve ser http(s)`).toContain(new URL(url).protocol);
  expect(typeof alt, `${where}: image.alt deve ser texto`).toBe("string");
  expect(typeof decorative, `${where}: image.decorative deve ser booleano`).toBe("boolean");
}

if (!API) {
  describe("contrato com a API real", () => {
    it.todo("API_BASE_URL não informada; verificação de contrato não executada");
  });
}

describe.skipIf(!API)("contrato com a API real", () => {
  it("lista paginada: envelope e campos usados pelos cartões", async () => {
    const { status, body } = await get("/activities/");
    expect(status).toBe(200);
    expectEnvelope(body);
    for (const item of body.results) {
      expect(typeof item.id, "item sem id").toBe("string");
      expect(typeof item.title, "item sem title").toBe("string");
      expect(item, "item sem next_occurrence").toHaveProperty("next_occurrence");
      expectImageField(item, `lista/${item.id}`);
    }
  });

  it("busca pelo título do primeiro item devolve ao menos um resultado", async (ctx) => {
    const { body } = await get("/activities/");
    if (!body?.results?.length) return ctx.skip();
    const term = body.results[0].title.split(/\s+/)[0];
    const found = await get(`/activities/?q=${encodeURIComponent(term)}`);
    expect(found.status).toBe(200);
    expect(found.body.count).toBeGreaterThanOrEqual(1);
  });

  it("lista vazia é 200 com count 0", async () => {
    const { status, body } = await get("/activities/?q=zzzz-inexistente-zzzz");
    expect(status).toBe(200);
    expectEnvelope(body);
    expect(body.count).toBe(0);
    expect(body.results).toEqual([]);
  });

  it("filtro inválido é 400 com errors", async () => {
    const { status, body } = await get("/activities/?date_from=invalido");
    expect(status).toBe(400);
    expect(isObject(body?.errors), "400 sem o objeto errors").toBe(true);
  });

  it("página fora do intervalo é 400 com errors.page", async () => {
    const { status, body } = await get("/activities/?page=999");
    expect(status, "contrato corrigido em 2026-10-12: 400").toBe(400);
    expect(body?.errors, "400 sem errors.page").toHaveProperty("page");
  });

  it("detalhe do primeiro item traz os campos que a página usa", async (ctx) => {
    const list = await get("/activities/");
    if (!list.body?.results?.length) return ctx.skip();
    const { id } = list.body.results[0];
    const { status, body } = await get(`/activities/${id}/`);
    expect(status).toBe(200);
    expect(body.id).toBe(id);
    expect(typeof body.title).toBe("string");
    expect(Array.isArray(body.schedules ?? [])).toBe(true);
    expect(Array.isArray(body.next_occurrences ?? [])).toBe(true);
    expectImageField(body, `detalhe/${id}`);
  });

  it("detalhe inexistente é 404", async () => {
    const { status } = await get("/activities/00000000-0000-4000-8000-000000000000/");
    expect(status).toBe(404);
  });

  // Feature 012 (agenda-livre-backend/docs/10-filtro-por-publico-alvo.md).
  it("catálogo de públicos-alvo: envelope e campos usados pelo filtro", async () => {
    const { status, body } = await get("/audiences/?page_size=50");
    expect(status).toBe(200);
    expectEnvelope(body);
    for (const item of body.results) {
      expect(typeof item.id, "público sem id").toBe("string");
      expect(typeof item.name, "público sem name").toBe("string");
    }
  });

  it("filtro audience: UUID malformado é 400 com errors.audience; válido é 200", async (ctx) => {
    const bad = await get("/activities/?audience=abc");
    expect(bad.status).toBe(400);
    expect(bad.body?.errors, "400 sem errors.audience").toHaveProperty("audience");

    const audiences = await get("/audiences/?page_size=50");
    if (!audiences.body?.results?.length) return ctx.skip();
    const { id } = audiences.body.results[0];
    const ok = await get(`/activities/?audience=${id}`);
    expect(ok.status).toBe(200);
    expectEnvelope(ok.body);
  });

  it("itens da listagem trazem target_audiences como lista", async (ctx) => {
    const { body } = await get("/activities/");
    if (!body?.results?.length) return ctx.skip();
    for (const item of body.results) {
      expect(Array.isArray(item.target_audiences), `lista/${item.id}: target_audiences deve ser lista`).toBe(true);
    }
  });
});
