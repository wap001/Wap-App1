# ==============================================================================
# Multi-Stage Dockerfile for Wap Mobility Node.js API & Socket.IO Server
# Target Runtime: Node.js 20 on Alpine Linux (Lightweight, Secure & Minimal)
# ==============================================================================

# ------------------------------------------------------------------------------
# STAGE 1: Build Stage (Compiles Vite SPA + Bundles Express/Socket.IO server)
# ------------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Install build prerequisites
RUN apk add --no-cache libc6-compat

# Cache dependencies layer
COPY package.json package-lock.json* ./
RUN npm ci

# Copy entire source tree
COPY . .

# Compile Vite client assets to dist/ and bundle server.ts to dist/server.cjs
RUN npm run build

# ------------------------------------------------------------------------------
# STAGE 2: Production Runtime Stage
# ------------------------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

# Install dumb-init / tini and curl for container healthchecks
RUN apk add --no-cache tini curl

ENV NODE_ENV=production
ENV PORT=3000

# Create unprivileged system user for security hardening (Principle of Least Privilege)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy package descriptors and install production-only dependencies
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev --ignore-scripts && \
    npm cache clean --force

# Copy pre-compiled production bundle and static assets from builder stage
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist

# Switch to non-root user
USER nodejs

# Expose internal API & Socket.IO HTTP port
EXPOSE 3000

# Container Healthcheck verifying Express HTTP & Socket.IO availability
HEALTHCHECK --interval=20s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Launch using tini to handle SIGTERM/SIGINT gracefully and prevent zombie processes
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/server.cjs"]
