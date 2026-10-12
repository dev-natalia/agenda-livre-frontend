import { describe, expect, it } from "vitest";
import { parseActivityId } from "../../js/details/id.js";

const ID = "550e8400-e29b-41d4-a716-446655440001";

describe("parseActivityId", () => {
  it("devolve o UUID válido em minúsculas", () => {
    expect(parseActivityId(`?id=${ID}`)).toBe(ID);
    expect(parseActivityId(`id=${ID.toUpperCase()}`)).toBe(ID);
    expect(parseActivityId(`?id=%20${ID}%20`)).toBe(ID);
  });

  it.each([
    [""],
    ["?"],
    ["?id="],
    ["?id=%20"],
    ["?id=abc"],
    ["?id=123"],
    [`?id=${ID}x`],
    [`?id=x${ID}`],
    [`?id=${ID}/../`],
    ["?id=javascript:alert(1)"],
    ["?outro=1"],
    [undefined],
    [null],
  ])("devolve null para %s", (search) => {
    expect(parseActivityId(search)).toBeNull();
  });

  it("com id repetido vale o primeiro", () => {
    expect(parseActivityId(`?id=${ID}&id=abc`)).toBe(ID);
    expect(parseActivityId(`?id=abc&id=${ID}`)).toBeNull();
  });

  it("ignora parâmetros desconhecidos e hash", () => {
    expect(parseActivityId(`?utm=1&id=${ID}&x=2#topo`)).toBe(ID);
  });
});
