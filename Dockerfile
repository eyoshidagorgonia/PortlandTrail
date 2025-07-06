# Dockerfile for Next.js with standalone output

# Base image
FROM node:20-alpine AS base

# 1. Installer image
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json ./
RUN npm install

# 2. Builder image
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 3. Runner image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

# Copy from builder
COPY --from=builder /app/public ./public
# Standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000

# The standalone output creates a server.js file
CMD ["node", "server.js"]
