import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  FRONTEND_ORIGIN: z.string().default("http://localhost:5173"),
  JWT_SECRET: z.string().min(12).default("super-secret-jwt-key"),
  AUTH_SERVICE_URL: z.string().url().default("http://auth-service:3001"),
  PROPERTY_SERVICE_URL: z.string().url().default("http://property-service:3002"),
  BOOKING_SERVICE_URL: z.string().url().default("http://booking-service:3003"),
});

export const env = envSchema.parse(process.env);
