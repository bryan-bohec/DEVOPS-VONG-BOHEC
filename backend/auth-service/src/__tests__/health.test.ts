import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../app";

describe("GET /health", () => {
  it("returns service health status", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
    expect(response.body.service).toBe("auth-service");
  });

  it("returns version, uptime and timestamp", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("version");
    expect(typeof response.body.uptime).toBe("number");
    expect(response.body.uptime).toBeGreaterThanOrEqual(0);
    expect(typeof response.body.timestamp).toBe("string");
    expect(() => new Date(response.body.timestamp)).not.toThrow();
  });
});
