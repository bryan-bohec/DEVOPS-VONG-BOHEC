import jwt from "jsonwebtoken";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { requireAuth, requireOwner, type AuthenticatedRequest } from "../middlewares/auth";

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

describe("property auth middlewares", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("requireAuth rejects missing token", () => {
    const request = { headers: {} } as unknown as AuthenticatedRequest;
    const response = createResponse();
    const next = vi.fn();

    requireAuth(request, response as never, next);

    expect(response.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("requireAuth accepts valid token", () => {
    vi.spyOn(jwt, "verify").mockReturnValue({ sub: 1, email: "x", role: "owner" } as never);

    const request = {
      headers: {
        authorization: "Bearer ok",
      },
    } as unknown as AuthenticatedRequest;
    const response = createResponse();
    const next = vi.fn();

    requireAuth(request, response as never, next);

    expect(next).toHaveBeenCalled();
    expect(request.user?.role).toBe("owner");
  });

  it("requireOwner blocks tenant role", () => {
    const request = { user: { sub: 1, email: "x", role: "tenant" } } as AuthenticatedRequest;
    const response = createResponse();
    const next = vi.fn();

    requireOwner(request, response as never, next);

    expect(response.status).toHaveBeenCalledWith(403);
    expect(response.json).toHaveBeenCalledWith({ message: "Only owners can manage properties." });
  });

  it("requireOwner allows owner role", () => {
    const request = { user: { sub: 1, email: "x", role: "owner" } } as AuthenticatedRequest;
    const response = createResponse();
    const next = vi.fn();

    requireOwner(request, response as never, next);

    expect(next).toHaveBeenCalled();
  });
});
