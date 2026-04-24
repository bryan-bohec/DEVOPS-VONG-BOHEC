import { Booking, BookingStatus, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

export const bookingRepository = {
  list(where: Prisma.BookingWhereInput): Promise<Booking[]> {
    return prisma.booking.findMany({
      where,
      orderBy: { created_at: "desc" },
    });
  },

  findById(id: number): Promise<Booking | null> {
    return prisma.booking.findUnique({ where: { id } });
  },

  create(data: Prisma.BookingCreateInput): Promise<Booking> {
    return prisma.booking.create({ data });
  },

  update(id: number, data: Prisma.BookingUpdateInput): Promise<Booking> {
    return prisma.booking.update({
      where: { id },
      data,
    });
  },

  async hasConflicts(propertyId: number, checkIn: Date, checkOut: Date): Promise<boolean> {
    const count = await prisma.booking.count({
      where: {
        property_id: propertyId,
        status: {
          in: [BookingStatus.pending, BookingStatus.confirmed],
        },
        NOT: [
          {
            check_out: {
              lte: checkIn,
            },
          },
          {
            check_in: {
              gte: checkOut,
            },
          },
        ],
      },
    });

    return count > 0;
  },

  async getBookedDates(propertyId: number): Promise<{ check_in: Date; check_out: Date }[]> {
    return prisma.booking.findMany({
      where: {
        property_id: propertyId,
        status: {
          in: [BookingStatus.pending, BookingStatus.confirmed],
        },
        check_out: {
          gte: new Date(),
        },
      },
      select: {
        check_in: true,
        check_out: true,
      },
      orderBy: { check_in: "asc" },
    });
  },
};
