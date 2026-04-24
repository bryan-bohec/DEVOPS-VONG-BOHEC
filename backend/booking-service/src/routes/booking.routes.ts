import { Router } from "express";
import { bookingController } from "../controllers/booking.controller";
import { requireAuth } from "../middlewares/auth";

export const bookingRouter = Router();
export const internalBookingRouter = Router();

bookingRouter.use(requireAuth);

bookingRouter.get("/", bookingController.list);
bookingRouter.get("/tenant/:tenantId", bookingController.list);
bookingRouter.get("/owner/:ownerId", bookingController.list);
bookingRouter.get("/:id", bookingController.getById);
bookingRouter.post("/", bookingController.create);
bookingRouter.patch("/:id/status", bookingController.updateStatus);

internalBookingRouter.get("/conflicts", bookingController.getConflicts);
internalBookingRouter.get("/booked-dates", bookingController.getBookedDates);
