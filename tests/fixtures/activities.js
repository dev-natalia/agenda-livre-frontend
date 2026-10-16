// Fixtures sintéticas e reproduzíveis das respostas da API pública (DOC-05), compartilhadas pelos
// testes de unidade e de navegador. Nenhum dado pessoal real. Casos: DOC-14 §12.
// Campo `image`: { url, alt, decorative } ou null (specs/010-testing-quality/contracts/api-image-contract.md).

export function makeActivity(n, overrides = {}) {
  return {
    id: `550e8400-e29b-41d4-a716-44665544${String(n).padStart(4, "0")}`,
    title: `Atividade de teste ${n}`,
    slug: `atividade-de-teste-${n}`,
    summary: "Resumo.",
    unit: { id: "u1", name: "CEU Navegantes", slug: "ceu-navegantes", neighborhood: "Grajaú" },
    category: { id: "c1", name: "Cultura e Artes", slug: "cultura-e-artes" },
    next_occurrence: { date: "2026-11-20", start_time: "14:00", end_time: "15:00" },
    target_audiences: [{ id: "55555555-5555-4555-8555-555555555551", name: "Adultos" }],
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

export const AUDIENCES = [
  { id: "55555555-5555-4555-8555-555555555551", name: "Adultos", slug: "adultos", description: null },
  { id: "55555555-5555-4555-8555-555555555552", name: "Crianças", slug: "criancas", description: null },
  { id: "55555555-5555-4555-8555-555555555553", name: "Todas as idades", slug: "todas-as-idades", description: null },
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

// ---- Casos do DOC-14 §12 ----

// Listagem e detalhe com imagem informativa ou decorativa.
export function withImage(activity, { alt = "Participantes em atividade no CEU", decorative = false, url = "https://imagens.example.com/atividade.webp" } = {}) {
  return { ...activity, image: { url, alt: decorative ? "" : alt, decorative } };
}

// Atividade sem imagem, no formato com o campo presente.
export function withNullImage(activity) {
  return { ...activity, image: null };
}

// Detalhe sem URL externa de inscrição.
export function makeDetailsNoUrl(overrides = {}) {
  return makeDetails({ external_registration_url: null, ...overrides });
}

// Detalhe só com os campos obrigatórios: opcionais ausentes ou vazios.
export function makeDetailsMinimal(overrides = {}) {
  return {
    id: DETAILS_ID,
    title: "Atividade mínima",
    slug: "atividade-minima",
    unit: null,
    category: null,
    target_audiences: [],
    external_registration_url: null,
    schedules: [],
    next_occurrences: [],
    ...overrides,
  };
}

// Atividade recorrente (terças e quintas), com próxima ocorrência.
export function makeRecurring(overrides = {}) {
  return makeDetails({
    schedules: [
      {
        id: "s-rec",
        schedule_type: "RECURRING",
        start_date: "2026-11-01",
        end_date: "2026-12-31",
        start_time: "14:00",
        end_time: "15:00",
        weekdays: [2, 4],
        weekday_names: ["Terça-feira", "Quinta-feira"],
      },
    ],
    ...overrides,
  });
}

// Listagem vazia (200 com count: 0).
export function makeEmptyListing() {
  return { count: 0, next: null, previous: null, results: [] };
}

// Atividade cancelada ou encerrada: a API pública responde o mesmo 404 do inexistente.
export function makeUnavailableResponse() {
  return { status: 404, body: { detail: "Não encontrado." } };
}

// Texto hostil: marcação, aspas, & e esquemas perigosos. Só para testes de segurança.
export const HOSTILE_TEXT =
  `<script>window.__pwned=1</script><img src=x onerror="window.__pwned=1"> "aspas" 'simples' & &amp; <b>negrito</b> javascript:alert(1) data:text/html,<p>x</p>`;
