import { createApp } from "@vong-bohec/shared";
import { env } from "./config/env";
import { bookingRouter, internalBookingRouter } from "./routes/booking.routes";

export const app = createApp("booking-service", env.FRONTEND_ORIGIN, (application) => {
  application.use("/internal/bookings", internalBookingRouter);
  application.use("/bookings", bookingRouter);
});
