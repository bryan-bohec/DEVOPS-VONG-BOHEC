# Build context = ./backend (monorepo npm workspaces).
FROM node:22-alpine

WORKDIR /app

# --- Dépendances : copie des manifestes pour profiter du cache Docker ---
# npm ci (workspaces) exige la présence de tous les package.json des workspaces.
COPY package.json package-lock.json ./
COPY shared/package.json ./shared/
COPY api-gateway/package.json ./api-gateway/
COPY auth-service/package.json ./auth-service/
COPY property-service/package.json ./property-service/
COPY booking-service/package.json ./booking-service/
RUN npm ci

# --- Build du code partagé ---
COPY shared ./shared
RUN npm run build --workspace=@vong-bohec/shared

# --- Build du service ---
COPY booking-service ./booking-service
WORKDIR /app/booking-service
RUN npx prisma generate && npm run build

CMD ["npm", "run", "start"]
