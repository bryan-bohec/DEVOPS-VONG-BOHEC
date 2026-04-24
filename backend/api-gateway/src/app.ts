import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { authRouter } from "./routes/auth.routes";
import { bookingRouter } from "./routes/booking.routes";
import { propertyRouter } from "./routes/property.routes";

export const app = express();

app.use(
  cors({
    origin: env.FRONTEND_ORIGIN,
  }),
);
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_request, response) => {
  response.json({ status: "ok", service: "api-gateway" });
});

app.use("/api/auth", authRouter);
app.use("/api/properties", propertyRouter);
app.use("/api/bookings", bookingRouter);

app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  console.error(error);
  response.status(500).json({ message: "Internal server error." });
});
