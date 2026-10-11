import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  // O servidor estático (http.server) recusa conexões com muitos workers em paralelo
  // (ERR_CONNECTION_REFUSED intermitente); 2 workers deixam a suíte estável.
  workers: 2,
  use: { baseURL: "http://localhost:5500" },
  webServer: {
    command: "python -m http.server 5500",
    url: "http://localhost:5500/index.html",
    reuseExistingServer: true,
  },
});
