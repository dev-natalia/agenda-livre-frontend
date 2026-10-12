import { describe, expect, it } from "vitest";
import { safeExternalUrl } from "../../js/details/external-link.js";

describe("safeExternalUrl", () => {
  it("aceita http e https", () => {
    expect(safeExternalUrl("https://exemplo.org/inscricao?x=1")).toBe("https://exemplo.org/inscricao?x=1");
    expect(safeExternalUrl("http://exemplo.org")).toBe("http://exemplo.org/");
    expect(safeExternalUrl("  https://exemplo.org/a  ")).toBe("https://exemplo.org/a");
  });

  it.each([
    [null],
    [undefined],
    [42],
    [{}],
    [""],
    ["   "],
    ["javascript:alert(1)"],
    ["JaVaScRiPt:alert(1)"],
    ["data:text/html,<script>alert(1)</script>"],
    ["file:///etc/passwd"],
    ["ftp://exemplo.org/arquivo"],
    ["//exemplo.org"],
    ["/relativa"],
    ["exemplo.org"],
    ["https://usuario:senha@exemplo.org"],
    ["https://usuario@exemplo.org"],
    ["https://"],
    ["não é url"],
  ])("rejeita %j", (value) => {
    expect(safeExternalUrl(value)).toBeNull();
  });
});
