import axios from "axios";
import { env } from "../config/env";

export const bookingApi = {
  async hasConflicts(propertyId: number, checkIn: string, checkOut: string) {
    const response = await axios.get(`${env.BOOKING_SERVICE_URL}/internal/bookings/conflicts`, {
      params: {
        propertyId,
        checkIn,
        checkOut,
      },
    });

    return Boolean(response.data.has_conflicts);
  },

  async getBookedDates(propertyId: number): Promise<{ check_in: string; check_out: string }[]> {
    const response = await axios.get(`${env.BOOKING_SERVICE_URL}/internal/bookings/booked-dates`, {
      params: { propertyId },
    });

    return response.data;
  },
};
