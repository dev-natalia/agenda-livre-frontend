import { vi } from "vitest";

export function jsonResponse(body, { status = 200 } = {}) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

export function textResponse(text, { status = 200 } = {}) {
  return new Response(text, { status, headers: { "Content-Type": "text/html" } });
}

// fetch simulado que respeita o sinal de abort, como o real.
export function pendingFetch() {
  const calls = [];
  const fetchImpl = vi.fn((url, init = {}) => {
    return new Promise((resolve, reject) => {
      const call = { url: String(url), init, resolve, reject };
      calls.push(call);
      init.signal?.addEventListener("abort", () => {
        reject(new DOMException("Aborted", "AbortError"));
      });
    });
  });
  return { fetchImpl, calls };
}
