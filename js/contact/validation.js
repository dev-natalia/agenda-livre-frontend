// Regras do formulário de contato (specs/008-institutional-pages/data-model.md).
// Sem DOM: o formulário só lê os valores e exibe o resultado.
export const CONTACT_LIMITS = {
  name: { min: 2, max: 100 },
  email: { max: 254 },
  subject: { min: 3, max: 100 },
  message: { min: 10, max: 1000 },
};

// Ordem da página: o primeiro campo inválido recebe o foco.
export const CONTACT_FIELDS = ["name", "email", "subject", "message"];

const EMPTY = {
  name: "Informe seu nome.",
  email: "Informe seu e-mail.",
  subject: "Informe o assunto.",
  message: "Escreva sua mensagem.",
};

// Formato apenas: parte local e domínio com ao menos um ponto, sem espaços nem pontos consecutivos.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;
const EMAIL_FORMAT = "Informe um e-mail válido, como nome@exemplo.com.";

function check(field, value) {
  if (value === "") return EMPTY[field];
  const { min, max } = CONTACT_LIMITS[field];
  if (min !== undefined && value.length < min) return `Use pelo menos ${min} caracteres.`;
  if (value.length > max) return `Use no máximo ${max} caracteres.`;
  if (field === "email" && !EMAIL_PATTERN.test(value)) return EMAIL_FORMAT;
  return null;
}

export function validateContact(values = {}) {
  const errors = {};
  const order = [];
  for (const field of CONTACT_FIELDS) {
    const message = check(field, String(values[field] ?? "").trim());
    if (message) {
      errors[field] = message;
      order.push(field);
    }
  }
  return { valid: order.length === 0, errors, order };
}
