import { Prisma } from "@prisma/client";
import { bookingApi } from "../lib/booking-api";
import { propertyRepository } from "../repositories/property.repository";

interface ListFilters {
  city?: string;
  type?: string;
  min_price?: number;
  max_price?: number;
  capacity?: number;
  owner_id?: number;
}

interface PropertyInput {
  title: string;
  description?: string;
  type: string;
  address: string;
  city: string;
  price_per_night: number;
  rooms: number;
  capacity: number;
  image_url?: string;
}

function buildWhereClause(filters: ListFilters): Prisma.PropertyWhereInput {
  return {
    ...(filters.city
      ? {
          city: {
            contains: filters.city,
            mode: "insensitive",
          },
        }
      : {}),
    ...(filters.type ? { type: filters.type } : {}),
    ...(filters.owner_id ? { owner_id: filters.owner_id } : {}),
    ...(filters.capacity ? { capacity: { gte: filters.capacity } } : {}),
    ...(filters.min_price || filters.max_price
      ? {
          price_per_night: {
            ...(filters.min_price ? { gte: filters.min_price } : {}),
            ...(filters.max_price ? { lte: filters.max_price } : {}),
          },
        }
      : {}),
  };
}

export const propertyService = {
  list(filters: ListFilters) {
    return propertyRepository.list(buildWhereClause(filters));
  },

  getById(id: number) {
    return propertyRepository.findById(id);
  },

  create(ownerId: number, input: PropertyInput) {
    return propertyRepository.create({
      ...input,
      owner_id: ownerId,
      image_url: input.image_url || null,
    });
  },

  async update(id: number, ownerId: number, input: Partial<PropertyInput>) {
    const property = await propertyRepository.findById(id);

    if (!property) {
      return null;
    }

    if (property.owner_id !== ownerId) {
      throw new Error("You can only update your own properties.");
    }

    return propertyRepository.update(id, {
      ...input,
      ...(input.image_url !== undefined ? { image_url: input.image_url || null } : {}),
    });
  },

  async remove(id: number, ownerId: number) {
    const property = await propertyRepository.findById(id);

    if (!property) {
      return null;
    }

    if (property.owner_id !== ownerId) {
      throw new Error("You can only delete your own properties.");
    }

    return propertyRepository.delete(id);
  },

  async getAvailability(id: number, checkIn?: string, checkOut?: string) {
    const property = await propertyRepository.findById(id);

    if (!property) {
      return null;
    }

    const hasDateRange = Boolean(checkIn && checkOut);
    if (property.is_available === false || !hasDateRange) {
      return {
        property_id: property.id,
        available: property.is_available,
      };
    }

    const hasConflicts = await bookingApi.hasConflicts(property.id, checkIn, checkOut);

    return {
      property_id: property.id,
      available: !hasConflicts,
    };
  },

  async getBookedDates(id: number) {
    const property = await propertyRepository.findById(id);

    if (!property) {
      return null;
    }

    return bookingApi.getBookedDates(property.id);
  },
};
