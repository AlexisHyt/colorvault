# Build stage
FROM node:24.11.1-alpine3.23 AS builder
WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

# Run stage
FROM node:24.11.1-alpine3.23
WORKDIR /app

RUN npm install -g pnpm

ENV NODE_ENV=production

COPY --from=builder /app ./

EXPOSE 3004
CMD ["pnpm", "start", "--", "--port", "3005"]