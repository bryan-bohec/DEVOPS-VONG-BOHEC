import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      // En test, on consomme la SOURCE TypeScript de shared (transformée en ESM
      // par vitest) plutôt que le dist CommonJS. Cela garantit une instance
      // unique des dépendances mockées et un coverage attribué au code partagé.
      "@vong-bohec/shared": fileURLToPath(new URL("../shared/src/index.ts", import.meta.url)),
    },
  },
});
