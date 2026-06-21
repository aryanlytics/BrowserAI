# apps/auth-service/Dockerfile
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/validators/package.json ./packages/validators/
COPY apps/auth-service/package.json ./apps/auth-service/

RUN pnpm install --frozen-lockfile

COPY packages/validators ./packages/validators
COPY apps/auth-service ./apps/auth-service

FROM builder AS runner
WORKDIR /app
ENV NODE_ENV=production
EXPOSE 4001
CMD ["npx", "tsx", "apps/auth-service/src/index.ts"]
