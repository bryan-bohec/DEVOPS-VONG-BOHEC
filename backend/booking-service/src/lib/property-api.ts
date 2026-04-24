import axios from "axios";
import { env } from "../config/env";

interface PropertyDto {
  id: number;
  owner_id: number;
  price_per_night: number;
  is_available: boolean;
}

export const propertyApi = {
  async getProperty(id: number): Promise<PropertyDto | null> {
    try {
      const response = await axios.get<PropertyDto>(`${env.PROPERTY_SERVICE_URL}/properties/${id}`);
      return response.data;
    } catch {
      return null;
    }
  },

  async listOwnerProperties(ownerId: number): Promise<PropertyDto[]> {
    const response = await axios.get<PropertyDto[]>(`${env.PROPERTY_SERVICE_URL}/properties`, {
      params: { owner_id: ownerId },
    });

    return response.data;
  },
};
