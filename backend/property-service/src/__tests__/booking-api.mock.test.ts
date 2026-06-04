import nock from "nock";
import { afterEach, describe, expect, it } from "vitest";
import { bookingApi } from "../lib/booking-api";

afterEach(() => {
  nock.cleanAll();
  nock.enableNetConnect();
});

describe("bookingApi web mocks", () => {
  it("returns true when booking service reports conflicts", async () => {
    nock.disableNetConnect();

    const scope = nock("http://booking-service:3003")
      .get("/internal/bookings/conflicts")
      .query({
        propertyId: 42,
        checkIn: "2026-06-10",
        checkOut: "2026-06-12",
      })
      .reply(200, { has_conflicts: true });

    const result = await bookingApi.hasConflicts(42, "2026-06-10", "2026-06-12");

    expect(result).toBe(true);
    expect(scope.isDone()).toBe(true);
  });

  it("returns booked dates from booking service", async () => {
    nock.disableNetConnect();

    const payload = [
      { check_in: "2026-07-01", check_out: "2026-07-03" },
      { check_in: "2026-07-10", check_out: "2026-07-12" },
    ];

    const scope = nock("http://booking-service:3003")
      .get("/internal/bookings/booked-dates")
      .query({ propertyId: 42 })
      .reply(200, payload);

    const result = await bookingApi.getBookedDates(42);

    expect(result).toEqual(payload);
    expect(scope.isDone()).toBe(true);
  });
});
