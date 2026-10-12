// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { initContactForm } from "../../js/contact/form.js";
import { mountContactDom } from "./helpers/dom.js";

let dom;
const FIELDS = ["name", "email", "subject", "message"];
const VALID = {
  name: "Maria Silva",
  email: "maria@exemplo.com",
  subject: "Dúvida",
  message: "Gostaria de saber mais sobre as atividades.",
};

function fill(values) {
  for (const [field, value] of Object.entries(values)) dom[field].value = value;
}

function submit() {
  dom.form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
}

const errorOf = (field) => document.getElementById(`${field}-error`);

describe("formulário de contato", () => {
  let fetchSpy;

  beforeEach(() => {
    dom = mountContactDom();
    fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    initContactForm();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("não lança quando a página não tem o formulário", () => {
    document.body.innerHTML = "<main></main>";
    expect(() => initContactForm()).not.toThrow();
  });

  it("habilita o botão de envio, que nasce desabilitado no HTML", () => {
    expect(dom.form.querySelector('button[type="submit"]').disabled).toBe(false);
  });

  it("não mostra erros antes do primeiro envio", () => {
    expect(document.querySelectorAll(".field-error")).toHaveLength(0);
    expect(document.querySelectorAll("[aria-invalid]")).toHaveLength(0);
  });

  describe("envio inválido", () => {
    it("formulário vazio: quatro erros, aria-invalid, foco no primeiro e resumo", () => {
      submit();
      expect(document.querySelectorAll(".field-error")).toHaveLength(4);
      for (const f of FIELDS) {
        expect(errorOf(f).tagName).toBe("P");
        expect(dom[f].getAttribute("aria-invalid")).toBe("true");
        expect(dom[f].getAttribute("aria-describedby")).toBe(`${f}-hint ${f}-error`);
      }
      expect(errorOf("name").textContent).toBe("Informe seu nome.");
      expect(document.activeElement).toBe(dom.name);
      expect(dom.summary.textContent).toBe("4 campos precisam de correção.");
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("um campo inválido: resumo no singular e foco nele", () => {
      fill({ ...VALID, email: "abc" });
      submit();
      expect(dom.summary.textContent).toBe("1 campo precisa de correção.");
      expect(document.activeElement).toBe(dom.email);
      expect(errorOf("email").textContent).toBe("Informe um e-mail válido, como nome@exemplo.com.");
      expect(errorOf("name")).toBeNull();
    });

    it("preserva todos os valores, válidos e inválidos", () => {
      fill({ ...VALID, email: "abc", message: "curta" });
      submit();
      expect(dom.name.value).toBe(VALID.name);
      expect(dom.subject.value).toBe(VALID.subject);
      expect(dom.email.value).toBe("abc");
      expect(dom.message.value).toBe("curta");
      expect(dom.summary.textContent).toBe("2 campos precisam de correção.");
    });

    it("corrigir um campo remove só o erro dele, sem mexer no resumo", () => {
      submit();
      dom.name.value = "Ana";
      dom.name.dispatchEvent(new Event("input", { bubbles: true }));
      expect(errorOf("name")).toBeNull();
      expect(dom.name.hasAttribute("aria-invalid")).toBe(false);
      expect(dom.name.getAttribute("aria-describedby")).toBe("name-hint");
      expect(errorOf("email")).not.toBeNull();
      expect(dom.summary.textContent).toBe("4 campos precisam de correção.");
    });

    it("um valor ainda inválido mantém o erro e não cria erros em outros campos", () => {
      fill({ ...VALID, name: "" });
      submit();
      dom.name.value = "A";
      dom.name.dispatchEvent(new Event("input", { bubbles: true }));
      expect(errorOf("name")).not.toBeNull();
      dom.email.value = "";
      dom.email.dispatchEvent(new Event("input", { bubbles: true }));
      expect(errorOf("email")).toBeNull();
    });

    it("envios inválidos repetidos não duplicam erros nem acumulam o resumo", () => {
      submit();
      submit();
      expect(document.querySelectorAll(".field-error")).toHaveLength(4);
      expect(dom.summary.textContent).toBe("4 campos precisam de correção.");
    });
  });

  describe("envio válido e confirmação", () => {
    beforeEach(() => {
      fill(VALID);
      submit();
    });

    it("troca o formulário pelo painel e foca o título do painel", () => {
      expect(dom.form.hidden).toBe(true);
      expect(dom.confirmation.hidden).toBe(false);
      expect(document.activeElement).toBe(dom.confirmation.querySelector("h2"));
      expect(document.querySelectorAll(".field-error")).toHaveLength(0);
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("afirma que é demonstrativo e nunca sugere envio ou recebimento", () => {
      const text = dom.confirmation.textContent;
      expect(text).toMatch(/demonstrativo/i);
      expect(text).toMatch(/Nenhuma mensagem foi enviada/);
      expect(text).not.toMatch(/recebida|recebemos|enviada com sucesso|entregue|retornaremos|responderemos/i);
    });

    it("anuncia a confirmação por região de status, uma vez", () => {
      const region = dom.confirmation.querySelector("[role=status]");
      expect(region).not.toBeNull();
      expect(region.textContent).toMatch(/nenhuma mensagem foi enviada/i);
      expect(document.querySelectorAll("#contact-confirmation [role=status]")).toHaveLength(1);
    });

    it("não repete os valores digitados no painel", () => {
      expect(dom.confirmation.textContent).not.toContain(VALID.name);
      expect(dom.confirmation.textContent).not.toContain(VALID.email);
    });

    it("voltar ao formulário preserva valores, remove erros e foca o primeiro campo", () => {
      dom.back.click();
      expect(dom.form.hidden).toBe(false);
      expect(dom.confirmation.hidden).toBe(true);
      for (const f of FIELDS) expect(dom[f].value).toBe(VALID[f]);
      expect(document.querySelectorAll(".field-error, [aria-invalid]")).toHaveLength(0);
      expect(dom.summary.textContent).toBe("");
      expect(document.activeElement).toBe(dom.name);
    });

    it("voltar e limpar esvazia os campos e foca o primeiro", () => {
      dom.back.click();
      dom.clear.click();
      for (const f of FIELDS) expect(dom[f].value).toBe("");
      expect(document.activeElement).toBe(dom.name);
    });

    it("é possível enviar de novo depois de voltar", () => {
      dom.back.click();
      submit();
      expect(dom.confirmation.hidden).toBe(false);
      expect(document.querySelectorAll("#contact-confirmation")).toHaveLength(1);
    });
  });

  it("limpar com erros exibidos remove erros, resumo e aria-invalid", () => {
    fill({ ...VALID, email: "abc" });
    submit();
    dom.clear.click();
    for (const f of FIELDS) expect(dom[f].value).toBe("");
    expect(document.querySelectorAll(".field-error, [aria-invalid]")).toHaveLength(0);
    expect(dom.summary.textContent).toBe("");
    expect(document.activeElement).toBe(dom.name);
  });

  it("marcação digitada nunca vira elemento", () => {
    fill({ ...VALID, subject: "<img src=x onerror=alert(1)>", name: "<b>x</b>y" });
    submit();
    dom.back.click();
    expect(document.querySelector("main img")).toBeNull();
    expect(document.querySelector("main b")).toBeNull();
    fill({ email: "<i>" });
    submit();
    expect(document.querySelector("main i")).toBeNull();
  });
});
