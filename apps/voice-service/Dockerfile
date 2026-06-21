# apps/voice-service/Dockerfile
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/voice-service/package.json ./apps/voice-service/

RUN pnpm install --frozen-lockfile

COPY apps/voice-service ./apps/voice-service

RUN pnpm --filter voice-service build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/voice-service/package.json ./apps/voice-service/package.json
COPY --from=builder /app/apps/voice-service/dist ./apps/voice-service/dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/voice-service/node_modules ./apps/voice-service/node_modules

EXPOSE 4002
CMD ["node", "apps/voice-service/dist/index.js"]
