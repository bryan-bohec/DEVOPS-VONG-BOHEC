import { BookingStatus } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { bookingController } from "../controllers/booking.controller";
import { bookingService } from "../services/booking.service";

vi.mock("../services/booking.service", () => ({
  bookingService: {
    list: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    updateStatus: vi.fn(),
    hasConflicts: vi.fn(),
    getBookedDates: vi.fn(),
  },
}));

function createResponse() {
  const response: {
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
  } = {
    status: vi.fn(),
    json: vi.fn(),
  };

  response.status.mockReturnValue(response);
  response.json.mockReturnValue(response);
  return response;
}

describe("bookingController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("list returns bookings", async () => {
    const request = {
      query: {},
      params: {},
      user: { sub: 1, role: "tenant", email: "x" },
    };
    const response = createResponse();
    vi.mocked(bookingService.list).mockResolvedValue([{ id: 1 }] as never);

    await bookingController.list(request as never, response as never);

    expect(response.json).toHaveBeenCalledWith([{ id: 1 }]);
  });

  it("list returns 403 on service error", async () => {
    const request = { query: {}, params: {}, user: { sub: 1, role: "tenant", email: "x" } };
    const response = createResponse();
    vi.mocked(bookingService.list).mockRejectedValue(new Error("denied"));

    await bookingController.list(request as never, response as never);

    expect(response.status).toHaveBeenCalledWith(403);
  });

  it("getById returns 404 when not found", async () => {
    const request = { params: { id: "9" }, user: { sub: 1, role: "tenant", email: "x" } };
    const response = createResponse();
    vi.mocked(bookingService.getById).mockResolvedValue(null);

    await bookingController.getById(request as never, response as never);

    expect(response.status).toHaveBeenCalledWith(404);
  });

  it("create returns 201 on success", async () => {
    const request = {
      body: {
        property_id: 3,
        check_in: "2026-06-10",
        check_out: "2026-06-12",
      },
      user: { sub: 1, role: "tenant", email: "x" },
    };
    const response = createResponse();
    vi.mocked(bookingService.create).mockResolvedValue({ id: 3 } as never);

    await bookingController.create(request as never, response as never);

    expect(response.status).toHaveBeenCalledWith(201);
  });

  it("create returns 400 for invalid payload", async () => {
    const request = { body: {}, user: { sub: 1, role: "tenant", email: "x" } };
    const response = createResponse();

    await bookingController.create(request as never, response as never);

    expect(response.status).toHaveBeenCalledWith(400);
  });

  it("create returns 400 for service errors", async () => {
    const request = {
      body: {
        property_id: 3,
        check_in: "2026-06-10",
        check_out: "2026-06-12",
      },
      user: { sub: 1, role: "tenant", email: "x" },
    };
    const response = createResponse();
    vi.mocked(bookingService.create).mockRejectedValue(new Error("failed"));

    await bookingController.create(request as never, response as never);

    expect(response.status).toHaveBeenCalledWith(400);
  });

  it("updateStatus returns 400 for invalid status", async () => {
    const request = {
      params: { id: "1" },
      body: { status: "wrong" },
      user: { sub: 1, role: "tenant", email: "x" },
    };
    const response = createResponse();

    await bookingController.updateStatus(request as never, response as never);

    expect(response.status).toHaveBeenCalledWith(400);
  });

  it("updateStatus returns 404 when not found", async () => {
    const request = {
      params: { id: "1" },
      body: { status: BookingStatus.cancelled },
      user: { sub: 1, role: "tenant", email: "x" },
    };
    const response = createResponse();
    vi.mocked(bookingService.updateStatus).mockResolvedValue(null);

    await bookingController.updateStatus(request as never, response as never);

    expect(response.status).toHaveBeenCalledWith(404);
  });

  it("updateStatus returns result on success", async () => {
    const request = {
      params: { id: "1" },
      body: { status: BookingStatus.confirmed },
      user: { sub: 77, role: "owner", email: "x" },
    };
    const response = createResponse();
    vi.mocked(bookingService.updateStatus).mockResolvedValue({ id: 1, status: BookingStatus.confirmed } as never);

    await bookingController.updateStatus(request as never, response as never);

    expect(response.json).toHaveBeenCalledWith({ id: 1, status: BookingStatus.confirmed });
  });

  it("getConflicts returns has_conflicts", async () => {
    const request = {
      query: {
        propertyId: "8",
        checkIn: "2026-06-10",
        checkOut: "2026-06-12",
      },
    };
    const response = createResponse();
    vi.mocked(bookingService.hasConflicts).mockResolvedValue(true as never);

    await bookingController.getConflicts(request as never, response as never);

    expect(response.json).toHaveBeenCalledWith({ has_conflicts: true });
  });

  it("getBookedDates returns repository result", async () => {
    const request = { query: { propertyId: "8" } };
    const response = createResponse();
    vi.mocked(bookingService.getBookedDates).mockResolvedValue([{ check_in: "x", check_out: "y" }] as never);

    await bookingController.getBookedDates(request as never, response as never);

    expect(response.json).toHaveBeenCalledWith([{ check_in: "x", check_out: "y" }]);
  });
});
