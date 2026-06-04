import { Router } from "express";
import { env } from "../config/env";
import { proxyRequest } from "../lib/proxy";
import { requireAuth, requireRole } from "../middlewares/auth";

export const propertyRouter = Router();

propertyRouter.get("/", async (request, response) =>
  proxyRequest({
    request,
    response,
    targetBaseUrl: env.PROPERTY_SERVICE_URL,
    targetPath: "/properties",
  }),
);

propertyRouter.get("/:id", async (request, response) =>
  proxyRequest({
    request,
    response,
    targetBaseUrl: env.PROPERTY_SERVICE_URL,
    targetPath: "/properties/:id",
    pathParams: { id: request.params.id },
  }),
);

propertyRouter.get("/:id/availability", async (request, response) =>
  proxyRequest({
    request,
    response,
    targetBaseUrl: env.PROPERTY_SERVICE_URL,
    targetPath: "/properties/:id/availability",
    pathParams: { id: request.params.id },
  }),
);

propertyRouter.get("/:id/booked-dates", async (request, response) =>
  proxyRequest({
    request,
    response,
    targetBaseUrl: env.PROPERTY_SERVICE_URL,
    targetPath: "/properties/:id/booked-dates",
    pathParams: { id: request.params.id },
  }),
);

propertyRouter.post("/", requireAuth, requireRole("owner"), async (request, response) =>
  proxyRequest({
    request,
    response,
    targetBaseUrl: env.PROPERTY_SERVICE_URL,
    targetPath: "/properties",
  }),
);

propertyRouter.put("/:id", requireAuth, requireRole("owner"), async (request, response) =>
  proxyRequest({
    request,
    response,
    targetBaseUrl: env.PROPERTY_SERVICE_URL,
    targetPath: "/properties/:id",
    pathParams: { id: request.params.id },
  }),
);

propertyRouter.delete("/:id", requireAuth, requireRole("owner"), async (request, response) =>
  proxyRequest({
    request,
    response,
    targetBaseUrl: env.PROPERTY_SERVICE_URL,
    targetPath: "/properties/:id",
    pathParams: { id: request.params.id },
  }),
);
