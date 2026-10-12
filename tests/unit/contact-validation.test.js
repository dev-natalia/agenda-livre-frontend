import { describe, expect, it } from "vitest";
import { CONTACT_LIMITS, validateContact } from "../../js/contact/validation.js";

const valid = {
  name: "Maria Silva",
  email: "maria@exemplo.com",
  subject: "Dúvida",
  message: "Gostaria de saber mais sobre as atividades.",
};
const rep = (n) => "a".repeat(n);
const check = (overrides) => validateContact({ ...valid, ...overrides });
const EMAIL_ERROR = "Informe um e-mail válido, como nome@exemplo.com.";

describe("CONTACT_LIMITS", () => {
  it("define os limites da spec", () => {
    expect(CONTACT_LIMITS).toEqual({
      name: { min: 2, max: 100 },
      email: { max: 254 },
      subject: { min: 3, max: 100 },
      message: { min: 10, max: 1000 },
    });
  });
});

describe("validateContact", () => {
  it("aceita dados válidos", () => {
    expect(validateContact(valid)).toEqual({ valid: true, errors: {}, order: [] });
  });

  it("todos vazios: quatro erros, na ordem da página", () => {
    const r = validateContact({ name: "", email: "", subject: "", message: "" });
    expect(r.valid).toBe(false);
    expect(r.order).toEqual(["name", "email", "subject", "message"]);
    expect(r.errors).toEqual({
      name: "Informe seu nome.",
      email: "Informe seu e-mail.",
      subject: "Informe o assunto.",
      message: "Escreva sua mensagem.",
    });
  });

  it("valores só com espaços são vazios; ausentes também", () => {
    const r = validateContact({ name: "   ", email: "\t", subject: null });
    expect(r.errors.name).toBe("Informe seu nome.");
    expect(r.errors.email).toBe("Informe seu e-mail.");
    expect(r.errors.subject).toBe("Informe o assunto.");
    expect(r.errors.message).toBe("Escreva sua mensagem.");
  });

  it("espaços nas extremidades de valores válidos não geram erro", () => {
    const r = check({ name: "  Ana  ", email: " ana@exemplo.com ", subject: " Oi! ", message: `  ${rep(10)}  ` });
    expect(r.valid).toBe(true);
  });

  it("conta caracteres do valor aparado", () => {
    expect(check({ name: ` ${rep(1)} ` }).errors.name).toBe("Use pelo menos 2 caracteres.");
  });

  it.each([
    ["name", 1, "Use pelo menos 2 caracteres."],
    ["name", 101, "Use no máximo 100 caracteres."],
    ["subject", 2, "Use pelo menos 3 caracteres."],
    ["subject", 101, "Use no máximo 100 caracteres."],
    ["message", 9, "Use pelo menos 10 caracteres."],
    ["message", 1001, "Use no máximo 1000 caracteres."],
  ])("%s com %i caracteres é recusado", (field, length, message) => {
    const r = check({ [field]: rep(length) });
    expect(r.errors).toEqual({ [field]: message });
    expect(r.order).toEqual([field]);
  });

  it.each([
    ["name", 2],
    ["name", 100],
    ["subject", 3],
    ["subject", 100],
    ["message", 10],
    ["message", 1000],
  ])("%s com %i caracteres é aceito", (field, length) => {
    expect(check({ [field]: rep(length) }).valid).toBe(true);
  });

  it("e-mail respeita o máximo de 254 caracteres", () => {
    const domain = `${rep(63)}.${rep(63)}.${rep(63)}.com`;
    const email254 = `${rep(254 - domain.length - 1)}@${domain}`;
    expect(email254.length).toBe(254);
    expect(check({ email: email254 }).valid).toBe(true);
    expect(check({ email: `a${email254}` }).errors.email).toBe("Use no máximo 254 caracteres.");
  });

  it.each(["a@b.co", "nome.sobrenome+tag@exemplo.com.br"])("e-mail válido: %s", (email) => {
    expect(check({ email }).valid).toBe(true);
  });

  it.each(["abc", "a@b", "a@@b.com", "a b@c.com", "@c.com", "a@.com", "a@b..com"])("e-mail inválido: %s", (email) => {
    expect(check({ email }).errors.email).toBe(EMAIL_ERROR);
  });

  it("marcação digitada é texto comum", () => {
    expect(check({ subject: "<b>x</b>" }).valid).toBe(true);
  });

  it("devolve os erros de vários campos juntos, com mensagens específicas", () => {
    const r = check({ email: "abc", subject: "ab", message: rep(1001) });
    expect(r.order).toEqual(["email", "subject", "message"]);
    expect(r.errors).toEqual({
      email: EMAIL_ERROR,
      subject: "Use pelo menos 3 caracteres.",
      message: "Use no máximo 1000 caracteres.",
    });
  });
});
