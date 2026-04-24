import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api";
let accessToken = localStorage.getItem("accessToken");

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

export const setAuthToken = (token: string | null) => {
  accessToken = token;
};

export const getCurrentUser = () => api.get("/auth/me");

// Properties
export const getProperties = (params?: Record<string, string>) =>
  api.get("/properties", { params });

export const getProperty = (id: number) => api.get(`/properties/${id}`);

export const getPropertyBookedDates = (id: number) =>
  api.get<{ check_in: string; check_out: string }[]>(`/properties/${id}/booked-dates`);

export const createProperty = (data: {
  title: string;
  description: string;
  type: string;
  address: string;
  city: string;
  price_per_night: number;
  rooms: number;
  capacity: number;
  image_url?: string;
  owner_id: number;
}) => api.post("/properties", data);

export const updateProperty = (id: number, data: Record<string, unknown>) =>
  api.put(`/properties/${id}`, data);

export const deleteProperty = (id: number) => api.delete(`/properties/${id}`);

// Bookings
export const getBookings = (params?: Record<string, string>) =>
  api.get("/bookings", { params });

export const getBooking = (id: number) => api.get(`/bookings/${id}`);

export const createBooking = (data: {
  property_id: number;
  tenant_id: number;
  check_in: string;
  check_out: string;
  total_price: number;
}) => api.post("/bookings", data);

export const updateBookingStatus = (id: number, status: string) =>
  api.patch(`/bookings/${id}/status`, { status });

// Users
export const register = (data: {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: string;
}) => api.post("/auth/register", data);

export const login = (data: { email: string; password: string }) =>
  api.post("/auth/login", data);

export default api;
