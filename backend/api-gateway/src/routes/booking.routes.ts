import { Router } from "express";
import { env } from "../config/env";
import { proxyRequest } from "../lib/proxy";
import { requireAuth } from "../middlewares/auth";

export const bookingRouter = Router();

bookingRouter.use(requireAuth);

bookingRouter.get("/", async (request, response) =>
  proxyRequest({
    request,
    response,
    targetBaseUrl: env.BOOKING_SERVICE_URL,
    targetPath: "/bookings",
  }),
);

bookingRouter.get("/tenant/:tenantId", async (request, response) =>
  proxyRequest({
    request,
    response,
    targetBaseUrl: env.BOOKING_SERVICE_URL,
    targetPath: "/bookings/tenant/:tenantId",
    pathParams: { tenantId: request.params.tenantId },
  }),
);

bookingRouter.get("/owner/:ownerId", async (request, response) =>
  proxyRequest({
    request,
    response,
    targetBaseUrl: env.BOOKING_SERVICE_URL,
    targetPath: "/bookings/owner/:ownerId",
    pathParams: { ownerId: request.params.ownerId },
  }),
);

bookingRouter.get("/:id", async (request, response) =>
  proxyRequest({
    request,
    response,
    targetBaseUrl: env.BOOKING_SERVICE_URL,
    targetPath: "/bookings/:id",
    pathParams: { id: request.params.id },
  }),
);

bookingRouter.post("/", async (request, response) =>
  proxyRequest({
    request,
    response,
    targetBaseUrl: env.BOOKING_SERVICE_URL,
    targetPath: "/bookings",
  }),
);

bookingRouter.patch("/:id/status", async (request, response) =>
  proxyRequest({
    request,
    response,
    targetBaseUrl: env.BOOKING_SERVICE_URL,
    targetPath: "/bookings/:id/status",
    pathParams: { id: request.params.id },
  }),
);
