import { defineConfig } from "vitest/config";

// Verificação opcional contra a API real (npm run test:contract). Fora de `npm test` e de `npm run test:all`.
export default defineConfig({
  test: {
    include: ["tests/contract/**/*.test.js"],
    environment: "node",
  },
});
