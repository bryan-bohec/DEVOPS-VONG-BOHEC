import { beforeEach, describe, expect, it, vi } from "vitest";
import { authController } from "../controllers/auth.controller";
import { authService } from "../services/auth.service";

vi.mock("../services/auth.service", () => ({
  authService: {
    register: vi.fn(),
    login: vi.fn(),
    getUserById: vi.fn(),
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

describe("authController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("register returns 201 on success", async () => {
    const request = {
      body: {
        email: "john@example.com",
        password: "secret123",
        first_name: "John",
        last_name: "Doe",
        role: "tenant",
      },
    };
    const response = createResponse();
    vi.mocked(authService.register).mockResolvedValue({ accessToken: "x", user: { id: 1 } } as never);

    await authController.register(request as never, response as never);

    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.json).toHaveBeenCalledWith({ accessToken: "x", user: { id: 1 } });
  });

  it("register returns 400 for invalid payload", async () => {
    const request = { body: { email: "bad" } };
    const response = createResponse();

    await authController.register(request as never, response as never);

    expect(response.status).toHaveBeenCalledWith(400);
  });

  it("register returns 409 for service errors", async () => {
    const request = {
      body: {
        email: "john@example.com",
        password: "secret123",
        first_name: "John",
        last_name: "Doe",
        role: "tenant",
      },
    };
    const response = createResponse();
    vi.mocked(authService.register).mockRejectedValue(new Error("conflict"));

    await authController.register(request as never, response as never);

    expect(response.status).toHaveBeenCalledWith(409);
    expect(response.json).toHaveBeenCalledWith({ message: "conflict" });
  });

  it("login returns token on success", async () => {
    const request = {
      body: {
        email: "john@example.com",
        password: "secret123",
      },
    };
    const response = createResponse();
    vi.mocked(authService.login).mockResolvedValue({ accessToken: "jwt", user: { id: 1 } } as never);

    await authController.login(request as never, response as never);

    expect(response.json).toHaveBeenCalledWith({ accessToken: "jwt", user: { id: 1 } });
  });

  it("login returns 400 for invalid payload", async () => {
    const request = { body: { email: "x" } };
    const response = createResponse();

    await authController.login(request as never, response as never);

    expect(response.status).toHaveBeenCalledWith(400);
  });

  it("login returns 401 for auth errors", async () => {
    const request = {
      body: {
        email: "john@example.com",
        password: "secret123",
      },
    };
    const response = createResponse();
    vi.mocked(authService.login).mockRejectedValue(new Error("bad creds"));

    await authController.login(request as never, response as never);

    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({ message: "bad creds" });
  });

  it("me returns 401 without authenticated user", async () => {
    const request = { user: undefined };
    const response = createResponse();

    await authController.me(request as never, response as never);

    expect(response.status).toHaveBeenCalledWith(401);
  });

  it("me returns 404 when user not found", async () => {
    const request = { user: { sub: 10 } };
    const response = createResponse();
    vi.mocked(authService.getUserById).mockResolvedValue(null);

    await authController.me(request as never, response as never);

    expect(response.status).toHaveBeenCalledWith(404);
  });

  it("me returns user when found", async () => {
    const request = { user: { sub: 10 } };
    const response = createResponse();
    vi.mocked(authService.getUserById).mockResolvedValue({ id: 10 } as never);

    await authController.me(request as never, response as never);

    expect(response.json).toHaveBeenCalledWith({ id: 10 });
  });

  it("getUserById returns 404 when not found", async () => {
    const request = { params: { id: "42" } };
    const response = createResponse();
    vi.mocked(authService.getUserById).mockResolvedValue(null);

    await authController.getUserById(request as never, response as never);

    expect(response.status).toHaveBeenCalledWith(404);
  });

  it("getUserById returns user when found", async () => {
    const request = { params: { id: "42" } };
    const response = createResponse();
    vi.mocked(authService.getUserById).mockResolvedValue({ id: 42 } as never);

    await authController.getUserById(request as never, response as never);

    expect(response.json).toHaveBeenCalledWith({ id: 42 });
  });
});
