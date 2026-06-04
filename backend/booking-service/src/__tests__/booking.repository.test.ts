import { BookingStatus } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../lib/prisma", () => ({
  prisma: {
    booking: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
  },
}));

import { bookingRepository } from "../repositories/booking.repository";
import { prisma } from "../lib/prisma";

describe("bookingRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("list delegates to prisma.findMany with order", async () => {
    vi.mocked(prisma.booking.findMany).mockResolvedValue([{ id: 1 }] as never);

    const result = await bookingRepository.list({ tenant_id: 1 });

    expect(prisma.booking.findMany).toHaveBeenCalledWith({
      where: { tenant_id: 1 },
      orderBy: { created_at: "desc" },
    });
    expect(result).toEqual([{ id: 1 }]);
  });

  it("findById/create/update delegate to prisma", async () => {
    vi.mocked(prisma.booking.findUnique).mockResolvedValue({ id: 1 } as never);
    vi.mocked(prisma.booking.create).mockResolvedValue({ id: 2 } as never);
    vi.mocked(prisma.booking.update).mockResolvedValue({ id: 3 } as never);

    await bookingRepository.findById(1);
    await bookingRepository.create({ property_id: 7 } as never);
    await bookingRepository.update(3, { status: BookingStatus.confirmed } as never);

    expect(prisma.booking.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(prisma.booking.create).toHaveBeenCalledWith({ data: { property_id: 7 } });
    expect(prisma.booking.update).toHaveBeenCalledWith({ where: { id: 3 }, data: { status: BookingStatus.confirmed } });
  });

  it("hasConflicts returns false when count is 0", async () => {
    vi.mocked(prisma.booking.count).mockResolvedValue(0 as never);

    const result = await bookingRepository.hasConflicts(7, new Date("2026-06-10"), new Date("2026-06-12"));

    expect(result).toBe(false);
    expect(prisma.booking.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          property_id: 7,
          status: { in: [BookingStatus.pending, BookingStatus.confirmed] },
        }),
      }),
    );
  });

  it("hasConflicts returns true when count is positive", async () => {
    vi.mocked(prisma.booking.count).mockResolvedValue(2 as never);

    const result = await bookingRepository.hasConflicts(7, new Date("2026-06-10"), new Date("2026-06-12"));

    expect(result).toBe(true);
  });

  it("getBookedDates delegates to prisma.findMany with expected filters", async () => {
    vi.mocked(prisma.booking.findMany).mockResolvedValue([{ check_in: new Date(), check_out: new Date() }] as never);

    const result = await bookingRepository.getBookedDates(7);

    expect(prisma.booking.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          property_id: 7,
          status: { in: [BookingStatus.pending, BookingStatus.confirmed] },
        }),
        select: {
          check_in: true,
          check_out: true,
        },
        orderBy: { check_in: "asc" },
      }),
    );
    expect(result).toHaveLength(1);
  });
});
