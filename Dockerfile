
FROM node:20-alpine AS builder
WORKDIR /app

# Copy all files
COPY package.json pnpm-lock.yaml ./

# Install pnpm and dep
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .

# Building
RUN pnpm build

# Prod image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Installing pnpm
RUN npm install -g pnpm

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["pnpm", "start"]
