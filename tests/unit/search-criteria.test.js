import { describe, expect, it } from "vitest";
import { MAX_TERM_LENGTH, PERIODS, buildExploreUrl, normalizeTerm, periodRange } from "../../js/home/search-criteria.js";

const HOJE = "2026-10-11";
const query = (url) => new URL(url, "http://x/").searchParams;

describe("normalizeTerm", () => {
  it("remove espaços das pontas e trata só espaços como vazio", () => {
    expect(normalizeTerm("  dança  ")).toBe("dança");
    expect(normalizeTerm("   ")).toBe("");
    expect(normalizeTerm(undefined)).toBe("");
  });

  it("corta em 100 caracteres", () => {
    expect(normalizeTerm("a".repeat(150))).toHaveLength(MAX_TERM_LENGTH);
  });
});

describe("buildExploreUrl — termo", () => {
  it("codifica o termo", () => {
    expect(buildExploreUrl({ term: "dança" }, HOJE)).toBe("explorar.html?q=dan%C3%A7a");
  });

  it.each(["a & b", "#hash", "x?y=1", 'aspas "duplas"', "100%", "a+b"])("preserva %s", (term) => {
    expect(query(buildExploreUrl({ term }, HOJE)).get("q")).toBe(term);
  });

  it("sem critérios abre a listagem geral, sem query string", () => {
    expect(buildExploreUrl({}, HOJE)).toBe("explorar.html");
    expect(buildExploreUrl({ term: "  ", unit: "", category: "", period: "any" }, HOJE)).toBe("explorar.html");
    expect(buildExploreUrl(undefined, HOJE)).toBe("explorar.html");
  });
});

describe("periodRange", () => {
  it("any e desconhecido não restringem", () => {
    expect(periodRange("any", HOJE)).toEqual({});
    expect(periodRange("xyz", HOJE)).toEqual({});
  });

  it("today usa só date", () => {
    expect(periodRange("today", HOJE)).toEqual({ date: HOJE });
  });

  it("week vai de hoje a hoje+6", () => {
    expect(periodRange("week", HOJE)).toEqual({ date_from: HOJE, date_to: "2026-10-17" });
  });

  it.each([
    ["2026-10-11", "2026-10-31"],
    ["2026-10-31", "2026-10-31"],
    ["2026-02-10", "2026-02-28"],
    ["2028-02-10", "2028-02-29"],
    ["2026-12-30", "2026-12-31"],
  ])("month a partir de %s termina em %s", (hoje, fim) => {
    expect(periodRange("month", hoje)).toEqual({ date_from: hoje, date_to: fim });
  });

  it("week atravessa mês e ano", () => {
    expect(periodRange("week", "2026-12-30")).toEqual({ date_from: "2026-12-30", date_to: "2027-01-05" });
    expect(periodRange("week", "2028-02-27")).toEqual({ date_from: "2028-02-27", date_to: "2028-03-04" });
  });
});

describe("buildExploreUrl — filtros", () => {
  const UNIT = "11111111-1111-4111-8111-111111111111";
  const CATEGORY = "33333333-3333-4333-8333-333333333333";

  it("combina todos os critérios, na ordem do contrato", () => {
    const url = buildExploreUrl({ term: "oficina", unit: UNIT, category: CATEGORY, period: "week" }, HOJE);
    expect([...query(url).keys()]).toEqual(["q", "unit", "category", "date_from", "date_to"]);
    expect(Object.fromEntries(query(url))).toEqual({
      q: "oficina",
      unit: UNIT,
      category: CATEGORY,
      date_from: HOJE,
      date_to: "2026-10-17",
    });
  });

  it("hoje usa apenas date; nunca junto de date_from/date_to", () => {
    const params = query(buildExploreUrl({ period: "today" }, HOJE));
    expect(Object.fromEntries(params)).toEqual({ date: HOJE });
  });

  it("omite valores padrão e vazios", () => {
    expect(buildExploreUrl({ category: CATEGORY }, HOJE)).toBe(`explorar.html?category=${CATEGORY}`);
    expect(buildExploreUrl({ unit: "", period: "any" }, HOJE)).toBe("explorar.html");
  });

  it("PERIODS expõe as quatro opções com 'Qualquer data' primeiro", () => {
    expect(PERIODS.map((p) => p.key)).toEqual(["any", "today", "week", "month"]);
    expect(PERIODS[0].label).toBe("Qualquer data");
  });
});
