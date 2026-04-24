export interface Property {
  id: number;
  title: string;
  description: string;
  type: string;
  address: string;
  city: string;
  price_per_night: number;
  rooms: number;
  capacity: number;
  image_url: string | null;
  owner_id: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: number;
  property_id: number;
  tenant_id: number;
  check_in: string;
  check_out: string;
  total_price: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: "tenant" | "owner";
  created_at: string;
}
