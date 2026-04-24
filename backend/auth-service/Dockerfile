FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
RUN npm install

COPY tsconfig.json ./
COPY src ./src

RUN npx prisma generate && npm run build

CMD ["npm", "run", "start"]
