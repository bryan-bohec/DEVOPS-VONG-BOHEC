import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { bookingRouter, internalBookingRouter } from "./routes/booking.routes";

export const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_request, response) => {
  response.json({ status: "ok", service: "booking-service" });
});

app.use("/internal/bookings", internalBookingRouter);
app.use("/bookings", bookingRouter);

app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  console.error(error);
  response.status(500).json({ message: "Internal server error." });
});
