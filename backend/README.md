# Backend Microservices

## Services
- `api-gateway` exposes the public API consumed by the React frontend.
- `auth-service` manages users, roles and JWT authentication.
- `property-service` manages the housing catalog and search filters.
- `booking-service` manages reservations and booking status changes.

## Local Run
1. Start the full stack with `docker compose up --build`.
2. Open the frontend on `http://localhost:5173`.
3. Call the gateway on `http://localhost:3000/api`.

## Ports
- `frontend`: `5173`
- `api-gateway`: `3000`
- `auth-service`: `3001`
- `property-service`: `3002`
- `booking-service`: `3003`
- `postgres-auth`: `5433`
- `postgres-property`: `5434`
- `postgres-booking`: `5435`

## Notes
- Each service owns its own PostgreSQL database.
- Prisma schema synchronization is handled with `prisma db push` on startup.
- The shared `JWT_SECRET` must stay identical across the gateway and protected services.
