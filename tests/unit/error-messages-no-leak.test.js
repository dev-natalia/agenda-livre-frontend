// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";

const configState = vi.hoisted(() => ({
  current: { status: "valid", apiBaseUrl: "http://localhost:8000/api/v1", message: null },
}));

vi.mock("../../js/config.js", () => ({
  getConfigStatus: () => configState.current,
  getApiBaseUrl: (state = configState.current) => state.apiBaseUrl,
  getRequestTimeoutMs: () => 15000,
}));

import { request } from "../../js/api/client.js";
import { ApiError, ERROR_CATEGORIES } from "../../js/api/errors.js";
import { renderErrorState } from "../../js/components/error-state.js";
import { textResponse } from "./helpers/fake-fetch.js";

// DOC-14 §11: falhas não exibem pilha, endereço interno, token nem corpo bruto da resposta.
const HOSTILE_BODY =
  "<html><body>Traceback (most recent call last):\n  File \"/srv/app/views.py\", line 10, in get\n" +
  "django.db.utils.OperationalError at http://localhost:8000/api/v1/activities/ token=Bearer abc123SECRET</body></html>";

const FORBIDDEN = [
  /Traceback/i,
  /File "/,
  /\.py/,
  /OperationalError/,
  /django/i,
  /localhost/i,
  /8000/,
  /Bearer/i,
  /abc123SECRET/,
  /token/i,
  /\bat\s+\S+\s*\(/,
  /<\/?html|<\/?body/i,
  /undefined|\[object/,
];

const expectClean = (text, where) => {
  for (const pattern of FORBIDDEN) expect(text, `${where}: ${pattern}`).not.toMatch(pattern);
};

afterEach(() => vi.restoreAllMocks());

describe("mensagens de falha", () => {
  it.each(Object.values(ERROR_CATEGORIES))("categoria %s: userMessage sem detalhes internos", (category) => {
    const error = new ApiError(category, {
      status: 503,
      cause: new Error(HOSTILE_BODY),
    });
    expectClean(error.userMessage, category);
    expectClean(JSON.stringify(error.userMessage), category);
  });

  it.each([400, 401, 403, 404, 429, 500, 502, 503])("resposta %i com corpo hostil não chega ao usuário", async (status) => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const error = await request("/activities/", {
      fetchImpl: async () => textResponse(HOSTILE_BODY, { status }),
    }).catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expectClean(error.userMessage, `HTTP ${status}`);
  });

  it("JSON inválido e falha de rede também ficam limpos", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const invalid = await request("/activities/", { fetchImpl: async () => textResponse(HOSTILE_BODY) }).catch((e) => e);
    const network = await request("/activities/", {
      fetchImpl: async () => Promise.reject(new TypeError(`Failed to fetch ${HOSTILE_BODY}`)),
    }).catch((e) => e);
    expectClean(invalid.userMessage, "JSON inválido");
    expectClean(network.userMessage, "rede");
  });

  it.each(["network", "timeout", "server", "http", "invalid_response", "rate_limited"])(
    "o texto renderizado na tela para %s não traz detalhes internos",
    (category) => {
      document.body.innerHTML = '<div id="box"></div>';
      const box = document.getElementById("box");
      renderErrorState(box, new ApiError(category, { status: 500, cause: new Error(HOSTILE_BODY) }), {
        onRetry: () => {},
      });
      expectClean(box.textContent, category);
      expectClean(box.innerHTML, category);
    },
  );
});
