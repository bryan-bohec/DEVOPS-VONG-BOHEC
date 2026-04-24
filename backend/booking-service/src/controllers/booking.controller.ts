import { BookingStatus } from "@prisma/client";
import { Request, Response } from "express";
import { z } from "zod";
import { AuthenticatedRequest } from "../middlewares/auth";
import { bookingService } from "../services/booking.service";

const listQuerySchema = z.object({
  tenant_id: z.coerce.number().optional(),
  owner_id: z.coerce.number().optional(),
  status: z.nativeEnum(BookingStatus).optional(),
});

const createBookingSchema = z.object({
  property_id: z.coerce.number().int().positive(),
  tenant_id: z.coerce.number().int().positive().optional(),
  check_in: z.string().min(1),
  check_out: z.string().min(1),
});

const updateStatusSchema = z.object({
  status: z.nativeEnum(BookingStatus),
});

const conflictQuerySchema = z.object({
  propertyId: z.coerce.number().int().positive(),
  checkIn: z.string().min(1),
  checkOut: z.string().min(1),
});

export const bookingController = {
  async list(request: AuthenticatedRequest, response: Response) {
    try {
      const filters = listQuerySchema.parse({
        ...request.query,
        tenant_id: request.params.tenantId ?? request.query.tenant_id,
        owner_id: request.params.ownerId ?? request.query.owner_id,
      });
      const bookings = await bookingService.list(filters, request.user!);
      response.json(bookings);
    } catch (error) {
      response.status(403).json({ message: error instanceof Error ? error.message : "Access denied." });
    }
  },

  async getById(request: AuthenticatedRequest, response: Response) {
    try {
      const booking = await bookingService.getById(Number(request.params.id), request.user!);

      if (!booking) {
        return response.status(404).json({ message: "Booking not found." });
      }

      return response.json(booking);
    } catch (error) {
      return response.status(403).json({ message: error instanceof Error ? error.message : "Access denied." });
    }
  },

  async create(request: AuthenticatedRequest, response: Response) {
    try {
      const payload = createBookingSchema.parse(request.body);
      const booking = await bookingService.create(payload, request.user!);
      response.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return response.status(400).json({ message: "Invalid request body.", errors: error.flatten() });
      }

      return response.status(400).json({ message: error instanceof Error ? error.message : "Booking creation failed." });
    }
  },

  async updateStatus(request: AuthenticatedRequest, response: Response) {
    try {
      const payload = updateStatusSchema.parse(request.body);
      const booking = await bookingService.updateStatus(Number(request.params.id), payload.status, request.user!);

      if (!booking) {
        return response.status(404).json({ message: "Booking not found." });
      }

      return response.json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return response.status(400).json({ message: "Invalid request body.", errors: error.flatten() });
      }

      return response.status(403).json({ message: error instanceof Error ? error.message : "Status update denied." });
    }
  },

  async getConflicts(request: Request, response: Response) {
    const payload = conflictQuerySchema.parse(request.query);
    const hasConflicts = await bookingService.hasConflicts(payload.propertyId, payload.checkIn, payload.checkOut);
    response.json({ has_conflicts: hasConflicts });
  },

  async getBookedDates(request: Request, response: Response) {
    const propertyId = z.coerce.number().int().positive().parse(request.query.propertyId);
    const bookedDates = await bookingService.getBookedDates(propertyId);
    response.json(bookedDates);
  },
};
