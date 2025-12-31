
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Allow passing BACKEND_URL at build time (optional)
ARG BACKEND_URL
ENV BACKEND_URL=${BACKEND_URL}

# Build Next.js app
RUN npm run build

# Runtime stage
FROM node:20-alpine AS runner

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy public files
COPY --from=builder /app/public ./public

# Copy .next files
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next

# Copy node_modules
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

# Copy package files
COPY --chown=nextjs:nodejs package.json package-lock.json ./

USER nextjs

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000
# Allow passing BACKEND_URL at runtime (overrides build ARG)
ENV BACKEND_URL=${BACKEND_URL}

CMD ["npm", "start"]

# Usage:
#   docker build --build-arg BACKEND_URL=https://your-backend ...
#   docker run -e BACKEND_URL=https://your-backend ...
