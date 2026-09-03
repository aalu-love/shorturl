# # ── Development image ─────────────────────────────────────────────────────
# FROM node:20-alpine AS development

# RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
# WORKDIR /app

# COPY package*.json ./
# RUN npm ci

# COPY --chown=nodejs:nodejs . .
# USER nodejs

# EXPOSE 5173

# CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]

# # ── Build stage ───────────────────────────────────────────────────────────
# FROM node:20-alpine AS build

# WORKDIR /app
# COPY package*.json ./
# RUN npm ci
# COPY . .
# RUN npm run build

# # ── Production image ──────────────────────────────────────────────────────
# FROM nginx:1.25-alpine AS production

# COPY --from=build /app/dist /usr/share/nginx/html
# COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# EXPOSE 80

# CMD ["nginx", "-g", "daemon off;"]


# Create a simple dev image with a node 20 image
FROM node:20-alpine AS development
# Create a non-root user to run the app (commented out for dev to allow volume mounts)
# RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
WORKDIR /app
# Install dependencies
COPY package*.json ./
RUN npm ci
# Copy the rest of the app
COPY . .
# List the files in the app directory for debugging
RUN ls -la /app
# Switch to the non-root user (commented out for dev)
# USER nodejs

RUN ls -la /app
# Expose the development server port
EXPOSE 5173
# Start the development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
