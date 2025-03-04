FROM node:22-slim AS build

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_ENV=production
ENV PORT=8000
RUN corepack enable
ENV CI=true

COPY . /hooks
WORKDIR /hooks

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm build

FROM busybox
COPY --from=build /hooks/dist/index.js /static/runner_container_hooks.js
