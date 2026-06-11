import { createApp } from "@vong-bohec/shared";
import { env } from "./config/env";
import { authRouter } from "./routes/auth.routes";

export const app = createApp("auth-service", env.FRONTEND_ORIGIN, (application) => {
  application.use("/auth", authRouter);
});
