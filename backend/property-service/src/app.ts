import { createApp } from "@vong-bohec/shared";
import { env } from "./config/env";
import { propertyRouter } from "./routes/property.routes";

export const app = createApp("property-service", env.FRONTEND_ORIGIN, (application) => {
  application.use("/properties", propertyRouter);
});
