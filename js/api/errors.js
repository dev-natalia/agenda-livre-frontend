export const ERROR_CATEGORIES = Object.freeze({
  CONFIG: "config",
  NETWORK: "network",
  TIMEOUT: "timeout",
  NOT_FOUND: "not_found",
  BAD_REQUEST: "bad_request",
  RATE_LIMITED: "rate_limited",
  SERVER: "server",
  HTTP: "http",
  INVALID_RESPONSE: "invalid_response",
  CANCELLED: "cancelled",
});

const GENERIC_MESSAGE = "Não foi possível carregar as informações. Tente novamente mais tarde.";

const USER_MESSAGES = {
  config: GENERIC_MESSAGE,
  network: "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.",
  timeout: "O servidor demorou para responder. Tente novamente.",
  not_found: "Não encontramos o que você procurava.",
  bad_request: "Não foi possível processar a pesquisa. Revise os filtros e tente novamente.",
  rate_limited: "Muitas consultas em pouco tempo. Aguarde um instante e tente novamente.",
  server: "O serviço está indisponível no momento. Tente novamente em instantes.",
  http: GENERIC_MESSAGE,
  invalid_response: GENERIC_MESSAGE,
  cancelled: "",
};

const RETRYABLE = new Set(["network", "timeout", "server", "rate_limited"]);

export class ApiError extends Error {
  constructor(category, { status = null, userMessage, fieldErrors = null, cause } = {}) {
    super(`API error: ${category}${status ? ` (${status})` : ""}`, { cause });
    this.name = "ApiError";
    this.category = category;
    this.status = status;
    this.userMessage = userMessage ?? USER_MESSAGES[category] ?? GENERIC_MESSAGE;
    this.retryable = RETRYABLE.has(category);
    this.fieldErrors = category === "bad_request" ? fieldErrors : null;
    this.cause = cause;
  }
}

export function classifyStatus(status) {
  let category = "http";
  if (status === 400) category = "bad_request";
  else if (status === 404) category = "not_found";
  else if (status === 429) category = "rate_limited";
  else if (status >= 500 && status <= 599) category = "server";
  return { category, retryable: RETRYABLE.has(category) };
}

export function isCancelled(error) {
  return error instanceof ApiError && error.category === "cancelled";
}
