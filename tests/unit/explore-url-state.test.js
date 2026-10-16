import { describe, expect, it } from "vitest";
import {
  buildExploreSearch,
  inferPeriod,
  parseExploreSearch,
  toApiParams,
} from "../../js/explore/url-state.js";

const HOJE = "2026-10-11";
const UNIT = "11111111-1111-4111-8111-111111111111";
const CATEGORY = "33333333-3333-4333-8333-333333333333";
const base = { term: "", unit: "", category: "", audience: "", period: "any" };

describe("parseExploreSearch", () => {
  it("sem parâmetros: critérios padrão, página 1 e nada alterado", () => {
    expect(parseExploreSearch("", HOJE)).toEqual({ criteria: base, page: 1, changed: false });
    expect(parseExploreSearch("?", HOJE).changed).toBe(false);
  });

  it("lê termo, unidade, categoria e página", () => {
    const { criteria, page, changed } = parseExploreSearch(
      `?q=dan%C3%A7a&unit=${UNIT}&category=${CATEGORY}&page=3`,
      HOJE,
    );
    expect(criteria).toEqual({ term: "dança", unit: UNIT, category: CATEGORY, audience: "", period: "any" });
    expect(page).toBe(3);
    expect(changed).toBe(false);
  });

  it("aplica trim ao termo, só espaços vira vazio e corta em 100 caracteres", () => {
    expect(parseExploreSearch("?q=%20%20oficina%20%20", HOJE).criteria.term).toBe("oficina");
    const blank = parseExploreSearch("?q=%20%20%20", HOJE);
    expect(blank.criteria.term).toBe("");
    expect(blank.changed).toBe(true);
    const long = parseExploreSearch(`?q=${"a".repeat(150)}`, HOJE);
    expect(long.criteria.term).toHaveLength(100);
    expect(long.changed).toBe(true);
  });

  it("ignora unit/category que não sejam UUID", () => {
    const { criteria, changed } = parseExploreSearch("?unit=xyz&category=123", HOJE);
    expect(criteria.unit).toBe("");
    expect(criteria.category).toBe("");
    expect(changed).toBe(true);
  });

  it.each(["0", "-2", "1.5", "abc", "", "99999999999999999999"])("page=%s vira 1", (value) => {
    expect(parseExploreSearch(`?page=${value}`, HOJE).page).toBe(1);
  });

  it("traduz a chave period (fallback sem JavaScript) e ignora chaves desconhecidas", () => {
    const week = parseExploreSearch("?period=week", HOJE);
    expect(week.criteria.period).toBe("week");
    expect(week.changed).toBe(true);
    expect(parseExploreSearch("?period=ontem", HOJE).criteria.period).toBe("any");
    expect(parseExploreSearch("?period=any", HOJE).criteria.period).toBe("any");
  });

  it("reconhece os períodos pelas datas de hoje", () => {
    expect(parseExploreSearch(`?date=${HOJE}`, HOJE).criteria.period).toBe("today");
    expect(parseExploreSearch(`?date=${HOJE}`, HOJE).changed).toBe(false);
    expect(parseExploreSearch(`?date_from=${HOJE}&date_to=2026-10-17`, HOJE).criteria.period).toBe("week");
    expect(parseExploreSearch(`?date_from=${HOJE}&date_to=2026-10-31`, HOJE).criteria.period).toBe("month");
  });

  it("descarta datas que não coincidem com nenhum período de hoje", () => {
    for (const search of [
      "?date=2026-10-10",
      "?date=2026-02-31",
      "?date=abc",
      "?date_from=2026-10-01&date_to=2026-10-31",
      `?date_from=${HOJE}`,
      "?date_to=2026-10-31",
      `?date_from=${HOJE}&date_to=2026-10-18`,
    ]) {
      const result = parseExploreSearch(search, HOJE);
      expect(result.criteria.period, search).toBe("any");
      expect(result.changed, search).toBe(true);
    }
  });

  it("nunca produz date junto de date_from/date_to", () => {
    const { criteria } = parseExploreSearch(`?date=${HOJE}&date_from=${HOJE}&date_to=2026-10-17`, HOJE);
    const keys = [...new URLSearchParams(buildExploreSearch(criteria, 1, HOJE)).keys()];
    expect(keys.includes("date") && keys.includes("date_from")).toBe(false);
    expect(criteria.period).toBe("week");
  });

  it("ignora parâmetros desconhecidos e marca como alterado", () => {
    const result = parseExploreSearch("?foo=bar&q=a", HOJE);
    expect(result.criteria.term).toBe("a");
    expect(result.changed).toBe(true);
  });

  it("virada de mês e de ano", () => {
    expect(parseExploreSearch("?date_from=2026-12-28&date_to=2027-01-03", "2026-12-28").criteria.period).toBe("week");
    expect(parseExploreSearch("?date_from=2026-12-28&date_to=2026-12-31", "2026-12-28").criteria.period).toBe("month");
    expect(parseExploreSearch("?date_from=2028-02-20&date_to=2028-02-29", "2028-02-20").criteria.period).toBe("month");
  });
});

