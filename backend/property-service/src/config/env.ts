import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3002),
  DATABASE_URL: z
    .string()
    .default("postgresql://postgres:postgres@localhost:5432/property_db?schema=public"),
  JWT_SECRET: z.string().min(12).default("super-secret-jwt-key"),
  BOOKING_SERVICE_URL: z.string().url().default("http://booking-service:3003"),
});

export const env = envSchema.parse(process.env);
