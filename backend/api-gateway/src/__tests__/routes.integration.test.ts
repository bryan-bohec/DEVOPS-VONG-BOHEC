import request from "supertest";
import axios from "axios";
import jwt from "jsonwebtoken";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { app } from "../app";

vi.mock("axios", () => ({
  default: {
    request: vi.fn(),
  },
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    verify: vi.fn(),
  },
}));

describe("gateway routes integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("proxies public routes", async () => {
    vi.mocked(axios.request).mockResolvedValue({
      status: 200,
      data: { ok: true },
    });

    const authResponse = await request(app)
      .post("/api/auth/login")
      .send({ email: "john@example.com", password: "secret123" });

    const propertyResponse = await request(app).get("/api/properties").query({ city: "Paris" });

    expect(authResponse.status).toBe(200);
    expect(propertyResponse.status).toBe(200);
    expect(axios.request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "http://auth-service:3001/auth/login",
        method: "POST",
      }),
    );
    expect(axios.request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "http://property-service:3002/properties",
        method: "GET",
      }),
    );
  });

  it("enforces auth and role on protected routes", async () => {
    const unauthenticated = await request(app).post("/api/properties").send({ title: "x" });
    expect(unauthenticated.status).toBe(401);

    vi.mocked(jwt.verify).mockReturnValue({ sub: 1, email: "tenant@x.com", role: "tenant" } as never);
    const forbidden = await request(app)
      .post("/api/properties")
      .set("Authorization", "Bearer tenant-token")
      .send({ title: "x" });
    expect(forbidden.status).toBe(403);

    vi.mocked(jwt.verify).mockReturnValue({ sub: 2, email: "owner@x.com", role: "owner" } as never);
    vi.mocked(axios.request).mockResolvedValue({ status: 201, data: { id: 1 } });

    const ownerResponse = await request(app)
      .post("/api/properties")
      .set("Authorization", "Bearer owner-token")
      .send({ title: "x" });

    expect(ownerResponse.status).toBe(201);
    expect(ownerResponse.body).toEqual({ id: 1 });
  });

  it("proxies authenticated bookings routes", async () => {
    vi.mocked(jwt.verify).mockReturnValue({ sub: 7, email: "tenant@x.com", role: "tenant" } as never);
    vi.mocked(axios.request).mockResolvedValue({ status: 200, data: [{ id: 10 }] });

    const response = await request(app)
      .get("/api/bookings/tenant/7")
      .set("Authorization", "Bearer valid-token");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ id: 10 }]);
    expect(axios.request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "http://booking-service:3003/bookings/tenant/7",
        method: "GET",
      }),
    );
  });
});