describe("buildExploreSearch", () => {
  it("sem critérios e na página 1: vazio", () => {
    expect(buildExploreSearch(base, 1, HOJE)).toBe("");
  });

  it("escreve na ordem q, unit, category, date, date_from, date_to, page", () => {
    const search = buildExploreSearch({ term: "oficina", unit: UNIT, category: CATEGORY, period: "week" }, 2, HOJE);
    expect([...new URLSearchParams(search).keys()]).toEqual(["q", "unit", "category", "date_from", "date_to", "page"]);
    expect(new URLSearchParams(search).get("date_to")).toBe("2026-10-17");
  });

  it("período today usa só date; any não escreve datas; page 1 é omitida", () => {
    expect(buildExploreSearch({ ...base, period: "today" }, 1, HOJE)).toBe(`date=${HOJE}`);
    expect(buildExploreSearch({ ...base, term: "a" }, 1, HOJE)).toBe("q=a");
  });

  it("codifica acentos, &, #, aspas e espaços sem corromper", () => {
    const term = 'dança & "arte" #1';
    const search = buildExploreSearch({ ...base, term }, 1, HOJE);
    expect(new URLSearchParams(search).get("q")).toBe(term);
    expect(search).not.toContain("#");
    expect(parseExploreSearch(`?${search}`, HOJE).criteria.term).toBe(term);
  });

  it("ida e volta mantém os critérios", () => {
    const criteria = { term: "teatro", unit: UNIT, category: CATEGORY, audience: "55555555-5555-4555-8555-555555555551", period: "month" };
    const search = buildExploreSearch(criteria, 4, HOJE);
    expect(parseExploreSearch(`?${search}`, HOJE)).toEqual({ criteria, page: 4, changed: false });
  });
});

describe("inferPeriod", () => {
  it("ausência de datas é any", () => {
    expect(inferPeriod({}, HOJE)).toBe("any");
  });

  it("prefere week quando week e month coincidem", () => {
    expect(inferPeriod({ date_from: "2026-10-25", date_to: "2026-10-31" }, "2026-10-25")).toBe("week");
  });
});

describe("toApiParams", () => {
  it("só envia o que foi escolhido", () => {
    expect(toApiParams(base, HOJE)).toEqual({});
    expect(toApiParams({ term: "x", unit: UNIT, category: "", period: "today" }, HOJE)).toEqual({
      q: "x",
      unit: UNIT,
      date: HOJE,
    });
    expect(toApiParams({ ...base, period: "week" }, HOJE)).toEqual({ date_from: HOJE, date_to: "2026-10-17" });
  });
});

describe("audience (feature 012)", () => {
  const AUDIENCE = "55555555-5555-4555-8555-555555555551";

  it("lê um UUID válido e ignora o malformado, reescrevendo o endereço", () => {
    expect(parseExploreSearch(`?audience=${AUDIENCE}`, HOJE)).toMatchObject({
      criteria: { audience: AUDIENCE },
      changed: false,
    });
    expect(parseExploreSearch("?audience=abc", HOJE)).toMatchObject({ criteria: { audience: "" }, changed: true });
  });

  it("com o parâmetro repetido vale o primeiro", () => {
    const other = "55555555-5555-4555-8555-555555555552";
    const { criteria, changed } = parseExploreSearch(`?audience=${AUDIENCE}&audience=${other}`, HOJE);
    expect(criteria.audience).toBe(AUDIENCE);
    expect(changed).toBe(true);
  });

  it("escreve entre category e as datas, só quando escolhido", () => {
    const criteria = { ...base, unit: UNIT, category: CATEGORY, audience: AUDIENCE, period: "today" };
    const keys = [...new URLSearchParams(buildExploreSearch(criteria, 2, HOJE)).keys()];
    expect(keys).toEqual(["unit", "category", "audience", "date", "page"]);
    expect(buildExploreSearch(base, 1, HOJE)).toBe("");
  });

  it("toApiParams inclui audience só quando preenchido", () => {
    expect(toApiParams({ ...base, audience: AUDIENCE }, HOJE)).toEqual({ audience: AUDIENCE });
    expect(toApiParams(base, HOJE)).toEqual({});
  });
});
