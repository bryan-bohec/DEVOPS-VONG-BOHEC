import jwt from "jsonwebtoken";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/auth";

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

describe("auth-service requireAuth", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 401 without bearer token", () => {
    const request = { headers: {} } as unknown as AuthenticatedRequest;
    const response = createResponse();
    const next = vi.fn();

    requireAuth(request, response as never, next);

    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({ message: "Authentication required." });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 for invalid token", () => {
    vi.spyOn(jwt, "verify").mockImplementation(() => {
      throw new Error("invalid");
    });

    const request = {
      headers: {
        authorization: "Bearer wrong",
      },
    } as unknown as AuthenticatedRequest;
    const response = createResponse();
    const next = vi.fn();

    requireAuth(request, response as never, next);

    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({ message: "Invalid or expired token." });
    expect(next).not.toHaveBeenCalled();
  });

  it("sets user and calls next for valid token", () => {
    vi.spyOn(jwt, "verify").mockReturnValue({
      sub: 3,
      email: "john@example.com",
      role: "tenant",
    } as never);

    const request = {
      headers: {
        authorization: "Bearer valid",
      },
    } as unknown as AuthenticatedRequest;
    const response = createResponse();
    const next = vi.fn();

    requireAuth(request, response as never, next);

    expect(request.user).toEqual({
      sub: 3,
      email: "john@example.com",
      role: "tenant",
    });
    expect(next).toHaveBeenCalled();
  });
});
