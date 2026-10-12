import { describe, expect, it } from "vitest";
import { scheduleViews } from "../../js/details/schedule-model.js";

const oneTime = (over = {}) => ({
  id: "s1",
  schedule_type: "ONE_TIME",
  start_date: "2026-11-20",
  end_date: "2026-11-20",
  start_time: "14:00",
  end_time: "15:00",
  weekdays: [],
  weekday_names: [],
  ...over,
});
const recurring = (over = {}) => ({
  id: "s2",
  schedule_type: "RECURRING",
  start_date: "2026-11-01",
  end_date: "2026-12-31",
  start_time: "14:00",
  end_time: "15:00",
  weekdays: [2, 4],
  weekday_names: ["Terça-feira", "Quinta-feira"],
  ...over,
});

describe("scheduleViews", () => {
  it("pontual: data e horário, sem dias da semana", () => {
    const { items } = scheduleViews([oneTime()], []);
    expect(items).toHaveLength(1);
    expect(items[0].kind).toBe("one-time");
    expect(items[0].periodLabel).toMatch(/20 de novembro de 2026/);
    expect(items[0].timeLabel).toBe("14h00 às 15h00");
    expect(items[0].weekdaysLabel).toBeNull();
  });

  it("pontual: só início, ou só data", () => {
    expect(scheduleViews([oneTime({ end_time: null })], []).items[0].timeLabel).toBe("14h00");
    const none = scheduleViews([oneTime({ start_time: null, end_time: null })], []).items[0];
    expect(none.timeLabel).toBeNull();
    expect(none.periodLabel).toMatch(/20 de novembro de 2026/);
  });

  it("recorrente: período, dias por extenso e horário", () => {
    const { items } = scheduleViews([recurring()], []);
    expect(items[0].kind).toBe("recurring");
    expect(items[0].periodLabel).toMatch(/1 de novembro de 2026.*31 de dezembro de 2026/);
    expect(items[0].weekdaysLabel).toBe("Terça-feira e Quinta-feira");
    expect(items[0].timeLabel).toBe("14h00 às 15h00");
  });

  it("junta três ou mais dias com vírgulas e 'e' no fim", () => {
    const names = ["Segunda-feira", "Quarta-feira", "Sexta-feira"];
    expect(scheduleViews([recurring({ weekday_names: names })], []).items[0].weekdaysLabel).toBe(
      "Segunda-feira, Quarta-feira e Sexta-feira",
    );
    expect(scheduleViews([recurring({ weekday_names: ["Sábado"] })], []).items[0].weekdaysLabel).toBe("Sábado");
    expect(scheduleViews([recurring({ weekday_names: [] })], []).items[0].weekdaysLabel).toBeNull();
  });

  it("mantém a ordem da API com várias programações", () => {
    const { items } = scheduleViews([recurring(), oneTime()], []);
    expect(items.map((i) => i.kind)).toEqual(["recurring", "one-time"]);
  });

  it("próximas ocorrências com rótulo e datetime, na ordem recebida", () => {
    const { upcoming } = scheduleViews([], [
      { date: "2026-11-05", start_time: "14:00", end_time: "15:00" },
      { date: "2026-11-03", start_time: null, end_time: null },
    ]);
    expect(upcoming).toHaveLength(2);
    expect(upcoming[0].datetime).toBe("2026-11-05T14:00");
    expect(upcoming[0].label).toContain("14h00 às 15h00");
    expect(upcoming[1].datetime).toBe("2026-11-03");
  });

  it("entradas ausentes, vazias ou inválidas não quebram e são omitidas", () => {
    expect(scheduleViews(undefined, undefined)).toEqual({ items: [], upcoming: [] });
    expect(scheduleViews(null, null)).toEqual({ items: [], upcoming: [] });
    expect(scheduleViews([], [])).toEqual({ items: [], upcoming: [] });
    const out = scheduleViews([null, 3, oneTime({ start_date: "lixo", end_date: "lixo" })], [null, { date: "x" }]);
    expect(out.items).toEqual([]);
    expect(out.upcoming).toEqual([]);
  });

  it("hora inválida é descartada, mantendo a data", () => {
    const { items } = scheduleViews([oneTime({ start_time: "25:99", end_time: "xx" })], []);
    expect(items[0].timeLabel).toBeNull();
  });
});
