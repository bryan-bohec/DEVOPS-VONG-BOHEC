import { Request, Response } from "express";
import { z } from "zod";
import { AuthenticatedRequest } from "../middlewares/auth";
import { propertyService } from "../services/property.service";

const listQuerySchema = z.object({
  city: z.string().optional(),
  type: z.string().optional(),
  min_price: z.coerce.number().optional(),
  max_price: z.coerce.number().optional(),
  capacity: z.coerce.number().optional(),
  owner_id: z.coerce.number().optional(),
});

const propertySchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  type: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  price_per_night: z.coerce.number().int().positive(),
  rooms: z.coerce.number().int().positive(),
  capacity: z.coerce.number().int().positive(),
  image_url: z.string().url().optional().or(z.literal("")),
});

const updateSchema = propertySchema.partial();

export const propertyController = {
  async list(request: Request, response: Response) {
    const filters = listQuerySchema.parse(request.query);
    const properties = await propertyService.list(filters);
    response.json(properties);
  },

  async getById(request: Request, response: Response) {
    const property = await propertyService.getById(Number(request.params.id));

    if (!property) {
      return response.status(404).json({ message: "Property not found." });
    }

    return response.json(property);
  },

  async create(request: AuthenticatedRequest, response: Response) {
    const payload = propertySchema.parse(request.body);
    const property = await propertyService.create(request.user!.sub, payload);
    response.status(201).json(property);
  },

  async update(request: AuthenticatedRequest, response: Response) {
    try {
      const payload = updateSchema.parse(request.body);
      const property = await propertyService.update(Number(request.params.id), request.user!.sub, payload);

      if (!property) {
        return response.status(404).json({ message: "Property not found." });
      }

      return response.json(property);
    } catch (error) {
      return response.status(403).json({ message: error instanceof Error ? error.message : "Update denied." });
    }
  },

  async remove(request: AuthenticatedRequest, response: Response) {
    try {
      const property = await propertyService.remove(Number(request.params.id), request.user!.sub);

      if (!property) {
        return response.status(404).json({ message: "Property not found." });
      }

      return response.status(204).send();
    } catch (error) {
      return response.status(403).json({ message: error instanceof Error ? error.message : "Delete denied." });
    }
  },

  async availability(request: Request, response: Response) {
    const result = await propertyService.getAvailability(
      Number(request.params.id),
      typeof request.query.checkIn === "string" ? request.query.checkIn : undefined,
      typeof request.query.checkOut === "string" ? request.query.checkOut : undefined,
    );

    if (!result) {
      return response.status(404).json({ message: "Property not found." });
    }

    return response.json(result);
  },

  async bookedDates(request: Request, response: Response) {
    const result = await propertyService.getBookedDates(Number(request.params.id));

    if (!result) {
      return response.status(404).json({ message: "Property not found." });
    }

    return response.json(result);
  },
};
