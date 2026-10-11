import { getApiBaseUrl, getConfigStatus, getRequestTimeoutMs } from "../config.js";
import { ApiError, classifyStatus } from "./errors.js";

const LOCAL_HOSTNAMES = ["localhost", "127.0.0.1", "[::1]"];

export function buildUrl(baseUrl, path, params = {}) {
  const base = String(baseUrl).replace(/\/+$/, "");
  const url = new URL(`${base}/${String(path).replace(/^\/+/, "")}`);

  for (const [key, value] of Object.entries(params ?? {})) {
    if (value === null || value === undefined || value === "") continue;
    if (!["string", "number", "boolean"].includes(typeof value)) {
      throw new TypeError(`Valor não suportado para o parâmetro "${key}".`);
    }
    url.searchParams.set(key, String(value));
  }
  return url;
}

function logTechnicalError(error, path) {
  const hostname = globalThis.location?.hostname ?? "";
  if (!LOCAL_HOSTNAMES.includes(hostname)) return;
  console.warn(`[api] ${error.category} status=${error.status ?? "-"} ${path}`);
}

function fail(error, path) {
  if (error.category !== "cancelled") logTechnicalError(error, path);
  return error;
}

async function readFieldErrors(response) {
  try {
    const body = await response.json();
    const errors = body?.errors;
    return errors && typeof errors === "object" ? errors : null;
  } catch {
    return null;
  }
}

export async function request(path, { params, signal, timeoutMs, allowEmpty = false, fetchImpl } = {}) {
  const config = getConfigStatus();
  if (config.status !== "valid") {
    throw fail(new ApiError("config", { userMessage: config.message }), path);
  }

  const url = buildUrl(getApiBaseUrl(config), path, params);
  const doFetch = fetchImpl ?? ((...args) => globalThis.fetch(...args));

  const controller = new AbortController();
  let timedOut = false;
  const onExternalAbort = () => controller.abort();
  if (signal?.aborted) controller.abort();
  signal?.addEventListener("abort", onExternalAbort, { once: true });
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs ?? getRequestTimeoutMs());

  const abortError = (cause) =>
    timedOut ? new ApiError("timeout", { cause }) : new ApiError("cancelled", { cause });

  try {
    let response;
    try {
      response = await doFetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
        credentials: "omit",
        signal: controller.signal,
      });
    } catch (cause) {
      if (controller.signal.aborted) throw abortError(cause);
      throw new ApiError("network", { cause });
    }

    if (!response.ok) {
      const { category } = classifyStatus(response.status);
      const fieldErrors = category === "bad_request" ? await readFieldErrors(response) : null;
      throw new ApiError(category, { status: response.status, fieldErrors });
    }

    let text;
    try {
      text = await response.text();
    } catch (cause) {
      if (controller.signal.aborted) throw abortError(cause);
      throw new ApiError("network", { cause });
    }

    if (text.trim() === "") {
      if (allowEmpty) return null;
      throw new ApiError("invalid_response", { status: response.status });
    }
    try {
      return JSON.parse(text);
    } catch (cause) {
      throw new ApiError("invalid_response", { status: response.status, cause });
    }
  } catch (error) {
    throw fail(error instanceof ApiError ? error : new ApiError("network", { cause: error }), path);
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onExternalAbort);
  }
}

export function createRequestScope() {
  let generation = 0;
  let controller = null;

  function cancel() {
    generation += 1;
    controller?.abort();
    controller = null;
  }

  async function run(path, options = {}) {
    cancel();
    const current = generation;
    controller = new AbortController();
    const { signal: scopeSignal } = controller;

    try {
      const data = await request(path, { ...options, signal: scopeSignal });
      if (current !== generation) throw new ApiError("cancelled");
      return data;
    } catch (error) {
      if (current !== generation) throw new ApiError("cancelled", { cause: error });
      throw error;
    }
  }

  return { run, cancel };
}
