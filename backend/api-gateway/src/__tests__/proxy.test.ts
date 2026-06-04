import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { proxyRequest } from "../lib/proxy";
import type { AuthenticatedRequest } from "../middlewares/auth";

vi.mock("axios", () => ({
  default: {
    request: vi.fn(),
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

describe("proxyRequest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("forwards request and returns upstream response", async () => {
    const request = {
      method: "GET",
      query: { city: "Paris" },
      body: {},
      headers: {
        authorization: "Bearer token",
        "content-type": "application/json",
      },
      user: {
        sub: 5,
        email: "owner@example.com",
        role: "owner",
      },
    } as unknown as AuthenticatedRequest;

    const response = createResponse();
    vi.mocked(axios.request).mockResolvedValue({
      status: 200,
      data: [{ id: 1 }],
    });

    await proxyRequest({
      request,
      response: response as never,
      targetBaseUrl: "http://property-service:3002",
      targetPath: "/properties",
    });

    expect(axios.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        url: "http://property-service:3002/properties",
        params: { city: "Paris" },
        headers: expect.objectContaining({
          authorization: "Bearer token",
          "content-type": "application/json",
          "x-user-id": "5",
          "x-user-role": "owner",
          "x-user-email": "owner@example.com",
        }),
      }),
    );

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith([{ id: 1 }]);
  });

  it("returns 502 when upstream request fails", async () => {
    const request = {
      method: "POST",
      query: {},
      body: { hello: "world" },
      headers: {},
    } as unknown as AuthenticatedRequest;

    const response = createResponse();
    vi.mocked(axios.request).mockRejectedValue({ code: "ECONNREFUSED" });

    await proxyRequest({
      request,
      response: response as never,
      targetBaseUrl: "http://booking-service:3003",
      targetPath: "/bookings",
    });

    expect(response.status).toHaveBeenCalledWith(502);
    expect(response.json).toHaveBeenCalledWith({
      message: "Upstream service unavailable.",
      target: "http://booking-service:3003/bookings",
      code: "ECONNREFUSED",
    });
  });
});
