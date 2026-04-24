import { BookingStatus } from "@prisma/client";
import { propertyApi } from "../lib/property-api";
import { AuthUser } from "../middlewares/auth";
import { bookingRepository } from "../repositories/booking.repository";

interface BookingFilters {
  tenant_id?: number;
  owner_id?: number;
  status?: BookingStatus;
}

interface CreateBookingInput {
  property_id: number;
  tenant_id?: number;
  check_in: string;
  check_out: string;
}

function calculateDays(checkIn: Date, checkOut: Date) {
  return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
}

async function ensureOwnerOwnsProperty(ownerId: number, propertyId: number) {
  const property = await propertyApi.getProperty(propertyId);
  return property?.owner_id === ownerId;
}

export const bookingService = {
  async list(filters: BookingFilters, currentUser: AuthUser) {
    if (currentUser.role === "tenant") {
      if (filters.tenant_id && filters.tenant_id !== currentUser.sub) {
        throw new Error("You can only access your own bookings.");
      }

      return bookingRepository.list({
        tenant_id: currentUser.sub,
        ...(filters.status ? { status: filters.status } : {}),
      });
    }

    if (filters.owner_id && filters.owner_id !== currentUser.sub) {
      throw new Error("You can only access bookings for your own properties.");
    }

    const ownerProperties = await propertyApi.listOwnerProperties(currentUser.sub);
    const propertyIds = ownerProperties.map((property) => property.id);

    return bookingRepository.list({
      property_id: { in: propertyIds.length ? propertyIds : [-1] },
      ...(filters.status ? { status: filters.status } : {}),
    });
  },

  async getById(id: number, currentUser: AuthUser) {
    const booking = await bookingRepository.findById(id);

    if (!booking) {
      return null;
    }

    if (currentUser.role === "tenant") {
      if (booking.tenant_id !== currentUser.sub) {
        throw new Error("You can only access your own bookings.");
      }

      return booking;
    }

    const isOwner = await ensureOwnerOwnsProperty(currentUser.sub, booking.property_id);

    if (!isOwner) {
      throw new Error("You can only access bookings on your own properties.");
    }

    return booking;
  },

  async create(input: CreateBookingInput, currentUser: AuthUser) {
    if (currentUser.role !== "tenant") {
      throw new Error("Only tenants can create bookings.");
    }

    const property = await propertyApi.getProperty(input.property_id);

    if (!property || !property.is_available) {
      throw new Error("Property is not available.");
    }

    const checkIn = new Date(input.check_in);
    const checkOut = new Date(input.check_out);
    const days = calculateDays(checkIn, checkOut);

    if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime()) || days <= 0) {
      throw new Error("Booking dates are invalid.");
    }

    const hasConflicts = await bookingRepository.hasConflicts(property.id, checkIn, checkOut);

    if (hasConflicts) {
      throw new Error("This property is already booked for the selected dates.");
    }

    return bookingRepository.create({
      property_id: property.id,
      tenant_id: currentUser.sub,
      check_in: checkIn,
      check_out: checkOut,
      total_price: days * property.price_per_night,
      status: BookingStatus.pending,
    });
  },

  async updateStatus(id: number, status: BookingStatus, currentUser: AuthUser) {
    const booking = await bookingRepository.findById(id);

    if (!booking) {
      return null;
    }

    if (currentUser.role === "tenant") {
      if (booking.tenant_id !== currentUser.sub || status !== BookingStatus.cancelled) {
        throw new Error("Tenants can only cancel their own bookings.");
      }

      return bookingRepository.update(id, { status });
    }

    const isOwner = await ensureOwnerOwnsProperty(currentUser.sub, booking.property_id);

    if (!isOwner) {
      throw new Error("You can only manage bookings for your own properties.");
    }

    return bookingRepository.update(id, { status });
  },

  hasConflicts(propertyId: number, checkIn: string, checkOut: string) {
    return bookingRepository.hasConflicts(propertyId, new Date(checkIn), new Date(checkOut));
  },

  getBookedDates(propertyId: number) {
    return bookingRepository.getBookedDates(propertyId);
  },
};
