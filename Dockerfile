# Stage 1: Build React client
FROM node:20-alpine AS client-builder
WORKDIR /app
COPY package*.json ./
COPY client/package*.json ./client/
RUN npm ci --workspace=client
COPY client/ ./client/
RUN npm run build --workspace=client

# Stage 2: Compile server TypeScript
FROM node:20-alpine AS server-builder
WORKDIR /app
COPY package*.json ./
COPY server/package*.json ./server/
RUN npm ci --workspace=server
COPY server/ ./server/
RUN npm run build --workspace=server

# Stage 3: Production image
FROM node:20-alpine AS production
WORKDIR /app

# Build tools needed for better-sqlite3 native compilation
RUN apk add --no-cache python3 make g++

COPY package*.json ./
COPY server/package*.json ./server/
RUN npm ci --workspace=server --omit=dev

# Remove build tools after native deps are compiled
RUN apk del python3 make g++

# Copy compiled output from builder stages
COPY --from=server-builder /app/server/dist ./server/dist
COPY --from=client-builder /app/client/dist ./client/dist

# Persist DB outside image layers
ENV DB_PATH=/app/data/writing_tracker.db
ENV NODE_ENV=production

RUN mkdir -p /app/data && \
    addgroup -S appgroup && \
    adduser -S appuser -G appgroup && \
    chown -R appuser:appgroup /app

USER appuser

EXPOSE 3001
CMD ["node", "server/dist/index.js"]
