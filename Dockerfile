# Build stage
FROM node:24.11.1-alpine3.23 AS builder
WORKDIR /app

# Outils nécessaires pour compiler les modules natifs (better-sqlite3)
RUN apk add --no-cache python3 make g++

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Recompiler better-sqlite3 pour la plateforme cible
RUN pnpm rebuild better-sqlite3

COPY . .
RUN pnpm run build

# Run stage
FROM node:24.11.1-alpine3.23
WORKDIR /app

# Outils nécessaires au runtime pour les modules natifs
RUN apk add --no-cache python3 make g++

RUN npm install -g pnpm

ENV NODE_ENV=production

COPY --from=builder /app ./

EXPOSE 3004
CMD ["pnpm", "start", "--", "--port", "3005"]
