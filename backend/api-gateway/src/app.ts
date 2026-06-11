import { createApp } from "@vong-bohec/shared";
import { env } from "./config/env";
import { authRouter } from "./routes/auth.routes";
import { bookingRouter } from "./routes/booking.routes";
import { propertyRouter } from "./routes/property.routes";

export const app = createApp("api-gateway", env.FRONTEND_ORIGIN, (application) => {
  application.use("/api/auth", authRouter);
  application.use("/api/properties", propertyRouter);
  application.use("/api/bookings", bookingRouter);
});
