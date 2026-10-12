import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  // O servidor estático (http.server) recusa conexões com muitos workers em paralelo
  // (ERR_CONNECTION_REFUSED intermitente); 2 workers deixam a suíte estável.
  workers: 2,
  // Sem `retries`: repetir um teste esconde instabilidade (docs/19-guia-de-testes.md). Na integração contínua,
  // o relatório HTML é publicado como artefato quando algo falha.
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: { baseURL: "http://localhost:5500" },
  webServer: {
    command: "python tests/static-server.py 5500",
    url: "http://localhost:5500/index.html",
    reuseExistingServer: true,
  },
});
