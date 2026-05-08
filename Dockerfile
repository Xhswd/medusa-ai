FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npx medusa build

FROM node:20-alpine AS production
WORKDIR /app
COPY --from=builder /app/.medusa/server ./
RUN npm ci --omit=dev --legacy-peer-deps
EXPOSE 9000
CMD ["npm", "run", "start"]
