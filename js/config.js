// Único ponto de configuração do frontend. Este arquivo é público:
// nunca coloque aqui segredos, tokens ou credenciais.
// Para outro ambiente, altere apenas apiBaseUrl (incluindo o prefixo /api/v1).
export const PUBLIC_CONFIG = {
  apiBaseUrl: "http://localhost:8000/api/v1",
  // Tempo limite (ms) de cada consulta à API; ajustável por ambiente.
  requestTimeoutMs: 15000,
};

const DEFAULT_TIMEOUT_MS = 15000;

const LOCAL_HOSTNAMES = ["localhost", "127.0.0.1", "[::1]"];

const MESSAGES = {
  missing: "A configuração do endereço da API está ausente. Não foi possível carregar as informações.",
  invalid: "A configuração do endereço da API é inválida. Não foi possível carregar as informações.",
  insecure:
    "O endereço da API usa uma conexão não segura (HTTP) fora do ambiente local. Não foi possível carregar as informações.",
};

function result(status, apiBaseUrl) {
  return { status, apiBaseUrl, message: status === "valid" ? null : MESSAGES[status] };
}

export function resolveConfig(rawUrl, { hostname = "" } = {}) {
  if (typeof rawUrl !== "string" || rawUrl.trim() === "") {
    return result("missing", null);
  }

  let url;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    return result("invalid", null);
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return result("invalid", null);
  }

  const apiBaseUrl = url.href.replace(/\/+$/, "");

  if (url.protocol === "http:" && !LOCAL_HOSTNAMES.includes(hostname)) {
    return result("insecure", apiBaseUrl);
  }

  return result("valid", apiBaseUrl);
}

export function getConfigStatus() {
  const hostname = globalThis.location?.hostname ?? "";
  return resolveConfig(PUBLIC_CONFIG.apiBaseUrl, { hostname });
}

export function getApiBaseUrl(state = getConfigStatus()) {
  if (state.status !== "valid") {
    throw new Error(state.message);
  }
  return state.apiBaseUrl;
}

export function getRequestTimeoutMs() {
  const value = PUBLIC_CONFIG.requestTimeoutMs;
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_TIMEOUT_MS;
}
