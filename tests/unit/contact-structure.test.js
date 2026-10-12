// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CONTACT_LIMITS } from "../../js/contact/validation.js";

const doc = new DOMParser().parseFromString(readFileSync("contato.html", "utf-8"), "text/html");
const $ = (id) => doc.getElementById(id);
const FIELDS = ["name", "email", "subject", "message"];

describe("estrutura de contato.html", () => {
  it("tem título, h1 único e aviso demonstrativo antes do formulário", () => {
    expect(doc.title).toBe("Contato — Agenda Livre");
    const h1 = doc.querySelectorAll("main h1");
    expect(h1).toHaveLength(1);
    expect(h1[0].textContent).toBe("Contato");
    const notice = doc.querySelector(".demo-notice");
    expect(notice.textContent).toMatch(/demonstrativo/i);
    expect(notice.textContent).toMatch(/nenhuma mensagem será enviada/i);
    const form = $("contact-form");
    expect(notice.compareDocumentPosition(form) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("o formulário não tem action e desliga a validação nativa", () => {
    const form = $("contact-form");
    expect(form.hasAttribute("action")).toBe(false);
    expect(form.hasAttribute("novalidate")).toBe(true);
  });

  it("os quatro campos têm o tipo, o autocomplete e a obrigatoriedade corretos", () => {
    const get = (f) => $(`contact-${f}`);
    expect(get("name").getAttribute("type")).toBe("text");
    expect(get("name").getAttribute("autocomplete")).toBe("name");
    expect(get("email").getAttribute("type")).toBe("email");
    expect(get("email").getAttribute("autocomplete")).toBe("email");
    expect(get("email").getAttribute("inputmode")).toBe("email");
    expect(get("subject").getAttribute("type")).toBe("text");
    expect(get("message").tagName).toBe("TEXTAREA");
    for (const f of FIELDS) {
      expect(get(f).hasAttribute("required"), f).toBe(true);
      expect(get(f).hasAttribute("maxlength"), f).toBe(false);
      expect(get(f).getAttribute("aria-describedby"), f).toBe(`${f}-hint`);
      expect($(`${f}-hint`), f).not.toBeNull();
      const label = doc.querySelector(`label[for="contact-${f}"]`);
      expect(label?.textContent.trim().length, f).toBeGreaterThan(0);
    }
  });

  it("a ordem no DOM é Nome, E-mail, Assunto, Mensagem", () => {
    const ids = [...$("contact-form").querySelectorAll("input, textarea")].map((el) => el.id);
    expect(ids).toEqual(["contact-name", "contact-email", "contact-subject", "contact-message"]);
  });

  it("indica a obrigatoriedade em texto antes dos campos", () => {
    const form = $("contact-form");
    const note = [...form.querySelectorAll("p")].find((p) => /todos os campos são obrigatórios/i.test(p.textContent));
    expect(note).toBeTruthy();
    expect(note.compareDocumentPosition($("contact-name")) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("os textos de ajuda citam os limites de CONTACT_LIMITS", () => {
    const text = (f) => $(`${f}-hint`).textContent;
    expect(text("name")).toContain(`${CONTACT_LIMITS.name.min} e ${CONTACT_LIMITS.name.max}`);
    expect(text("email")).toContain(String(CONTACT_LIMITS.email.max));
    expect(text("subject")).toContain(`${CONTACT_LIMITS.subject.min} e ${CONTACT_LIMITS.subject.max}`);
    expect(text("message")).toContain(`${CONTACT_LIMITS.message.min} e ${CONTACT_LIMITS.message.max}`);
  });

  it("tem os botões de ação, o resumo e o painel de confirmação oculto", () => {
    const form = $("contact-form");
    const submit = form.querySelector('button[type="submit"]');
    expect(submit.textContent.trim()).toBe("Enviar mensagem");
    expect(submit.hasAttribute("disabled")).toBe(true); // habilitado só por JavaScript (sem JS, nada é enviado)
    expect($("contact-clear").getAttribute("type")).toBe("button");
    expect($("contact-clear").textContent.trim()).toBe("Limpar campos");
    expect($("contact-summary").getAttribute("role")).toBe("status");
    expect($("contact-summary").textContent).toBe("");
    const panel = $("contact-confirmation");
    expect(panel.hasAttribute("hidden")).toBe(true);
    expect(panel.querySelector("h2").getAttribute("tabindex")).toBe("-1");
    expect($("contact-back").textContent.trim()).toBe("Voltar ao formulário");
  });

  it("o <noscript> repete o aviso demonstrativo", () => {
    const html = readFileSync("contato.html", "utf-8");
    const match = /<noscript>([\s\S]*?)<\/noscript>/.exec(html.slice(html.indexOf("<main")));
    expect(match).not.toBeNull();
    expect(match[1]).toMatch(/demonstrativo/i);
    expect(match[1]).toMatch(/nada é enviado/i);
  });
});
