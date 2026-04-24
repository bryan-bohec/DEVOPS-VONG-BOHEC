import { Router } from "express";
import { propertyController } from "../controllers/property.controller";
import { requireAuth, requireOwner } from "../middlewares/auth";

export const propertyRouter = Router();

propertyRouter.get("/", propertyController.list);
propertyRouter.get("/:id/availability", propertyController.availability);
propertyRouter.get("/:id/booked-dates", propertyController.bookedDates);
propertyRouter.get("/:id", propertyController.getById);
propertyRouter.post("/", requireAuth, requireOwner, propertyController.create);
propertyRouter.put("/:id", requireAuth, requireOwner, propertyController.update);
propertyRouter.delete("/:id", requireAuth, requireOwner, propertyController.remove);
