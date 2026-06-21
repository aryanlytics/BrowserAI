# apps/web-frontend/Dockerfile
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/validators/package.json ./packages/validators/
COPY apps/web-frontend/package.json ./apps/web-frontend/

RUN pnpm install --frozen-lockfile

COPY packages/validators ./packages/validators
COPY apps/web-frontend ./apps/web-frontend

ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter web-frontend build

FROM builder AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["npx", "next", "start", "apps/web-frontend"]
