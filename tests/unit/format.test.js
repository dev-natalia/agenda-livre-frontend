import { describe, expect, it } from "vitest";
import { activityDetailsUrl, formatOccurrence } from "../../js/utils/format.js";

describe("formatOccurrence", () => {
  it("formata data e horário de início e fim", () => {
    expect(formatOccurrence({ date: "2026-11-20", start_time: "14:00", end_time: "15:00" })).toEqual({
      dateLabel: "sex., 20 de nov.",
      timeLabel: "14h00 às 15h00",
      datetime: "2026-11-20T14:00",
    });
  });

  it("mostra só o início quando não há fim", () => {
    const result = formatOccurrence({ date: "2026-11-20", start_time: "09:30" });
    expect(result.timeLabel).toBe("09h30");
  });

  it("deixa o horário nulo quando não há horário", () => {
    const result = formatOccurrence({ date: "2026-11-20" });
    expect(result.timeLabel).toBeNull();
    expect(result.datetime).toBe("2026-11-20");
  });

  it.each([
    [{ date: "2026-02-30", start_time: "10:00" }],
    [{ date: "20/11/2026" }],
    [{}],
    [null],
    [undefined],
    ["2026-11-20"],
  ])("devolve null para entrada inválida %#", (input) => {
    expect(formatOccurrence(input)).toBeNull();
  });

  it("ignora só o horário quando ele é inválido, mantendo a data", () => {
    const result = formatOccurrence({ date: "2026-11-20", start_time: "25:00", end_time: "26:00" });
    expect(result.timeLabel).toBeNull();
    expect(result.datetime).toBe("2026-11-20");
  });

  it("não desloca o dia, qualquer que seja o fuso do ambiente", () => {
    expect(formatOccurrence({ date: "2026-01-01" }).dateLabel).toBe("qui., 1 de jan.");
    expect(formatOccurrence({ date: "2026-12-31" }).dateLabel).toBe("qui., 31 de dez.");
  });
});

describe("activityDetailsUrl", () => {
  it("monta o endereço relativo com o id", () => {
    expect(activityDetailsUrl("550e8400-e29b-41d4-a716-446655440001")).toBe(
      "atividade.html?id=550e8400-e29b-41d4-a716-446655440001",
    );
  });

  it("codifica caracteres especiais", () => {
    expect(activityDetailsUrl("a b&c")).toBe("atividade.html?id=a+b%26c");
  });
});
