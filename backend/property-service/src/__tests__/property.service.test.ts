import { beforeEach, describe, expect, it, vi } from "vitest";
import { propertyService } from "../services/property.service";
import { propertyRepository } from "../repositories/property.repository";
import { bookingApi } from "../lib/booking-api";

vi.mock("../repositories/property.repository", () => ({
  propertyRepository: {
    list: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("../lib/booking-api", () => ({
  bookingApi: {
    hasConflicts: vi.fn(),
    getBookedDates: vi.fn(),
  },
}));

const ownerProperty = {
  id: 1,
  owner_id: 10,
  is_available: true,
};

describe("propertyService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("builds where clause in list", async () => {
    vi.mocked(propertyRepository.list).mockResolvedValue([] as never);

    await propertyService.list({
      city: "Paris",
      type: "apartment",
      min_price: 50,
      max_price: 200,
      capacity: 2,
      owner_id: 10,
    });

    expect(propertyRepository.list).toHaveBeenCalledWith(
      expect.objectContaining({
        city: { contains: "Paris", mode: "insensitive" },
        type: "apartment",
        owner_id: 10,
        capacity: { gte: 2 },
        price_per_night: { gte: 50, lte: 200 },
      }),
    );
  });

  it("getById delegates to repository", async () => {
    vi.mocked(propertyRepository.findById).mockResolvedValue(ownerProperty as never);

    const result = await propertyService.getById(1);

    expect(propertyRepository.findById).toHaveBeenCalledWith(1);
    expect(result).toEqual(ownerProperty);
  });

  it("create injects owner_id and normalizes empty image", async () => {
    vi.mocked(propertyRepository.create).mockResolvedValue({ id: 11 } as never);

    await propertyService.create(10, {
      title: "Flat",
      description: "Nice",
      type: "apartment",
      address: "1 rue",
      city: "Paris",
      price_per_night: 120,
      rooms: 2,
      capacity: 4,
      image_url: "",
    });

    expect(propertyRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        owner_id: 10,
        image_url: null,
      }),
    );
  });

  it("update returns null if property does not exist", async () => {
    vi.mocked(propertyRepository.findById).mockResolvedValue(null);

    const result = await propertyService.update(1, 10, { title: "x" });

    expect(result).toBeNull();
  });

  it("update throws if user is not owner", async () => {
    vi.mocked(propertyRepository.findById).mockResolvedValue(ownerProperty as never);

    await expect(propertyService.update(1, 99, { title: "x" })).rejects.toThrow(
      "You can only update your own properties.",
    );
  });

  it("update persists changes for owner", async () => {
    vi.mocked(propertyRepository.findById).mockResolvedValue(ownerProperty as never);
    vi.mocked(propertyRepository.update).mockResolvedValue({ id: 1, title: "updated" } as never);

    const result = await propertyService.update(1, 10, { title: "updated", image_url: "" });

    expect(propertyRepository.update).toHaveBeenCalledWith(1, expect.objectContaining({ title: "updated", image_url: null }));
    expect(result).toEqual({ id: 1, title: "updated" });
  });

  it("remove returns null if property does not exist", async () => {
    vi.mocked(propertyRepository.findById).mockResolvedValue(null);

    const result = await propertyService.remove(1, 10);

    expect(result).toBeNull();
  });

  it("remove throws when owner mismatch", async () => {
    vi.mocked(propertyRepository.findById).mockResolvedValue(ownerProperty as never);

    await expect(propertyService.remove(1, 3)).rejects.toThrow("You can only delete your own properties.");
  });

  it("remove deletes property for owner", async () => {
    vi.mocked(propertyRepository.findById).mockResolvedValue(ownerProperty as never);
    vi.mocked(propertyRepository.delete).mockResolvedValue({ id: 1 } as never);

    const result = await propertyService.remove(1, 10);

    expect(propertyRepository.delete).toHaveBeenCalledWith(1);
    expect(result).toEqual({ id: 1 });
  });

  it("getAvailability returns null when property does not exist", async () => {
    vi.mocked(propertyRepository.findById).mockResolvedValue(null);

    const result = await propertyService.getAvailability(1, "2026-06-01", "2026-06-02");

    expect(result).toBeNull();
  });

  it("getAvailability returns direct availability when missing dates", async () => {
    vi.mocked(propertyRepository.findById).mockResolvedValue(ownerProperty as never);

    const result = await propertyService.getAvailability(1);

    expect(result).toEqual({ property_id: 1, available: true });
    expect(bookingApi.hasConflicts).not.toHaveBeenCalled();
  });

  it("getAvailability checks conflicts when dates are provided", async () => {
    vi.mocked(propertyRepository.findById).mockResolvedValue(ownerProperty as never);
    vi.mocked(bookingApi.hasConflicts).mockResolvedValue(true);

    const result = await propertyService.getAvailability(1, "2026-06-10", "2026-06-12");

    expect(bookingApi.hasConflicts).toHaveBeenCalledWith(1, "2026-06-10", "2026-06-12");
    expect(result).toEqual({ property_id: 1, available: false });
  });

  it("getBookedDates returns null when property does not exist", async () => {
    vi.mocked(propertyRepository.findById).mockResolvedValue(null);

    const result = await propertyService.getBookedDates(2);

    expect(result).toBeNull();
  });

  it("getBookedDates delegates to bookingApi", async () => {
    vi.mocked(propertyRepository.findById).mockResolvedValue(ownerProperty as never);
    vi.mocked(bookingApi.getBookedDates).mockResolvedValue([{ check_in: "2026-06-10", check_out: "2026-06-12" }]);

    const result = await propertyService.getBookedDates(1);

    expect(bookingApi.getBookedDates).toHaveBeenCalledWith(1);
    expect(result).toEqual([{ check_in: "2026-06-10", check_out: "2026-06-12" }]);
  });
});
