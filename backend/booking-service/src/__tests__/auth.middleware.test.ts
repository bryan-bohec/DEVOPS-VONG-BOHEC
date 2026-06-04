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

describe("booking requireAuth", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 401 when authorization header is missing", () => {
    const request = { headers: {} } as unknown as AuthenticatedRequest;
    const response = createResponse();
    const next = vi.fn();

    requireAuth(request, response as never, next);

    expect(response.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 for invalid token", () => {
    vi.spyOn(jwt, "verify").mockImplementation(() => {
      throw new Error("invalid");
    });

    const request = { headers: { authorization: "Bearer bad" } } as unknown as AuthenticatedRequest;
    const response = createResponse();
    const next = vi.fn();

    requireAuth(request, response as never, next);

    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({ message: "Invalid or expired token." });
  });

  it("sets user and calls next for valid token", () => {
    vi.spyOn(jwt, "verify").mockReturnValue({ sub: 1, email: "x", role: "tenant" } as never);

    const request = { headers: { authorization: "Bearer good" } } as unknown as AuthenticatedRequest;
    const response = createResponse();
    const next = vi.fn();

    requireAuth(request, response as never, next);

    expect(next).toHaveBeenCalled();
    expect(request.user?.sub).toBe(1);
  });

  it("returns 401 when decoded payload is not an object", () => {
    vi.spyOn(jwt, "verify").mockReturnValue("bad-payload" as never);

    const request = { headers: { authorization: "Bearer good" } } as unknown as AuthenticatedRequest;
    const response = createResponse();
    const next = vi.fn();

    requireAuth(request, response as never, next);

    expect(response.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when decoded payload has missing email", () => {
    vi.spyOn(jwt, "verify").mockReturnValue({ sub: 1, role: "tenant" } as never);

    const request = { headers: { authorization: "Bearer good" } } as unknown as AuthenticatedRequest;
    const response = createResponse();
    const next = vi.fn();

    requireAuth(request, response as never, next);

    expect(response.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("accepts numeric string sub in decoded payload", () => {
    vi.spyOn(jwt, "verify").mockReturnValue({ sub: "11", email: "x", role: "tenant" } as never);

    const request = { headers: { authorization: "Bearer good" } } as unknown as AuthenticatedRequest;
    const response = createResponse();
    const next = vi.fn();

    requireAuth(request, response as never, next);

    expect(request.user?.sub).toBe(11);
    expect(next).toHaveBeenCalled();
  });
});
