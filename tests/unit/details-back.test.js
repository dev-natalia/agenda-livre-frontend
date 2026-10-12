// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { initBackLink } from "../../js/details/back-link.js";

const ORIGIN = "https://agenda.exemplo.org";
let link;
let historyRef;

beforeEach(() => {
  document.body.innerHTML = '<a id="back" href="explorar.html">Voltar</a>';
  link = document.getElementById("back");
  historyRef = { back: vi.fn(), length: 3 };
});

function click(init = {}) {
  const event = new MouseEvent("click", { bubbles: true, cancelable: true, button: 0, ...init });
  link.dispatchEvent(event);
  return event;
}

const setup = (referrer, over = {}) => initBackLink(link, { referrer, historyRef, origin: ORIGIN, ...over });

describe("initBackLink", () => {
  it("mantém o href para a Explorar", () => {
    setup(`${ORIGIN}/explorar.html?q=a`);
    expect(link.getAttribute("href")).toBe("explorar.html");
  });

  it.each([[`${ORIGIN}/explorar.html`], [`${ORIGIN}/explorar.html?q=dan%C3%A7a&page=2`], [`${ORIGIN}/app/explorar.html?x=1`]])(
    "vindo da Explorar (%s) usa o histórico",
    (referrer) => {
      setup(referrer);
      const event = click();
      expect(historyRef.back).toHaveBeenCalledTimes(1);
      expect(event.defaultPrevented).toBe(true);
    },
  );

  it.each([
    ["outra origem", "https://outro.org/explorar.html"],
    ["outra página", `${ORIGIN}/index.html`],
    ["sem referrer", ""],
    ["referrer inválido", "não é url"],
    ["referrer indefinido", undefined],
  ])("segue o link normal com %s", (_name, referrer) => {
    setup(referrer);
    const event = click();
    expect(historyRef.back).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });

  it("sem histórico para voltar, segue o link normal", () => {
    historyRef.length = 1;
    setup(`${ORIGIN}/explorar.html`);
    const event = click();
    expect(historyRef.back).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });

  it.each([[{ ctrlKey: true }], [{ metaKey: true }], [{ shiftKey: true }], [{ altKey: true }], [{ button: 1 }]])(
    "com modificador %j segue o link normal",
    (init) => {
      setup(`${ORIGIN}/explorar.html`);
      const event = click(init);
      expect(historyRef.back).not.toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(false);
    },
  );
});
