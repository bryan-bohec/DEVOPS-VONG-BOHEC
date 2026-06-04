import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3003),
  DATABASE_URL: z
    .string()
    .default("postgresql://postgres:postgres@localhost:5432/booking_db?schema=public"),
  FRONTEND_ORIGIN: z.string().url().default("http://localhost:5173"),
  JWT_SECRET: z.string().min(12).default("super-secret-jwt-key"),
  PROPERTY_SERVICE_URL: z.string().url().default("http://property-service:3002"),
});

export const env = envSchema.parse(process.env);
