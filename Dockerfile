# Dockerfile

# 1. Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./
# Install dependencies
RUN npm install

# 2. Build the application
FROM node:20-alpine AS builder
WORKDIR /app
# Copy dependencies from the 'deps' stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set NEXT_TELEMETRY_DISABLED to 1 to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

# Build the Next.js application
RUN npm run build

# 3. Production image
FROM node:20-alpine AS runner
WORKDIR /app

# Set NEXT_TELEMETRY_DISABLED to 1 to disable telemetry in production.
ENV NEXT_TELEMETRY_DISABLED 1
# Set the Node.js environment to production
ENV NODE_ENV production

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
# Copy the standalone output
COPY --from=builder /app/.next/standalone ./
# Copy the static assets
COPY --from=builder /app/.next/static ./.next/static

# Expose the port the app will run on
EXPOSE 3000

# Set the host and port environment variables
ENV PORT 3000
ENV HOSTNAME 0.0.0.0

# Start the app
CMD ["node", "server.js"]
