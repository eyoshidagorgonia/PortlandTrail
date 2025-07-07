# Stage 1: Builder
# Use a specific Node.js version for reproducibility.
FROM node:20-alpine AS builder

# Set working directory.
WORKDIR /app

# Copy package.json and lock file.
COPY package.json package-lock.json* ./

# Install dependencies using `npm ci` for consistency.
RUN npm ci

# Copy the rest of the application source code.
COPY . .

# Build the Next.js application.
# The `output: 'standalone'` in next.config.ts will create a minimal server.
RUN npm run build

# Stage 2: Runner
# Use a lightweight, secure base image for the final container.
FROM node:20-alpine AS runner

# Set working directory.
WORKDIR /app

# Set environment to production.
ENV NODE_ENV=production

# The Next.js app in standalone mode runs on port 3000 by default.
EXPOSE 3000

# Copy the standalone output from the builder stage.
# This includes the server, minimal node_modules, and any static assets.
COPY --from=builder /app/.next/standalone ./

# The standalone output includes a `server.js` file to run the application.
CMD ["node", "server.js"]
