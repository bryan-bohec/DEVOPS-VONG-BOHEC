import jwt from "jsonwebtoken";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { requireAuth, requireRole, type AuthenticatedRequest } from "../middlewares/auth";

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

describe("gateway auth middlewares", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects request without bearer token", () => {
    const request = { headers: {} } as unknown as AuthenticatedRequest;
    const response = createResponse();
    const next = vi.fn();

    requireAuth(request, response as never, next);

    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({ message: "Authentication required." });
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects request with invalid token", () => {
    vi.spyOn(jwt, "verify").mockImplementation(() => {
      throw new Error("invalid");
    });

    const request = {
      headers: {
        authorization: "Bearer bad-token",
      },
    } as unknown as AuthenticatedRequest;
    const response = createResponse();
    const next = vi.fn();

    requireAuth(request, response as never, next);

    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({ message: "Invalid or expired token." });
    expect(next).not.toHaveBeenCalled();
  });

  it("sets request.user and calls next for valid token", () => {
    vi.spyOn(jwt, "verify").mockReturnValue({
      sub: 9,
      email: "tenant@example.com",
      role: "tenant",
    } as never);

    const request = {
      headers: {
        authorization: "Bearer valid-token",
      },
    } as unknown as AuthenticatedRequest;
    const response = createResponse();
    const next = vi.fn();

    requireAuth(request, response as never, next);

    expect(request.user).toEqual({
      sub: 9,
      email: "tenant@example.com",
      role: "tenant",
    });
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("enforces allowed roles", () => {
    const onlyOwner = requireRole("owner");

    const noUserRequest = {} as AuthenticatedRequest;
    const noUserResponse = createResponse();
    const next = vi.fn();

    onlyOwner(noUserRequest, noUserResponse as never, next);
    expect(noUserResponse.status).toHaveBeenCalledWith(401);

    const tenantRequest = {
      user: { sub: 1, email: "t@x.com", role: "tenant" },
    } as AuthenticatedRequest;
    const tenantResponse = createResponse();

    onlyOwner(tenantRequest, tenantResponse as never, next);
    expect(tenantResponse.status).toHaveBeenCalledWith(403);
    expect(tenantResponse.json).toHaveBeenCalledWith({ message: "Access denied." });

    const ownerRequest = {
      user: { sub: 2, email: "o@x.com", role: "owner" },
    } as AuthenticatedRequest;
    const ownerResponse = createResponse();

    onlyOwner(ownerRequest, ownerResponse as never, next);
    expect(next).toHaveBeenCalled();
  });
});
