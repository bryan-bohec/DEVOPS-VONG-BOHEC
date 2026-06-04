import { BookingStatus } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { bookingService } from "../services/booking.service";
import { bookingRepository } from "../repositories/booking.repository";
import { propertyApi } from "../lib/property-api";

vi.mock("../repositories/booking.repository", () => ({
  bookingRepository: {
    list: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    hasConflicts: vi.fn(),
    getBookedDates: vi.fn(),
  },
}));

vi.mock("../lib/property-api", () => ({
  propertyApi: {
    getProperty: vi.fn(),
    listOwnerProperties: vi.fn(),
  },
}));

const tenantUser = {
  sub: 11,
  email: "tenant@example.com",
  role: "tenant",
} as const;

const ownerUser = {
  sub: 77,
  email: "owner@example.com",
  role: "owner",
} as const;

describe("bookingService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("tenant list blocks other tenant id", async () => {
    await expect(bookingService.list({ tenant_id: 99 }, tenantUser as never)).rejects.toThrow(
      "You can only access your own bookings.",
    );
  });

  it("tenant list filters by own tenant id", async () => {
    vi.mocked(bookingRepository.list).mockResolvedValue([] as never);

    await bookingService.list({ status: BookingStatus.pending }, tenantUser as never);

    expect(bookingRepository.list).toHaveBeenCalledWith({
      tenant_id: 11,
      status: BookingStatus.pending,
    });
  });

  it("owner list blocks foreign owner id", async () => {
    await expect(bookingService.list({ owner_id: 10 }, ownerUser as never)).rejects.toThrow(
      "You can only access bookings for your own properties.",
    );
  });

  it("owner list uses -1 fallback when no properties", async () => {
    vi.mocked(propertyApi.listOwnerProperties).mockResolvedValue([]);
    vi.mocked(bookingRepository.list).mockResolvedValue([] as never);

    await bookingService.list({}, ownerUser as never);

    expect(bookingRepository.list).toHaveBeenCalledWith({ property_id: { in: [-1] } });
  });

  it("owner list filters by owner property ids", async () => {
    vi.mocked(propertyApi.listOwnerProperties).mockResolvedValue([
      { id: 7, owner_id: 77, price_per_night: 100, is_available: true },
      { id: 8, owner_id: 77, price_per_night: 110, is_available: true },
    ]);
    vi.mocked(bookingRepository.list).mockResolvedValue([] as never);

    await bookingService.list({ status: BookingStatus.confirmed }, ownerUser as never);

    expect(bookingRepository.list).toHaveBeenCalledWith({
      property_id: { in: [7, 8] },
      status: BookingStatus.confirmed,
    });
  });

  it("getById returns null when booking missing", async () => {
    vi.mocked(bookingRepository.findById).mockResolvedValue(null);

    const result = await bookingService.getById(1, tenantUser as never);

    expect(result).toBeNull();
  });

  it("tenant getById blocks foreign booking", async () => {
    vi.mocked(bookingRepository.findById).mockResolvedValue({ id: 1, tenant_id: 99, property_id: 7 } as never);

    await expect(bookingService.getById(1, tenantUser as never)).rejects.toThrow(
      "You can only access your own bookings.",
    );
  });

  it("owner getById blocks booking not on owner property", async () => {
    vi.mocked(bookingRepository.findById).mockResolvedValue({ id: 1, tenant_id: 11, property_id: 7 } as never);
    vi.mocked(propertyApi.getProperty).mockResolvedValue({ id: 7, owner_id: 12, price_per_night: 100, is_available: true });

    await expect(bookingService.getById(1, ownerUser as never)).rejects.toThrow(
      "You can only access bookings on your own properties.",
    );
  });

  it("create blocks non-tenant users", async () => {
    await expect(
      bookingService.create(
        {
          property_id: 7,
          check_in: "2026-06-10",
          check_out: "2026-06-12",
        },
        ownerUser as never,
      ),
    ).rejects.toThrow("Only tenants can create bookings.");
  });

  it("create validates property availability", async () => {
    vi.mocked(propertyApi.getProperty).mockResolvedValue(null);

    await expect(
      bookingService.create(
        {
          property_id: 7,
          check_in: "2026-06-10",
          check_out: "2026-06-12",
        },
        tenantUser as never,
      ),
    ).rejects.toThrow("Property is not available.");
  });

  it("create validates booking dates", async () => {
    vi.mocked(propertyApi.getProperty).mockResolvedValue({ id: 7, owner_id: 77, price_per_night: 100, is_available: true });

    await expect(
      bookingService.create(
        {
          property_id: 7,
          check_in: "bad-date",
          check_out: "2026-06-12",
        },
        tenantUser as never,
      ),
    ).rejects.toThrow("Booking dates are invalid.");
  });

  it("create rejects conflicts", async () => {
    vi.mocked(propertyApi.getProperty).mockResolvedValue({ id: 7, owner_id: 77, price_per_night: 100, is_available: true });
    vi.mocked(bookingRepository.hasConflicts).mockResolvedValue(true as never);

    await expect(
      bookingService.create(
        {
          property_id: 7,
          check_in: "2026-06-10",
          check_out: "2026-06-12",
        },
        tenantUser as never,
      ),
    ).rejects.toThrow("This property is already booked for the selected dates.");
  });

  it("create persists booking with computed total price", async () => {
    vi.mocked(propertyApi.getProperty).mockResolvedValue({ id: 7, owner_id: 77, price_per_night: 120, is_available: true });
    vi.mocked(bookingRepository.hasConflicts).mockResolvedValue(false as never);
    vi.mocked(bookingRepository.create).mockResolvedValue({ id: 99 } as never);

    const result = await bookingService.create(
      {
        property_id: 7,
        check_in: "2026-06-10",
        check_out: "2026-06-13",
      },
      tenantUser as never,
    );

    expect(bookingRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        property_id: 7,
        tenant_id: 11,
        total_price: 360,
        status: BookingStatus.pending,
      }),
    );
    expect(result).toEqual({ id: 99 });
  });

  it("updateStatus returns null when booking missing", async () => {
    vi.mocked(bookingRepository.findById).mockResolvedValue(null);

    const result = await bookingService.updateStatus(1, BookingStatus.confirmed, ownerUser as never);

    expect(result).toBeNull();
  });

  it("updateStatus blocks tenant invalid action", async () => {
    vi.mocked(bookingRepository.findById).mockResolvedValue({ id: 1, tenant_id: 11, property_id: 7 } as never);

    await expect(bookingService.updateStatus(1, BookingStatus.confirmed, tenantUser as never)).rejects.toThrow(
      "Tenants can only cancel their own bookings.",
    );
  });

  it("updateStatus allows tenant cancellation", async () => {
    vi.mocked(bookingRepository.findById).mockResolvedValue({ id: 1, tenant_id: 11, property_id: 7 } as never);
    vi.mocked(bookingRepository.update).mockResolvedValue({ id: 1, status: BookingStatus.cancelled } as never);

    const result = await bookingService.updateStatus(1, BookingStatus.cancelled, tenantUser as never);

    expect(result).toEqual({ id: 1, status: BookingStatus.cancelled });
  });

  it("updateStatus allows owner on owned property", async () => {
    vi.mocked(bookingRepository.findById).mockResolvedValue({ id: 2, tenant_id: 11, property_id: 7 } as never);
    vi.mocked(propertyApi.getProperty).mockResolvedValue({ id: 7, owner_id: 77, price_per_night: 100, is_available: true });
    vi.mocked(bookingRepository.update).mockResolvedValue({ id: 2, status: BookingStatus.confirmed } as never);

    const result = await bookingService.updateStatus(2, BookingStatus.confirmed, ownerUser as never);

    expect(result).toEqual({ id: 2, status: BookingStatus.confirmed });
  });

  it("hasConflicts converts dates to Date objects", async () => {
    vi.mocked(bookingRepository.hasConflicts).mockResolvedValue(false as never);

    await bookingService.hasConflicts(7, "2026-06-10", "2026-06-12");

    const args = vi.mocked(bookingRepository.hasConflicts).mock.calls[0];
    expect(args[0]).toBe(7);
    expect(args[1]).toBeInstanceOf(Date);
    expect(args[2]).toBeInstanceOf(Date);
  });

  it("getBookedDates delegates to repository", async () => {
    vi.mocked(bookingRepository.getBookedDates).mockResolvedValue([{ check_in: new Date(), check_out: new Date() }] as never);

    const result = await bookingService.getBookedDates(7);

    expect(bookingRepository.getBookedDates).toHaveBeenCalledWith(7);
    expect(result).toHaveLength(1);
  });
});
