import nock from "nock";
import { afterEach, describe, expect, it } from "vitest";
import { propertyApi } from "../lib/property-api";

afterEach(() => {
  nock.cleanAll();
  nock.enableNetConnect();
});

describe("propertyApi web mocks", () => {
  it("returns property details when upstream service responds", async () => {
    nock.disableNetConnect();

    const payload = {
      id: 7,
      owner_id: 99,
      price_per_night: 120,
      is_available: true,
    };

    const scope = nock("http://property-service:3002").get("/properties/7").reply(200, payload);

    const result = await propertyApi.getProperty(7);

    expect(result).toEqual(payload);
    expect(scope.isDone()).toBe(true);
  });

  it("returns null when property endpoint fails", async () => {
    nock.disableNetConnect();

    const scope = nock("http://property-service:3002").get("/properties/404").reply(404, {
      message: "Property not found.",
    });

    const result = await propertyApi.getProperty(404);

    expect(result).toBeNull();
    expect(scope.isDone()).toBe(true);
  });

  it("returns owner properties list with query param", async () => {
    nock.disableNetConnect();

    const payload = [
      { id: 11, owner_id: 99, price_per_night: 80, is_available: true },
      { id: 12, owner_id: 99, price_per_night: 140, is_available: false },
    ];

    const scope = nock("http://property-service:3002")
      .get("/properties")
      .query({ owner_id: 99 })
      .reply(200, payload);

    const result = await propertyApi.listOwnerProperties(99);

    expect(result).toEqual(payload);
    expect(scope.isDone()).toBe(true);
  });
});
