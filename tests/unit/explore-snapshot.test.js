// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import {
  MAX_ENTRIES,
  TTL_MS,
  readSnapshot,
  saveSnapshot,
  updateScroll,
} from "../../js/explore/snapshot.js";

const NOW = 1_700_000_000_000;
const activity = (n) => ({
  id: `id-${n}`,
  title: `Atividade ${n}`,
  slug: "x",
  summary: "não deve ser guardado",
  unit: { id: "u", name: "CEU", neighborhood: "Grajaú", slug: "ceu" },
  category: { id: "c", name: "Cultura", slug: "cultura" },
  next_occurrence: { date: "2026-11-20", start_time: "14:00", end_time: "15:00" },
  target_audiences: [{ id: "a1", name: "Adultos", slug: "adultos" }],
});
const data = (n = 3) => ({
  count: 27,
  next: "http://x/?page=2",
  previous: null,
  results: Array.from({ length: n }, (_, i) => activity(i + 1)),
});

beforeEach(() => sessionStorage.clear());

describe("snapshot da listagem", () => {
  it("guarda e lê a cópia dentro da validade, só com os campos usados", () => {
    saveSnapshot("q=a", data(), NOW);
    const snap = readSnapshot("q=a", NOW + 1000);
    expect(snap.count).toBe(27);
    expect(snap.next).toBe("http://x/?page=2");
    expect(snap.previous).toBeNull();
    expect(snap.results).toHaveLength(3);
    expect(snap.results[0]).toEqual({
      id: "id-1",
      title: "Atividade 1",
      unit: { name: "CEU", neighborhood: "Grajaú" },
      category: { name: "Cultura", slug: "cultura" },
      next_occurrence: { date: "2026-11-20", start_time: "14:00", end_time: "15:00" },
      target_audiences: [{ id: "a1", name: "Adultos" }],
    });
    expect(snap.scrollY).toBe(0);
    expect(snap.activityId).toBeNull();
  });

  it("5 minutos de validade", () => {
    expect(TTL_MS).toBe(5 * 60 * 1000);
    saveSnapshot("q=a", data(), NOW);
    expect(readSnapshot("q=a", NOW + TTL_MS)).not.toBeNull();
    expect(readSnapshot("q=a", NOW + TTL_MS + 1)).toBeNull();
    // cópia vencida é descartada
    expect(readSnapshot("q=a", NOW)).toBeNull();
  });

  it("usa a chave agenda-livre:explore:<search>", () => {
    saveSnapshot("q=a&page=2", data(), NOW);
    expect(sessionStorage.getItem("agenda-livre:explore:q=a&page=2")).not.toBeNull();
    expect(readSnapshot("q=b", NOW)).toBeNull();
  });

  it("updateScroll atualiza a entrada existente e preserva o card quando não informado", () => {
    saveSnapshot("", data(), NOW);
    updateScroll("", 480, "id-2");
    updateScroll("", 500, null);
    const snap = readSnapshot("", NOW);
    expect(snap.scrollY).toBe(500);
    expect(snap.activityId).toBe("id-2");
  });

  it("updateScroll sem cópia não cria nada", () => {
    updateScroll("q=zzz", 100, "id-1");
    expect(readSnapshot("q=zzz", NOW)).toBeNull();
  });

  it("mantém no máximo 10 entradas, descartando as mais antigas", () => {
    expect(MAX_ENTRIES).toBe(10);
    for (let i = 0; i < 12; i += 1) saveSnapshot(`q=${i}`, data(), NOW + i);
    expect(readSnapshot("q=0", NOW + 12)).toBeNull();
    expect(readSnapshot("q=1", NOW + 12)).toBeNull();
    expect(readSnapshot("q=2", NOW + 12)).not.toBeNull();
    expect(readSnapshot("q=11", NOW + 12)).not.toBeNull();
    const keys = Object.keys(sessionStorage).filter((key) => key.startsWith("agenda-livre:explore:") && !key.endsWith("__index"));
    expect(keys).toHaveLength(10);
  });

  it.each([
    ["JSON corrompido", "{nao é json"],
    ["não é objeto", "42"],
    ["results ausente", JSON.stringify({ savedAt: NOW, count: 1 })],
    ["savedAt inválido", JSON.stringify({ savedAt: "x", results: [] })],
  ])("entrada inválida (%s) é tratada como ausente", (_name, raw) => {
    sessionStorage.setItem("agenda-livre:explore:q=a", raw);
    expect(readSnapshot("q=a", NOW)).toBeNull();
  });

  it("sessionStorage indisponível não lança", () => {
    const storage = {
      getItem() {
        throw new Error("blocked");
      },
      setItem() {
        throw new Error("blocked");
      },
      removeItem() {
        throw new Error("blocked");
      },
    };
    expect(() => saveSnapshot("q=a", data(), NOW, storage)).not.toThrow();
    expect(readSnapshot("q=a", NOW, storage)).toBeNull();
    expect(() => updateScroll("q=a", 10, null, storage)).not.toThrow();
  });

  it("dados sem results não são guardados", () => {
    saveSnapshot("q=a", { count: 1 }, NOW);
    expect(readSnapshot("q=a", NOW)).toBeNull();
  });
});

describe("target_audiences na cópia (feature 012)", () => {
  it("atividade sem o campo guarda lista vazia", () => {
    const { target_audiences: _omit, ...legacy } = activity(1);
    saveSnapshot("q=b", { count: 1, next: null, previous: null, results: [legacy] }, NOW);
    expect(readSnapshot("q=b", NOW + 1).results[0].target_audiences).toEqual([]);
  });
});
