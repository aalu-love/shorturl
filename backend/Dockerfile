# ── Build stage ───────────────────────────────────────────────────────────
FROM node:20-alpine AS base

WORKDIR /app

# Copy package files first — Docker layer cache means npm install only
# re-runs when package.json changes, not on every source code change.
COPY package*.json ./
RUN npm ci --only=production

# ── Development image ──────────────────────────────────────────────────────
FROM node:20-alpine AS development

# Run as non-root user — security best practice
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app

# Install all dependencies (including dev dependencies) for development
COPY package*.json ./
RUN npm ci

COPY --chown=nodejs:nodejs . .

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["npm", "run", "dev"]

# ── Production image ───────────────────────────────────────────────────────
FROM node:20-alpine AS production

# Run as non-root user — security best practice
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app

COPY --from=base /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs src ./src
COPY --chown=nodejs:nodejs package.json ./

USER nodejs

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:8080/health || exit 1

CMD ["npm", "start"]