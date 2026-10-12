import { CONTACT_FIELDS, validateContact } from "./validation.js";

const CONFIRMATION_MESSAGE = "Este formulário é demonstrativo. Nenhuma mensagem foi enviada.";

// Formulário demonstrativo: valida, mostra erros ou a confirmação, e nunca transmite nem guarda
// dados (contracts/no-network.md). Valores digitados só passam por .value e textContent.
export function initContactForm(root = document) {
  const form = root.querySelector("#contact-form");
  if (!form) return;

  const summary = root.querySelector("#contact-summary");
  const panel = root.querySelector("#contact-confirmation");
  const panelTitle = panel?.querySelector("h2");
  const panelMessage = panel?.querySelector("[role=status]");
  const controls = Object.fromEntries(CONTACT_FIELDS.map((field) => [field, root.querySelector(`#contact-${field}`)]));

  // Sem JavaScript o envio ficaria nativo (GET com os dados na URL): o botão nasce desabilitado.
  const submitButton = form.querySelector('button[type="submit"]');
  if (submitButton) submitButton.disabled = false;

  const values = () => Object.fromEntries(CONTACT_FIELDS.map((field) => [field, controls[field].value]));

  function showError(field, message) {
    const control = controls[field];
    let error = root.querySelector(`#${field}-error`);
    if (!error) {
      error = document.createElement("p");
      error.id = `${field}-error`;
      error.className = "field-error";
      root.querySelector(`#${field}-hint`).after(error);
    }
    error.textContent = message;
    control.setAttribute("aria-invalid", "true");
    control.setAttribute("aria-describedby", `${field}-hint ${field}-error`);
  }

  function clearError(field) {
    root.querySelector(`#${field}-error`)?.remove();
    controls[field].removeAttribute("aria-invalid");
    controls[field].setAttribute("aria-describedby", `${field}-hint`);
  }

  function clearErrors() {
    CONTACT_FIELDS.forEach(clearError);
    summary.textContent = "";
  }

  function summaryText(count) {
    return count === 1 ? "1 campo precisa de correção." : `${count} campos precisam de correção.`;
  }

  function showForm() {
    panel.hidden = true;
    form.hidden = false;
  }

  function showConfirmation() {
    form.hidden = true;
    panel.hidden = false;
    panelMessage.textContent = "";
    panelMessage.textContent = CONFIRMATION_MESSAGE;
    panelTitle.focus();
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const result = validateContact(values());
    clearErrors();
    if (!result.valid) {
      for (const field of result.order) showError(field, result.errors[field]);
      summary.textContent = summaryText(result.order.length);
      controls[result.order[0]].focus();
      return;
    }
    showConfirmation();
  });

  for (const field of CONTACT_FIELDS) {
    controls[field].addEventListener("input", () => {
      if (!root.querySelector(`#${field}-error`)) return;
      if (!(field in validateContact(values()).errors)) clearError(field);
    });
  }

  root.querySelector("#contact-clear")?.addEventListener("click", () => {
    form.reset();
    clearErrors();
    controls.name.focus();
  });

  root.querySelector("#contact-back")?.addEventListener("click", () => {
    clearErrors();
    showForm();
    controls.name.focus();
  });
}
