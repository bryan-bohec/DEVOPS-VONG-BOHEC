import { Router } from "express";
import { env } from "../config/env";
import { proxyRequest } from "../lib/proxy";
import { requireAuth } from "../middlewares/auth";

export const authRouter = Router();

authRouter.post("/register", async (request, response) =>
  proxyRequest({
    request,
    response,
    targetBaseUrl: env.AUTH_SERVICE_URL,
    targetPath: "/auth/register",
  }),
);

authRouter.post("/login", async (request, response) =>
  proxyRequest({
    request,
    response,
    targetBaseUrl: env.AUTH_SERVICE_URL,
    targetPath: "/auth/login",
  }),
);

authRouter.get("/me", requireAuth, async (request, response) =>
  proxyRequest({
    request,
    response,
    targetBaseUrl: env.AUTH_SERVICE_URL,
    targetPath: "/auth/me",
  }),
);
