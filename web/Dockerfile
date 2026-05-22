# Base image shared across all stages
FROM node:22-alpine AS base
WORKDIR /app

# Stage 1: Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Development environment
FROM base AS dev
ENV NODE_ENV=development
COPY --from=deps /app/node_modules ./node_modules
# Source code is mounted via docker-compose.dev.yml volumes
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Stage 3: Build the application
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
# Copy all source files
COPY . . 
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 4: Production runner
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Configure system group and user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set up the Next.js cache directory with correct permissions
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Pull built assets from the builder stage
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Run the standalone server
CMD ["node", "server.js"]
