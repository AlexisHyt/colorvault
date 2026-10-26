# Build stage
FROM node:24.11.1-alpine3.23 AS builder
WORKDIR /app

RUN npm install -g bun

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

# Run stage
FROM node:24.11.1-alpine3.23
WORKDIR /app

RUN npm install -g bun

ENV NODE_ENV=production

COPY --from=builder /app ./

EXPOSE 3005
CMD ["bun", "run", "start", "--port", "3005"]