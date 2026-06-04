import { beforeEach, describe, expect, it, vi } from "vitest";
import { propertyController } from "../controllers/property.controller";
import { propertyService } from "../services/property.service";

vi.mock("../services/property.service", () => ({
  propertyService: {
    list: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    getAvailability: vi.fn(),
    getBookedDates: vi.fn(),
  },
}));

function createResponse() {
  const response: {
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
    send: ReturnType<typeof vi.fn>;
  } = {
    status: vi.fn(),
    json: vi.fn(),
    send: vi.fn(),
  };

  response.status.mockReturnValue(response);
  response.json.mockReturnValue(response);
  response.send.mockReturnValue(response);
  return response;
}

describe("propertyController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("list returns properties", async () => {
    const request = { query: { city: "Paris" } };
    const response = createResponse();
    vi.mocked(propertyService.list).mockResolvedValue([{ id: 1 }] as never);

    await propertyController.list(request as never, response as never);

    expect(propertyService.list).toHaveBeenCalledWith(expect.objectContaining({ city: "Paris" }));
    expect(response.json).toHaveBeenCalledWith([{ id: 1 }]);
  });

  it("getById returns 404 when missing", async () => {
    const request = { params: { id: "3" } };
    const response = createResponse();
    vi.mocked(propertyService.getById).mockResolvedValue(null);

    await propertyController.getById(request as never, response as never);

    expect(response.status).toHaveBeenCalledWith(404);
  });

  it("create returns 201 on success", async () => {
    const request = {
      user: { sub: 10 },
      body: {
        title: "Flat",
        type: "apartment",
        address: "1 rue",
        city: "Paris",
        price_per_night: 100,
        rooms: 2,
        capacity: 3,
      },
    };
    const response = createResponse();
    vi.mocked(propertyService.create).mockResolvedValue({ id: 12 } as never);

    await propertyController.create(request as never, response as never);

    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.json).toHaveBeenCalledWith({ id: 12 });
  });

  it("update returns 404 when property missing", async () => {
    const request = {
      user: { sub: 10 },
      params: { id: "1" },
      body: { title: "updated" },
    };
    const response = createResponse();
    vi.mocked(propertyService.update).mockResolvedValue(null);

    await propertyController.update(request as never, response as never);

    expect(response.status).toHaveBeenCalledWith(404);
  });

  it("update returns 403 on service error", async () => {
    const request = {
      user: { sub: 10 },
      params: { id: "1" },
      body: { title: "updated" },
    };
    const response = createResponse();
    vi.mocked(propertyService.update).mockRejectedValue(new Error("denied"));

    await propertyController.update(request as never, response as never);

    expect(response.status).toHaveBeenCalledWith(403);
  });

  it("remove returns 204 on success", async () => {
    const request = {
      user: { sub: 10 },
      params: { id: "1" },
    };
    const response = createResponse();
    vi.mocked(propertyService.remove).mockResolvedValue({ id: 1 } as never);

    await propertyController.remove(request as never, response as never);

    expect(response.status).toHaveBeenCalledWith(204);
    expect(response.send).toHaveBeenCalled();
  });

  it("availability returns 404 when missing", async () => {
    const request = { params: { id: "1" }, query: {} };
    const response = createResponse();
    vi.mocked(propertyService.getAvailability).mockResolvedValue(null);

    await propertyController.availability(request as never, response as never);

    expect(response.status).toHaveBeenCalledWith(404);
  });

  it("bookedDates returns result", async () => {
    const request = { params: { id: "1" } };
    const response = createResponse();
    vi.mocked(propertyService.getBookedDates).mockResolvedValue([{ check_in: "x", check_out: "y" }] as never);

    await propertyController.bookedDates(request as never, response as never);

    expect(response.json).toHaveBeenCalledWith([{ check_in: "x", check_out: "y" }]);
  });
});
