import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      // En test, on consomme la SOURCE TypeScript de shared (transformée en ESM
      // par vitest) plutôt que le dist CommonJS. Sinon le helper __importDefault
      // du CJS compilé double-emballe les mocks de module (vi.mock("jsonwebtoken"))
      // et jwt.verify devient introuvable.
      "@vong-bohec/shared": fileURLToPath(new URL("../shared/src/index.ts", import.meta.url)),
    },
  },
});
