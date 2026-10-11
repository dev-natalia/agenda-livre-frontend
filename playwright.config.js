import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  use: { baseURL: "http://localhost:5500" },
  webServer: {
    command: "python -m http.server 5500",
    url: "http://localhost:5500/index.html",
    reuseExistingServer: true,
  },
});
