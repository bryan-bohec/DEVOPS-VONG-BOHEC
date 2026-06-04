import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { authService } from "../services/auth.service";
import { userRepository } from "../repositories/user.repository";

vi.mock("../repositories/user.repository", () => ({
  userRepository: {
    findByEmail: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
  },
}));

vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    sign: vi.fn(),
  },
}));

const baseUser = {
  id: 1,
  email: "john@example.com",
  password_hash: "hashed-password",
  first_name: "John",
  last_name: "Doe",
  role: "tenant",
  created_at: new Date("2026-01-01T00:00:00Z"),
};

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(jwt.sign).mockReturnValue("jwt-token" as never);
  });

  it("register throws if email already exists", async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(baseUser as never);

    await expect(
      authService.register({
        email: "john@example.com",
        password: "secret123",
        first_name: "John",
        last_name: "Doe",
        role: "tenant",
      }),
    ).rejects.toThrow("Un compte existe déjà avec cet email.");
  });

  it("register creates user and returns token + safe user", async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
    vi.mocked(bcrypt.hash).mockResolvedValue("new-hash" as never);
    vi.mocked(userRepository.create).mockResolvedValue(baseUser as never);

    const result = await authService.register({
      email: "john@example.com",
      password: "secret123",
      first_name: "John",
      last_name: "Doe",
      role: "tenant",
    });

    expect(userRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "john@example.com",
        password_hash: "new-hash",
        first_name: "John",
        last_name: "Doe",
      }),
    );
    expect(result.accessToken).toBe("jwt-token");
    expect(result.user).toEqual({
      id: baseUser.id,
      email: baseUser.email,
      first_name: baseUser.first_name,
      last_name: baseUser.last_name,
      role: baseUser.role,
      created_at: baseUser.created_at,
    });
  });

  it("login throws if user does not exist", async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);

    await expect(authService.login({ email: "missing@example.com", password: "x" })).rejects.toThrow(
      "Email ou mot de passe incorrect.",
    );
  });

  it("login throws if password is invalid", async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(baseUser as never);
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

    await expect(authService.login({ email: baseUser.email, password: "bad" })).rejects.toThrow(
      "Email ou mot de passe incorrect.",
    );
  });

  it("login returns token + safe user when credentials are valid", async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(baseUser as never);
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

    const result = await authService.login({ email: baseUser.email, password: "good" });

    expect(result.accessToken).toBe("jwt-token");
    expect(result.user.email).toBe(baseUser.email);
    expect(result.user).not.toHaveProperty("password_hash");
  });

  it("getUserById returns null if not found", async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(null);

    const result = await authService.getUserById(123);
    expect(result).toBeNull();
  });

  it("getUserById returns safe user when found", async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(baseUser as never);

    const result = await authService.getUserById(1);

    expect(result).toEqual({
      id: baseUser.id,
      email: baseUser.email,
      first_name: baseUser.first_name,
      last_name: baseUser.last_name,
      role: baseUser.role,
      created_at: baseUser.created_at,
    });
  });
});
